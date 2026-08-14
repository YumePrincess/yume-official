import { ClashSubscription, Env, FileMeta } from '../utils/types';
import { error, json } from '../utils/response';
import {
  deleteClashSubscription,
  getAllClashSubscriptions,
  getAllFiles,
  getClashSubscription,
  getFile,
  saveClashSubscription,
} from '../utils/db';

const TOKEN_VERSION = 1;
const TOKEN_IV_LENGTH = 12;
const MAX_BATCH_SIZE = 100;

function isYamlFile(file: FileMeta): boolean {
  return /\.ya?ml$/i.test(file.name);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getTokenKey(env: Env): Promise<CryptoKey> {
  if (!env.SESSION_SECRET) throw new Error('SESSION_SECRET is not configured');
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(env.SESSION_SECRET + ':clash-subscription-token-v1'),
  );
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encryptToken(env: Env, subscriptionId: string, expiresAt: string | null): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(TOKEN_IV_LENGTH));
  const payload = JSON.stringify({ v: TOKEN_VERSION, id: subscriptionId, exp: expiresAt });
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    await getTokenKey(env),
    new TextEncoder().encode(payload),
  );
  const tokenBytes = new Uint8Array(TOKEN_IV_LENGTH + encrypted.byteLength);
  tokenBytes.set(iv, 0);
  tokenBytes.set(new Uint8Array(encrypted), TOKEN_IV_LENGTH);
  return toBase64Url(tokenBytes);
}

async function decryptToken(env: Env, token: string): Promise<{ id: string; expiresAt: string | null } | null> {
  try {
    const tokenBytes = fromBase64Url(token);
    if (tokenBytes.byteLength <= TOKEN_IV_LENGTH) return null;
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: tokenBytes.slice(0, TOKEN_IV_LENGTH) },
      await getTokenKey(env),
      tokenBytes.slice(TOKEN_IV_LENGTH),
    );
    const payload = JSON.parse(new TextDecoder().decode(decrypted)) as {
      v?: unknown;
      id?: unknown;
      exp?: unknown;
    };
    if (payload.v !== TOKEN_VERSION || typeof payload.id !== 'string' || !payload.id) return null;
    return {
      id: payload.id,
      expiresAt: typeof payload.exp === 'string' && payload.exp ? payload.exp : null,
    };
  } catch {
    return null;
  }
}

function isExpired(expiresAt: string | null): boolean {
  return !!expiresAt && new Date(expiresAt).getTime() <= Date.now();
}

function publicFile(file: FileMeta): Pick<FileMeta, 'id' | 'name' | 'folder' | 'size' | 'type' | 'uploadedAt'> {
  return {
    id: file.id,
    name: file.name,
    folder: file.folder,
    size: file.size,
    type: file.type,
    uploadedAt: file.uploadedAt,
  };
}

function subscriptionUrl(request: Request, token: string): string {
  return new URL('/clash/' + encodeURIComponent(token) + '.yaml', request.url).toString();
}

function serializeSubscription(request: Request, subscription: ClashSubscription, file: FileMeta) {
  return {
    id: subscription.id,
    fileId: subscription.fileId,
    file: publicFile(file),
    url: subscriptionUrl(request, subscription.token),
    expiresAt: subscription.expiresAt,
    createdAt: subscription.createdAt,
    encryption: 'AES-256-GCM',
  };
}

export async function listFiles(_request: Request, env: Env): Promise<Response> {
  const files = (await getAllFiles(env))
    .filter(isYamlFile)
    .sort((a, b) => a.folder.localeCompare(b.folder) || a.name.localeCompare(b.name));
  return json({ files: files.map(publicFile) });
}

export async function listSubscriptions(request: Request, env: Env): Promise<Response> {
  const rows = await getAllClashSubscriptions(env);
  const subscriptions = [];
  for (const row of rows) {
    const file = await getFile(env, row.fileId);
    if (file && isYamlFile(file)) subscriptions.push(serializeSubscription(request, row, file));
  }
  return json({ subscriptions });
}

export async function createSubscriptions(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ fileIds?: string[]; expiresInDays?: number }>();
  const fileIds = Array.from(new Set((body.fileIds || []).filter((id): id is string => typeof id === 'string' && !!id)));
  if (fileIds.length === 0) return error('At least one YAML file is required', 400);
  if (fileIds.length > MAX_BATCH_SIZE) return error('Too many files in one request', 400);

  const expiresInDays = Number(body.expiresInDays || 0);
  if (!Number.isFinite(expiresInDays) || expiresInDays < 0 || expiresInDays > 3650) {
    return error('expiresInDays must be between 0 and 3650', 400);
  }

  const files: FileMeta[] = [];
  for (const fileId of fileIds) {
    const file = await getFile(env, fileId);
    if (!file) return error('File not found: ' + fileId, 404);
    if (!isYamlFile(file)) return error('Only .yaml or .yml files can be published', 400);
    files.push(file);
  }

  const expiresAt = expiresInDays > 0
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;
  const createdAt = new Date().toISOString();
  const subscriptions: ClashSubscription[] = [];

  for (const file of files) {
    const subscription: ClashSubscription = {
      id: crypto.randomUUID(),
      fileId: file.id,
      token: '',
      expiresAt,
      createdAt,
    };
    subscription.token = await encryptToken(env, subscription.id, expiresAt);
    await saveClashSubscription(env, subscription);
    subscriptions.push(subscription);
  }

  return json({
    subscriptions: subscriptions.map((subscription, index) => serializeSubscription(request, subscription, files[index])),
  }, 201);
}

export async function revokeSubscription(request: Request, env: Env): Promise<Response> {
  const id = decodeURIComponent(new URL(request.url).pathname.split('/').pop() || '');
  if (!id) return error('Subscription ID required', 400);
  const subscription = await getClashSubscription(env, id);
  if (!subscription) return error('Subscription not found', 404);
  await deleteClashSubscription(env, id);
  return json({ revoked: true });
}

export async function serveSubscription(request: Request, env: Env): Promise<Response> {
  const rawToken = new URL(request.url).pathname.slice('/clash/'.length).replace(/\.yaml$/i, '');
  const token = decodeURIComponent(rawToken);
  if (!token || token.includes('/')) return error('Invalid subscription link', 404);

  const payload = await decryptToken(env, token);
  if (!payload) return error('Invalid subscription link', 404);

  const subscription = await getClashSubscription(env, payload.id);
  if (!subscription || subscription.token !== token) return error('Subscription link has been revoked', 404);
  if (isExpired(subscription.expiresAt) || isExpired(payload.expiresAt)) return error('Subscription link has expired', 404);

  const file = await getFile(env, subscription.fileId);
  if (!file || !isYamlFile(file)) return error('Subscription source file is unavailable', 404);
  const object = await env.VAULT_BUCKET.get(file.key);
  if (!object) return error('Subscription source file is unavailable', 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Type', 'application/yaml; charset=utf-8');
  headers.set('Content-Disposition', 'inline; filename="' + file.name.replace(/["\\\r\n]/g, '_') + '"');
  headers.set('Content-Length', String(object.size));
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('X-Subscription-Encryption', 'AES-256-GCM');
  if (object.httpEtag) headers.set('ETag', object.httpEtag);

  return new Response(object.body, { headers });
}
