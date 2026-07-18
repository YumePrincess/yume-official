import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../backend/worker.js';

function executionContext() {
  return {
    waitUntil() {},
  };
}

test('non-API requests receive JSON 404 when the API worker is called directly', async () => {
  const response = await worker.fetch(
    new Request('https://yume.zone/missing.js'),
    {},
    executionContext()
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not Found', path: '/missing.js' });
});

test('announcement API works on every configured hostname', async () => {
  const hostnames = [
    'yume.zone',
    'www.yume.zone',
    'search.yume.zone',
    'pricing.yume.zone',
  ];

  for (const hostname of hostnames) {
    const response = await worker.fetch(
      new Request(`https://${hostname}/api/announcement`),
      {},
      executionContext()
    );

    assert.equal(response.status, 200, hostname);
    assert.deepEqual(await response.json(), { md: null, start: null, end: null });
  }
});

test('protected APIs allow Yume hosts and reject untrusted browser origins', async () => {
  const sameSiteResponse = await worker.fetch(
    new Request('https://search.yume.zone/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hello', target_lang: 'JA' }),
    }),
    {},
    executionContext()
  );
  assert.equal(sameSiteResponse.status, 500);
  assert.deepEqual(await sameSiteResponse.json(), { error: 'DEEPL_API_KEY not set' });

  const rejectedResponse = await worker.fetch(
    new Request('https://yume.zone/api/geoip', {
      headers: { Origin: 'https://example.com' },
    }),
    {},
    executionContext()
  );
  assert.equal(rejectedResponse.status, 403);
  assert.deepEqual(await rejectedResponse.json(), { error: 'Forbidden' });
});

test('unknown API paths and unsupported methods return explicit JSON errors', async () => {
  const missingResponse = await worker.fetch(
    new Request('https://yume.zone/api/missing'),
    {},
    executionContext()
  );
  assert.equal(missingResponse.status, 404);

  const methodResponse = await worker.fetch(
    new Request('https://yume.zone/api/announcement', { method: 'POST' }),
    {},
    executionContext()
  );
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.get('Allow'), 'GET');
});
