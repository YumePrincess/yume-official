CREATE TABLE IF NOT EXISTS clash_subscriptions (
  id TEXT PRIMARY KEY,
  file_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_clash_subscriptions_file_id ON clash_subscriptions(file_id);
CREATE INDEX IF NOT EXISTS idx_clash_subscriptions_expires_at ON clash_subscriptions(expires_at);
