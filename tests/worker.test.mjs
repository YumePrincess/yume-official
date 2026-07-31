import assert from "node:assert/strict";
import test from "node:test";
import worker from "../worker.mjs";

function createAssets(response) {
  return {
    fetch: async () => response
  };
}

test("font assets receive CORS and version-safe cache headers", async () => {
  const response = await worker.fetch(
    new Request("https://www.yume.zone/font/UnidreamLED.ttf?v=font-v1"),
    {
      ASSETS: createAssets(new Response("font", {
        headers: { "Content-Type": "font/ttf" }
      }))
    }
  );

  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
  assert.equal(response.headers.get("Access-Control-Allow-Methods"), "GET, HEAD");
  assert.equal(
    response.headers.get("Cache-Control"),
    "public, max-age=31536000, immutable"
  );
});

test("non-font static assets bypass the response transformation", async () => {
  const source = new Response("image", {
    headers: { "Cache-Control": "public, max-age=0, must-revalidate" }
  });
  const response = await worker.fetch(
    new Request("https://www.yume.zone/images/logo.png"),
    { ASSETS: createAssets(source) }
  );

  assert.equal(response, source);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), null);
});
