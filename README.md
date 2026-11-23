# Yume Official

<p align="center">
  <img src="assets/readme/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="README.md">English · Default</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.ja.md">日本語</a>
</p>

## English

Yume Official is the multilingual static website and service portal for the Yume ecosystem. This repository contains the front end; the API Worker and backend services are maintained separately.

### Features

- A home page that introduces Yume and links to its services.
- A search portal at [`/search/`](https://www.yume.zone/search/) and a service and pricing catalog at [`/pricing/`](https://www.yume.zone/pricing/).
- Language, theme, and display preferences for English, Simplified Chinese, Traditional Chinese, French, and Japanese.
- Privacy, user terms, and refund documents in all five languages.
- An SMS consent and notification-preference page, plus Android and iOS distribution files.

### Deployment

The site is deployed to Cloudflare Workers Static Assets. Wrangler uploads `frontend/` directly; there is no separate build output.

Requirements: Node.js 22 or later and access to the configured Cloudflare account and domains.

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npm run deploy
```

The Worker is `yume-official`, serving `yume.zone` and `www.yume.zone`. The API is served separately at `https://aio.yume.zone/api/*` and is not included in this repository.

### Copyright and license

Copyright © 2026 Yume Internet LLC. The original project code is licensed under the [MIT License](./LICENSE).

Third-party software, fonts, music, images, app packages, and other materials retain their respective licenses and rights; the MIT license does not automatically relicense them.
