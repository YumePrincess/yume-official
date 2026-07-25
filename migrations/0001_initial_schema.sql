CREATE TABLE IF NOT EXISTS files (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'application/octet-stream',
  folder TEXT NOT NULL DEFAULT 'root',
  uploaded_at TEXT NOT NULL,
  share_token TEXT UNIQUE,
  share_password TEXT,
  share_expires_at TEXT,
  downloads INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_files_folder_uploaded_at ON files(folder, uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_folder_name ON files(folder, name);
CREATE INDEX IF NOT EXISTS idx_files_share_token ON files(share_token);
CREATE INDEX IF NOT EXISTS idx_files_downloads ON files(downloads DESC);

CREATE TABLE IF NOT EXISTS folders (
  name TEXT PRIMARY KEY,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS folder_shares (
  folder TEXT PRIMARY KEY,
  shared_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS folder_share_exclusions (
  folder TEXT PRIMARY KEY,
  excluded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS folder_share_links (
  token TEXT PRIMARY KEY,
  folder TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_folder_share_links_folder ON folder_share_links(folder);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
