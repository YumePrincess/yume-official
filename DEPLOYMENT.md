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

## First migration

The API project is new and does not inherit secrets from the previous combined Worker. Create a replacement DeepL key **without revoking the old key yet**, then attach the replacement to `yume-api`:

```bash
npx wrangler secret put DEEPL_API_KEY --config wrangler.api.jsonc
```

Deploy the API route first while the current combined Worker still owns all four domains. Verify `/api/translate` through all four hostnames, then revoke the old DeepL key. This order avoids an API interruption during the cutover.

After the API is verified, replace the frontend origins. Keep the first migration commands in this order so that each domain always has an owner:

```bash
npm run deploy:api
npm run deploy:official
npm run deploy:search
npm run deploy:pricing
```

Wrangler intentionally preserves existing Worker secrets unless they are explicitly deleted. Once the static `yume-official` deployment and the new API have been verified, remove the obsolete secret from the former combined project:

```bash
npx wrangler secret delete DEEPL_API_KEY --config wrangler.jsonc
```

The three static build commands target separate output directories, so one deployment cannot delete another site's build output. The initial domain migration should still be performed serially in the order above.

Deploy Search and Pricing immediately after Official during the first migration because the Official deployment removes their old Custom Domain associations from the former combined project. If Cloudflare reports that either Custom Domain is still attached to the old project, detach that association in **Workers & Pages → Settings → Domains & Routes**, then rerun the matching deployment.

After deployment, requests for missing static files such as `/missing.js` must return the styled static 404 without appearing in `yume-api` invocation logs. A missing `/api/*` endpoint is intentionally handled by `yume-api` and returns JSON 404.
