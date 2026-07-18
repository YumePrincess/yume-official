import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../backend/worker.js';

function executionContext() {
  return {
    waitUntil() {},
  };
}

const TEST_AI_API_KEY = 'test-ai-api-key';

function aiRequestHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TEST_AI_API_KEY}`,
    ...extra,
  };
}

function withAiAccess(env = {}, rateLimitSuccess = true) {
  return {
    AI_API_KEY: TEST_AI_API_KEY,
    AI_RATE_LIMITER: {
      async limit() {
        return { success: rateLimitSuccess };
      },
    },
    ...env,
  };
}

test('non-API requests receive JSON 404 when the API worker is called directly', async () => {
  const response = await worker.fetch(
    new Request('https://api.yume.zone/missing.js'),
    {},
    executionContext()
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'Not Found', path: '/missing.js' });
});

test('announcement API works on the dedicated API hostname', async () => {
  const response = await worker.fetch(
    new Request('https://api.yume.zone/api/announcement'),
    {},
    executionContext()
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { md: null, start: null, end: null });
});

test('protected APIs allow Yume hosts and reject untrusted browser origins', async () => {
  const sameSiteResponse = await worker.fetch(
    new Request('https://api.yume.zone/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://search.yume.zone',
      },
      body: JSON.stringify({ text: 'hello', target_lang: 'JA' }),
    }),
    {},
    executionContext()
  );
  assert.equal(sameSiteResponse.status, 500);
  assert.deepEqual(await sameSiteResponse.json(), { error: 'DEEPL_API_KEY not set' });

  const rejectedResponse = await worker.fetch(
    new Request('https://api.yume.zone/api/geoip', {
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
    new Request('https://api.yume.zone/api/missing'),
    {},
    executionContext()
  );
  assert.equal(missingResponse.status, 404);

  const methodResponse = await worker.fetch(
    new Request('https://api.yume.zone/api/announcement', { method: 'POST' }),
    {},
    executionContext()
  );
  assert.equal(methodResponse.status, 405);
  assert.equal(methodResponse.headers.get('Allow'), 'GET');
});

test('AI model discovery exposes only configured Workers AI models', async () => {
  const response = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/models', {
      headers: { Authorization: `Bearer ${TEST_AI_API_KEY}` },
    }),
    withAiAccess({
      AI_CHAT_MODELS: '@cf/openai/gpt-oss-20b,openai/gpt-5',
      AI_EMBEDDING_MODELS: '@cf/baai/bge-m3',
    }),
    executionContext()
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    object: 'list',
    data: [
      {
        id: '@cf/openai/gpt-oss-20b',
        object: 'model',
        created: 0,
        owned_by: 'openai',
      },
      {
        id: '@cf/baai/bge-m3',
        object: 'model',
        created: 0,
        owned_by: 'baai',
      },
    ],
  });
});

test('chat completions use Bearer authentication, the AI binding, and AI Gateway', async () => {
  let call;
  const completion = {
    id: 'chatcmpl-test',
    object: 'chat.completion',
    created: 1,
    model: '@cf/openai/gpt-oss-20b',
    choices: [
      {
        index: 0,
        message: { role: 'assistant', content: 'Hello' },
        finish_reason: 'stop',
      },
    ],
  };
  const env = withAiAccess({
    AI_GATEWAY_ID: 'yume-gateway',
    AI: {
      aiGatewayLogId: 'gateway-log-test',
      async run(...args) {
        call = args;
        return completion;
      },
    },
  });
  const response = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/chat/completions', {
      method: 'POST',
      headers: aiRequestHeaders({
        Origin: 'https://www.yume.zone',
      }),
      body: JSON.stringify({
        model: '@cf/openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.2,
      }),
    }),
    env,
    executionContext()
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://www.yume.zone');
  assert.equal(response.headers.get('CF-AIG-Log-ID'), 'gateway-log-test');
  assert.deepEqual(await response.json(), completion);
  assert.equal(call[0], '@cf/openai/gpt-oss-20b');
  assert.deepEqual(call[1], {
    messages: [{ role: 'user', content: 'Hello' }],
    temperature: 0.2,
  });
  assert.equal(call[2].gateway.id, 'yume-gateway');
  assert.equal(call[2].gateway.collectLog, true);
  assert.equal(call[2].gateway.metadata.service, 'yume-aio-api');
  assert.equal(call[2].gateway.metadata.endpoint, 'chat.completions');
});

test('chat completion streaming preserves the Workers AI SSE stream', async () => {
  const encoder = new TextEncoder();
  const upstream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('data: {"id":"chatcmpl-stream"}\n\n'));
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  const response = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/chat/completions', {
      method: 'POST',
      headers: aiRequestHeaders(),
      body: JSON.stringify({
        model: '@cf/openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'Hello' }],
        stream: true,
      }),
    }),
    withAiAccess({ AI: { async run() { return upstream; } } }),
    executionContext()
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /^text\/event-stream/);
  assert.equal(response.headers.get('Cache-Control'), 'no-cache, no-transform');
  assert.equal(
    await response.text(),
    'data: {"id":"chatcmpl-stream"}\n\ndata: [DONE]\n\n'
  );
});

test('embeddings normalize Workers AI vectors to the OpenAI response shape', async () => {
  let call;
  const response = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/embeddings', {
      method: 'POST',
      headers: aiRequestHeaders(),
      body: JSON.stringify({
        model: '@cf/baai/bge-m3',
        input: ['hello', 'world'],
      }),
    }),
    withAiAccess({
      AI: {
        async run(...args) {
          call = args;
          return { data: [[0.1, 0.2], [0.3, 0.4]], shape: [2, 2] };
        },
      },
    }),
    executionContext()
  );

  assert.equal(response.status, 200);
  assert.deepEqual(call[1], { text: ['hello', 'world'] });
  assert.deepEqual(await response.json(), {
    object: 'list',
    data: [
      { object: 'embedding', embedding: [0.1, 0.2], index: 0 },
      { object: 'embedding', embedding: [0.3, 0.4], index: 1 },
    ],
    model: '@cf/baai/bge-m3',
    usage: { prompt_tokens: 0, total_tokens: 0 },
  });
});

test('AI requests reject unknown models and untrusted browser origins before inference', async () => {
  let calls = 0;
  const env = withAiAccess({
    AI: {
      async run() {
        calls += 1;
        return {};
      },
    },
  });
  const unknownModelResponse = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/chat/completions', {
      method: 'POST',
      headers: aiRequestHeaders(),
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    }),
    env,
    executionContext()
  );
  assert.equal(unknownModelResponse.status, 404);
  assert.equal((await unknownModelResponse.json()).error.code, 'model_not_found');

  const rejectedOriginResponse = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/chat/completions', {
      method: 'POST',
      headers: aiRequestHeaders({
        Origin: 'https://example.com',
      }),
      body: JSON.stringify({
        model: '@cf/openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    }),
    env,
    executionContext()
  );
  assert.equal(rejectedOriginResponse.status, 403);
  assert.equal(calls, 0);
});

test('every v1 endpoint requires the configured AI_API_KEY Bearer secret', async () => {
  let calls = 0;
  const env = withAiAccess({
    AI: {
      async run() {
        calls += 1;
        return {};
      },
    },
  });
  const missingKey = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/models'),
    env,
    executionContext()
  );
  assert.equal(missingKey.status, 401);
  assert.match(missingKey.headers.get('WWW-Authenticate'), /^Bearer /);
  assert.equal((await missingKey.json()).error.code, 'invalid_api_key');

  const wrongKey = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/models', {
      headers: { Authorization: 'Bearer wrong-key' },
    }),
    env,
    executionContext()
  );
  assert.equal(wrongKey.status, 401);

  const missingSecret = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/models', {
      headers: { Authorization: `Bearer ${TEST_AI_API_KEY}` },
    }),
    {},
    executionContext()
  );
  assert.equal(missingSecret.status, 503);
  assert.equal((await missingSecret.json()).error.code, 'authentication_unavailable');
  assert.equal(calls, 0);
});

test('AI rate limiting returns an OpenAI-compatible 429 before inference', async () => {
  let calls = 0;
  const response = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/chat/completions', {
      method: 'POST',
      headers: aiRequestHeaders({ 'CF-Connecting-IP': '203.0.113.10' }),
      body: JSON.stringify({
        model: '@cf/openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    }),
    withAiAccess({
      AI: {
        async run() {
          calls += 1;
          return {};
        },
      },
    }, false),
    executionContext()
  );

  assert.equal(response.status, 429);
  assert.equal(response.headers.get('Retry-After'), '60');
  assert.equal((await response.json()).error.code, 'rate_limit_exceeded');
  assert.equal(calls, 0);
});

test('invalid chat roles and parameters return 400 without calling Workers AI', async () => {
  let calls = 0;
  const env = withAiAccess({
    AI: {
      async run() {
        calls += 1;
        return {};
      },
    },
  });
  const invalidRole = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/chat/completions', {
      method: 'POST',
      headers: aiRequestHeaders(),
      body: JSON.stringify({
        model: '@cf/openai/gpt-oss-20b',
        messages: [{ role: 'bogus', content: 'Hello' }],
      }),
    }),
    env,
    executionContext()
  );
  assert.equal(invalidRole.status, 400);
  assert.equal((await invalidRole.json()).error.param, 'messages');

  const invalidTemperature = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/chat/completions', {
      method: 'POST',
      headers: aiRequestHeaders(),
      body: JSON.stringify({
        model: '@cf/openai/gpt-oss-20b',
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 3,
      }),
    }),
    env,
    executionContext()
  );
  assert.equal(invalidTemperature.status, 400);
  assert.equal((await invalidTemperature.json()).error.param, 'temperature');
  assert.equal(calls, 0);
});

test('AI preflight and method errors cover the entire protected AI subtree', async () => {
  const preflight = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/responses', {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://search.yume.zone',
        'Access-Control-Request-Headers': [
          'content-type',
          'authorization',
          'x-stainless-retry-count',
          'x-stainless-lang',
        ].join(', '),
      },
    }),
    {},
    executionContext()
  );
  assert.equal(preflight.status, 204);
  assert.equal(
    preflight.headers.get('Access-Control-Allow-Origin'),
    'https://search.yume.zone'
  );
  assert.match(
    preflight.headers.get('Access-Control-Allow-Headers'),
    /x-stainless-retry-count/
  );
  assert.match(preflight.headers.get('Access-Control-Allow-Headers'), /x-stainless-lang/);

  const wrongMethod = await worker.fetch(
    new Request('https://api.yume.zone/api/v1/models', {
      method: 'POST',
      headers: { Authorization: `Bearer ${TEST_AI_API_KEY}` },
    }),
    withAiAccess(),
    executionContext()
  );
  assert.equal(wrongMethod.status, 405);
  assert.equal(wrongMethod.headers.get('Allow'), 'GET');
  assert.equal((await wrongMethod.json()).error.code, 'method_not_allowed');
});
