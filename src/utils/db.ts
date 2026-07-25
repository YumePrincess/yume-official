import { Env, FileMeta, Session } from './types';

type DbValue = string | number | null;

interface FileRow {
  id: string;
  object_key: string;
  name: string;
  size: number;
  type: string;
  folder: string;
  uploaded_at: string;
  share_token: string | null;
  share_password: string | null;
  share_expires_at: string | null;
  downloads: number;
}

interface FolderRow {
  name: string;
  created_at: string;
}

interface SessionRow {
  id: string;
  created_at: string;
  expires_at: string;
  auth_provider?: string;
  oidc_email?: string | null;
  oidc_id_token?: string | null;
  oidc_last_checked_at?: string | null;
}

export interface FolderShareLink {
  token: string;
  folder: string;
  passwordHash: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface FolderShareLinkRow {
  token: string;
  folder: string;
  password_hash: string | null;
  expires_at: string | null;
  created_at: string;
}

const FILE_COLUMNS = [
  'id',
  'object_key',
  'name',
  'size',
  'type',
  'folder',
  'uploaded_at',
  'share_token',
  'share_password',
  'share_expires_at',
  'downloads',
].join(', ');

function fileFromRow(row: FileRow): FileMeta {
  return {
    id: row.id,
    key: row.object_key,
    name: row.name,
    size: row.size,
    type: row.type,
    folder: row.folder,
    uploadedAt: row.uploaded_at,
    shareToken: row.share_token,
    sharePassword: row.share_password,
    shareExpiresAt: row.share_expires_at,
    downloads: row.downloads,
  };
}

function fileValues(meta: FileMeta): DbValue[] {
  return [
    meta.id,
    meta.key,
    meta.name,
    meta.size,
    meta.type,
    meta.folder,
    meta.uploadedAt,
    meta.shareToken,
    meta.sharePassword,
    meta.shareExpiresAt,
    meta.downloads,
  ];
}

function folderShareLinkFromRow(row: FolderShareLinkRow): FolderShareLink {
  return {
    token: row.token,
    folder: row.folder,
    passwordHash: row.password_hash,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

function sessionFromRow(row: SessionRow): Session {
  return {
    id: row.id,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    authProvider: row.auth_provider === 'oidc' ? 'oidc' : 'password',
    oidcEmail: row.oidc_email || null,
    oidcIdToken: row.oidc_id_token || null,
    oidcLastCheckedAt: row.oidc_last_checked_at || null,
  };
}

export async function getAllFiles(env: Env): Promise<FileMeta[]> {
  const { results } = await env.VAULT_DB
    .prepare(`SELECT ${FILE_COLUMNS} FROM files ORDER BY uploaded_at DESC`)
    .all<FileRow>();
  return (results || []).map(fileFromRow);
}

export async function listFiles(env: Env, filters: { folder?: string; search?: string }): Promise<FileMeta[]> {
  const conditions: string[] = [];
  const params: DbValue[] = [];

  if (filters.folder) {
    conditions.push('folder = ?');
    params.push(filters.folder);
  }
  if (filters.search) {
    conditions.push('LOWER(name) LIKE ?');
    params.push('%' + filters.search.toLowerCase() + '%');
  }

  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const { results } = await env.VAULT_DB
    .prepare(`SELECT ${FILE_COLUMNS} FROM files${where} ORDER BY uploaded_at DESC`)
    .bind(...params)
    .all<FileRow>();
  return (results || []).map(fileFromRow);
}

export async function getFile(env: Env, id: string): Promise<FileMeta | null> {
  const row = await env.VAULT_DB
    .prepare(`SELECT ${FILE_COLUMNS} FROM files WHERE id = ?`)
    .bind(id)
    .first<FileRow>();
  return row ? fileFromRow(row) : null;
}

export async function getFileByKey(env: Env, key: string): Promise<FileMeta | null> {
  const row = await env.VAULT_DB
    .prepare(`SELECT ${FILE_COLUMNS} FROM files WHERE object_key = ?`)
    .bind(key)
    .first<FileRow>();
  return row ? fileFromRow(row) : null;
}

export async function findFileByPath(env: Env, folder: string, name: string): Promise<FileMeta | null> {
  const row = await env.VAULT_DB
    .prepare(`SELECT ${FILE_COLUMNS} FROM files WHERE folder = ? AND name = ? ORDER BY uploaded_at DESC LIMIT 1`)
    .bind(folder, name)
    .first<FileRow>();
  return row ? fileFromRow(row) : null;
}

export async function getFileByShareToken(env: Env, token: string): Promise<FileMeta | null> {
  const row = await env.VAULT_DB
    .prepare(`SELECT ${FILE_COLUMNS} FROM files WHERE share_token = ?`)
    .bind(token)
    .first<FileRow>();
  return row ? fileFromRow(row) : null;
}

export async function getFilesByIds(env: Env, ids: string[]): Promise<FileMeta[]> {
  const files: FileMeta[] = [];
  for (const id of ids) {
    const file = await getFile(env, id);
    if (file) files.push(file);
  }
  return files;
}

export async function getFilesInFolderTree(env: Env, folder: string): Promise<FileMeta[]> {
  if (folder === 'root') return getAllFiles(env);
  const { results } = await env.VAULT_DB
    .prepare(`SELECT ${FILE_COLUMNS} FROM files WHERE folder = ? OR folder LIKE ? ORDER BY folder ASC, name ASC`)
    .bind(folder, folder + '/%')
    .all<FileRow>();
  return (results || []).map(fileFromRow);
}

export async function saveFile(env: Env, meta: FileMeta): Promise<void> {
  await env.VAULT_DB
    .prepare(
      `INSERT INTO files (${FILE_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         object_key = excluded.object_key,
         name = excluded.name,
         size = excluded.size,
         type = excluded.type,
         folder = excluded.folder,
         uploaded_at = excluded.uploaded_at,
         share_token = excluded.share_token,
         share_password = excluded.share_password,
         share_expires_at = excluded.share_expires_at,
         downloads = excluded.downloads`,
    )
    .bind(...fileValues(meta))
    .run();
}

export async function replaceFileByKey(env: Env, meta: FileMeta): Promise<void> {
  await env.VAULT_DB
    .prepare(
      `INSERT INTO files (${FILE_COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(object_key) DO UPDATE SET
         id = excluded.id,
         name = excluded.name,
         size = excluded.size,
         type = excluded.type,
         folder = excluded.folder,
         uploaded_at = excluded.uploaded_at,
         share_token = excluded.share_token,
         share_password = excluded.share_password,
         share_expires_at = excluded.share_expires_at,
         downloads = excluded.downloads`,
    )
    .bind(...fileValues(meta))
    .run();
}

export async function deleteFile(env: Env, id: string): Promise<void> {
  await env.VAULT_DB.prepare('DELETE FROM files WHERE id = ?').bind(id).run();
}

export async function deleteFilesByFolderTree(env: Env, folder: string): Promise<FileMeta[]> {
  const files = await getFilesInFolderTree(env, folder);
  if (folder === 'root') {
    await env.VAULT_DB.prepare('DELETE FROM files').run();
  } else {
    await env.VAULT_DB
      .prepare('DELETE FROM files WHERE folder = ? OR folder LIKE ?')
      .bind(folder, folder + '/%')
      .run();
  }
  return files;
}

export async function incrementDownloads(env: Env, id: string): Promise<void> {
  await env.VAULT_DB
    .prepare('UPDATE files SET downloads = downloads + 1 WHERE id = ?')
    .bind(id)
    .run();
}

export async function setFileShare(
  env: Env,
  fileId: string,
  shareToken: string | null,
  sharePassword: string | null,
  shareExpiresAt: string | null,
): Promise<void> {
  await env.VAULT_DB
    .prepare('UPDATE files SET share_token = ?, share_password = ?, share_expires_at = ? WHERE id = ?')
    .bind(shareToken, sharePassword, shareExpiresAt, fileId)
    .run();
}

export async function getAllFolders(env: Env): Promise<Map<string, string>> {
  const { results } = await env.VAULT_DB
    .prepare('SELECT name, created_at FROM folders ORDER BY name ASC')
    .all<FolderRow>();
  const folders = new Map<string, string>();
  for (const row of results || []) {
    folders.set(row.name, row.created_at);
  }
  return folders;
}

export async function createFolderRecord(env: Env, name: string, createdAt = new Date().toISOString()): Promise<void> {
  await env.VAULT_DB
    .prepare('INSERT OR IGNORE INTO folders (name, created_at) VALUES (?, ?)')
    .bind(name, createdAt)
    .run();
}

export async function ensureFolderChain(env: Env, folderPath: string): Promise<void> {
  if (!folderPath || folderPath === 'root') return;

  const parts = folderPath.split('/');
  let path = '';
  for (const part of parts) {
    path = path ? path + '/' + part : part;
    await createFolderRecord(env, path);
  }
}

export async function getFolderTreeRecords(env: Env, folder: string): Promise<FolderRow[]> {
  if (folder === 'root') {
    const { results } = await env.VAULT_DB
      .prepare('SELECT name, created_at FROM folders ORDER BY name ASC')
      .all<FolderRow>();
    return results || [];
  }
  const { results } = await env.VAULT_DB
    .prepare('SELECT name, created_at FROM folders WHERE name = ? OR name LIKE ? ORDER BY name ASC')
    .bind(folder, folder + '/%')
    .all<FolderRow>();
  return results || [];
}

export async function deleteFolderTreeRecords(env: Env, folder: string): Promise<FolderRow[]> {
  const folders = await getFolderTreeRecords(env, folder);
  if (folder === 'root') {
    await env.VAULT_DB.prepare('DELETE FROM folders').run();
  } else {
    await env.VAULT_DB
      .prepare('DELETE FROM folders WHERE name = ? OR name LIKE ?')
      .bind(folder, folder + '/%')
      .run();
  }
  return folders;
}

export async function renameFolderRecords(env: Env, oldName: string, newName: string): Promise<void> {
  const rows = await getFolderTreeRecords(env, oldName);
  for (const row of rows) {
    const target = row.name === oldName ? newName : newName + row.name.slice(oldName.length);
    await env.VAULT_DB
      .prepare('INSERT OR REPLACE INTO folders (name, created_at) VALUES (?, ?)')
      .bind(target, row.created_at || new Date().toISOString())
      .run();
  }
  await deleteFolderTreeRecords(env, oldName);
}

export async function getSharedFolderSet(env: Env): Promise<Set<string>> {
  const { results } = await env.VAULT_DB.prepare('SELECT folder FROM folder_shares ORDER BY folder ASC').all<{ folder: string }>();
  return new Set((results || []).map(row => row.folder));
}

export async function getExcludedFolderSet(env: Env): Promise<Set<string>> {
  const { results } = await env.VAULT_DB.prepare('SELECT folder FROM folder_share_exclusions ORDER BY folder ASC').all<{ folder: string }>();
  return new Set((results || []).map(row => row.folder));
}

export async function isFolderDirectlyShared(env: Env, folder: string): Promise<boolean> {
  const row = await env.VAULT_DB.prepare('SELECT folder FROM folder_shares WHERE folder = ?').bind(folder).first<{ folder: string }>();
  return !!row;
}

export async function setFolderShared(env: Env, folder: string, shared: boolean): Promise<void> {
  if (shared) {
    await env.VAULT_DB
      .prepare('INSERT OR REPLACE INTO folder_shares (folder, shared_at) VALUES (?, ?)')
      .bind(folder, new Date().toISOString())
      .run();
    await env.VAULT_DB.prepare('DELETE FROM folder_share_exclusions WHERE folder = ?').bind(folder).run();
    return;
  }
  await env.VAULT_DB.prepare('DELETE FROM folder_shares WHERE folder = ?').bind(folder).run();
}

export async function isFolderExcluded(env: Env, folder: string): Promise<boolean> {
  const row = await env.VAULT_DB
    .prepare('SELECT folder FROM folder_share_exclusions WHERE folder = ?')
    .bind(folder)
    .first<{ folder: string }>();
  return !!row;
}

export async function setFolderExcluded(env: Env, folder: string, excluded: boolean): Promise<void> {
  if (excluded) {
    await env.VAULT_DB
      .prepare('INSERT OR REPLACE INTO folder_share_exclusions (folder, excluded_at) VALUES (?, ?)')
      .bind(folder, new Date().toISOString())
      .run();
    return;
  }
  await env.VAULT_DB.prepare('DELETE FROM folder_share_exclusions WHERE folder = ?').bind(folder).run();
}

export async function deleteFolderShareStateForTree(env: Env, folder: string): Promise<void> {
  if (folder === 'root') {
    await env.VAULT_DB.batch([
      env.VAULT_DB.prepare('DELETE FROM folder_shares'),
      env.VAULT_DB.prepare('DELETE FROM folder_share_exclusions'),
      env.VAULT_DB.prepare('DELETE FROM folder_share_links'),
    ]);
    return;
  }

  await env.VAULT_DB.batch([
    env.VAULT_DB.prepare('DELETE FROM folder_shares WHERE folder = ? OR folder LIKE ?').bind(folder, folder + '/%'),
    env.VAULT_DB.prepare('DELETE FROM folder_share_exclusions WHERE folder = ? OR folder LIKE ?').bind(folder, folder + '/%'),
    env.VAULT_DB.prepare('DELETE FROM folder_share_links WHERE folder = ? OR folder LIKE ?').bind(folder, folder + '/%'),
  ]);
}

export async function renameFolderShareState(env: Env, oldName: string, newName: string): Promise<void> {
  const shared = await getSharedFolderSet(env);
  const excluded = await getExcludedFolderSet(env);
  const links = await getFolderShareLinksInTree(env, oldName);

  for (const folder of shared) {
    if (folder === oldName || folder.startsWith(oldName + '/')) {
      const target = folder === oldName ? newName : newName + folder.slice(oldName.length);
      await setFolderShared(env, target, true);
      await setFolderShared(env, folder, false);
    }
  }

  for (const folder of excluded) {
    if (folder === oldName || folder.startsWith(oldName + '/')) {
      const target = folder === oldName ? newName : newName + folder.slice(oldName.length);
      await setFolderExcluded(env, target, true);
      await setFolderExcluded(env, folder, false);
    }
  }

  for (const link of links) {
    const target = link.folder === oldName ? newName : newName + link.folder.slice(oldName.length);
    await env.VAULT_DB
      .prepare('UPDATE folder_share_links SET folder = ? WHERE token = ?')
      .bind(target, link.token)
      .run();
  }
}

export async function getFolderShareLinkByFolder(env: Env, folder: string): Promise<FolderShareLink | null> {
  const row = await env.VAULT_DB
    .prepare('SELECT token, folder, password_hash, expires_at, created_at FROM folder_share_links WHERE folder = ?')
    .bind(folder)
    .first<FolderShareLinkRow>();
  return row ? folderShareLinkFromRow(row) : null;
}

export async function getFolderShareLinkByToken(env: Env, token: string): Promise<FolderShareLink | null> {
  const row = await env.VAULT_DB
    .prepare('SELECT token, folder, password_hash, expires_at, created_at FROM folder_share_links WHERE token = ?')
    .bind(token)
    .first<FolderShareLinkRow>();
  return row ? folderShareLinkFromRow(row) : null;
}

export async function getFolderShareLinksInTree(env: Env, folder: string): Promise<FolderShareLink[]> {
  const { results } = await env.VAULT_DB
    .prepare('SELECT token, folder, password_hash, expires_at, created_at FROM folder_share_links WHERE folder = ? OR folder LIKE ?')
    .bind(folder, folder + '/%')
    .all<FolderShareLinkRow>();
  return (results || []).map(folderShareLinkFromRow);
}

export async function upsertFolderShareLink(
  env: Env,
  link: { token: string; folder: string; passwordHash: string | null; expiresAt: string | null; createdAt: string },
): Promise<void> {
  await env.VAULT_DB
    .prepare(
      `INSERT INTO folder_share_links (token, folder, password_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(folder) DO UPDATE SET
         token = excluded.token,
         password_hash = excluded.password_hash,
         expires_at = excluded.expires_at,
         created_at = excluded.created_at`,
    )
    .bind(link.token, link.folder, link.passwordHash, link.expiresAt, link.createdAt)
    .run();
}

export async function deleteFolderShareLinkByFolder(env: Env, folder: string): Promise<void> {
  await env.VAULT_DB.prepare('DELETE FROM folder_share_links WHERE folder = ?').bind(folder).run();
}

export async function saveSession(env: Env, session: Session): Promise<void> {
  await env.VAULT_DB
    .prepare(
      `INSERT OR REPLACE INTO sessions
       (id, created_at, expires_at, auth_provider, oidc_email, oidc_id_token, oidc_last_checked_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      session.id,
      session.createdAt,
      session.expiresAt,
      session.authProvider,
      session.oidcEmail,
      session.oidcIdToken,
      session.oidcLastCheckedAt,
    )
    .run();
}

export async function getSession(env: Env, id: string): Promise<Session | null> {
  const row = await env.VAULT_DB
    .prepare('SELECT id, created_at, expires_at, auth_provider, oidc_email, oidc_id_token, oidc_last_checked_at FROM sessions WHERE id = ?')
    .bind(id)
    .first<SessionRow>();
  return row ? sessionFromRow(row) : null;
}

export async function deleteSession(env: Env, id: string): Promise<void> {
  await env.VAULT_DB.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
}

export async function deleteExpiredSessions(env: Env, nowIso = new Date().toISOString()): Promise<void> {
  await env.VAULT_DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(nowIso).run();
}

export async function getSetting(env: Env, key: string): Promise<string | null> {
  const row = await env.VAULT_DB.prepare('SELECT value FROM settings WHERE key = ?').bind(key).first<{ value: string }>();
  return row?.value || null;
}

export async function putSetting(env: Env, key: string, value: string): Promise<void> {
  await env.VAULT_DB.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').bind(key, value).run();
}
