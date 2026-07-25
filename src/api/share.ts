import { Env } from '../utils/types';
import { json, error } from '../utils/response';
import { getSettings } from './settings';
import {
  deleteFolderShareLinkByFolder,
  getAllFiles,
  getExcludedFolderSet,
  getFile,
  getFolderShareLinkByFolder,
  getFolderShareLinkByToken,
  getSharedFolderSet,
  incrementDownloads,
  isFolderDirectlyShared,
  isFolderExcluded,
  setFileShare,
  setFolderExcluded,
  setFolderShared,
  upsertFolderShareLink,
} from '../utils/db';
import { listFolderContents, normalizeFolderPath } from '../utils/storage';

function extractFileId(url: URL): string | null {
  const parts = url.pathname.split('/');
  const idx = parts.indexOf('share');
  return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null;
}

async function hashSharePassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + ':cloudvault-share-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifySharePassword(input: string, storedHash: string): Promise<boolean> {
  const inputHash = await hashSharePassword(input);
  const encoder = new TextEncoder();
  const a = encoder.encode(inputHash);
  const b = encoder.encode(storedHash);
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

// ─── Folder Sharing Helpers ───────────────────────────────────────────

export async function getSharedFolders(env: Env): Promise<Set<string>> {
  return getSharedFolderSet(env);
}

export async function getExcludedFolders(env: Env): Promise<Set<string>> {
  return getExcludedFolderSet(env);
}

export function isFolderShared(folderPath: string, sharedFolders: Set<string>, excludedFolders?: Set<string>): boolean {
  if (!folderPath || folderPath === 'root') return false;
  if (excludedFolders?.has(folderPath)) return false;
  let current = folderPath;
  while (current) {
    if (sharedFolders.has(current)) return true;
    const lastSlash = current.lastIndexOf('/');
    if (lastSlash < 0) break;
    current = current.substring(0, lastSlash);
  }
  return false;
}

// ─── File Share CRUD ──────────────────────────────────────────────────

export async function createShare(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{
    fileId: string;
    password?: string;
    expiresInDays?: number;
  }>();

  if (!body.fileId) return error('fileId required', 400);

  const meta = await getFile(env, body.fileId);
  if (!meta) return error('File not found', 404);

  const token = crypto.randomUUID();
  let passwordHash: string | null = null;
  if (body.password) {
    passwordHash = await hashSharePassword(body.password);
  }

  let expiresAt: string | null = null;
  if (body.expiresInDays && body.expiresInDays > 0) {
    expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  }

  meta.shareToken = token;
  meta.sharePassword = passwordHash;
  meta.shareExpiresAt = expiresAt;

  await setFileShare(env, body.fileId, token, passwordHash, expiresAt);

  return json({
    token,
    url: '/s/' + token,
    expiresAt,
    hasPassword: !!passwordHash,
  });
}

export async function revokeShare(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const fileId = extractFileId(url);
  if (!fileId) return error('File ID required', 400);

  const meta = await getFile(env, fileId);
  if (!meta) return error('File not found', 404);

  meta.shareToken = null;
  meta.sharePassword = null;
  meta.shareExpiresAt = null;

  await setFileShare(env, fileId, null, null, null);

  return json({ message: 'Share revoked' });
}

export async function getShareInfo(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const fileId = extractFileId(url);
  if (!fileId) return error('File ID required', 400);

  const meta = await getFile(env, fileId);
  if (!meta) return error('File not found', 404);

  return json({
    fileId: meta.id,
    token: meta.shareToken,
    hasPassword: !!meta.sharePassword,
    expiresAt: meta.shareExpiresAt,
    downloads: meta.downloads,
  });
}

// ─── Folder Share Toggle ──────────────────────────────────────────────

export async function shareFolderToggle(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ folder: string }>();
  if (!body.folder?.trim()) return error('Folder name required', 400);

  const folder = body.folder.trim();
  const existing = await isFolderDirectlyShared(env, folder);

  if (existing) {
    await setFolderShared(env, folder, false);
    return json({ shared: false, folder });
  }

  await setFolderShared(env, folder, true);
  return json({ shared: true, folder });
}

export async function listSharedFolders(_request: Request, env: Env): Promise<Response> {
  const folders = await getSharedFolders(env);
  return json({ folders: Array.from(folders).sort() });
}

export async function toggleFolderExclude(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ folder: string }>();
  if (!body.folder?.trim()) return error('Folder name required', 400);

  const folder = body.folder.trim();
  const existing = await isFolderExcluded(env, folder);

  if (existing) {
    await setFolderExcluded(env, folder, false);
    return json({ excluded: false, folder });
  }

  await setFolderExcluded(env, folder, true);
  return json({ excluded: true, folder });
}

// ─── Folder Share Link CRUD ────────────────────────────────────────────

export async function createFolderShareLink(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{
    folder: string;
    password?: string;
    expiresInDays?: number;
  }>();

  if (!body.folder?.trim()) return error('Folder name required', 400);
  const folder = body.folder.trim();

  const token = crypto.randomUUID();
  let passwordHash: string | null = null;
  if (body.password) {
    passwordHash = await hashSharePassword(body.password);
  }

  let expiresAt: string | null = null;
  if (body.expiresInDays && body.expiresInDays > 0) {
    expiresAt = new Date(Date.now() + body.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  }

  await upsertFolderShareLink(env, {
    token,
    folder,
    passwordHash,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  return json({
    token,
    url: '/s/' + token,
    expiresAt,
    hasPassword: !!passwordHash,
  });
}

export async function revokeFolderShareLink(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const folder = decodeURIComponent(url.pathname.split('/').slice(3).join('/'));
  if (!folder) return error('Folder path required', 400);

  const meta = await getFolderShareLinkByFolder(env, folder);
  if (!meta) return error('No share link found for this folder', 404);

  await deleteFolderShareLinkByFolder(env, folder);

  return json({ message: 'Folder share link revoked' });
}

export async function getFolderShareLinkInfo(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const folder = decodeURIComponent(url.pathname.split('/').slice(3).join('/'));
  if (!folder) return error('Folder path required', 400);

  const meta = await getFolderShareLinkByFolder(env, folder);
  if (!meta) return json({ token: null });
  return json({
    folder,
    token: meta.token,
    hasPassword: !!meta.passwordHash,
    expiresAt: meta.expiresAt,
  });
}

export async function resolveFolderShareToken(token: string, env: Env): Promise<{ folder: string; passwordHash: string | null; expiresAt: string | null } | null> {
  const data = await getFolderShareLinkByToken(env, token);
  if (!data) return null;
  return { folder: data.folder, passwordHash: data.passwordHash || null, expiresAt: data.expiresAt || null };
}

export async function browseFolderShareLink(folder: string, subpath: string, env: Env): Promise<{ files: Array<{ id: string; name: string; size: number; type: string; folder: string; uploadedAt: string }>; subfolders: string[] }> {
  const browsePath = normalizeFolderPath(subpath ? folder + '/' + subpath : folder);
  const listing = await listFolderContents(env, browsePath);

  const folderFiles = listing.files
    .map(f => ({
      id: f.id, name: f.name, size: f.size, type: f.type,
      folder: f.folder, uploadedAt: f.uploadedAt,
    }))
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));

  return { files: folderFiles, subfolders: listing.subfolders };
}

// ─── Public Shared Listing (with folder inheritance) ──────────────────

export async function listPublicShared(request: Request, env: Env): Promise<Response> {
  const settings = await getSettings(env);
  const sharedFolders = await getSharedFolders(env);
  const excludedFolders = await getExcludedFolders(env);
  const allFiles = await getAllFiles(env);

  const visibleFolders = Array.from(sharedFolders).filter(sf => !excludedFolders.has(sf));

  const files: Array<{
    id: string; name: string; size: number; type: string;
    token: string | null; folder: string; uploadedAt: string;
  }> = [];

  for (const meta of allFiles) {
    const hasValidShareLink = !!meta.shareToken && !meta.sharePassword &&
      (!meta.shareExpiresAt || new Date(meta.shareExpiresAt) >= new Date());
    const inSharedFolder = isFolderShared(meta.folder, sharedFolders, excludedFolders);

    if (hasValidShareLink && !inSharedFolder) {
      files.push({
        id: meta.id, name: meta.name, size: meta.size, type: meta.type,
        token: meta.shareToken, folder: meta.folder, uploadedAt: meta.uploadedAt,
      });
    }
  }

  files.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  return json({
    files,
    sharedFolders: visibleFolders.sort(),
    settings: {
      showLoginButton: settings.showLoginButton,
      siteName: settings.siteName,
      siteIconUrl: settings.siteIconUrl,
      logoBarImageUrl: settings.logoBarImageUrl,
    },
  });
}

// ─── Public Folder Browse ─────────────────────────────────────────────

export async function browsePublicFolder(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const rawPath = url.searchParams.get('path') || '';
  const path = rawPath ? normalizeFolderPath(rawPath) : '';
  const sharedFolders = await getSharedFolders(env);
  const excludedFolders = await getExcludedFolders(env);

  if (!path) {
    const visibleFolders = Array.from(sharedFolders).filter(sf => !excludedFolders.has(sf));
    return json({ files: [], subfolders: visibleFolders.sort(), currentFolder: '' });
  }

  const isSharedOrChild = isFolderShared(path, sharedFolders, excludedFolders);
  const isAncestorOfShared = !isSharedOrChild && Array.from(sharedFolders).some(
    sf => sf.startsWith(path + '/') && !excludedFolders.has(sf)
  );

  if (!isSharedOrChild && !isAncestorOfShared) {
    return error('Folder not shared', 403);
  }

  let folderFiles: Array<{
    id: string; name: string; size: number; type: string;
    token: string | null; folder: string; uploadedAt: string;
  }> = [];
  const subfolderSet = new Set<string>();

  if (isSharedOrChild) {
    const listing = await listFolderContents(env, path);
    folderFiles = listing.files
      .map(f => ({
        id: f.id, name: f.name, size: f.size, type: f.type,
        token: f.shareToken || null, folder: f.folder, uploadedAt: f.uploadedAt,
      }))
      .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
    for (const subfolder of listing.subfolders) {
      subfolderSet.add(subfolder);
    }
  }

  const prefix = path ? path + '/' : '';
  if (isAncestorOfShared) {
    for (const sf of sharedFolders) {
      if (sf.startsWith(prefix)) {
        const rest = sf.slice(prefix.length);
        const slashIdx = rest.indexOf('/');
        const childName = slashIdx >= 0 ? rest.substring(0, slashIdx) : rest;
        if (childName) subfolderSet.add(prefix + childName);
      }
    }
  }

  for (const ex of excludedFolders) {
    subfolderSet.delete(ex);
    for (const sf of subfolderSet) {
      if (sf.startsWith(ex + '/')) subfolderSet.delete(sf);
    }
  }

  return json({ files: folderFiles, subfolders: Array.from(subfolderSet).sort(), currentFolder: path });
}

// ─── Public File Download (folder-shared files) ──────────────────────

export async function publicDownload(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const fileId = parts[parts.length - 1];
  if (!fileId) return error('File ID required', 400);

  const meta = await getFile(env, fileId);
  if (!meta) return error('File not found', 404);

  const hasPublicLink = !!meta.shareToken && !meta.sharePassword &&
    (!meta.shareExpiresAt || new Date(meta.shareExpiresAt) >= new Date());
  const sharedFolders = await getSharedFolders(env);
  const excludedFolders = await getExcludedFolders(env);
  const inSharedFolder = isFolderShared(meta.folder, sharedFolders, excludedFolders);

  if (!hasPublicLink && !inSharedFolder) {
    return error('File not publicly accessible', 403);
  }

  const object = await env.VAULT_BUCKET.get(meta.key);
  if (!object) return error('File not found in storage', 404);

  meta.downloads++;
  await incrementDownloads(env, meta.id);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=14400, s-maxage=86400');
  headers.set('Content-Disposition', 'attachment; filename="' + encodeURIComponent(meta.name) + '"');
  headers.set('Content-Length', String(object.size));

  return new Response(object.body, { headers });
}

export async function publicPreview(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const fileId = parts[parts.length - 1];
  if (!fileId) return error('File ID required', 400);

  const meta = await getFile(env, fileId);
  if (!meta) return error('File not found', 404);

  const hasPublicLink = !!meta.shareToken && !meta.sharePassword &&
    (!meta.shareExpiresAt || new Date(meta.shareExpiresAt) >= new Date());
  const sharedFolders = await getSharedFolders(env);
  const excludedFolders = await getExcludedFolders(env);
  const inSharedFolder = isFolderShared(meta.folder, sharedFolders, excludedFolders);

  if (!hasPublicLink && !inSharedFolder) {
    return error('File not publicly accessible', 403);
  }

  const object = await env.VAULT_BUCKET.get(meta.key);
  if (!object) return error('File not found in storage', 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Content-Type', meta.type || 'application/octet-stream');
  headers.set('Content-Disposition', 'inline; filename="' + encodeURIComponent(meta.name) + '"');
  headers.set('Cache-Control', 'public, max-age=14400, s-maxage=86400');
  headers.set('Accept-Ranges', 'bytes');

  const rangeHeader = request.headers.get('Range');
  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
    if (match) {
      const totalSize = object.size;
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
      if (start >= totalSize || end >= totalSize || start > end) {
        return new Response('Range Not Satisfiable', {
          status: 416,
          headers: { 'Content-Range': 'bytes */' + totalSize },
        });
      }
      headers.set('Content-Range', 'bytes ' + start + '-' + end + '/' + totalSize);
      headers.set('Content-Length', String(end - start + 1));
      return new Response(object.body, { status: 206, headers });
    }
  }

  headers.set('Content-Length', String(object.size));
  return new Response(object.body, { headers });
}
