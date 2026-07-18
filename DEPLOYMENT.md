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
| `https://api.yume.zone/*` | `yume-aio-api` | `backend/worker.js` |

The three frontend configurations have no `main`, assets binding, or `run_worker_first`. Static hits and misses therefore stay in Workers Static Assets. Each output contains the shared `404.html`, and `not_found_handling` returns it with HTTP 404.

The API Worker is exposed only through the dedicated `https://api.yume.zone` hostname. Do not attach `/api/*` routes to the Official, Search, or Pricing hostnames. Frontend calls use absolute URLs such as `https://api.yume.zone/api/translate`.

## Validate

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npx wrangler deploy --dry-run --config wrangler.search.jsonc
npx wrangler deploy --dry-run --config wrangler.pricing.jsonc
npx wrangler deploy --dry-run --config wrangler.api.jsonc
```

## Runtime bindings and secrets

`yume-aio-api` is a new Worker project, so runtime secrets attached to the old `yume-api` project do not migrate automatically. On the first deployment, attach both runtime secrets directly to the new Worker:

```bash
npx wrangler secret put DEEPL_API_KEY --config wrangler.api.jsonc
npx wrangler secret put AI_API_KEY --config wrangler.api.jsonc
```

Verify that the secret name exists without printing its value:

```bash
npx wrangler secret list --config wrangler.api.jsonc
```

Workers AI is invoked upstream through the Wrangler `AI` binding exposed as `env.AI`, so the Worker does not need a Cloudflare API token. The public `/api/v1/*` compatibility layer is separately protected by the `AI_API_KEY` runtime Secret and accepts it as an OpenAI-style Bearer credential. Keep only these non-sensitive Wrangler variables in source control:

| Variable | Value | Purpose |
| --- | --- | --- |
| `AI_GATEWAY_ID` | `default` | AI Gateway used by `env.AI` calls |
| `AI_CHAT_MODELS` | `@cf/openai/gpt-oss-20b` | Allowed Chat Completions and Responses models |
| `AI_EMBEDDING_MODELS` | `@cf/baai/bge-m3` | Allowed Embeddings models |

The allowlists are the model-selection boundary: OpenAI-compatible requests must explicitly include a `model`, and the Worker rejects models outside the corresponding list. There is no server-selected default model.

`AI_RATE_LIMITER` is a native Rate Limiting binding using namespace `2026071801`. It limits each Cloudflare connecting IP and inference route to 20 requests per 60 seconds; authentication failures and model listing do not consume inference quota.

Official Cloudflare references:

- [Workers AI bindings](https://developers.cloudflare.com/workers-ai/configuration/bindings/)
- [OpenAI compatible API endpoints](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/)
- [AI Gateway binding methods](https://developers.cloudflare.com/ai-gateway/usage/worker-binding-methods/)
- [Rate Limiting binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- [OpenAI API authentication](https://developers.openai.com/api/reference/overview#authentication)

## OpenAI-compatible API

Use this base URL for OpenAI-compatible clients:

```text
https://api.yume.zone/api/v1
```

| Method and relative path | Purpose |
| --- | --- |
| `GET /models` | List the models exposed by the configured allowlists |
| `POST /chat/completions` | Chat Completions-compatible inference |
| `POST /responses` | Responses-compatible inference |
| `POST /embeddings` | Embeddings-compatible inference |

Set the OpenAI/OpenWebUI API key field to the exact `AI_API_KEY` Secret. The Worker validates `Authorization: Bearer <key>` before rate limiting or inference. Never expose this key in browser-delivered frontend code.

## GitHub automatic deployment

Connect each Cloudflare Worker project to the same GitHub repository, `YumePrincess/yume-all-in-one`, from **Worker → Settings → Builds**. Use `main` as the production branch, `/` as the root directory, leave non-production branch builds disabled, and keep the default include watch path `*` so shared files and generated Official aliases always rebuild together.

Workers Builds does not honor `build.command` from Wrangler configuration. Set these commands explicitly in the dashboard:

| Worker | Build command | Deploy command |
| --- | --- | --- |
| `yume-official` | `npm run check` | `npm run deploy:official` |
| `yume-search` | `npm run check` | `npm run deploy:search` |
| `yume-pricing` | `npm run check` | `npm run deploy:pricing` |
| `yume-aio-api` | `npm run check` | `npm run deploy:aio-api` |

Do not add `DEEPL_API_KEY` or `AI_API_KEY` as build variables: build variables are not available to the running Worker. Keep both under **yume-aio-api → Settings → Variables and Secrets** as encrypted runtime secrets. Workers AI upstream authorization still comes from the `AI` binding; `AI_API_KEY` only protects the public OpenAI-compatible routes.

For a manual deployment, keep this order:

```bash
npm run deploy:aio-api
npm run deploy:official
npm run deploy:search
npm run deploy:pricing
```

The three static build commands target separate output directories, so one deployment cannot delete another site's build output. Keep manual full-stack deployments serial and in the order above.

After deployment, requests for missing static files such as `/missing.js` must return the styled static 404 without appearing in `yume-aio-api` invocation logs. A missing endpoint under `https://api.yume.zone/*` is intentionally handled by `yume-aio-api` and returns JSON 404.

## Migration from `yume-api`

Treat the Worker rename as a migration rather than assuming Cloudflare project state is transferred:

1. Deploy `yume-aio-api`, attach `api.yume.zone`, and set both `DEEPL_API_KEY` and `AI_API_KEY` on the new Worker.
2. Verify the existing API endpoints through `https://api.yume.zone`, then verify `GET /api/v1/models`, Chat Completions, Responses, and Embeddings with the new Bearer key and allowlisted model IDs.
3. Confirm frontend traffic and invocation logs reach `yume-aio-api`, and confirm no frontend hostname still depends on an old same-origin `/api/*` route.
4. Only after those checks pass, remove the old `yume-api` routes and then delete or archive the old Worker project. Do not remove the old project first.
