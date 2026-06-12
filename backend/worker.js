export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const origin = request.headers.get("Origin") || "";

      // ----------------------
      // CORS 配置
      // ----------------------
      const allowedDomains = [
        /^(?:.+\.)?yume\.zone$/,
        /^(?:.+\.)?princess\.work$/,
      ];
      let allowOrigin = "";
      try {
        const hostname = new URL(origin).hostname;
        if (allowedDomains.some((regex) => regex.test(hostname))) {
          allowOrigin = origin;
        }
      } catch {}

      // OPTIONS 预检
      if (url.pathname.startsWith("/api/") && request.method === "OPTIONS") {
        return buildResponse(null, 204, allowOrigin, true);
      }

      // ----------------------
      // 路由分发
      // ----------------------
      if (url.pathname.startsWith("/api/")) {
        return handleApiRequest(request, env, allowOrigin);
      }

      return env.ASSETS.fetch(request);
    } catch (err) {
      return buildResponse({ error: err.message || "Internal Error" }, 500);
    }
  },
};

const ANNOUNCEMENTS_CONFIG_KEY = "announcements/config.json";

async function handleApiRequest(request, env, allowOrigin) {
  const url = new URL(request.url);
  const route = url.pathname.slice("/api".length);

  if (route === "/announcement" && request.method === "GET") {
    return handleAnnouncement(env, allowOrigin);
  }

  if (route === "/translate" && request.method === "POST") {
    return handleTranslate(request, env, allowOrigin);
  }

  if (route === "/geoip" && request.method === "GET") {
    return handleGeoIP(request, allowOrigin);
  }

  return buildResponse(
    { error: "Not Found", path: url.pathname },
    404,
    allowOrigin
  );
}

// ----------------------
// 公共响应函数
// ----------------------
function buildResponse(data, status = 200, allowOrigin = "*", isOptions = false) {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": allowOrigin || "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    Vary: "Origin",
  };

  if (isOptions) {
    return new Response(null, { status: status, headers });
  }

  return new Response(JSON.stringify(data), { status, headers });
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
async function handleTranslate(request, env, allowOrigin) {
  const DEEPL_API_KEY = env.DEEPL_API_KEY;
  if (!DEEPL_API_KEY) {
    return buildResponse({ error: "DEEPL_API_KEY not set" }, 500, allowOrigin);
  }

  let body;
  const contentType = request.headers.get("Content-Type") || "";

  if (contentType.includes("application/json")) {
    body = await request.json();
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

  const { text, target_lang } = body;
  if (!text || !target_lang) {
    return buildResponse(
      { error: "Missing text or target_lang" },
      400,
      allowOrigin
    );
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
        target_lang: target_lang.toUpperCase(),
      }),
    });

    const data = await deeplRes.json();
    return buildResponse(data, deeplRes.ok ? 200 : 500, allowOrigin);
  } catch (err) {
    return buildResponse({ error: err.message || "DeepL API Error" }, 500, allowOrigin);
  }
}

// ----------------------
// IP 查询
// ----------------------
async function handleGeoIP(request, allowOrigin) {
  const ip = request.headers.get("CF-Connecting-IP") || "8.8.8.8"; // fallback
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
    const data = await res.json();
    return buildResponse(data, 200, allowOrigin);
  } catch (err) {
    return buildResponse({ error: err.message || "GeoIP lookup failed" }, 500, allowOrigin);
  }
}
