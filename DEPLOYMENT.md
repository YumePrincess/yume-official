# Yume deployment layout

The repository maintains three independent frontend source trees. `frontend/official/paddle/` contains both the production checkout return page and the intentional `test/` sandbox return page; both are deployed with Official:

```text
frontend/
├── official/
├── search/
└── pricing/
```

`npm run build` generates the deployable asset trees. The main-domain aliases are generated copies, not additional source code:

```text
dist/
├── official/
│   ├── index.html
│   ├── search/       # generated from frontend/search
│   └── pricing/      # generated from frontend/pricing
├── search/
└── pricing/
```

## Request matching

| Request | Cloudflare project | Asset path |
| --- | --- | --- |
| `yume.zone/*` | `yume-official` | `dist/official/*` |
| `www.yume.zone/*` | `yume-official` | `dist/official/*` |
| `yume.zone/search/*` | `yume-official` | `dist/official/search/*` |
| `www.yume.zone/search/*` | `yume-official` | `dist/official/search/*` |
| `yume.zone/pricing/*` | `yume-official` | `dist/official/pricing/*` |
| `www.yume.zone/pricing/*` | `yume-official` | `dist/official/pricing/*` |
| `search.yume.zone/*` | `yume-search` | `dist/search/*` |
| `pricing.yume.zone/*` | `yume-pricing` | `dist/pricing/*` |
| Any configured host under `/api/*` | `yume-api` | `backend/worker.js` |

The three frontend configurations have no `main`, assets binding, or `run_worker_first`. Static hits and misses therefore stay in Workers Static Assets. Each output contains the shared `404.html`, and `not_found_handling` returns it with HTTP 404.

The API Worker uses four explicit `/api/*` Worker Routes. Those routes take precedence over the frontend Custom Domains. Frontend calls remain same-origin absolute URLs such as `/api/translate`.

## Validate

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npx wrangler deploy --dry-run --config wrangler.search.jsonc
npx wrangler deploy --dry-run --config wrangler.pricing.jsonc
npx wrangler deploy --dry-run --config wrangler.api.jsonc
```

## Runtime secret

The DeepL key is a runtime secret of `yume-api`; it is not a Workers Builds variable. Attach a current key directly to the Worker before deploying API changes:

```bash
npx wrangler secret put DEEPL_API_KEY --config wrangler.api.jsonc
```

Verify that the secret name exists without printing its value:

```bash
npx wrangler secret list --config wrangler.api.jsonc
```

## GitHub automatic deployment

Connect each existing Cloudflare Worker to the same GitHub repository, `YumePrincess/yume-all-in-one`, from **Worker → Settings → Builds**. Use `main` as the production branch, `/` as the root directory, leave non-production branch builds disabled, and keep the default include watch path `*` so shared files and generated Official aliases always rebuild together.

Workers Builds does not honor `build.command` from Wrangler configuration. Set these commands explicitly in the dashboard:

| Worker | Build command | Deploy command |
| --- | --- | --- |
| `yume-official` | `npm run check` | `npm run deploy:official` |
| `yume-search` | `npm run check` | `npm run deploy:search` |
| `yume-pricing` | `npm run check` | `npm run deploy:pricing` |
| `yume-api` | `npm run check` | `npm run deploy:api` |

Do not add `DEEPL_API_KEY` as a build variable: build variables are not available to the running Worker. Keep it under **yume-api → Settings → Variables and Secrets** as an encrypted runtime secret.

For a manual deployment, keep this order:

```bash
npm run deploy:api
npm run deploy:official
npm run deploy:search
npm run deploy:pricing
```

The three static build commands target separate output directories, so one deployment cannot delete another site's build output. Keep manual full-stack deployments serial and in the order above.

After deployment, requests for missing static files such as `/missing.js` must return the styled static 404 without appearing in `yume-api` invocation logs. A missing `/api/*` endpoint is intentionally handled by `yume-api` and returns JSON 404.
