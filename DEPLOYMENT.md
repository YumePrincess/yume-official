# Yume deployment layout

本仓库当前只部署一个 Cloudflare 静态 Worker：`yume-official`。

Search 与 Pricing 仍保留独立源码目录，但它们不再拥有独立域名，也不再有独立 Worker。构建后它们作为主站路径的一部分发布：

```text
frontend/
├── index.html
├── 200.html
├── 404.html
├── 500.html
├── search/
└── pricing/
```

`frontend/` 就是最终静态目录，部署时由 Wrangler 直接上传，不再生成 `dist/`。
缺失资源仍返回 HTTP 404，但使用 `frontend/404.html` 套用 500 Cloudflare 风格错误页，将页面错误码显示为 500。

## Request matching

| Request | Cloudflare project | Asset path |
| --- | --- | --- |
| `yume.zone/*` | `yume-official` | `frontend/*` |
| `www.yume.zone/*` | `yume-official` | `frontend/*` |
| `www.yume.zone/search/*` | `yume-official` | `frontend/search/*` |
| `www.yume.zone/pricing/*` | `yume-official` | `frontend/pricing/*` |

旧的 Search / Pricing 独立子域名已于 2026 年 7 月 25 日取消，不应再在本仓库中出现。

## API boundary

本仓库不再部署 API Worker。

- 前端 API 地址：`https://aio.yume.zone/api/*`
- API Worker 项目位置：`../yume-all-in-one-backend`

不要把 `/api/*` 路由重新挂回 `yume-official`。

## Validate

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
```

## Deploy

Cloudflare Workers Builds 或手动部署都只需要一个项目：

- Worker: `yume-official`
- Build command: `npm run check`
- Deploy command: `npm run deploy`

## Static guarantees

- `wrangler.jsonc` 不包含 `main`、`assets.binding` 或 `assets.run_worker_first`，只使用 Workers Static Assets。
- `assets.directory` 直接指向 `./frontend`，不生成或部署 `dist/`。
- Search 与 Pricing 通过 `frontend/search`、`frontend/pricing` 发布。
- `frontend/200.html` 与 `frontend/500.html` 提供参考项目中的 Cloudflare 风格 Working / Internal server error 页面。
- `frontend/404.html` 作为所有未匹配资源的 404 fallback，内容复用 500 页面并将错误源显示为 Cloudflare。
- 所有旧的 Search / Pricing 独立域名残留都应被替换为 `https://www.yume.zone/search/`、`https://www.yume.zone/pricing/`。
