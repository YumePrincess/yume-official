import { Env, FileMeta } from '../utils/types';
import { json, error, getMimeType } from '../utils/response';
import { getSharedFolders, getExcludedFolders, isFolderShared } from './share';
import {
  createFolderRecord,
  deleteFile,
  deleteClashSubscriptionsByFileId,
  deleteClashSubscriptionsByFileIds,
  deleteFilesByFolderTree,
  deleteFolderShareStateForTree,
  deleteFolderTreeRecords,
  ensureFolderChain,
  getAllFolders,
  getFile,
  getFileByKey,
  getFolderTreeRecords,
  getFilesByIds,
  listFiles as listFilesFromDb,
  renameFolderRecords,
  renameFolderShareState,
  replaceFileByKey,
  saveFile,
} from '../utils/db';
import {
  ensureFileRecordById,
  keyFromFolderAndName,
  listAllObjectsInFolderTree,
  listFolderContents,
  normalizeFolderPath,
} from '../utils/storage';
import { markBucketUsageDirty } from '../utils/bucket-usage';

function applyNoStorePreviewHeaders(headers: Headers, etag?: string | null, uploadedAt?: string | null): void {
  if (etag) headers.set('etag', etag);
  if (uploadedAt) headers.set('Last-Modified', new Date(uploadedAt).toUTCString());
  headers.set('Cache-Control', 'private, no-store, no-cache, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
}

function extractId(url: URL): string | null {
  const parts = url.pathname.split('/');
  const idx = parts.indexOf('files');
  return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : null;
}

export async function upload(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  if (action === 'mpu-create') {
    return handleMultipartCreate(request, env);
  }
  if (action === 'mpu-upload') {
    return handleMultipartUpload(request, env, url);
  }
  if (action === 'mpu-complete') {
    return handleMultipartComplete(request, env);
  }

  return handleDirectUpload(request, env);
}

async function handleDirectUpload(request: Request, env: Env): Promise<Response> {
  const fileName = decodeURIComponent(request.headers.get('X-File-Name') || 'untitled');
  const folder = decodeURIComponent(request.headers.get('X-Folder') || 'root');
  const contentType = request.headers.get('Content-Type') || getMimeType(fileName);
  const key = folder === 'root' ? fileName : folder + '/' + fileName;

  if (!key || key.includes('..')) return error('Invalid file path', 400);
  if (folder !== 'root') await ensureFolderChain(env, folder);
  const existing = await getFileByKey(env, key);
  const id = existing?.id || crypto.randomUUID();

  const r2Object = await env.VAULT_BUCKET.put(key, request.body, {
    httpMetadata: {
      contentType,
      contentDisposition: 'attachment; filename="' + fileName + '"',
    },
    customMetadata: { fileId: id },
  });

  if (!r2Object) return error('Upload failed', 500);

  const meta: FileMeta = {
    id,
    key,
    name: fileName,
    size: r2Object.size,
    type: contentType,
    folder,
    uploadedAt: new Date().toISOString(),
    shareToken: existing?.shareToken || null,
    sharePassword: existing?.sharePassword || null,
    shareExpiresAt: existing?.shareExpiresAt || null,
    downloads: existing?.downloads || 0,
  };

  await replaceFileByKey(env, meta);
  await markBucketUsageDirty(env);

  return json(meta, 201);
}

async function handleMultipartCreate(request: Request, env: Env): Promise<Response> {
  const fileName = decodeURIComponent(request.headers.get('X-File-Name') || 'untitled');
  const folder = decodeURIComponent(request.headers.get('X-Folder') || 'root');
  const contentType = request.headers.get('Content-Type') || getMimeType(fileName);
  const key = folder === 'root' ? fileName : folder + '/' + fileName;

  if (!key || key.includes('..')) return error('Invalid file path', 400);
  if (folder !== 'root') await ensureFolderChain(env, folder);

  const multipart = await env.VAULT_BUCKET.createMultipartUpload(key, {
    httpMetadata: {
      contentType,
      contentDisposition: 'attachment; filename="' + fileName + '"',
    },
  });

  return json({ uploadId: multipart.uploadId, key });
}

async function handleMultipartUpload(request: Request, env: Env, url: URL): Promise<Response> {
  const uploadId = url.searchParams.get('uploadId');
  const partNumber = parseInt(url.searchParams.get('partNumber') || '0', 10);
  const key = url.searchParams.get('key');

  if (!uploadId || !partNumber || !key) return error('Missing uploadId, partNumber, or key', 400);

  const multipart = env.VAULT_BUCKET.resumeMultipartUpload(key, uploadId);
  const part = await multipart.uploadPart(partNumber, request.body as ReadableStream);

  return json({ partNumber: part.partNumber, etag: part.etag });
}

async function handleMultipartComplete(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{
    uploadId: string;
    key: string;
    parts: { partNumber: number; etag: string }[];
  }>();

  if (!body.key || body.key.includes('..')) return error('Invalid file path', 400);

  const multipart = env.VAULT_BUCKET.resumeMultipartUpload(body.key, body.uploadId);
  const r2Object = await multipart.complete(body.parts);

  const fileName = body.key.split('/').pop() || body.key;
  const folder = body.key.includes('/') ? body.key.substring(0, body.key.lastIndexOf('/')) : 'root';
  if (folder !== 'root') await ensureFolderChain(env, folder);
  const existing = await getFileByKey(env, body.key);
  const id = existing?.id || crypto.randomUUID();

  const meta: FileMeta = {
    id,
    key: body.key,
    name: fileName,
    size: r2Object.size,
    type: r2Object.httpMetadata?.contentType || getMimeType(fileName),
    folder,
    uploadedAt: new Date().toISOString(),
    shareToken: existing?.shareToken || null,
    sharePassword: existing?.sharePassword || null,
    shareExpiresAt: existing?.shareExpiresAt || null,
    downloads: existing?.downloads || 0,
  };

  await replaceFileByKey(env, meta);
  await markBucketUsageDirty(env);

  return json(meta, 201);
}

export async function list(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const folderFilter = normalizeFolderPath(url.searchParams.get('folder'));
  const searchFilter = url.searchParams.get('search')?.toLowerCase();

  if (searchFilter) {
    const files = await listFilesFromDb(env, {
      folder: folderFilter === 'root' ? undefined : folderFilter,
      search: searchFilter,
    });
    return json({ files, cursor: null, totalFiles: files.length });
  }

  const listing = await listFolderContents(env, folderFilter);
  return json({
    files: listing.files,
    cursor: listing.cursor,
    totalFiles: listing.files.length,
  });
}

export async function get(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const id = extractId(url);
  if (!id) return error('File ID required', 400);

  const meta = await getFile(env, id);
  if (!meta) return error('File not found', 404);

  return json(meta);
}

export async function download(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const id = parts[parts.indexOf('files') + 1];
  if (!id) return error('File ID required', 400);

  const meta = await getFile(env, id);
  if (!meta) return error('File not found', 404);

  const object = await env.VAULT_BUCKET.get(meta.key);
  if (!object) return error('File not found in storage', 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'private, max-age=14400');
  headers.set('Content-Disposition', 'attachment; filename="' + meta.name + '"');

  return new Response(object.body, { headers });
}

export async function directLink(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const id = parts[parts.indexOf('files') + 1];
  if (!id) return error('File ID required', 400);

  const meta = await getFile(env, id);
  if (!meta) return error('File not found', 404);

  const baseUrl = (env.R2_PUBLIC_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!baseUrl) return error('R2_PUBLIC_BASE_URL is not configured', 400);

  const keyPath = meta.key.split('/').map(encodeURIComponent).join('/');
  return json({ url: baseUrl + '/' + keyPath, key: meta.key });
}

export async function deleteFiles(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  let ids: string[];

  if (request.method === 'DELETE') {
    const id = extractId(url);
    if (!id) return error('File ID required', 400);
    ids = [id];
  } else {
    const body = await request.json<{ ids: string[] }>();
    ids = body.ids;
  }

  if (!ids || ids.length === 0) return error('No file IDs provided', 400);

  let totalSizeRemoved = 0;
  let deleted = 0;
  for (const id of ids) {
    const meta = await getFile(env, id);
    if (!meta) continue;

    await env.VAULT_BUCKET.delete(meta.key);
    await deleteClashSubscriptionsByFileId(env, meta.id);
    await deleteFile(env, id);
    totalSizeRemoved += meta.size;
    deleted++;
  }

  if (deleted > 0) {
    await markBucketUsageDirty(env);
  }

  return json({ deleted, totalSizeRemoved });
}

export async function rename(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const id = extractId(url);
  if (!id) return error('File ID required', 400);

  const meta = await ensureFileRecordById(env, id);
  if (!meta) return error('File not found', 404);

  const body = await request.json<{ name: string }>();
  if (!body.name?.trim()) return error('Name required', 400);
  const newName = body.name.trim();
  const newKey = keyFromFolderAndName(meta.folder, newName);
  if (newKey === meta.key) return json(meta);

  const object = await env.VAULT_BUCKET.get(meta.key);
  if (!object) {
    await deleteFile(env, meta.id);
    return error('File not found in storage', 404);
  }

  const existingTarget = await getFileByKey(env, newKey);
  await env.VAULT_BUCKET.put(newKey, object.body, {
    httpMetadata: {
      contentType: object.httpMetadata?.contentType || meta.type,
      contentDisposition: 'attachment; filename="' + newName + '"',
      contentEncoding: object.httpMetadata?.contentEncoding,
      contentLanguage: object.httpMetadata?.contentLanguage,
      cacheControl: object.httpMetadata?.cacheControl,
      cacheExpiry: object.httpMetadata?.cacheExpiry,
    },
    customMetadata: object.customMetadata,
  });
  await env.VAULT_BUCKET.delete(meta.key);
  if (existingTarget && existingTarget.id !== meta.id) {
    await deleteFile(env, existingTarget.id);
  }

  meta.name = newName;
  meta.key = newKey;
  await saveFile(env, meta);
  await markBucketUsageDirty(env);

  return json(meta);
}

export async function createFolder(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ name: string; parent: string }>();
  if (!body.name?.trim()) return error('Folder name required', 400);

  const folderName = body.parent === 'root' ? body.name.trim() : body.parent + '/' + body.name.trim();
  await createFolderRecord(env, folderName);

  return json({ folder: folderName }, 201);
}

export async function deleteFolder(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ folder: string }>();
  if (!body.folder?.trim()) return error('Folder name required', 400);
  const folder = normalizeFolderPath(body.folder);

  const filesInTree = await listAllObjectsInFolderTree(env, folder);
  let totalSizeRemoved = 0;
  for (const file of filesInTree) {
    await env.VAULT_BUCKET.delete(file.key);
    totalSizeRemoved += file.size;
  }

  await deleteFolderShareStateForTree(env, folder);
  const deletedFolders = await deleteFolderTreeRecords(env, folder);
  const deletedFiles = await deleteFilesByFolderTree(env, folder);
  await deleteClashSubscriptionsByFileIds(env, filesInTree.map(file => file.id));
  if (filesInTree.length > 0) {
    await markBucketUsageDirty(env);
  }

  return json({
    deleted: folder,
    deletedFiles: Math.max(deletedFiles.length, filesInTree.length),
    deletedSubfolders: deletedFolders.filter(f => f.name !== folder).length,
    totalSizeRemoved,
  });
}

export async function renameFolder(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ oldName: string; newName: string }>();
  if (!body.oldName?.trim() || !body.newName?.trim()) return error('Both old and new names required', 400);
  const oldName = normalizeFolderPath(body.oldName);
  const newName = normalizeFolderPath(body.newName);
  if (oldName === newName) return json({ folder: newName });

  const filesToMove = await listAllObjectsInFolderTree(env, oldName);
  await createFolderRecord(env, newName);
  for (const file of filesToMove) {
    const newFolder = newName + file.folder.slice(oldName.length);
    const newKey = keyFromFolderAndName(newFolder, file.name);
    const object = await env.VAULT_BUCKET.get(file.key);
    if (!object) continue;

    const existingTarget = await getFileByKey(env, newKey);
    await env.VAULT_BUCKET.put(newKey, object.body, {
      httpMetadata: object.httpMetadata,
      customMetadata: object.customMetadata,
    });
    await env.VAULT_BUCKET.delete(file.key);
    if (existingTarget && existingTarget.id !== file.id) {
      await deleteFile(env, existingTarget.id);
    }

    file.key = newKey;
    file.folder = newFolder;
    await saveFile(env, file);
  }

  await renameFolderRecords(env, oldName, newName);
  await renameFolderShareState(env, oldName, newName);
  await markBucketUsageDirty(env);
  return json({ folder: newName });
}

export async function listFolders(_request: Request, env: Env): Promise<Response> {
  const folderSet = new Set<string>();

  const folders = await getAllFolders(env);
  for (const [name] of folders) {
    if (name) folderSet.add(name);
  }

  // Ensure all intermediate parent folders are included in the set
  for (const folder of [...folderSet]) {
    const parts = folder.split('/');
    let path = '';
    for (let i = 0; i < parts.length - 1; i++) {
      path = path ? path + '/' + parts[i] : parts[i];
      folderSet.add(path);
    }
  }

  const sharedFolders = await getSharedFolders(env);
  const excludedFolders = await getExcludedFolders(env);
  const folderList = Array.from(folderSet).sort().map(name => ({
    name,
    shared: isFolderShared(name, sharedFolders, excludedFolders),
    directlyShared: sharedFolders.has(name),
    excluded: excludedFolders.has(name),
  }));

  return json({ folders: folderList });
}

export async function moveFiles(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ ids: string[]; targetFolder: string }>();
  if (!body.ids?.length) return error('No file IDs provided', 400);
  if (body.targetFolder === undefined) return error('Target folder required', 400);

  const targetFolder = normalizeFolderPath(body.targetFolder);
  if (targetFolder !== 'root') await ensureFolderChain(env, targetFolder);
  let moved = 0;

  for (const id of body.ids) {
    const meta = await getFile(env, id);
    if (!meta) continue;

    if (meta.folder === targetFolder) continue;

    const newKey = targetFolder === 'root' ? meta.name : targetFolder + '/' + meta.name;

    const oldObject = await env.VAULT_BUCKET.get(meta.key);
    if (!oldObject) continue;

    const existingTarget = await getFileByKey(env, newKey);

    await env.VAULT_BUCKET.put(newKey, oldObject.body, {
      httpMetadata: oldObject.httpMetadata,
      customMetadata: oldObject.customMetadata,
    });
    await env.VAULT_BUCKET.delete(meta.key);

    if (existingTarget && existingTarget.id !== meta.id) {
      await deleteFile(env, existingTarget.id);
    }

    meta.key = newKey;
    meta.folder = targetFolder;
    await saveFile(env, meta);
    moved++;
  }

  if (moved > 0) {
    await markBucketUsageDirty(env);
  }

  return json({ moved });
}

export async function thumbnail(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const id = parts[parts.indexOf('files') + 1];
  if (!id) return error('File ID required', 400);

  const meta = await getFile(env, id);
  if (!meta) return error('File not found', 404);

  if (!meta.type.startsWith('image/')) return error('Not an image', 400);

  const object = await env.VAULT_BUCKET.get(meta.key);
  if (!object) return error('File not found in storage', 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  applyNoStorePreviewHeaders(headers, object.httpEtag, meta.uploadedAt);

  return new Response(object.body, { headers });
}

// ─── Inline Preview (admin) ───────────────────────────────────────────
export async function preview(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const id = parts[parts.indexOf('files') + 1];
  if (!id) return error('File ID required', 400);

  const meta = await getFile(env, id);
  if (!meta) return error('File not found', 404);

  const rangeHeader = request.headers.get('Range');

  const object = await env.VAULT_BUCKET.get(meta.key);
  if (!object) return error('File not found in storage', 404);

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Type', meta.type || 'application/octet-stream');
  headers.set('Content-Disposition', 'inline; filename="' + encodeURIComponent(meta.name) + '"');
  headers.set('Accept-Ranges', 'bytes');
  applyNoStorePreviewHeaders(headers, object.httpEtag, meta.uploadedAt);

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

const MAX_ZIP_FILES = 1000;
const MAX_ZIP_ENTRY_SIZE = 0xFFFFFFFF;
type ZipEntry = { meta?: FileMeta; name: string; isDirectory?: boolean };

// ─── Zip Download (multiple files or a folder tree) ──────────────────
export async function zipDownload(request: Request, env: Env): Promise<Response> {
  const body = await request.json<{ ids?: string[]; folder?: string }>();
  const folder = body.folder ? normalizeFolderPath(body.folder) : undefined;
  const fileMetas = folder
    ? await listAllObjectsInFolderTree(env, folder)
    : await getFilesByIds(env, body.ids || []);
  const directoryEntries: ZipEntry[] = folder
    ? (await getFolderTreeRecords(env, folder))
        .filter(row => row.name !== folder)
        .map(row => ({ name: sanitizeZipEntryName(relativeFolderNameForFolder(row.name, folder)) + '/', isDirectory: true }))
    : [];

  if (fileMetas.length === 0 && directoryEntries.length === 0 && !folder) return error('No valid files found', 404);
  if (fileMetas.length > MAX_ZIP_FILES) return error('Max ' + MAX_ZIP_FILES + ' files per zip', 400);
  if (fileMetas.some(meta => meta.size > MAX_ZIP_ENTRY_SIZE)) return error('ZIP64 is not supported for files over 4GB', 400);

  // For a single explicitly selected file, keep the existing direct-download behavior.
  if (!folder && fileMetas.length === 1) {
    const meta = fileMetas[0];
    const object = await env.VAULT_BUCKET.get(meta.key);
    if (!object) return error('File not found in storage', 404);
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Content-Disposition', 'attachment; filename="' + encodeURIComponent(meta.name) + '"');
    headers.set('Content-Length', String(object.size));
    return new Response(object.body, { headers });
  }

  const entries: ZipEntry[] = directoryEntries.concat(fileMetas.map(meta => ({
    meta,
    name: sanitizeZipEntryName(folder ? relativeNameForFolder(meta, folder) : meta.name),
  })));
  const zipName = folder
    ? sanitizeDownloadName((folder === 'root' ? 'root' : folder.split('/').pop() || 'folder') + '.zip')
    : 'yume-aio-backend-' + new Date().toISOString().slice(0, 10) + '.zip';

  return createZipResponse(entries, env, zipName);
}

function relativeNameForFolder(meta: FileMeta, folder: string): string {
  const fullPath = meta.folder === 'root' ? meta.name : meta.folder + '/' + meta.name;
  if (folder === 'root') return fullPath;
  const prefix = folder + '/';
  if (fullPath.startsWith(prefix)) return fullPath.slice(prefix.length);
  return meta.name;
}

function relativeFolderNameForFolder(folderName: string, folder: string): string {
  if (folder === 'root') return folderName;
  const prefix = folder + '/';
  if (folderName.startsWith(prefix)) return folderName.slice(prefix.length);
  return folderName;
}

function sanitizeZipEntryName(name: string): string {
  const parts = name
    .replace(/\\/g, '/')
    .split('/')
    .filter(part => part && part !== '.' && part !== '..');
  return parts.join('/') || 'file';
}

function sanitizeDownloadName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '_') || 'download.zip';
}

function createZipResponse(
  entries: ZipEntry[],
  env: Env,
  zipName: string,
): Response {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const centralDir: Uint8Array[] = [];
      let offset = 0;

      try {
        for (const entry of entries) {
          const object = !entry.isDirectory && entry.meta
            ? await env.VAULT_BUCKET.get(entry.meta.key)
            : null;
          if (!entry.isDirectory && !object) continue;

          const fileName = encoder.encode(entry.name);
          const localHeader = createLocalFileHeader(fileName);
          controller.enqueue(localHeader);

          let crc = 0xFFFFFFFF;
          let size = 0;

          if (object) {
            const reader = object.body.getReader();

            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              if (!value) continue;
              crc = crc32Update(crc, value);
              size += value.byteLength;
              controller.enqueue(value);
            }
          }

          const finalCrc = crc32Finish(crc);
          const descriptor = createDataDescriptor(finalCrc, size);
          controller.enqueue(descriptor);
          centralDir.push(createCentralDirectoryEntry(fileName, finalCrc, size, offset));
          offset += localHeader.length + size + descriptor.length;
        }

        let cdSize = 0;
        for (const cd of centralDir) {
          controller.enqueue(cd);
          cdSize += cd.length;
        }
        controller.enqueue(createEndOfCentralDirectory(centralDir.length, cdSize, offset));
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });

  const asciiName = zipName.replace(/[^\w.-]+/g, '_');
  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(zipName)}`,
    },
  });
}

// ─── CRC-32 for zip ───────────────────────────────────────────────────
function createLocalFileHeader(fileName: Uint8Array): Uint8Array {
  const header = new Uint8Array(30 + fileName.length);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0808, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, 0, true);
  view.setUint32(18, 0, true);
  view.setUint32(22, 0, true);
  view.setUint16(26, fileName.length, true);
  view.setUint16(28, 0, true);
  header.set(fileName, 30);
  return header;
}

function createDataDescriptor(crc: number, size: number): Uint8Array {
  const descriptor = new Uint8Array(16);
  const view = new DataView(descriptor.buffer);
  view.setUint32(0, 0x08074b50, true);
  view.setUint32(4, crc, true);
  view.setUint32(8, size, true);
  view.setUint32(12, size, true);
  return descriptor;
}

function createCentralDirectoryEntry(fileName: Uint8Array, crc: number, size: number, offset: number): Uint8Array {
  const entry = new Uint8Array(46 + fileName.length);
  const view = new DataView(entry.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0808, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, fileName.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  entry.set(fileName, 46);
  return entry;
}

function createEndOfCentralDirectory(entryCount: number, cdSize: number, cdOffset: number): Uint8Array {
  const eocd = new Uint8Array(22);
  const view = new DataView(eocd.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, cdSize, true);
  view.setUint32(16, cdOffset, true);
  view.setUint16(20, 0, true);
  return eocd;
}

function crc32Update(crc: number, data: Uint8Array): number {
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return crc;
}

function crc32Finish(crc: number): number {
  return (crc ^ 0xFFFFFFFF) >>> 0;
}
