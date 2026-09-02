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
    "../frontend/sms-consent/index.html",
    "../frontend/sms-consent/style.css",
    "../frontend/sms-consent/app.js",
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

test("terms routes preserve the existing query-driven homepage", async () => {
  const redirects = await readFile(new URL("../frontend/_redirects", import.meta.url), "utf8");
  const mainSource = await readFile(new URL("../frontend/js/main.js", import.meta.url), "utf8");

  for (const route of [
    "/terms /?terms=user 200",
    "/privacy /?terms=privacy 200",
    "/refunds /?terms=refunds 200",
    "/terms/user /?terms=user 200",
    "/terms/privacy /?terms=privacy 200",
    "/terms/refunds /?terms=refunds 200"
  ]) {
    assert.match(redirects, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.match(mainSource, /pathAliases/);
  assert.match(mainSource, /window\.location\.pathname/);
  assert.doesNotMatch(mainSource, /terms\/manifest\.json/);
});

test("SMS consent demo is static and publicly routable", async () => {
  const redirects = await readFile(new URL("../frontend/_redirects", import.meta.url), "utf8");
  const demoSource = await readFile(new URL("../frontend/sms-consent/index.html", import.meta.url), "utf8");
  const demoScript = await readFile(new URL("../frontend/sms-consent/app.js", import.meta.url), "utf8");

  assert.match(redirects, /\/sms-consent \/sms-consent\/ 308/);
  assert.match(redirects, /\/sms-consent\/index\.html \/sms-consent\/ 308/);
  assert.doesNotMatch(redirects, /sms-campaign-demo|campaign-demo/);
  assert.doesNotMatch(demoSource, /sms-campaign-demo|campaign-demo/);
  assert.match(demoSource, /canonical" href="https:\/\/www\.yume\.zone\/sms-consent\//);
  assert.match(demoSource, /Campaign description/);
  assert.match(demoSource, /Sample message #5/);
  assert.match(demoSource, /id="sms-consent"/);
  assert.match(demoSource, /Continue without SMS/);
  assert.match(demoSource, /transactional and account-related SMS messages/);
  assert.match(demoSource, /one-time verification codes/);
  assert.match(demoSource, /Message frequency varies based on account activity/);
  assert.match(demoSource, /Website: https:\/\/www\.yume\.zone/);
  assert.match(demoSource, /Terms of Service: https:\/\/www\.yume\.zone\/terms/);
  assert.match(demoSource, /Public opt-in example: https:\/\/www\.yume\.zone\/sms-consent/);
  assert.match(demoSource, /Mobile application/);
  assert.match(demoSource, /href="\/privacy"/);
  assert.match(demoSource, /href="\/terms"/);
  assert.doesNotMatch(demoScript, /fetch\s*\(/);
  assert.doesNotMatch(demoScript, /XMLHttpRequest/);
});
