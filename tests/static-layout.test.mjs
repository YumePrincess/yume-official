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

  for (const file of ["../frontend/index.html", "../frontend/search/index.html", "../frontend/pricing/index.html"]) {
    const page = await readFile(new URL(file, import.meta.url), "utf8");
    const criticalStyleIndex = page.indexOf('id="loading-critical"');
    const loadingStylesheetIndex = page.indexOf("loading.css");

    assert.notEqual(criticalStyleIndex, -1);
    assert.notEqual(loadingStylesheetIndex, -1);
    assert.ok(criticalStyleIndex < loadingStylesheetIndex);
    assert.match(page, /#loading-box \{[\s\S]*position: fixed;[\s\S]*z-index: 999998;/);
    assert.match(page, /#loading-box > \.spinner-box \{[\s\S]*z-index: 999999;/);
  }

  for (const file of ["../frontend/200.html", "../frontend/404.html", "../frontend/500.html"]) {
    const page = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(page, /example\.com/);
    assert.match(page, /id="cf-hostname"/);
  }

  const homepage = await readFile(new URL("../frontend/index.html", import.meta.url), "utf8");
  assert.doesNotMatch(homepage, /facebook\.com\/YumePrincess|id="facebook"/);

  for (const file of ["../frontend/js/preferences.js", "../frontend/search/js/preferences.js", "../frontend/pricing/js/preferences.js"]) {
    const preferences = await readFile(new URL(file, import.meta.url), "utf8");
    assert.match(preferences, /cookieDomain: '\.yume\.zone'/);
    assert.match(preferences, /cookieDomain: '\.princess\.work'/);
    assert.match(preferences, /cookieDomain: '\.yume\.edu\.pl'/);
    assert.match(preferences, /hostname\.endsWith\('\.' \+ entry\.suffix\)/);
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

test("SMS consent page is static and publicly routable", async () => {
  const redirects = await readFile(new URL("../frontend/_redirects", import.meta.url), "utf8");
  const consentSource = await readFile(new URL("../frontend/sms-consent/index.html", import.meta.url), "utf8");
  const consentScript = await readFile(new URL("../frontend/sms-consent/app.js", import.meta.url), "utf8");

  assert.match(redirects, /\/sms-consent \/sms-consent\/ 308/);
  assert.match(redirects, /\/sms-consent\/index\.html \/sms-consent\/ 308/);
  assert.doesNotMatch(redirects, /sms-campaign-demo|campaign-demo/);
  assert.doesNotMatch(consentSource, /sms-campaign-demo|campaign-demo/);
  assert.match(consentSource, /canonical" href="https:\/\/www\.yume\.zone\/sms-consent\//);
  assert.match(consentSource, /<title>Yume Official SMS Notifications<\/title>/);
  assert.match(consentSource, /SMS Notifications/);
  assert.match(consentSource, /Enter your mobile phone number to receive transactional and account-related SMS messages from Yume Official\./);
  assert.match(consentSource, /Save SMS Preferences/);
  assert.match(consentSource, /You may continue using Yume Official without opting in to SMS notifications\./);
  assert.match(consentSource, /id="sms-consent" name="sms-consent" type="checkbox"/);
  assert.doesNotMatch(consentSource, /id="sms-consent"[^>]*\bchecked\b/);
  assert.match(consentSource, /href="\/privacy"/);
  assert.match(consentSource, /href="\/terms"/);
  assert.doesNotMatch(consentSource, /Twilio A2P 10DLC|SMS Campaign Demo|Demo only|Campaign submission|Campaign sending number|Replace before submission|This demonstration does not invent|Check for errors|Submit registration|This is a static demonstration|Before you submit|Registration check/);
  assert.doesNotMatch(consentScript, /Twilio A2P 10DLC|SMS Campaign Demo|Demo only|Campaign submission|Campaign sending number|Check for errors|Submit registration|This is a static demonstration|Before you submit|Registration check/);
  assert.doesNotMatch(consentScript, /fetch\s*\(/);
  assert.doesNotMatch(consentScript, /XMLHttpRequest/);
});
