export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const isApiRequest = url.pathname.startsWith("/api/");

      if (!isApiRequest) {
        return buildResponse(
          { error: "Not Found", path: url.pathname },
          404,
          getPublicCorsOrigin(request)
        );
      }

      // OPTIONS 预检
      if (request.method === "OPTIONS") {
        const protectedOrigin = getProtectedApiOrigin(request, url);
        const isProtectedApi = isProtectedApiPath(url.pathname);

        if (isProtectedApi && !protectedOrigin.allowed) {
          return buildResponse({ error: "Forbidden" }, 403, "");
        }

        return buildResponse(
          null,
          204,
          isProtectedApi ? protectedOrigin.corsOrigin : getPublicCorsOrigin(request),
          true,
          getCorsAllowHeaders(request)
        );
      }

      // ----------------------
      // 路由分发
      // ----------------------
      const protectedOrigin = getProtectedApiOrigin(request, url);
      const isProtectedApi = isProtectedApiPath(url.pathname);

      if (isProtectedApi && !protectedOrigin.allowed) {
        return buildResponse({ error: "Forbidden" }, 403, "");
      }

      return await handleApiRequest(
        request,
        env,
        isProtectedApi ? protectedOrigin.corsOrigin : getPublicCorsOrigin(request),
        ctx
      );
    } catch (err) {
      console.error(
        JSON.stringify({
          message: "Unhandled Worker request error",
          error: err?.message || String(err),
        })
      );
      return buildResponse({ error: "Internal Error" }, 500);
    }
  },
};

const ANNOUNCEMENTS_CONFIG_KEY = "announcements/config.json";
const PROTECTED_API_PATHS = new Set(["/api/geoip", "/api/geowea", "/api/translate"]);
const AI_API_PREFIX = "/api/v1";
const AI_ROUTE_PREFIX = "/v1";
const DEFAULT_AI_CHAT_MODELS = ["@cf/openai/gpt-oss-20b"];
const DEFAULT_AI_EMBEDDING_MODELS = ["@cf/baai/bge-m3"];
const MAX_AI_REQUEST_BYTES = 1024 * 1024;
const DEFAULT_CORS_ALLOW_HEADERS = "Content-Type,Authorization";
const CHAT_MESSAGE_ROLES = new Set([
  "developer",
  "system",
  "user",
  "assistant",
  "tool",
  "function",
]);
const ALLOWED_ORIGIN_DOMAINS = ["yume.zone", "princess.work"];
const API_METHODS = new Map([
  ["/announcement", ["GET"]],
  ["/translate", ["POST"]],
  ["/geoip", ["GET"]],
  ["/geowea", ["GET"]],
]);
const AI_METHODS = new Map([
  ["/v1", ["GET"]],
  ["/v1/models", ["GET"]],
  ["/v1/chat/completions", ["POST"]],
  ["/v1/responses", ["POST"]],
  ["/v1/embeddings", ["POST"]],
]);

async function handleApiRequest(request, env, allowOrigin, ctx) {
  const url = new URL(request.url);
  const route = url.pathname.slice("/api".length);

  if (route === AI_ROUTE_PREFIX || route.startsWith(`${AI_ROUTE_PREFIX}/`)) {
    return handleAiRequest(request, env, allowOrigin);
  }

  const allowedMethods = API_METHODS.get(route);

  if (allowedMethods && !allowedMethods.includes(request.method)) {
    const response = buildResponse(
      { error: "Method Not Allowed", path: url.pathname },
      405,
      allowOrigin
    );
    response.headers.set("Allow", allowedMethods.join(", "));
    return response;
  }

  if (route === "/announcement" && request.method === "GET") {
    return handleAnnouncement(env, allowOrigin);
  }

  if (route === "/translate" && request.method === "POST") {
    return handleTranslate(request, env, allowOrigin, ctx);
  }

  if (route === "/geoip" && request.method === "GET") {
    return handleGeoIP(request, allowOrigin, ctx);
  }

  if (route === "/geowea" && request.method === "GET") {
    return handleGeoWeather(request, allowOrigin, ctx);
  }

  return buildResponse(
    { error: "Not Found", path: url.pathname },
    404,
    allowOrigin
  );
}

function isProtectedApiPath(pathname) {
  return (
    PROTECTED_API_PATHS.has(pathname) ||
    pathname === AI_API_PREFIX ||
    pathname.startsWith(`${AI_API_PREFIX}/`)
  );
}

// ----------------------
// Workers AI（OpenAI v1 兼容）
// ----------------------
async function handleAiRequest(request, env, allowOrigin) {
  const requestId = crypto.randomUUID();
  const url = new URL(request.url);
  const rawRoute = url.pathname.slice("/api".length);
  const route = rawRoute.length > 1 ? rawRoute.replace(/\/+$/, "") : rawRoute;
  const allowedMethods = AI_METHODS.get(route);

  const authenticationError = await authenticateAiRequest(
    request,
    env,
    allowOrigin,
    requestId
  );
  if (authenticationError) {
    return authenticationError;
  }

  if (!allowedMethods) {
    return buildOpenAiError(
      "The requested AI endpoint does not exist.",
      404,
      allowOrigin,
      requestId,
      { code: "not_found" }
    );
  }

  if (!allowedMethods.includes(request.method)) {
    const response = buildOpenAiError(
      "Method not allowed.",
      405,
      allowOrigin,
      requestId,
      { code: "method_not_allowed" }
    );
    response.headers.set("Allow", allowedMethods.join(", "));
    return response;
  }

  try {
    if (route === "/v1") {
      return handleAiDiscovery(request, env, allowOrigin, requestId);
    }

    if (route === "/v1/models") {
      return handleAiModels(env, allowOrigin, requestId);
    }

    const rateLimitResponse = await enforceAiRateLimit(
      request,
      env,
      route,
      allowOrigin,
      requestId
    );
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    if (route === "/v1/chat/completions") {
      return await handleAiChatCompletions(request, env, allowOrigin, requestId);
    }

    if (route === "/v1/responses") {
      return await handleAiResponses(request, env, allowOrigin, requestId);
    }

    return await handleAiEmbeddings(request, env, allowOrigin, requestId);
  } catch (err) {
    if (err instanceof AiHttpError) {
      return buildOpenAiError(
        err.message,
        err.status,
        allowOrigin,
        requestId,
        { type: err.type, param: err.param, code: err.code }
      );
    }

    console.error(
      JSON.stringify({
        message: "Unhandled AI API error",
        requestId,
        error: err?.message || String(err),
      })
    );
    return buildOpenAiError(
      "The AI request could not be completed.",
      500,
      allowOrigin,
      requestId,
      { type: "server_error", code: "internal_error" }
    );
  }
}

async function authenticateAiRequest(request, env, allowOrigin, requestId) {
  const configuredKey = env.AI_API_KEY;
  if (typeof configuredKey !== "string" || configuredKey.length === 0) {
    return buildOpenAiError(
      "AI API authentication is unavailable.",
      503,
      allowOrigin,
      requestId,
      { type: "server_error", code: "authentication_unavailable" }
    );
  }

  const authorization = request.headers.get("Authorization") || "";
  const match = authorization.match(/^Bearer[ \t]+([^\s]+)$/i);
  const suppliedKey = match?.[1] || "";
  const authenticated =
    suppliedKey.length > 0 &&
    suppliedKey.length <= 4096 &&
    await timingSafeSecretEqual(suppliedKey, configuredKey);

  if (authenticated) {
    return null;
  }

  const response = buildOpenAiError(
    "Invalid or missing API key.",
    401,
    allowOrigin,
    requestId,
    { type: "authentication_error", code: "invalid_api_key" }
  );
  response.headers.set("WWW-Authenticate", 'Bearer realm="Yume AI API"');
  return response;
}

async function timingSafeSecretEqual(left, right) {
  const encoder = new TextEncoder();
  const [leftDigest, rightDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(left)),
    crypto.subtle.digest("SHA-256", encoder.encode(right)),
  ]);

  if (typeof crypto.subtle.timingSafeEqual === "function") {
    return crypto.subtle.timingSafeEqual(leftDigest, rightDigest);
  }

  const leftBytes = new Uint8Array(leftDigest);
  const rightBytes = new Uint8Array(rightDigest);
  let difference = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }
  return difference === 0;
}

async function enforceAiRateLimit(request, env, route, allowOrigin, requestId) {
  if (!env.AI_RATE_LIMITER || typeof env.AI_RATE_LIMITER.limit !== "function") {
    throw new AiHttpError(
      "AI rate limiting is unavailable.",
      503,
      null,
      "rate_limiter_unavailable",
      "server_error"
    );
  }

  const actor = request.headers.get("CF-Connecting-IP") || "anonymous";
  let result;
  try {
    result = await env.AI_RATE_LIMITER.limit({ key: `${actor}:${route}` });
  } catch (err) {
    console.error(
      JSON.stringify({
        message: "AI rate limiter failed",
        requestId,
        route,
        error: err?.message || String(err),
      })
    );
    throw new AiHttpError(
      "AI rate limiting is temporarily unavailable.",
      503,
      null,
      "rate_limiter_unavailable",
      "server_error"
    );
  }

  if (result?.success !== true) {
    const response = buildOpenAiError(
      "Rate limit exceeded. Try again later.",
      429,
      allowOrigin,
      requestId,
      { type: "rate_limit_error", code: "rate_limit_exceeded" }
    );
    response.headers.set("Retry-After", "60");
    return response;
  }

  return null;
}

function handleAiDiscovery(request, env, allowOrigin, requestId) {
  const baseUrl = new URL("/api/v1", request.url).toString();
  const models = getAiModelConfig(env);

  return buildOpenAiJson(
    {
      object: "api",
      version: "v1",
      base_url: baseUrl,
      endpoints: [
        "GET /models",
        "POST /chat/completions",
        "POST /responses",
        "POST /embeddings",
      ],
      models: {
        chat: models.chat,
        embeddings: models.embeddings,
      },
    },
    200,
    allowOrigin,
    requestId
  );
}

function handleAiModels(env, allowOrigin, requestId) {
  const models = getAiModelConfig(env);
  const data = [...models.chat, ...models.embeddings].map((model) => ({
    id: model,
    object: "model",
    created: 0,
    owned_by: getWorkersAiModelOwner(model),
  }));

  return buildOpenAiJson(
    { object: "list", data },
    200,
    allowOrigin,
    requestId
  );
}

async function handleAiChatCompletions(request, env, allowOrigin, requestId) {
  assertAiBinding(env);
  const body = await readAiJsonObject(request);
  const model = requireAiModel(body.model);
  const { chat } = getAiModelConfig(env);
  assertAllowedAiModel(model, chat);

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    throw new AiHttpError(
      "messages must be a non-empty array.",
      400,
      "messages",
      "invalid_messages"
    );
  }

  const invalidMessage = body.messages.some((message) => !isValidChatMessage(message));
  if (invalidMessage) {
    throw new AiHttpError(
      "Each message must use a supported role and valid content.",
      400,
      "messages",
      "invalid_messages"
    );
  }

  validateStreamOption(body.stream);
  validateChatOptions(body);
  const input = { ...body };
  delete input.model;
  const result = await runWorkersAi(env, model, input, "chat.completions", requestId);

  if (body.stream === true) {
    if (!isReadableStream(result)) {
      throw new AiHttpError(
        "Workers AI returned an invalid streaming response.",
        502,
        null,
        "invalid_ai_response",
        "server_error"
      );
    }
    return buildOpenAiStream(result, env, allowOrigin, requestId);
  }

  if (!result || typeof result !== "object" || isReadableStream(result)) {
    throw new AiHttpError(
      "Workers AI returned an invalid response.",
      502,
      null,
      "invalid_ai_response",
      "server_error"
    );
  }

  return buildOpenAiJson(result, 200, allowOrigin, requestId, env);
}

async function handleAiResponses(request, env, allowOrigin, requestId) {
  assertAiBinding(env);
  const body = await readAiJsonObject(request);
  const model = requireAiModel(body.model);
  const { chat } = getAiModelConfig(env);
  assertAllowedAiModel(model, chat);

  if (
    body.input === undefined ||
    (typeof body.input !== "string" && !Array.isArray(body.input)) ||
    (typeof body.input === "string" && !body.input.trim()) ||
    (Array.isArray(body.input) && body.input.length === 0)
  ) {
    throw new AiHttpError(
      "input must be a non-empty string or array.",
      400,
      "input",
      "invalid_input"
    );
  }

  if (
    Array.isArray(body.input) &&
    body.input.some((item) => !item || typeof item !== "object" || Array.isArray(item))
  ) {
    throw new AiHttpError(
      "Each Responses input item must be an object.",
      400,
      "input",
      "invalid_input"
    );
  }

  validateStreamOption(body.stream);
  validateResponsesOptions(body);
  const input = { ...body };
  delete input.model;
  const result = await runWorkersAi(env, model, input, "responses", requestId);

  if (body.stream === true) {
    if (!isReadableStream(result)) {
      throw new AiHttpError(
        "Workers AI returned an invalid streaming response.",
        502,
        null,
        "invalid_ai_response",
        "server_error"
      );
    }
    return buildOpenAiStream(result, env, allowOrigin, requestId);
  }

  if (!result || typeof result !== "object" || isReadableStream(result)) {
    throw new AiHttpError(
      "Workers AI returned an invalid response.",
      502,
      null,
      "invalid_ai_response",
      "server_error"
    );
  }

  return buildOpenAiJson(result, 200, allowOrigin, requestId, env);
}

async function handleAiEmbeddings(request, env, allowOrigin, requestId) {
  assertAiBinding(env);
  const body = await readAiJsonObject(request);
  const model = requireAiModel(body.model);
  const { embeddings } = getAiModelConfig(env);
  assertAllowedAiModel(model, embeddings);

  const validString = typeof body.input === "string" && body.input.length > 0;
  const validStringList =
    Array.isArray(body.input) &&
    body.input.length > 0 &&
    body.input.every((value) => typeof value === "string" && value.length > 0);

  if (!validString && !validStringList) {
    throw new AiHttpError(
      "input must be a non-empty string or an array of non-empty strings.",
      400,
      "input",
      "invalid_input"
    );
  }

  if (body.encoding_format !== undefined && body.encoding_format !== "float") {
    throw new AiHttpError(
      "Only encoding_format=\"float\" is supported.",
      400,
      "encoding_format",
      "unsupported_encoding_format"
    );
  }

  if (body.dimensions !== undefined) {
    throw new AiHttpError(
      "Custom embedding dimensions are not supported by this model.",
      400,
      "dimensions",
      "unsupported_dimensions"
    );
  }

  const result = await runWorkersAi(
    env,
    model,
    { text: body.input },
    "embeddings",
    requestId
  );
  const vectors = result?.data;

  if (
    !Array.isArray(vectors) ||
    vectors.length === 0 ||
    vectors.some((vector) => !Array.isArray(vector))
  ) {
    throw new AiHttpError(
      "Workers AI returned an invalid embedding response.",
      502,
      null,
      "invalid_ai_response",
      "server_error"
    );
  }

  return buildOpenAiJson(
    {
      object: "list",
      data: vectors.map((embedding, index) => ({
        object: "embedding",
        embedding,
        index,
      })),
      model,
      usage: {
        prompt_tokens: 0,
        total_tokens: 0,
      },
    },
    200,
    allowOrigin,
    requestId,
    env
  );
}

async function runWorkersAi(env, model, input, endpoint, requestId) {
  const gatewayId = String(env.AI_GATEWAY_ID || "default").trim() || "default";

  try {
    return await env.AI.run(model, input, {
      gateway: {
        id: gatewayId,
        collectLog: true,
        metadata: {
          service: "yume-aio-api",
          endpoint,
          request_id: requestId,
        },
      },
    });
  } catch (err) {
    console.error(
      JSON.stringify({
        message: "Workers AI inference failed",
        requestId,
        model,
        endpoint,
        error: err?.message || String(err),
      })
    );
    throw new AiHttpError(
      "Workers AI inference failed.",
      502,
      null,
      "ai_inference_failed",
      "server_error"
    );
  }
}

function assertAiBinding(env) {
  if (!env.AI || typeof env.AI.run !== "function") {
    throw new AiHttpError(
      "Workers AI binding is unavailable.",
      503,
      null,
      "ai_binding_unavailable",
      "server_error"
    );
  }
}

function requireAiModel(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AiHttpError(
      "model is required.",
      400,
      "model",
      "model_required"
    );
  }

  return value.trim();
}

function assertAllowedAiModel(model, allowedModels) {
  if (!allowedModels.includes(model)) {
    throw new AiHttpError(
      `The model '${model}' is not available.`,
      404,
      "model",
      "model_not_found"
    );
  }
}

function validateStreamOption(value) {
  if (value !== undefined && value !== null && typeof value !== "boolean") {
    throw new AiHttpError(
      "stream must be a boolean.",
      400,
      "stream",
      "invalid_stream"
    );
  }
}

function isValidChatMessage(message) {
  if (
    !message ||
    typeof message !== "object" ||
    Array.isArray(message) ||
    !CHAT_MESSAGE_ROLES.has(message.role)
  ) {
    return false;
  }

  const hasContent =
    (typeof message.content === "string" && message.content.length > 0) ||
    (Array.isArray(message.content) && message.content.length > 0);

  if (message.role === "assistant") {
    const hasToolCalls = Array.isArray(message.tool_calls) && message.tool_calls.length > 0;
    const hasFunctionCall =
      message.function_call && typeof message.function_call === "object";
    return hasContent || hasToolCalls || Boolean(hasFunctionCall);
  }

  if (message.role === "tool") {
    return (
      hasContent &&
      typeof message.tool_call_id === "string" &&
      message.tool_call_id.length > 0
    );
  }

  if (message.role === "function") {
    return (
      (typeof message.content === "string" || message.content === null) &&
      typeof message.name === "string" &&
      message.name.length > 0
    );
  }

  return hasContent;
}

function validateChatOptions(body) {
  validateOptionalNumber(body.temperature, "temperature", 0, 2);
  validateOptionalNumber(body.top_p, "top_p", 0, 1);
  validateOptionalNumber(body.frequency_penalty, "frequency_penalty", -2, 2);
  validateOptionalNumber(body.presence_penalty, "presence_penalty", -2, 2);
  validateOptionalInteger(body.n, "n", 1, 4);
  validateOptionalInteger(body.max_tokens, "max_tokens", 1, 8192);
  validateOptionalInteger(
    body.max_completion_tokens,
    "max_completion_tokens",
    1,
    8192
  );

  if (body.tools !== undefined && !Array.isArray(body.tools)) {
    throw invalidAiParameter("tools", "tools must be an array.");
  }

  if (
    body.response_format !== undefined &&
    (!body.response_format ||
      typeof body.response_format !== "object" ||
      Array.isArray(body.response_format))
  ) {
    throw invalidAiParameter(
      "response_format",
      "response_format must be an object."
    );
  }

  if (
    body.stream_options !== undefined &&
    (!body.stream_options ||
      typeof body.stream_options !== "object" ||
      Array.isArray(body.stream_options))
  ) {
    throw invalidAiParameter(
      "stream_options",
      "stream_options must be an object."
    );
  }
}

function validateResponsesOptions(body) {
  validateOptionalNumber(body.temperature, "temperature", 0, 2);
  validateOptionalNumber(body.top_p, "top_p", 0, 1);
  validateOptionalInteger(body.max_output_tokens, "max_output_tokens", 1, 8192);

  if (body.tools !== undefined && !Array.isArray(body.tools)) {
    throw invalidAiParameter("tools", "tools must be an array.");
  }
}

function validateOptionalNumber(value, param, minimum, maximum) {
  if (value === undefined || value === null) return;
  if (typeof value !== "number" || !Number.isFinite(value) || value < minimum || value > maximum) {
    throw invalidAiParameter(
      param,
      `${param} must be a number between ${minimum} and ${maximum}.`
    );
  }
}

function validateOptionalInteger(value, param, minimum, maximum) {
  if (value === undefined || value === null) return;
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw invalidAiParameter(
      param,
      `${param} must be an integer between ${minimum} and ${maximum}.`
    );
  }
}

function invalidAiParameter(param, message) {
  return new AiHttpError(message, 400, param, "invalid_parameter");
}

function getAiModelConfig(env) {
  return {
    chat: parseWorkersAiModels(env.AI_CHAT_MODELS, DEFAULT_AI_CHAT_MODELS),
    embeddings: parseWorkersAiModels(
      env.AI_EMBEDDING_MODELS,
      DEFAULT_AI_EMBEDDING_MODELS
    ),
  };
}

function parseWorkersAiModels(value, fallback) {
  const configured = typeof value === "string"
    ? value.split(",").map((model) => model.trim()).filter(Boolean)
    : [];
  const workersAiModels = configured.filter((model) => model.startsWith("@cf/"));
  return [...new Set(workersAiModels.length ? workersAiModels : fallback)];
}

function getWorkersAiModelOwner(model) {
  return model.split("/")[1] || "cloudflare";
}

async function readAiJsonObject(request) {
  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw new AiHttpError(
      "Content-Type must be application/json.",
      415,
      null,
      "unsupported_content_type"
    );
  }

  const contentLength = Number(request.headers.get("Content-Length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_AI_REQUEST_BYTES) {
    throw new AiHttpError(
      "Request body is too large.",
      413,
      null,
      "request_too_large"
    );
  }

  if (!request.body) {
    throw new AiHttpError("Request body is required.", 400, null, "body_required");
  }

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_AI_REQUEST_BYTES) {
        await reader.cancel();
        throw new AiHttpError(
          "Request body is too large.",
          413,
          null,
          "request_too_large"
        );
      }

      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
  } finally {
    reader.releaseLock();
  }

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new AiHttpError("Invalid JSON.", 400, null, "invalid_json");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AiHttpError(
      "Request body must be a JSON object.",
      400,
      null,
      "invalid_request_body"
    );
  }

  return body;
}

function buildOpenAiJson(
  data,
  status,
  allowOrigin,
  requestId,
  env = null
) {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: buildAiHeaders("application/json; charset=utf-8", allowOrigin, requestId),
  });
  appendAiGatewayLogId(response, env);
  return response;
}

function buildOpenAiStream(stream, env, allowOrigin, requestId) {
  const headers = buildAiHeaders(
    "text/event-stream; charset=utf-8",
    allowOrigin,
    requestId
  );
  headers.set("Cache-Control", "no-cache, no-transform");
  headers.set("X-Accel-Buffering", "no");

  const response = new Response(stream, { status: 200, headers });
  appendAiGatewayLogId(response, env);
  return response;
}

function buildOpenAiError(
  message,
  status,
  allowOrigin,
  requestId,
  { type = "invalid_request_error", param = null, code = null } = {}
) {
  return buildOpenAiJson(
    { error: { message, type, param, code } },
    status,
    allowOrigin,
    requestId
  );
}

function buildAiHeaders(contentType, allowOrigin, requestId) {
  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "no-store",
    "X-Request-ID": requestId,
    Vary: "Origin",
  });

  if (allowOrigin) {
    headers.set("Access-Control-Allow-Origin", allowOrigin);
    headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    headers.set("Access-Control-Allow-Headers", DEFAULT_CORS_ALLOW_HEADERS);
    headers.set(
      "Access-Control-Expose-Headers",
      "X-Request-ID,CF-AIG-Log-ID,Retry-After"
    );
  }

  return headers;
}

function appendAiGatewayLogId(response, env) {
  const logId = env?.AI?.aiGatewayLogId;
  if (typeof logId === "string" && logId) {
    response.headers.set("CF-AIG-Log-ID", logId);
  }
}

function isReadableStream(value) {
  return value && typeof value.getReader === "function";
}

class AiHttpError extends Error {
  constructor(
    message,
    status,
    param = null,
    code = null,
    type = "invalid_request_error"
  ) {
    super(message);
    this.name = "AiHttpError";
    this.status = status;
    this.param = param;
    this.code = code;
    this.type = type;
  }
}

// ----------------------
// 公共响应函数
// ----------------------
function buildResponse(
  data,
  status = 200,
  allowOrigin = "*",
  isOptions = false,
  corsAllowHeaders = DEFAULT_CORS_ALLOW_HEADERS
) {
  const headers = {
    "Content-Type": "application/json",
    Vary: isOptions ? "Origin, Access-Control-Request-Headers" : "Origin",
  };

  if (allowOrigin) {
    headers["Access-Control-Allow-Origin"] = allowOrigin;
    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
    headers["Access-Control-Allow-Headers"] = corsAllowHeaders;
  }

  if (isOptions) {
    return new Response(null, { status: status, headers });
  }

  return new Response(JSON.stringify(data), { status, headers });
}

function getCorsAllowHeaders(request) {
  const requested = request.headers.get("Access-Control-Request-Headers");
  if (!requested) {
    return DEFAULT_CORS_ALLOW_HEADERS;
  }

  const allowedHeaders = new Set(["content-type", "authorization"]);
  for (const value of requested.split(",").slice(0, 32)) {
    const header = value.trim().toLowerCase();
    if (header && header.length <= 128 && /^[a-z0-9-]+$/.test(header)) {
      allowedHeaders.add(header);
    }
  }

  return [...allowedHeaders].join(", ");
}

function getPublicCorsOrigin(request) {
  const origin = request.headers.get("Origin");
  return getAllowedOrigin(origin) || "*";
}

function getProtectedApiOrigin(request, url) {
  const origin = request.headers.get("Origin");
  const allowedOrigin = getAllowedOrigin(origin);

  if (origin) {
    return {
      allowed: Boolean(allowedOrigin),
      corsOrigin: allowedOrigin || "",
    };
  }

  const referer = request.headers.get("Referer");
  if (referer) {
    return {
      allowed: Boolean(getAllowedOrigin(referer)),
      corsOrigin: "",
    };
  }

  return {
    allowed: isAllowedHostname(url.hostname),
    corsOrigin: "",
  };
}

function getAllowedOrigin(origin) {
  if (!origin) {
    return "";
  }

  try {
    const originUrl = new URL(origin);
    if (
      (originUrl.protocol === "https:" || originUrl.protocol === "http:") &&
      isAllowedHostname(originUrl.hostname)
    ) {
      return originUrl.origin;
    }
  } catch {}

  return "";
}

function isAllowedHostname(hostname) {
  const normalizedHostname = hostname.toLowerCase().replace(/\.$/, "");
  return ALLOWED_ORIGIN_DOMAINS.some((domain) => {
    return normalizedHostname === domain || normalizedHostname.endsWith(`.${domain}`);
  });
}

// ----------------------
// 系统公告
// ----------------------
async function handleAnnouncement(env, allowOrigin) {
  try {
    const announcements = await loadAnnouncements(env);
    const nowET = new Date(
      new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    const active = announcements.find((item) => {
      const start = new Date(item.start);
      const end = new Date(item.end);
      return nowET >= start && nowET <= end;
    });

    const result = active
      ? { md: active.md, start: active.start, end: active.end }
      : { md: null, start: null, end: null };

    return buildResponse(result, 200, allowOrigin);
  } catch (err) {
    console.error(
      JSON.stringify({
        message: "Failed to load announcement config",
        error: err.message || String(err),
      })
    );

    return buildResponse(
      { md: null, start: null, end: null },
      200,
      allowOrigin
    );
  }
}

async function loadAnnouncements(env) {
  if (!env.r2) {
    return [];
  }

  const key = env.ANNOUNCEMENTS_CONFIG_KEY || ANNOUNCEMENTS_CONFIG_KEY;
  const object = await env.r2.get(key);
  if (!object) {
    return [];
  }

  const config = await object.json();
  return normalizeAnnouncements(config);
}

function normalizeAnnouncements(config) {
  const rawAnnouncements = Array.isArray(config)
    ? config
    : Array.isArray(config?.announcements)
      ? config.announcements
      : isAnnouncement(config)
        ? [config]
        : [];

  return rawAnnouncements.filter(isAnnouncement);
}

function isAnnouncement(value) {
  return (
    value &&
    typeof value.start === "string" &&
    typeof value.end === "string" &&
    Number.isFinite(new Date(value.start).getTime()) &&
    Number.isFinite(new Date(value.end).getTime()) &&
    isMarkdownMap(value.md)
  );
}

function isMarkdownMap(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.values(value).every((url) => typeof url === "string" && url)
  );
}

// ----------------------
// DeepL 翻译
// ----------------------
async function handleTranslate(request, env, allowOrigin, ctx) {
  const DEEPL_API_KEY = env.DEEPL_API_KEY;
  if (!DEEPL_API_KEY) {
    return buildResponse({ error: "DEEPL_API_KEY not set" }, 500, allowOrigin);
  }

  let body;
  const contentType = request.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    try {
      body = await request.json();
    } catch {
      return buildResponse({ error: "Invalid JSON" }, 400, allowOrigin);
    }
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await request.formData();
    body = Object.fromEntries(form);
  } else {
    return buildResponse(
      { error: "Unsupported Content-Type" },
      400,
      allowOrigin
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return buildResponse({ error: "Invalid request body" }, 400, allowOrigin);
  }

  const { text, target_lang } = body;
  if (!text || !target_lang) {
    return buildResponse(
      { error: "Missing text or target_lang" },
      400,
      allowOrigin
    );
  }

  const normalizedTargetLang = String(target_lang).toUpperCase();
  const translateCache = getDefaultCache();
  const cacheKey = translateCache
    ? await buildInternalCacheRequest(
        "translate",
        `${normalizedTargetLang}\n${String(text)}`
      )
    : null;

  if (translateCache && cacheKey) {
    const cached = await translateCache.match(cacheKey);
    if (cached) {
      return buildResponse(await cached.json(), 200, allowOrigin);
    }
  }

  const apiUrl = "https://api-free.deepl.com/v2/translate";
  try {
    const deeplRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
      },
      body: new URLSearchParams({
        auth_key: DEEPL_API_KEY,
        text,
        target_lang: normalizedTargetLang,
      }),
    });

    const data = await deeplRes.json();
    if (deeplRes.ok && translateCache && cacheKey) {
      ctx?.waitUntil(
        translateCache.put(
          cacheKey,
          buildCacheResponse(data, 86400)
        )
      );
    }

    return buildResponse(data, deeplRes.ok ? 200 : 500, allowOrigin);
  } catch (err) {
    return buildResponse({ error: err.message || "DeepL API Error" }, 500, allowOrigin);
  }
}

function getDefaultCache() {
  return typeof caches !== "undefined" ? caches.default : null;
}

async function buildInternalCacheRequest(scope, value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value)
  );

  const hash = [...new Uint8Array(digest)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  return new Request(`https://worker-cache.invalid/${scope}/${hash}`);
}

function buildCacheResponse(data, maxAge) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${maxAge}`,
    },
  });
}

// ----------------------
// IP 查询
// ----------------------
async function handleGeoIP(request, allowOrigin, ctx) {
  try {
    return buildResponse(await lookupGeoIP(request, ctx), 200, allowOrigin);
  } catch (err) {
    return buildResponse(
      { success: false, error: err.message || "GeoIP lookup failed" },
      500,
      allowOrigin
    );
  }
}

async function lookupGeoIP(request, ctx) {
  const cf = request.cf || {};
  const ip = request.headers.get("CF-Connecting-IP") || "";

  // Cloudflare 自带 GeoIP：优先使用，不消耗第三方额度
  if (cf.latitude && cf.longitude) {
    return {
      success: true,
      ip,

      city: cf.city || null,
      region: cf.region || null,
      region_code: cf.regionCode || null,
      country: cf.country || null,
      continent: cf.continent || null,

      latitude: Number(cf.latitude),
      longitude: Number(cf.longitude),
      timezone: cf.timezone || null,
      postal: cf.postalCode || null,

      source: "cloudflare"
    };
  }

  // 极少数情况下 Cloudflare 没有经纬度，再 fallback 到 ipwho.is
  const geoCache = getDefaultCache();
  const cacheKey = geoCache ? await buildInternalCacheRequest("geoip", ip) : null;

  if (geoCache && cacheKey) {
    const cached = await geoCache.match(cacheKey);
    if (cached) {
      return cached.json();
    }
  }

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
    const data = await res.json();

    if (res.ok && data?.success !== false && geoCache && cacheKey) {
      ctx?.waitUntil(
        geoCache.put(cacheKey, buildCacheResponse(data, 86400))
      );
    }

    if (!res.ok) {
      throw new Error(data?.message || "GeoIP lookup failed");
    }

    return data;
  } catch (err) {
    throw new Error(err.message || "GeoIP lookup failed");
  }
}

async function handleGeoWeather(request, allowOrigin, ctx) {
  const weatherCache = getDefaultCache();
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const cacheSeed = ip || `${request.cf?.latitude || ""},${request.cf?.longitude || ""}`;
  const cacheKey = weatherCache && cacheSeed
    ? await buildInternalCacheRequest("geowea", cacheSeed)
    : null;

  if (weatherCache && cacheKey) {
    const cached = await weatherCache.match(cacheKey);
    if (cached) {
      return buildResponse(await cached.json(), 200, allowOrigin);
    }
  }

  try {
    const geo = await lookupGeoIP(request, ctx);
    const latitude = Number(geo.latitude);
    const longitude = Number(geo.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Geo coordinates unavailable");
    }

    const weatherResult = await fetchWeatherWithFallbacks(latitude, longitude, geo.timezone);

    const result = {
      success: true,
      ip: geo.ip || ip,
      city: geo.city || null,
      region: geo.region || null,
      region_code: geo.region_code || geo.regionCode || null,
      country: geo.country || null,
      continent: geo.continent || null,
      latitude,
      longitude,
      timezone: geo.timezone || weatherResult.weather.timezone || null,
      postal: geo.postal || geo.postalCode || null,
      source: {
        geo: geo.source || "ipwho.is",
        weather: weatherResult.source,
      },
      weather: weatherResult.weather,
      fallback_errors: weatherResult.fallbackErrors,
    };

    if (weatherCache && cacheKey) {
      ctx?.waitUntil(weatherCache.put(cacheKey, buildCacheResponse(result, 600)));
    }

    return buildResponse(result, 200, allowOrigin);
  } catch (err) {
    return buildResponse(
      { success: false, error: err.message || "Weather lookup failed" },
      500,
      allowOrigin
    );
  }
}

async function fetchWeatherWithFallbacks(latitude, longitude, timezone) {
  const providers = [
    ["open-meteo", fetchOpenMeteoWeather],
    ["met-no", fetchMetNoWeather],
    ["wttr-in", fetchWttrWeather],
  ];
  const fallbackErrors = [];

  for (const [source, provider] of providers) {
    try {
      const weather = await provider(latitude, longitude, timezone);
      validateWeatherPayload(weather);
      return { source, weather, fallbackErrors };
    } catch (err) {
      fallbackErrors.push({
        source,
        error: err.message || String(err),
      });
    }
  }

  throw new Error(
    fallbackErrors.map((item) => `${item.source}: ${item.error}`).join("; ") ||
    "Weather lookup failed"
  );
}

async function fetchOpenMeteoWeather(latitude, longitude, timezone) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "weather_code,temperature_2m",
    daily: "temperature_2m_max,temperature_2m_min",
    timezone: timezone || "auto",
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.reason || data?.error || "Open-Meteo lookup failed");
  }

  return {
    code: Number(data.current?.weather_code),
    temperature: Number(data.current?.temperature_2m),
    temperature_2m: Number(data.current?.temperature_2m),
    temperature_2m_max: Number(data.daily?.temperature_2m_max?.[0]),
    temperature_2m_min: Number(data.daily?.temperature_2m_min?.[0]),
    timezone: data.timezone || timezone || null,
  };
}

async function fetchMetNoWeather(latitude, longitude, timezone) {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
  });

  const res = await fetch(`https://api.met.no/weatherapi/locationforecast/2.0/compact?${params}`, {
    headers: {
      "User-Agent": "YumeOfficial/1.0 support@yume.zone",
      "Accept": "application/json",
    },
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.reason || data?.error || "MET Norway lookup failed");
  }

  const timeseries = Array.isArray(data.properties?.timeseries)
    ? data.properties.timeseries
    : [];
  const first = timeseries[0];
  const temperature = Number(first?.data?.instant?.details?.air_temperature);
  const symbolCode =
    first?.data?.next_1_hours?.summary?.symbol_code ||
    first?.data?.next_6_hours?.summary?.symbol_code ||
    first?.data?.next_12_hours?.summary?.symbol_code ||
    "";
  const dailyTemps = collectMetNoDailyTemperatures(timeseries);

  return {
    code: metNoSymbolToWmoCode(symbolCode),
    temperature,
    temperature_2m: temperature,
    temperature_2m_max: dailyTemps.max,
    temperature_2m_min: dailyTemps.min,
    timezone: timezone || null,
  };
}

async function fetchWttrWeather(latitude, longitude, timezone) {
  const coordinate = `${roundCoordinate(latitude)},${roundCoordinate(longitude)}`;
  const res = await fetch(`https://wttr.in/${encodeURIComponent(coordinate)}?format=j1`, {
    headers: {
      "User-Agent": "YumeOfficial/1.0 support@yume.zone",
      "Accept": "application/json",
    },
  });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "wttr.in lookup failed");
  }

  const current = data.current_condition?.[0] || {};
  const today = data.weather?.[0] || {};
  const code = wttrWeatherCodeToWmoCode(current.weatherCode);

  return {
    code,
    temperature: Number(current.temp_C),
    temperature_2m: Number(current.temp_C),
    temperature_2m_max: Number(today.maxtempC),
    temperature_2m_min: Number(today.mintempC),
    timezone: timezone || null,
  };
}

function validateWeatherPayload(weather) {
  if (
    !weather ||
    !Number.isFinite(Number(weather.code)) ||
    !Number.isFinite(Number(weather.temperature_2m_max)) ||
    !Number.isFinite(Number(weather.temperature_2m_min))
  ) {
    throw new Error("Incomplete weather payload");
  }
}

function collectMetNoDailyTemperatures(timeseries) {
  const now = Date.now();
  const end = now + 24 * 60 * 60 * 1000;
  const temperatures = timeseries
    .filter((item) => {
      const time = new Date(item.time).getTime();
      return Number.isFinite(time) && time >= now - 60 * 60 * 1000 && time <= end;
    })
    .map((item) => Number(item.data?.instant?.details?.air_temperature))
    .filter(Number.isFinite);

  if (!temperatures.length) {
    return { max: NaN, min: NaN };
  }

  return {
    max: Math.max(...temperatures),
    min: Math.min(...temperatures),
  };
}

function metNoSymbolToWmoCode(symbolCode) {
  const code = String(symbolCode || "")
    .replace(/_(day|night|polartwilight)$/i, "")
    .toLowerCase();

  if (!code) return NaN;
  if (code === "clearsky") return 0;
  if (code === "fair") return 1;
  if (code === "partlycloudy") return 2;
  if (code === "cloudy") return 3;
  if (code === "fog") return 45;
  if (code.includes("thunder")) {
    if (code.includes("hail")) return 96;
    return 95;
  }
  if (code.includes("heavysnowshowers")) return 86;
  if (code.includes("snowshowers")) return 85;
  if (code.includes("heavyrainshowers")) return 82;
  if (code.includes("rainshowers")) return code.includes("light") ? 80 : 81;
  if (code.includes("heavysnow")) return 75;
  if (code.includes("snow")) return code.includes("light") ? 71 : 73;
  if (code.includes("sleet")) return code.includes("light") ? 66 : 67;
  if (code.includes("heavyrain")) return 65;
  if (code.includes("rain")) return code.includes("light") ? 61 : 63;

  return NaN;
}

function wttrWeatherCodeToWmoCode(weatherCode) {
  const code = Number(weatherCode);
  const weatherCodeMap = {
    113: 0,
    116: 2,
    119: 3,
    122: 3,
    143: 45,
    176: 80,
    179: 85,
    182: 66,
    185: 56,
    200: 95,
    227: 75,
    230: 75,
    248: 45,
    260: 48,
    263: 51,
    266: 51,
    281: 56,
    284: 57,
    293: 61,
    296: 61,
    299: 63,
    302: 63,
    305: 65,
    308: 65,
    311: 66,
    314: 67,
    317: 66,
    320: 67,
    323: 71,
    326: 71,
    329: 73,
    332: 73,
    335: 75,
    338: 75,
    350: 77,
    353: 80,
    356: 81,
    359: 82,
    362: 66,
    365: 67,
    368: 85,
    371: 86,
    374: 77,
    377: 77,
    386: 96,
    389: 99,
    392: 95,
    395: 95,
  };

  return weatherCodeMap[code] ?? NaN;
}

function roundCoordinate(value) {
  return Number(value).toFixed(4);
}
