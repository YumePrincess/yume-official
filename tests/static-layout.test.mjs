import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const configSource = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const config = JSON.parse(configSource.replace(/\/\/.*$/gm, ""));

test("deployment is static-assets only", async () => {
  assert.equal("main" in config, false);
  assert.equal("binding" in config.assets, false);
  assert.equal("run_worker_first" in config.assets, false);
  assert.equal(config.assets.directory, "./frontend");
  assert.equal(config.assets.not_found_handling, "404-page");

  const headers = await readFile(new URL("../frontend/_headers", import.meta.url), "utf8");
  assert.match(headers, /\/\*/);
  assert.match(headers, /Access-Control-Allow-Origin: \*/);
  assert.match(headers, /Access-Control-Allow-Methods: GET, HEAD/);
  assert.match(headers, /\/font\/\*/);
  assert.match(headers, /Cache-Control: public, max-age=31536000, immutable/);
});

test("static build contains the single official asset tree", async () => {
  const requiredFiles = [
    "../frontend/index.html",
    "../frontend/search/index.html",
    "../frontend/pricing/index.html",
    "../frontend/200.html",
    "../frontend/404.html",
    "../frontend/500.html",
    "../frontend/css/cloudflare-error-page.css",
    "../frontend/js/cloudflare-error-page.js",
    "../frontend/_headers",
    "../frontend/_redirects",
  ];

  await Promise.all(requiredFiles.map((file) => readFile(new URL(file, import.meta.url))));

  for (const file of ["../frontend/200.html", "../frontend/404.html", "../frontend/500.html"]) {
    const page = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(page, /example\.com/);
    assert.match(page, /id="cf-hostname"/);
  }

  const errorPageScript = await readFile(new URL("../frontend/js/cloudflare-error-page.js", import.meta.url), "utf8");
  assert.match(errorPageScript, /a\.location\.hostname/);

  const notFoundFallback = await readFile(new URL("../frontend/404.html", import.meta.url), "utf8");
  assert.match(notFoundFallback, /Error code 500/);
  assert.match(notFoundFallback, /cf-cloudflare-status/);
});
