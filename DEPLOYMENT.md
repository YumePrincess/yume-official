# Yume deployment layout

本仓库当前只部署一个 Cloudflare 静态 Worker：`yume-official`。

Search 与 Pricing 仍保留独立源码目录，但它们不再拥有独立域名，也不再有独立 Worker。构建后它们作为主站路径的一部分发布：

```text
dist/
└── official/
    ├── index.html
    ├── search/
    └── pricing/
```

## Request matching

| Request | Cloudflare project | Asset path |
| --- | --- | --- |
| `yume.zone/*` | `yume-official` | `dist/official/*` |
| `www.yume.zone/*` | `yume-official` | `dist/official/*` |
| `www.yume.zone/search/*` | `yume-official` | `dist/official/search/*` |
| `www.yume.zone/pricing/*` | `yume-official` | `dist/official/pricing/*` |

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
- 构建产物只有 `dist/official` 一套。
- Search 与 Pricing 通过 `dist/official/search`、`dist/official/pricing` 发布。
- 缺失资源返回共享静态 `404.html`。
- 所有旧的 Search / Pricing 独立域名残留都应被替换为 `https://www.yume.zone/search/`、`https://www.yume.zone/pricing/`。
