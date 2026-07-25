import { Env } from './utils/types';
import { error, redirect, corsPreflightResponse, fetchAssetHtml, injectBranding, injectJsonData } from './utils/response';
import { handleLogin, authMiddleware, validateSession } from './auth';
import { getPublicAuthConfig, handleOidcCallback, handleOidcLogout, handleOidcSilentStart, handleOidcStart, maybeValidateOidcSession } from './oidc';
import { getSettings } from './api/settings';
import * as files from './api/files';
import * as share from './api/share';
import * as stats from './api/stats';
import * as settings from './api/settings';
import * as download from './handlers/download';
import { handleWebDav } from './handlers/webdav';
// @ts-ignore backend/worker.js is an existing JS Worker module reused here.
import backendApiWorker from '../backend/worker.js';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    if (method === 'OPTIONS' && !path.startsWith('/dav') && !isBackendApiRequest(path)) {
      return corsPreflightResponse();
    }

    try {
      // ── WebDAV endpoint (/dav or /dav/...) ──
      if (path === '/dav' || path.startsWith('/dav/')) {
        // OPTIONS may be sent without auth by some clients
        if (method !== 'OPTIONS') {
          const authHeader = request.headers.get('Authorization');
          if (!authHeader || !authHeader.startsWith('Basic ')) {
            return new Response('Unauthorized', {
              status: 401,
              headers: { 'WWW-Authenticate': 'Basic realm="Yume AIO Backend WebDAV"' },
            });
          }
          const decoded = atob(authHeader.slice(6));
          const colonIdx = decoded.indexOf(':');
          const inputPassword = colonIdx >= 0 ? decoded.slice(colonIdx + 1) : decoded;

          const encoder = new TextEncoder();
          const inputHash = Array.from(
            new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(inputPassword))),
          )
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');
          const storedHash = Array.from(
            new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(env.ADMIN_PASSWORD))),
          )
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('');

          const a = encoder.encode(inputHash);
          const b = encoder.encode(storedHash);
          if (a.byteLength !== b.byteLength || !crypto.subtle.timingSafeEqual(a, b)) {
            return new Response('Unauthorized', {
              status: 401,
              headers: { 'WWW-Authenticate': 'Basic realm="Yume AIO Backend WebDAV"' },
            });
          }
        }
        return handleWebDav(request, env);
      }

      if (path === '/auth/login' && method === 'POST') {
        return await handleLogin(request, env);
      }
      if (path === '/auth/oidc/start' && method === 'GET') {
        return await handleOidcStart(request, env);
      }
      if (path === '/auth/oidc/silent' && method === 'GET') {
        return await handleOidcSilentStart(request, env);
      }
      if (path === '/auth/oidc/callback' && method === 'GET') {
        return await handleOidcCallback(request, env);
      }
      if (path === '/auth/logout') {
        return await handleOidcLogout(request, env);
      }

      if (path.startsWith('/s/')) {
        return await handleShareRoutes(request, env, url, path, method);
      }

      if (path === '/login') {
        const loginSettings = await getSettings(env);
        let loginHtml = await fetchAssetHtml(env.ASSETS, request.url, '/login.html');
        loginHtml = injectBranding(loginHtml, loginSettings);
        loginHtml = injectJsonData(loginHtml, 'auth-config', getPublicAuthConfig(env));
        return htmlPage(loginHtml);
      }


      if (isBackendApiRequest(path)) {
        return backendApiWorker.fetch(request, { ...env, r2: env.VAULT_BUCKET }, ctx);
      }

      if (path === '/api/public/shared' && method === 'GET') {
        return await share.listPublicShared(request, env);
      }
      if (path === '/api/public/folder' && method === 'GET') {
        return await share.browsePublicFolder(request, env);
      }
      if (path.startsWith('/api/public/download/') && method === 'GET') {
        return (await serveWithEdgeCache(request, ctx, () => share.publicDownload(request, env)))!;
      }
      if (path.startsWith('/api/public/preview/') && method === 'GET') {
        return await share.publicPreview(request, env);
      }

      if (path === '/' && method === 'GET') {
        return await handleRootPage(request, env);
      }

      if (path === '/admin' && method === 'GET') {
        const authResponse = await authMiddleware(request, env);
        if (authResponse) return authResponse;
        const oidcCheckResponse = await maybeValidateOidcSession(request, env);
        if (oidcCheckResponse) return oidcCheckResponse;
        const adminSettings = await getSettings(env);
        let dashHtml = await fetchAssetHtml(env.ASSETS, request.url, '/dashboard.html');
        dashHtml = injectBranding(dashHtml, adminSettings);
        return htmlPage(dashHtml);
      }

      if (path.startsWith('/api/')) {
        const authResponse = await authMiddleware(request, env);
        if (authResponse) return authResponse;
        return await handleApiRoutes(request, env, url, path, method);
      }

      // Serve static assets (css, js, images, fonts) without auth — needed by all pages
      if ((method === 'GET' || method === 'HEAD') && isStaticAsset(path)) {
        return serveStaticAsset(request, env, path);
      }

      if (method === 'GET' || method === 'HEAD') {
        const cleanResponse = await serveWithEdgeCache(request, ctx, () => download.handleCleanDownload(request, env));
        if (cleanResponse) return cleanResponse;
      }

      const isAuth = await validateSession(request, env);
      if (isAuth) return env.ASSETS.fetch(request);

      return await serve404Page(request, env);

    } catch (e) {
      const message = e instanceof Error ? e.message : 'Internal server error';
      console.error('Unhandled error:', message);
      return error(message, 500);
    }
  },
  async queue(batch: MessageBatch<unknown>, env: Env): Promise<void> {
    const keys = batch.messages
      .map((message) => extractR2EventObjectKey(message.body))
      .filter((value): value is string => !!value);

    if (keys.length === 0) return;
    await purgePublicObjectUrls(keys, env);
  },
} satisfies ExportedHandler<Env>;

async function handleRootPage(request: Request, env: Env): Promise<Response> {
  const siteSettings = await getSettings(env);

  if (!siteSettings.guestPageEnabled) {
    const isAuth = await validateSession(request, env);
    if (isAuth) return redirect('/admin');
    return redirect('/login');
  }

  let guestHtml = await fetchAssetHtml(env.ASSETS, request.url, '/guest.html');
  guestHtml = injectBranding(guestHtml, siteSettings);
  return htmlPage(guestHtml);
}

async function serveAssetHtml(request: Request, env: Env, assetPath: string): Promise<Response> {
  const settings = await getSettings(env);
  let html = await fetchAssetHtml(env.ASSETS, request.url, assetPath);
  html = injectBranding(html, settings);
  return htmlPage(html);
}

async function serveWithEdgeCache(
  request: Request,
  ctx: ExecutionContext,
  handler: () => Promise<Response | null>,
): Promise<Response | null> {
  const cache = caches.default;
  const cached = await cache.match(request);
  if (cached) {
    const headers = new Headers(cached.headers);
    headers.set('X-Cache', 'HIT');
    return new Response(cached.body, { status: cached.status, headers });
  }

  const response = await handler();
  if (!response || !response.ok) return response;

  ctx.waitUntil(cache.put(request, response.clone()));
  response.headers.set('X-Cache', 'MISS');
  return response;
}

const STATIC_EXTENSIONS = new Set([
  '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.avif',
  '.woff', '.woff2', '.ttf', '.eot', '.otf', '.map',
]);

function isStaticAsset(pathname: string): boolean {
  const dot = pathname.lastIndexOf('.');
  if (dot < 0) return false;
  return STATIC_EXTENSIONS.has(pathname.slice(dot).toLowerCase());
}

async function serveStaticAsset(request: Request, env: Env, pathname: string): Promise<Response> {
  const response = await env.ASSETS.fetch(request);
  const headers = new Headers(response.headers);
  if (pathname.endsWith('.css') || pathname.endsWith('.js')) {
    headers.set('Cache-Control', 'no-cache, must-revalidate');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function htmlPage(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
    },
  });
}

function isBackendApiRequest(path: string): boolean {
  return path === '/api/announcement' ||
    path === '/api/translate' ||
    path === '/api/geoip' ||
    path === '/api/geowea' ||
    path === '/api/v1' ||
    path.startsWith('/api/v1/');
}

function extractR2EventObjectKey(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const event = body as { object?: { key?: unknown } };
  return typeof event.object?.key === 'string' && event.object.key ? event.object.key : null;
}

async function purgePublicObjectUrls(keys: string[], env: Env): Promise<void> {
  const apiToken = env.CACHE_PURGE_API_TOKEN?.trim();
  const zoneId = env.CACHE_PURGE_ZONE_ID?.trim();
  const baseUrl = (env.R2_PUBLIC_BASE_URL || 'https://oss.yume.zone').trim().replace(/\/+$/, '');

  if (!apiToken || !zoneId || !baseUrl) {
    console.warn('Skipping cache purge because CACHE_PURGE_API_TOKEN, CACHE_PURGE_ZONE_ID, or R2_PUBLIC_BASE_URL is missing.');
    return;
  }

  const files = Array.from(new Set(keys)).map((key) => (
    baseUrl + '/' + key.split('/').map(encodeURIComponent).join('/')
  ));

  const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Cloudflare cache purge failed (${response.status}): ${body}`);
  }
}

async function serve404Page(request: Request, env: Env): Promise<Response> {
  const siteSettings = await getSettings(env);
  let notFoundHtml = await fetchAssetHtml(env.ASSETS, request.url, '/404.html');
  notFoundHtml = injectBranding(notFoundHtml, siteSettings);
  return htmlPage(notFoundHtml, 404);
}

async function handleShareRoutes(
  request: Request,
  env: Env,
  url: URL,
  path: string,
  method: string,
): Promise<Response> {
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 2 && method === 'GET') {
    return download.handleSharePage(request, env);
  }
  if (segments.length === 3 && segments[2] === 'download' && method === 'GET') {
    return download.handleShareDownload(request, env);
  }
  if (segments.length === 3 && segments[2] === 'preview' && method === 'GET') {
    return download.handlePreview(request, env);
  }
  if (segments.length === 3 && segments[2] === 'folder-download' && method === 'GET') {
    return download.handleFolderShareDownload(request, env);
  }
  if (segments.length === 3 && segments[2] === 'folder-preview' && method === 'GET') {
    return download.handleFolderSharePreview(request, env);
  }
  if (segments.length === 3 && segments[2] === 'verify' && method === 'POST') {
    return download.handleSharePassword(request, env);
  }

  return error('Not found', 404);
}

async function handleApiRoutes(
  request: Request,
  env: Env,
  url: URL,
  path: string,
  method: string,
): Promise<Response> {
  if (path === '/api/files' && method === 'GET') {
    return files.list(request, env);
  }
  if (path === '/api/files/upload' && method === 'POST') {
    return files.upload(request, env);
  }
  if (path === '/api/files/upload' && method === 'PUT') {
    return files.upload(request, env);
  }
  if (path === '/api/files/delete' && method === 'POST') {
    return files.deleteFiles(request, env);
  }

  const filesMatch = path.match(/^\/api\/files\/([^/]+)$/);
  if (filesMatch) {
    if (method === 'GET') return files.get(request, env);
    if (method === 'PUT') return files.rename(request, env);
    if (method === 'DELETE') return files.deleteFiles(request, env);
  }

  const thumbnailMatch = path.match(/^\/api\/files\/([^/]+)\/thumbnail$/);
  if (thumbnailMatch && method === 'GET') {
    return files.thumbnail(request, env);
  }

  const previewMatch = path.match(/^\/api\/files\/([^/]+)\/preview$/);
  if (previewMatch && method === 'GET') {
    return files.preview(request, env);
  }

  const fileDownloadMatch = path.match(/^\/api\/files\/([^/]+)\/download$/);
  if (fileDownloadMatch && method === 'GET') {
    return files.download(request, env);
  }

  const fileDirectLinkMatch = path.match(/^\/api\/files\/([^/]+)\/direct-link$/);
  if (fileDirectLinkMatch && method === 'GET') {
    return files.directLink(request, env);
  }

  if (path === '/api/files/zip' && method === 'POST') {
    return files.zipDownload(request, env);
  }

  if (path === '/api/folders' && method === 'GET') {
    return files.listFolders(request, env);
  }
  if (path === '/api/folders' && method === 'POST') {
    return files.createFolder(request, env);
  }
  if (path === '/api/folders' && method === 'DELETE') {
    return files.deleteFolder(request, env);
  }
  if (path === '/api/folders' && method === 'PUT') {
    return files.renameFolder(request, env);
  }
  if (path === '/api/folders/exclude' && method === 'POST') {
    return share.toggleFolderExclude(request, env);
  }
  if (path === '/api/folders/share' && method === 'POST') {
    return share.shareFolderToggle(request, env);
  }
  if (path === '/api/folders/shared' && method === 'GET') {
    return share.listSharedFolders(request, env);
  }
  if (path === '/api/files/move' && method === 'POST') {
    return files.moveFiles(request, env);
  }

  if (path === '/api/share' && method === 'POST') {
    return share.createShare(request, env);
  }

  const shareMatch = path.match(/^\/api\/share\/([^/]+)$/);
  if (shareMatch) {
    if (method === 'DELETE') return share.revokeShare(request, env);
    if (method === 'GET') return share.getShareInfo(request, env);
  }

  if (path === '/api/folder-share-link' && method === 'POST') {
    return share.createFolderShareLink(request, env);
  }
  if (path.startsWith('/api/folder-share-link/') && method === 'DELETE') {
    return share.revokeFolderShareLink(request, env);
  }
  if (path.startsWith('/api/folder-share-link/') && method === 'GET') {
    return share.getFolderShareLinkInfo(request, env);
  }

  if (path === '/api/stats' && method === 'GET') {
    return stats.getStats(request, env);
  }

  if (path === '/api/settings' && method === 'GET') {
    return settings.handleGetSettings(request, env);
  }
  if (path === '/api/settings' && method === 'PUT') {
    return settings.handlePutSettings(request, env);
  }

  return error('Not found', 404);
}
