import { Env, FileMeta } from '../utils/types';
import { getMimeType } from '../utils/response';
import {
  createFolderRecord,
  deleteFile,
  deleteFilesByFolderTree,
  deleteFolderShareStateForTree,
  deleteFolderTreeRecords,
  ensureFolderChain,
  findFileByPath,
  getAllFiles,
  getAllFolders,
  replaceFileByKey,
  saveFile,
} from '../utils/db';
import {
  multistatusResponse,
  propstatEntry,
  fileToProps,
  fileToHref,
  folderToProps,
  folderToHref,
} from '../utils/webdav-xml';

const DAV_PREFIX = '/dav/';
const DAV_METHODS = 'OPTIONS, PROPFIND, GET, HEAD, PUT, DELETE, MKCOL, MOVE, COPY';

function parseDavPath(request: Request): string {
  const url = new URL(request.url);
  const raw = decodeURIComponent(url.pathname.slice(DAV_PREFIX.length));
  return raw.replace(/\/+$/, '');
}

function toFolder(davPath: string): string {
  const idx = davPath.lastIndexOf('/');
  return idx < 0 ? 'root' : davPath.substring(0, idx);
}

function toFileName(davPath: string): string {
  return davPath.split('/').pop() || davPath;
}

function toR2Key(folder: string, name: string): string {
  return folder === 'root' ? name : folder + '/' + name;
}

async function findFileByDavPath(env: Env, davPath: string): Promise<FileMeta | null> {
  const folder = toFolder(davPath);
  const name = toFileName(davPath);
  return findFileByPath(env, folder, name);
}

export async function handleWebDav(request: Request, env: Env): Promise<Response> {
  const method = request.method;

  switch (method) {
    case 'OPTIONS': return handleOptions();
    case 'PROPFIND': return handlePropfind(request, env);
    case 'GET': return handleGet(request, env);
    case 'HEAD': return handleHead(request, env);
    case 'PUT': return handlePut(request, env);
    case 'DELETE': return handleDelete(request, env);
    case 'MKCOL': return handleMkcol(request, env);
    case 'MOVE': return handleMove(request, env);
    case 'COPY': return handleCopy(request, env);
    default:
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: DAV_METHODS },
      });
  }
}

function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: DAV_METHODS,
      DAV: '1',
      'MS-Author-Via': 'DAV',
    },
  });
}

async function handlePropfind(request: Request, env: Env): Promise<Response> {
  const davPath = parseDavPath(request);
  const depth = request.headers.get('Depth') ?? '1';

  if (davPath === '') {
    return propfindRoot(env, depth);
  }

  const file = await findFileByDavPath(env, davPath);
  if (file) {
    return multistatusResponse([
      propstatEntry(fileToHref(file), fileToProps(file), false),
    ]);
  }

  const folders = await getAllFolders(env);
  const allFiles = await getAllFiles(env);

  if (!isDirPath(davPath, folders, allFiles)) {
    return new Response('Not Found', { status: 404 });
  }

  const items: string[] = [
    propstatEntry(folderToHref(davPath), folderToProps(davPath, folders.get(davPath)), true),
  ];

  if (depth !== '0') {
    const directFiles = allFiles.filter(f => f.folder === davPath);
    for (const f of directFiles) {
      items.push(propstatEntry(fileToHref(f), fileToProps(f), false));
    }

    const childNames = collectChildFolders(davPath, folders, allFiles);
    for (const cn of childNames) {
      const fullPath = davPath + '/' + cn;
      items.push(propstatEntry(folderToHref(fullPath), folderToProps(fullPath, folders.get(fullPath)), true));
    }
  }

  return multistatusResponse(items);
}

async function propfindRoot(env: Env, depth: string): Promise<Response> {
  const items: string[] = [
    propstatEntry(folderToHref(''), folderToProps('', new Date().toISOString()), true),
  ];

  if (depth !== '0') {
    const folders = await getAllFolders(env);
    const allFiles = await getAllFiles(env);

    const rootFiles = allFiles.filter(f => f.folder === 'root');
    for (const f of rootFiles) {
      items.push(propstatEntry(fileToHref(f), fileToProps(f), false));
    }

    const topFolders = new Set<string>();
    for (const [name] of folders) {
      const top = name.split('/')[0];
      topFolders.add(top);
    }
    for (const f of allFiles) {
      if (f.folder !== 'root') {
        topFolders.add(f.folder.split('/')[0]);
      }
    }
    for (const tf of topFolders) {
      items.push(propstatEntry(folderToHref(tf), folderToProps(tf, folders.get(tf)), true));
    }
  }

  return multistatusResponse(items);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1073741824).toFixed(2) + ' GB';
}

function encodeDavHref(davPath: string, trailingSlash = false): string {
  if (!davPath) return '/dav/';
  const encoded = davPath.split('/').map(s => encodeURIComponent(s)).join('/');
  return '/dav/' + encoded + (trailingSlash ? '/' : '');
}

function isDirPath(davPath: string, folders: Map<string, string>, allFiles: FileMeta[]): boolean {
  if (!davPath) return true;
  return folders.has(davPath) || allFiles.some(f => f.folder === davPath || f.folder.startsWith(davPath + '/'));
}

function collectChildFolders(davPath: string, folders: Map<string, string>, allFiles: FileMeta[]): string[] {
  const childSet = new Set<string>();
  const prefix = davPath ? davPath + '/' : '';

  if (!davPath) {
    for (const [name] of folders) { childSet.add(name.split('/')[0]); }
    for (const f of allFiles) { if (f.folder !== 'root') childSet.add(f.folder.split('/')[0]); }
  } else {
    for (const [name] of folders) {
      if (name.startsWith(prefix) && !name.slice(prefix.length).includes('/')) {
        childSet.add(name.slice(prefix.length));
      }
    }
    for (const f of allFiles) {
      if (f.folder.startsWith(prefix) && !f.folder.slice(prefix.length).includes('/')) {
        childSet.add(f.folder.slice(prefix.length));
      }
    }
  }

  return [...childSet].sort();
}

async function serveDirectoryListing(env: Env, davPath: string, folders: Map<string, string>, allFiles: FileMeta[]): Promise<Response> {
  const displayPath = davPath || '/';
  const childFolders = collectChildFolders(davPath, folders, allFiles);

  const directFiles = davPath
    ? allFiles.filter(f => f.folder === davPath).sort((a, b) => a.name.localeCompare(b.name))
    : allFiles.filter(f => f.folder === 'root').sort((a, b) => a.name.localeCompare(b.name));

  let rows = '';
  if (davPath) {
    const parentPath = davPath.includes('/') ? davPath.substring(0, davPath.lastIndexOf('/')) : '';
    rows += `<tr><td>📁</td><td><a href="${encodeDavHref(parentPath, true)}">..</a></td><td>—</td><td>—</td></tr>\n`;
  }
  for (const cf of childFolders) {
    const fullPath = davPath ? davPath + '/' + cf : cf;
    rows += `<tr><td>📁</td><td><a href="${encodeDavHref(fullPath, true)}">${escapeHtml(cf)}/</a></td><td>—</td><td>—</td></tr>\n`;
  }
  for (const f of directFiles) {
    const fullPath = davPath ? davPath + '/' + f.name : f.name;
    const date = f.uploadedAt ? new Date(f.uploadedAt).toISOString().slice(0, 16).replace('T', ' ') : '—';
    rows += `<tr><td>📄</td><td><a href="${encodeDavHref(fullPath)}">${escapeHtml(f.name)}</a></td><td>${formatSize(f.size)}</td><td>${date}</td></tr>\n`;
  }

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WebDAV — ${escapeHtml(displayPath)}</title>
<style>body{font-family:system-ui,sans-serif;margin:2rem;color:#e0e0e0;background:#1a1a2e}
a{color:#82aaff;text-decoration:none}a:hover{text-decoration:underline}
table{border-collapse:collapse;width:100%;max-width:800px}th,td{text-align:left;padding:6px 12px;border-bottom:1px solid #333}
th{color:#888;font-size:13px}h1{font-size:18px;font-weight:500}</style></head>
<body><h1>Index of ${escapeHtml(displayPath)}</h1>
<table><thead><tr><th></th><th>Name</th><th>Size</th><th>Modified</th></tr></thead>
<tbody>${rows}</tbody></table>
<p style="color:#555;font-size:12px;margin-top:2rem">Yume Official Backend WebDAV</p></body></html>`;

  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleGet(request: Request, env: Env): Promise<Response> {
  const davPath = parseDavPath(request);
  const folders = await getAllFolders(env);
  const allFiles = await getAllFiles(env);
  const isDir = isDirPath(davPath, folders, allFiles);

  if (isDir) {
    const isBrowser = (request.headers.get('Accept') || '').includes('text/html');
    if (!isBrowser) return new Response('', { status: 200, headers: { 'Content-Type': 'httpd/unix-directory' } });
    return serveDirectoryListing(env, davPath, folders, allFiles);
  }

  const folder = toFolder(davPath);
  const name = toFileName(davPath);
  const file = allFiles.find(f => f.folder === folder && f.name === name) || null;

  const r2Key = file ? file.key : toR2Key(folder, name);
  const object = await env.VAULT_BUCKET.get(r2Key, {
    onlyIf: request.headers,
    range: request.headers,
  });
  if (!object) return new Response('Not Found', { status: 404 });

  if (!('body' in object)) {
    return new Response('Preconditions failed', { status: 412 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Length', String(object.size));
  if (file) {
    headers.set('etag', '"' + file.id + '"');
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', file.type || getMimeType(file.name));
    }
  } else if (!headers.has('Content-Type')) {
    headers.set('Content-Type', getMimeType(name));
  }

  return new Response(object.body, { headers });
}

async function handleHead(request: Request, env: Env): Promise<Response> {
  const davPath = parseDavPath(request);
  const folders = await getAllFolders(env);
  const allFiles = await getAllFiles(env);

  if (davPath) {
    const folder = toFolder(davPath);
    const name = toFileName(davPath);
    const file = allFiles.find(f => f.folder === folder && f.name === name) || null;
    if (file) {
      return new Response(null, {
        status: 200,
        headers: {
          'Content-Type': file.type || getMimeType(file.name),
          'Content-Length': String(file.size),
          ETag: '"' + file.id + '"',
          'Last-Modified': new Date(file.uploadedAt).toUTCString(),
        },
      });
    }

    const r2Key = toR2Key(folder, name);
    const r2Head = await env.VAULT_BUCKET.head(r2Key);
    if (r2Head) {
      return new Response(null, {
        status: 200,
        headers: {
          'Content-Type': r2Head.httpMetadata?.contentType || getMimeType(name),
          'Content-Length': String(r2Head.size),
          'Last-Modified': r2Head.uploaded.toUTCString(),
        },
      });
    }
  }

  if (isDirPath(davPath, folders, allFiles)) {
    return new Response(null, {
      status: 200,
      headers: { 'Content-Type': 'httpd/unix-directory' },
    });
  }

  return new Response('Not Found', { status: 404 });
}

async function handlePut(request: Request, env: Env): Promise<Response> {
  const davPath = parseDavPath(request);
  if (!davPath) return new Response('Cannot PUT to root', { status: 405 });
  if (davPath.includes('..')) return new Response('Invalid path', { status: 400 });

  const folder = toFolder(davPath);
  const fileName = toFileName(davPath);
  const contentType = request.headers.get('Content-Type') || getMimeType(fileName);
  const key = toR2Key(folder, fileName);

  const existingFile = await findFileByDavPath(env, davPath);

  if (existingFile) {
    await env.VAULT_BUCKET.delete(existingFile.key);
    const r2Object = await env.VAULT_BUCKET.put(key, request.body, {
      httpMetadata: {
        contentType,
        contentDisposition: 'attachment; filename="' + fileName + '"',
      },
      customMetadata: { fileId: existingFile.id },
    });
    if (!r2Object) return new Response('Upload failed', { status: 500 });

    existingFile.key = key;
    existingFile.size = r2Object.size;
    existingFile.type = contentType;
    existingFile.uploadedAt = new Date().toISOString();
    await saveFile(env, existingFile);

    return new Response(null, { status: 204 });
  }

  if (folder !== 'root') {
    await ensureFolderChain(env, folder);
  }

  const id = crypto.randomUUID();
  const r2Object = await env.VAULT_BUCKET.put(key, request.body, {
    httpMetadata: {
      contentType,
      contentDisposition: 'attachment; filename="' + fileName + '"',
    },
    customMetadata: { fileId: id },
  });
  if (!r2Object) return new Response('Upload failed', { status: 500 });

  const meta: FileMeta = {
    id,
    key,
    name: fileName,
    size: r2Object.size,
    type: contentType,
    folder,
    uploadedAt: new Date().toISOString(),
    shareToken: null,
    sharePassword: null,
    shareExpiresAt: null,
    downloads: 0,
  };

  await replaceFileByKey(env, meta);

  return new Response(null, { status: 201 });
}

async function handleDelete(request: Request, env: Env): Promise<Response> {
  const davPath = parseDavPath(request);
  if (!davPath) return new Response('Cannot DELETE root', { status: 403 });

  const file = await findFileByDavPath(env, davPath);
  if (file) {
    await env.VAULT_BUCKET.delete(file.key);
    await deleteFile(env, file.id);
    return new Response(null, { status: 204 });
  }

  const folders = await getAllFolders(env);
  const allFiles = await getAllFiles(env);
  const isFolder = folders.has(davPath) || allFiles.some(f => f.folder === davPath || f.folder.startsWith(davPath + '/'));

  if (!isFolder) return new Response('Not Found', { status: 404 });

  await deleteFolderShareStateForTree(env, davPath);
  await deleteFolderTreeRecords(env, davPath);
  const deletedFiles = await deleteFilesByFolderTree(env, davPath);
  for (const f of deletedFiles) {
    await env.VAULT_BUCKET.delete(f.key);
  }

  return new Response(null, { status: 204 });
}

async function handleMkcol(request: Request, env: Env): Promise<Response> {
  const davPath = parseDavPath(request);
  if (!davPath) return new Response('Cannot MKCOL root', { status: 405 });

  const body = await request.text();
  if (body) return new Response('Unsupported Media Type', { status: 415 });

  const existingFile = await findFileByDavPath(env, davPath);
  if (existingFile) return new Response('Conflict', { status: 409 });

  const folders = await getAllFolders(env);
  if (folders.has(davPath)) return new Response('Method Not Allowed', { status: 405 });

  const parentPath = davPath.includes('/') ? davPath.substring(0, davPath.lastIndexOf('/')) : '';
  if (parentPath && !folders.has(parentPath)) {
    const allFiles = await getAllFiles(env);
    const parentExists = allFiles.some(f => f.folder === parentPath || f.folder.startsWith(parentPath + '/'));
    if (!parentExists) return new Response('Conflict', { status: 409 });
  }

  await createFolderRecord(env, davPath);

  return new Response('Created', { status: 201 });
}

async function handleMove(request: Request, env: Env): Promise<Response> {
  const davPath = parseDavPath(request);
  if (!davPath) return new Response('Cannot MOVE root', { status: 403 });

  const destination = parseDestination(request);
  if (!destination) return new Response('Bad Request', { status: 400 });

  const overwrite = request.headers.get('Overwrite') !== 'F';

  const file = await findFileByDavPath(env, davPath);
  if (file) {
    const destFile = await findFileByDavPath(env, destination);
    if (destFile && !overwrite) return new Response('Precondition Failed', { status: 412 });

    if (destFile) {
      await env.VAULT_BUCKET.delete(destFile.key);
      await deleteFile(env, destFile.id);
    }

    const newFolder = toFolder(destination);
    const newName = toFileName(destination);
    const newKey = toR2Key(newFolder, newName);

    if (newFolder !== 'root') await ensureFolderChain(env, newFolder);

    const object = await env.VAULT_BUCKET.get(file.key);
    if (!object) return new Response('Not Found', { status: 404 });

    await env.VAULT_BUCKET.put(newKey, object.body, {
      httpMetadata: object.httpMetadata,
      customMetadata: object.customMetadata,
    });
    await env.VAULT_BUCKET.delete(file.key);

    file.key = newKey;
    file.folder = newFolder;
    file.name = newName;
    await saveFile(env, file);

    return new Response(null, { status: destFile ? 204 : 201 });
  }

  return new Response('Not Found', { status: 404 });
}

async function handleCopy(request: Request, env: Env): Promise<Response> {
  const davPath = parseDavPath(request);
  if (!davPath) return new Response('Cannot COPY root', { status: 403 });

  const destination = parseDestination(request);
  if (!destination) return new Response('Bad Request', { status: 400 });

  const overwrite = request.headers.get('Overwrite') !== 'F';

  const file = await findFileByDavPath(env, davPath);
  if (!file) return new Response('Not Found', { status: 404 });

  const destFile = await findFileByDavPath(env, destination);
  if (destFile && !overwrite) return new Response('Precondition Failed', { status: 412 });

  if (destFile) {
    await env.VAULT_BUCKET.delete(destFile.key);
    await deleteFile(env, destFile.id);
  }

  const newFolder = toFolder(destination);
  const newName = toFileName(destination);
  const newKey = toR2Key(newFolder, newName);
  const newId = crypto.randomUUID();

  if (newFolder !== 'root') await ensureFolderChain(env, newFolder);

  const object = await env.VAULT_BUCKET.get(file.key);
  if (!object) return new Response('Not Found', { status: 404 });

  await env.VAULT_BUCKET.put(newKey, object.body, {
    httpMetadata: object.httpMetadata,
    customMetadata: { fileId: newId },
  });

  const meta: FileMeta = {
    id: newId,
    key: newKey,
    name: newName,
    size: file.size,
    type: file.type,
    folder: newFolder,
    uploadedAt: new Date().toISOString(),
    shareToken: null,
    sharePassword: null,
    shareExpiresAt: null,
    downloads: 0,
  };

  await replaceFileByKey(env, meta);

  return new Response(null, { status: destFile ? 204 : 201 });
}

function parseDestination(request: Request): string | null {
  const dest = request.headers.get('Destination');
  if (!dest) return null;

  try {
    const url = new URL(dest);
    const decoded = decodeURIComponent(url.pathname);
    if (!decoded.startsWith(DAV_PREFIX)) return null;
    return decoded.slice(DAV_PREFIX.length).replace(/\/+$/, '');
  } catch {
    const decoded = decodeURIComponent(dest);
    if (!decoded.startsWith(DAV_PREFIX)) return null;
    return decoded.slice(DAV_PREFIX.length).replace(/\/+$/, '');
  }
}
