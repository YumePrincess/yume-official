import { Env, FileMeta } from './types';
import { getMimeType } from './response';
import {
  createFolderRecord,
  deleteFile,
  ensureFolderChain,
  getFile,
  getFileByKey,
  replaceFileByKey,
} from './db';

const DIRECTORY_LIST_LIMIT = 200;

export interface FolderListing {
  files: FileMeta[];
  subfolders: string[];
  cursor: string | null;
  truncated: boolean;
}

export function normalizeFolderPath(folder?: string | null): string {
  const trimmed = (folder || 'root').trim().replace(/^\/+|\/+$/g, '');
  return trimmed || 'root';
}

export function folderPrefix(folder: string): string {
  return folder === 'root' ? '' : `${folder}/`;
}

export function fileNameFromKey(key: string): string {
  return key.split('/').pop() || key;
}

export function folderFromKey(key: string): string {
  const lastSlash = key.lastIndexOf('/');
  return lastSlash >= 0 ? key.slice(0, lastSlash) : 'root';
}

export function keyFromFolderAndName(folder: string, name: string): string {
  return folder === 'root' ? name : `${folder}/${name}`;
}

function objectToFileMeta(object: R2Object, existing?: FileMeta | null): FileMeta {
  const folder = folderFromKey(object.key);
  const name = fileNameFromKey(object.key);
  const type = object.httpMetadata?.contentType || existing?.type || getMimeType(name);

  return {
    id: existing?.id || object.customMetadata?.fileId || crypto.randomUUID(),
    key: object.key,
    name,
    size: object.size,
    type,
    folder,
    uploadedAt: existing?.uploadedAt || object.uploaded.toISOString(),
    shareToken: existing?.shareToken || null,
    sharePassword: existing?.sharePassword || null,
    shareExpiresAt: existing?.shareExpiresAt || null,
    downloads: existing?.downloads || 0,
  };
}

export async function upsertFileRecordFromObject(env: Env, object: R2Object): Promise<FileMeta> {
  const existing = await getFileByKey(env, object.key);
  const meta = objectToFileMeta(object, existing);
  if (meta.folder !== 'root') {
    await ensureFolderChain(env, meta.folder);
  }
  await replaceFileByKey(env, meta);
  return meta;
}

export async function ensureFileRecordByKey(
  env: Env,
  key: string,
  object?: R2Object | R2ObjectBody | R2Object | null,
): Promise<FileMeta | null> {
  const existing = await getFileByKey(env, key);

  if (object && 'key' in object) {
    return upsertFileRecordFromObject(env, object as R2Object);
  }

  const head = await env.VAULT_BUCKET.head(key);
  if (!head) {
    if (existing) {
      await deleteFile(env, existing.id);
    }
    return null;
  }

  const meta = objectToFileMeta(head, existing);
  if (meta.folder !== 'root') {
    await ensureFolderChain(env, meta.folder);
  }
  await replaceFileByKey(env, meta);
  return meta;
}

export async function ensureFileRecordById(env: Env, id: string): Promise<FileMeta | null> {
  const meta = await getFile(env, id);
  if (!meta) return null;
  return ensureFileRecordByKey(env, meta.key);
}

export async function ensureFileRecordByPath(env: Env, folder: string, name: string): Promise<FileMeta | null> {
  return ensureFileRecordByKey(env, keyFromFolderAndName(folder, name));
}

export async function listFolderContents(
  env: Env,
  folder: string,
  options: { cursor?: string | null; limit?: number } = {},
): Promise<FolderListing> {
  const normalizedFolder = normalizeFolderPath(folder);
  const prefix = folderPrefix(normalizedFolder);
  const result = await env.VAULT_BUCKET.list({
    prefix,
    delimiter: '/',
    cursor: options.cursor || undefined,
    limit: options.limit || DIRECTORY_LIST_LIMIT,
  });

  const files: FileMeta[] = [];
  for (const object of result.objects) {
    if (!object.key || object.key.endsWith('/')) continue;
    files.push(await upsertFileRecordFromObject(env, object));
  }

  const subfolders = Array.from(
    new Set(
      (result.delimitedPrefixes || [])
        .map((item) => item.replace(/\/+$/, ''))
        .filter(Boolean),
    ),
  ).sort();

  for (const subfolder of subfolders) {
    await ensureFolderChain(env, subfolder);
  }
  if (normalizedFolder !== 'root' && subfolders.length === 0 && files.length === 0) {
    await createFolderRecord(env, normalizedFolder);
  }

  return {
    files,
    subfolders,
    cursor: result.truncated ? result.cursor || null : null,
    truncated: !!result.truncated,
  };
}

export async function listAllObjectsInFolderTree(env: Env, folder: string): Promise<FileMeta[]> {
  const normalizedFolder = normalizeFolderPath(folder);
  const prefix = folderPrefix(normalizedFolder);
  const files: FileMeta[] = [];
  let cursor: string | undefined;

  for (;;) {
    const result = await env.VAULT_BUCKET.list({
      prefix,
      cursor,
      limit: 1000,
    });

    for (const object of result.objects) {
      if (!object.key || object.key.endsWith('/')) continue;
      files.push(await upsertFileRecordFromObject(env, object));
    }

    if (!result.truncated || !result.cursor) break;
    cursor = result.cursor;
  }

  return files;
}
