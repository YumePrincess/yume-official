<p align="center">
  <img src="assets/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a>
</p>

# Yume Official Backend

Yume Official Backend is a file management and sharing service for Cloudflare Workers. It uses Cloudflare R2 for files and D1 for application metadata.

The default Worker deployment name and D1 database name are both `yume-official-backend`.

### Features

- Admin dashboard for uploading, downloading, previewing, editing text files, organizing folders, and creating ZIP archives.
- Public file and folder sharing with optional passwords and expiration dates, plus a guest file browser.
- WebDAV access at `/dav`.
- Clash and Mihomo subscription publishing from YAML files, with encrypted share URLs.
- Optional OIDC sign-in with an email allowlist; password sign-in is also available when OIDC is disabled.
- Integrated announcement, translation, geolocation, weather, and Workers AI API endpoints.
- English, French, Japanese, Simplified Chinese, and Traditional Chinese interface translations.

### Deploy

Requirements: Node.js 20 or later, npm, and a Cloudflare account with Workers, R2, D1, Queues, and Workers AI available.

1. Install dependencies, create a deployment config from the example, and authenticate Wrangler:

   ```sh
   npm install
   cp wrangler.example.jsonc wrangler.jsonc
   npx wrangler login
   ```

   The copy command replaces an existing `wrangler.jsonc`. Keep your account-specific configuration and credentials private.

2. Create the resources named in the config, or change the config to match resources you already have:

   ```sh
   npx wrangler r2 bucket create yume-oss
   npx wrangler d1 create yume-official-backend
   npx wrangler queues create yume-oss-cache-purge
   ```

   Put the D1 database ID returned by Wrangler and your rate-limit namespace ID in `wrangler.jsonc`. Set your custom domain, R2 public URL, bucket, database, and queue names there as well.

3. Apply the database migrations:

   ```sh
   npx wrangler d1 migrations apply VAULT_DB --remote
   ```

4. Add secrets with Wrangler. The example config requires `DEEPL_API_KEY` and `AI_API_KEY`; configure the other secrets for the features you enable:

   ```sh
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET
   npx wrangler secret put DEEPL_API_KEY
   npx wrangler secret put AI_API_KEY
   ```

   For OIDC, set the OIDC variables in `wrangler.jsonc` and add `OIDC_CLIENT_SECRET`. For R2 cache-purge events, add `CACHE_PURGE_ZONE_ID` and `CACHE_PURGE_API_TOKEN`.

5. To purge cached R2 URLs when objects change, connect bucket events to the queue:

   ```sh
   npx wrangler r2 bucket notification create yume-oss --event-type object-create --queue yume-oss-cache-purge
   npx wrangler r2 bucket notification create yume-oss --event-type object-delete --queue yume-oss-cache-purge
   ```

6. Run locally, check types, and deploy:

   ```sh
   npm run dev
   npm run typecheck
   npm run deploy
   ```

The example enables password sign-in by default. To use OIDC, configure the issuer, client ID, callback URL, and allowed email addresses in `wrangler.jsonc`, then set `OIDC_CLIENT_SECRET` as a Wrangler secret. Keep real credentials and production account identifiers out of public commits.

### Copyright and license

Copyright © 2026 Yume Internet LLC. This project is distributed under the MIT License. See [LICENSE](LICENSE) for the license text and conditions.
