ALTER TABLE sessions ADD COLUMN auth_provider TEXT NOT NULL DEFAULT 'password';
ALTER TABLE sessions ADD COLUMN oidc_email TEXT;
ALTER TABLE sessions ADD COLUMN oidc_id_token TEXT;
ALTER TABLE sessions ADD COLUMN oidc_last_checked_at TEXT;
