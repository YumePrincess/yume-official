// ─── Environment Bindings ─────────────────────────────────────────────
export interface Env {
  VAULT_BUCKET: R2Bucket;
  VAULT_DB: D1Database;
  ASSETS: Fetcher;
  R2_PUBLIC_BASE_URL?: string;
  CACHE_PURGE_ZONE_ID?: string;
  CACHE_PURGE_API_TOKEN?: string;
  ADMIN_PASSWORD: string;   // wrangler secret
  SESSION_SECRET: string;   // wrangler secret
  ENVIRONMENT: string;
  OIDC_ENABLED?: string;
  OIDC_NAME?: string;
  OIDC_PROVIDER_NAME?: string;
  OIDC_ICON?: string;
  OIDC_ISSUER?: string;
  OIDC_CLIENT_ID?: string;
  OIDC_CLIENT_SECRET?: string; // wrangler secret
  OIDC_REDIRECT_URI?: string;
  OIDC_POST_LOGOUT_REDIRECT_URI?: string;
  OIDC_SCOPES?: string;
  OIDC_ALLOWED_EMAILS?: string;
  OIDC_EMAIL_CLAIM?: string;
  OIDC_REQUIRE_VERIFIED_EMAIL?: string;
  OIDC_TOKEN_AUTH_METHOD?: string;
  OIDC_AUTO_LOGIN?: string;
  OIDC_SESSION_CHECK_INTERVAL_SECONDS?: string;
  ANNOUNCEMENTS_CONFIG_KEY?: string;
  DEEPL_API_KEY?: string;
  AI_CHAT_MODELS?: string;
  AI_EMBEDDING_MODELS?: string;
  AI_GATEWAY_ID?: string;
  AI_API_KEY?: string;
  AI?: {
    run(model: string, input: unknown, options?: unknown): Promise<unknown>;
    aiGatewayLogId?: string;
  };
  AI_RATE_LIMITER?: {
    limit(input: { key: string }): Promise<{ success: boolean }>;
  };
}

// ─── File Metadata (stored in D1; file bodies stay in R2) ─────────────
export interface FileMeta {
  id: string;
  key: string;              // R2 object key (e.g. "photos/sunset.jpg")
  name: string;             // Original filename
  size: number;
  type: string;             // MIME type
  folder: string;           // Virtual folder path (e.g. "photos")
  uploadedAt: string;       // ISO 8601
  shareToken: string | null;
  sharePassword: string | null; // bcrypt-style hash (null = no password)
  shareExpiresAt: string | null; // ISO 8601 or null
  downloads: number;
}

// ─── Clash Subscription ─────────────────────────────────────────────
export interface ClashSubscription {
  id: string;
  fileId: string;
  token: string;
  name: string;
  expiresAt: string | null;
  createdAt: string;
}

// ─── Share Link Info ──────────────────────────────────────────────────
export interface ShareInfo {
  fileId: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
  hasPassword: boolean;
}

// ─── Session ──────────────────────────────────────────────────────────
export interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  authProvider: 'password' | 'oidc';
  oidcEmail: string | null;
  oidcIdToken: string | null;
  oidcLastCheckedAt: string | null;
}

// ─── API Response Types ───────────────────────────────────────────────
export interface FileListResponse {
  files: FileMeta[];
  cursor: string | null;
  totalFiles: number;
}

export interface StatsResponse {
  totalFiles: number;
  totalSize: number;
  totalDownloads: number;
  recentUploads: FileMeta[];
  topDownloaded: FileMeta[];
}

// ─── API Request Types ────────────────────────────────────────────────
export interface CreateShareRequest {
  fileId: string;
  password?: string;
  expiresInDays?: number;
}

export interface MultipartCreateResponse {
  uploadId: string;
  key: string;
}

export interface MultipartCompleteRequest {
  uploadId: string;
  key: string;
  parts: { partNumber: number; etag: string }[];
}

// ─── Site Settings ────────────────────────────────────────────────────
export interface SiteSettings {
  guestPageEnabled: boolean;
  showLoginButton: boolean;
  siteName: string;
  siteIconUrl: string;        // URL to custom logo/icon image (empty = default cloud icon)
  logoBarImageUrl: string;    // URL to header logo bar image
  backgroundImageUrl: string; // URL to custom page background image (empty = bundled default)
  language: string;           // auto, en, fr, ja, zh-CN, zh-TW
  clashConfigFolder: string;  // R2 folder scanned for Clash YAML files
}

export const DEFAULT_SETTINGS: SiteSettings = {
  guestPageEnabled: false,
  showLoginButton: true,
  siteName: 'Yume AIO Backend',
  siteIconUrl: '',
  logoBarImageUrl: 'https://www.yume.zone/assets/img/yumeaio.png',
  backgroundImageUrl: '',
  language: 'auto',
  clashConfigFolder: 'clash',
};
