import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const configSource = await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const config = JSON.parse(configSource.replace(/\/\/.*$/gm, ""));

test("deployment is static-assets only", async () => {
  assert.equal("main" in config, false);
  assert.equal("binding" in config.assets, false);
  assert.equal("run_worker_first" in config.assets, false);
  assert.equal(config.assets.directory, "./dist/official");

  const headers = await readFile(new URL("../scripts/static/_headers", import.meta.url), "utf8");
  assert.match(headers, /\/\*/);
  assert.match(headers, /Access-Control-Allow-Origin: \*/);
  assert.match(headers, /Access-Control-Allow-Methods: GET, HEAD/);
  assert.match(headers, /\/font\/\*/);
  assert.match(headers, /Cache-Control: public, max-age=31536000, immutable/);
});

test("static build contains the single official asset tree", async () => {
  const requiredFiles = [
    "../dist/official/index.html",
    "../dist/official/search/index.html",
    "../dist/official/pricing/index.html",
    "../dist/official/_headers",
    "../dist/official/_redirects",
  ];

  await Promise.all(requiredFiles.map((file) => readFile(new URL(file, import.meta.url))));
});
