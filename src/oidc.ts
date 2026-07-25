import { createSession, getSessionId } from './auth';
import { deleteSession, getSession } from './utils/db';
import { Env } from './utils/types';

const STATE_COOKIE = 'oidc_state';
const STATE_TTL_SECONDS = 10 * 60;
const DEFAULT_SCOPES = 'openid email profile';
const DEFAULT_SESSION_CHECK_INTERVAL_SECONDS = 5;

type OidcMode = 'login' | 'silent' | 'check';

interface OidcConfig {
  issuer: string;
  providerName: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scopes: string;
  allowedEmails: Set<string>;
  allowAllEmails: boolean;
  emailClaim: string;
  requireVerifiedEmail: boolean;
  tokenAuthMethod: 'client_secret_post' | 'client_secret_basic' | 'none';
}

interface OidcDiscovery {
  authorization_endpoint?: string;
  token_endpoint?: string;
  userinfo_endpoint?: string;
  end_session_endpoint?: string;
}

interface OidcState {
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectUri: string;
  returnTo: string;
  mode: OidcMode;
  sessionId: string | null;
  expectedEmail: string | null;
  createdAt: number;
}

interface TokenResponse {
  access_token?: string;
  id_token?: string;
  error?: string;
  error_description?: string;
}

export function isOidcEnabled(env: Env): boolean {
  return parseBoolean(env.OIDC_ENABLED);
}

export function getOidcDisplayName(env: Env): string {
  return env.OIDC_NAME?.trim() || env.OIDC_PROVIDER_NAME?.trim() || 'OIDC';
}

export function getPublicAuthConfig(env: Env): {
  oidcEnabled: boolean;
  oidcProviderName: string;
  oidcIconUrl: string;
  oidcAutoLogin: boolean;
} {
  return {
    oidcEnabled: isOidcEnabled(env),
    oidcProviderName: getOidcDisplayName(env),
    oidcIconUrl: env.OIDC_ICON?.trim() || '',
    oidcAutoLogin: parseBooleanDefault(env.OIDC_AUTO_LOGIN, true),
  };
}

export async function handleOidcStart(request: Request, env: Env): Promise<Response> {
  return handleOidcAuthorize(request, env, 'login');
}

export async function handleOidcSilentStart(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const mode: OidcMode = url.searchParams.get('mode') === 'check' ? 'check' : 'silent';
  return handleOidcAuthorize(request, env, mode);
}

export async function handleOidcCallback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  let state: OidcState | null = null;

  try {
    state = await readStateCookie(request, env);
    if (url.searchParams.has('error')) {
      return await handleOidcErrorCallback(request, env, state);
    }

    const config = getOidcConfig(request, env);
    if (!state || state.state !== url.searchParams.get('state')) {
      return oidcCallbackFailure(state, 'invalid_state', true);
    }
    if (Date.now() - state.createdAt > STATE_TTL_SECONDS * 1000) {
      return oidcCallbackFailure(state, 'invalid_state', true);
    }

    const code = url.searchParams.get('code');
    if (!code) return oidcCallbackFailure(state, 'oidc_failed', true);

    const discovery = await fetchDiscovery(config);
    if (!discovery.token_endpoint || !discovery.userinfo_endpoint) {
      return oidcCallbackFailure(state, 'oidc_misconfigured', true);
    }

    const token = await exchangeCodeForToken(discovery.token_endpoint, config, code, state);
    if (!token.access_token) return oidcCallbackFailure(state, 'oidc_failed', true);

    const claims = await fetchUserInfo(discovery.userinfo_endpoint, token.access_token);
    const email = getClaimAsString(claims, config.emailClaim)?.toLowerCase();
    if (!email) return oidcCallbackFailure(state, 'missing_email', true);

    const emailVerified = claims.email_verified;
    if (emailVerified === false || (config.requireVerifiedEmail && emailVerified !== true)) {
      return oidcCallbackFailure(state, 'email_unverified', true);
    }

    if (state.mode === 'check' && state.expectedEmail && state.expectedEmail !== email) {
      if (state.sessionId) await deleteSession(env, state.sessionId);
      return loginRedirect('oidc_session_expired', true, true);
    }

    if (!config.allowAllEmails && !config.allowedEmails.has(email)) {
      console.warn('OIDC unauthorized email:', email);
      return oidcCallbackFailure(state, 'unauthorized_email', true);
    }

    if (state.sessionId) await deleteSession(env, state.sessionId);

    const nowIso = new Date().toISOString();
    const { cookie } = await createSession(env, {
      authProvider: 'oidc',
      oidcEmail: email,
      oidcIdToken: token.id_token || null,
      oidcLastCheckedAt: nowIso,
    });

    const returnTo = state.returnTo || '/admin';
    const headers = new Headers();
    headers.append('Set-Cookie', cookie);
    headers.append('Set-Cookie', clearStateCookie());
    if (state.mode === 'silent') {
      return silentSuccessResponse(returnTo, headers);
    }
    headers.set('Location', returnTo);
    return new Response(null, { status: 302, headers });
  } catch (err) {
    console.error('OIDC callback failed:', errorMessage(err));
    return oidcCallbackFailure(state, 'oidc_failed', true);
  }
}

export async function handleOidcLogout(request: Request, env: Env): Promise<Response> {
  const sessionId = getSessionId(request);
  const session = sessionId ? await getSession(env, sessionId) : null;
  if (sessionId) await deleteSession(env, sessionId);

  const headers = new Headers({ Location: '/login' });
  headers.append('Set-Cookie', clearSessionCookie());

  if (isOidcEnabled(env) && session?.authProvider === 'oidc') {
    const oidcLogoutUrl = await buildOidcLogoutUrl(request, env, session.oidcIdToken);
    if (oidcLogoutUrl) headers.set('Location', oidcLogoutUrl);
  }

  return new Response(null, { status: 302, headers });
}

export async function maybeValidateOidcSession(request: Request, env: Env): Promise<Response | null> {
  if (!isOidcEnabled(env) || request.method !== 'GET') return null;

  const url = new URL(request.url);
  if (url.pathname !== '/admin') return null;

  const sessionId = getSessionId(request);
  if (!sessionId) return null;

  const session = await getSession(env, sessionId);
  if (!session || session.authProvider !== 'oidc') return null;

  const lastCheckedAt = session.oidcLastCheckedAt ? Date.parse(session.oidcLastCheckedAt) : 0;
  const intervalMs = getSessionCheckIntervalSeconds(env) * 1000;
  if (lastCheckedAt && Date.now() - lastCheckedAt < intervalMs) return null;

  const checkUrl = new URL('/auth/oidc/silent', request.url);
  checkUrl.searchParams.set('mode', 'check');
  checkUrl.searchParams.set('returnTo', url.pathname + url.search);
  return new Response(null, {
    status: 302,
    headers: { Location: checkUrl.pathname + checkUrl.search },
  });
}

async function handleOidcAuthorize(request: Request, env: Env, mode: OidcMode): Promise<Response> {
  try {
    const config = getOidcConfig(request, env);
    const discovery = await fetchDiscovery(config);
    if (!discovery.authorization_endpoint) return loginRedirect('oidc_misconfigured');

    const url = new URL(request.url);
    const sessionId = getSessionId(request);
    const session = sessionId ? await getSession(env, sessionId) : null;
    const state: OidcState = {
      state: randomBase64Url(32),
      nonce: randomBase64Url(32),
      codeVerifier: randomBase64Url(64),
      redirectUri: config.redirectUri,
      returnTo: sanitizeReturnTo(url.searchParams.get('returnTo'), request.url),
      mode,
      sessionId: session?.id || null,
      expectedEmail: mode === 'check' ? session?.oidcEmail || null : null,
      createdAt: Date.now(),
    };

    const challenge = await sha256Base64Url(state.codeVerifier);
    const authUrl = new URL(discovery.authorization_endpoint);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', config.clientId);
    authUrl.searchParams.set('redirect_uri', config.redirectUri);
    authUrl.searchParams.set('scope', config.scopes);
    authUrl.searchParams.set('state', state.state);
    authUrl.searchParams.set('nonce', state.nonce);
    authUrl.searchParams.set('code_challenge', challenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');
    if (mode !== 'login') authUrl.searchParams.set('prompt', 'none');

    return new Response(null, {
      status: 302,
      headers: {
        Location: authUrl.toString(),
        'Set-Cookie': await createStateCookie(env, state),
      },
    });
  } catch (err) {
    console.error('OIDC start failed:', errorMessage(err));
    return mode === 'silent' ? silentNoopResponse(true) : loginRedirect('oidc_misconfigured');
  }
}

async function handleOidcErrorCallback(request: Request, env: Env, state: OidcState | null): Promise<Response> {
  const url = new URL(request.url);
  const errorCode = url.searchParams.get('error') || '';
  console.error('OIDC provider error:', url.searchParams.get('error_description') || errorCode);

  if (state?.mode === 'silent') {
    return silentNoopResponse(true);
  }

  if (state?.mode === 'check') {
    const sessionId = state.sessionId || getSessionId(request);
    if (sessionId) await deleteSession(env, sessionId);
    return loginRedirect('oidc_session_expired', true, true);
  }

  return loginRedirect('oidc_failed', true);
}

function oidcCallbackFailure(
  state: OidcState | null,
  code: string,
  clearState = false,
  clearSession = false,
): Response {
  if (state?.mode === 'silent') return silentNoopResponse(clearState);
  return loginRedirect(code, clearState, clearSession);
}

function getOidcConfig(request: Request, env: Env): OidcConfig {
  if (!isOidcEnabled(env)) throw new Error('OIDC is not enabled');

  const issuer = trimTrailingSlash(env.OIDC_ISSUER || '');
  const clientId = env.OIDC_CLIENT_ID?.trim() || '';
  const clientSecret = env.OIDC_CLIENT_SECRET || '';
  const emailAccess = parseEmailAccess(env.OIDC_ALLOWED_EMAILS || '');
  const tokenAuthMethod = parseTokenAuthMethod(env.OIDC_TOKEN_AUTH_METHOD);

  if (!issuer || !clientId || (tokenAuthMethod !== 'none' && !clientSecret)) {
    throw new Error('Missing OIDC issuer, client id, or client secret');
  }
  if (!emailAccess.allowAllEmails && emailAccess.allowedEmails.size === 0) {
    throw new Error('OIDC allowed email list is empty');
  }

  return {
    issuer,
    providerName: getOidcDisplayName(env),
    clientId,
    clientSecret,
    redirectUri: env.OIDC_REDIRECT_URI?.trim() || new URL('/auth/oidc/callback', request.url).toString(),
    postLogoutRedirectUri: env.OIDC_POST_LOGOUT_REDIRECT_URI?.trim() || new URL('/login', request.url).toString(),
    scopes: env.OIDC_SCOPES?.trim() || DEFAULT_SCOPES,
    allowedEmails: emailAccess.allowedEmails,
    allowAllEmails: emailAccess.allowAllEmails,
    emailClaim: env.OIDC_EMAIL_CLAIM?.trim() || 'email',
    requireVerifiedEmail: parseBoolean(env.OIDC_REQUIRE_VERIFIED_EMAIL),
    tokenAuthMethod,
  };
}

async function fetchDiscovery(config: OidcConfig): Promise<OidcDiscovery> {
  const discoveryUrl = config.issuer + '/.well-known/openid-configuration';
  const response = await fetch(discoveryUrl, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('OIDC discovery failed with status ' + response.status);
  return response.json<OidcDiscovery>();
}

async function buildOidcLogoutUrl(request: Request, env: Env, idToken: string | null): Promise<string | null> {
  try {
    const config = getOidcConfig(request, env);
    const discovery = await fetchDiscovery(config);
    if (!discovery.end_session_endpoint) return null;

    const logoutUrl = new URL(discovery.end_session_endpoint);
    if (idToken) logoutUrl.searchParams.set('id_token_hint', idToken);
    logoutUrl.searchParams.set('client_id', config.clientId);
    logoutUrl.searchParams.set('post_logout_redirect_uri', config.postLogoutRedirectUri);
    return logoutUrl.toString();
  } catch (err) {
    console.error('OIDC logout URL build failed:', errorMessage(err));
    return null;
  }
}

async function exchangeCodeForToken(
  tokenEndpoint: string,
  config: OidcConfig,
  code: string,
  state: OidcState,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: state.redirectUri,
    code_verifier: state.codeVerifier,
  });

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (config.tokenAuthMethod === 'client_secret_basic') {
    headers.Authorization = 'Basic ' + btoa(formEncode(config.clientId) + ':' + formEncode(config.clientSecret));
  } else {
    body.set('client_id', config.clientId);
    if (config.tokenAuthMethod === 'client_secret_post') {
      body.set('client_secret', config.clientSecret);
    }
  }

  const response = await fetch(tokenEndpoint, { method: 'POST', headers, body });
  const token = await response.json<TokenResponse>().catch((): TokenResponse => ({}));
  if (!response.ok || token.error) {
    throw new Error(token.error_description || token.error || 'OIDC token exchange failed');
  }
  return token;
}

async function fetchUserInfo(userinfoEndpoint: string, accessToken: string): Promise<Record<string, unknown>> {
  const response = await fetch(userinfoEndpoint, {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
    },
  });
  if (!response.ok) throw new Error('OIDC userinfo failed with status ' + response.status);
  return response.json<Record<string, unknown>>();
}

function parseEmailAccess(value: string): { allowedEmails: Set<string>; allowAllEmails: boolean } {
  const entries = value
    .split(/[\s,;]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  return {
    allowedEmails: new Set(entries.filter((email) => email !== '*')),
    allowAllEmails: entries.includes('*'),
  };
}

function parseTokenAuthMethod(value: string | undefined): OidcConfig['tokenAuthMethod'] {
  if (value === 'client_secret_basic' || value === 'none') return value;
  return 'client_secret_post';
}

function formEncode(value: string): string {
  return new URLSearchParams({ value }).toString().slice('value='.length);
}

function parseBoolean(value: string | undefined): boolean {
  return /^(1|true|yes|on)$/i.test((value || '').trim());
}

function parseBooleanDefault(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === '') return fallback;
  return parseBoolean(value);
}

function getSessionCheckIntervalSeconds(env: Env): number {
  const value = Number(env.OIDC_SESSION_CHECK_INTERVAL_SECONDS || DEFAULT_SESSION_CHECK_INTERVAL_SECONDS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_SESSION_CHECK_INTERVAL_SECONDS;
}

function trimTrailingSlash(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function sanitizeReturnTo(value: string | null, requestUrl: string): string {
  if (!value) return '/admin';
  try {
    const base = new URL(requestUrl);
    const target = new URL(value, base.origin);
    if (target.origin !== base.origin || target.pathname.startsWith('/auth/')) return '/admin';
    return target.pathname + target.search;
  } catch {
    return '/admin';
  }
}

function getClaimAsString(claims: Record<string, unknown>, path: string): string | null {
  let current: unknown = claims;
  for (const part of path.split('.')) {
    if (!current || typeof current !== 'object') return null;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : null;
}

async function createStateCookie(env: Env, state: OidcState): Promise<string> {
  const payload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(state)));
  const signature = await sign(env, payload);
  return `${STATE_COOKIE}=${payload}.${signature}; Path=/auth/oidc; HttpOnly; Secure; SameSite=Lax; Max-Age=${STATE_TTL_SECONDS}`;
}

async function readStateCookie(request: Request, env: Env): Promise<OidcState | null> {
  const value = getCookie(request, STATE_COOKIE);
  if (!value) return null;

  const dot = value.lastIndexOf('.');
  if (dot < 0) return null;

  const payload = value.slice(0, dot);
  const signature = value.slice(dot + 1);
  const expected = await sign(env, payload);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(payload))) as OidcState;
  } catch {
    return null;
  }
}

function clearStateCookie(): string {
  return `${STATE_COOKIE}=; Path=/auth/oidc; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function clearSessionCookie(): string {
  return 'session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

async function sign(env: Env, payload: string): Promise<string> {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is required for OIDC state');
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return base64UrlEncode(new Uint8Array(digest));
}

function randomBase64Url(bytes: number): string {
  const data = new Uint8Array(bytes);
  crypto.getRandomValues(data);
  return base64UrlEncode(data);
}

function base64UrlEncode(data: Uint8Array): string {
  let binary = '';
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const data = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
  return data;
}

function getCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get('Cookie') || '';
  const match = cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? match[1] : null;
}

function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) {
    diff |= (left[i] || 0) ^ (right[i] || 0);
  }
  return diff === 0;
}

function loginRedirect(
  code?: string,
  clearState = false,
  clearSession = false,
  extraParams: Record<string, string> = {},
): Response {
  const params = new URLSearchParams(extraParams);
  if (code) params.set('error', code);
  const location = params.toString() ? '/login?' + params.toString() : '/login';
  const headers = new Headers({ Location: location });
  if (clearState) headers.append('Set-Cookie', clearStateCookie());
  if (clearSession) headers.append('Set-Cookie', clearSessionCookie());
  return new Response(null, { status: 302, headers });
}

function silentSuccessResponse(returnTo: string, headers: Headers): Response {
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  const target = JSON.stringify(returnTo);
  return new Response(
    '<!doctype html><meta charset="utf-8"><script>try{window.top.location.replace(' + target + ')}catch(e){window.location.replace(' + target + ')}</script>',
    { status: 200, headers },
  );
}

function silentNoopResponse(clearState = false): Response {
  const headers = new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  if (clearState) headers.append('Set-Cookie', clearStateCookie());
  return new Response('<!doctype html><meta charset="utf-8">', { status: 200, headers });
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
