export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const protectedOrigin = getProtectedApiOrigin(request, url);
      const isProtectedApi = PROTECTED_API_PATHS.has(url.pathname);

      // OPTIONS 预检
      if (url.pathname.startsWith("/api/") && request.method === "OPTIONS") {
        if (isProtectedApi && !protectedOrigin.allowed) {
          return buildResponse({ error: "Forbidden" }, 403, "");
        }

        return buildResponse(
          null,
          204,
          isProtectedApi ? protectedOrigin.corsOrigin : getPublicCorsOrigin(request),
          true
        );
      }

      // ----------------------
      // 路由分发
      // ----------------------
      if (url.pathname.startsWith("/api/")) {
        if (isProtectedApi && !protectedOrigin.allowed) {
          return buildResponse({ error: "Forbidden" }, 403, "");
        }

        return handleApiRequest(
          request,
          env,
          isProtectedApi ? protectedOrigin.corsOrigin : getPublicCorsOrigin(request),
          ctx
        );
      }

      const assetResponse = await env.ASSETS.fetch(request);
      return withAssetCacheHeaders(assetResponse, url);
    } catch (err) {
      return buildResponse({ error: err.message || "Internal Error" }, 500);
    }
  },
};

const ANNOUNCEMENTS_CONFIG_KEY = "announcements/config.json";
const PROTECTED_API_PATHS = new Set(["/api/geoip", "/api/translate"]);
const ALLOWED_ORIGIN_DOMAINS = ["yume.zone", "princess.work"];
const INTERNAL_CACHE_URL = "https://cache.yume.zone";

async function handleApiRequest(request, env, allowOrigin, ctx) {
  const url = new URL(request.url);
  const route = url.pathname.slice("/api".length);

  if (route === "/announcement" && request.method === "GET") {
    return handleAnnouncement(env, allowOrigin);
  }

  if (route === "/translate" && request.method === "POST") {
    return handleTranslate(request, env, allowOrigin, ctx);
  }

  if (route === "/geoip" && request.method === "GET") {
    return handleGeoIP(request, allowOrigin, ctx);
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
    Vary: "Origin",
  };

  if (allowOrigin) {
    headers["Access-Control-Allow-Origin"] = allowOrigin;
    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization";
  }

  if (isOptions) {
    return new Response(null, { status: status, headers });
  }

  return new Response(JSON.stringify(data), { status, headers });
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

function withAssetCacheHeaders(response, url) {
  if (!response.ok) {
    return response;
  }

  const pathname = url.pathname;
  const extension = pathname.split(".").pop()?.toLowerCase();
  const immutableExtensions = new Set([
    "avif",
    "gif",
    "ico",
    "jpg",
    "jpeg",
    "mp3",
    "png",
    "svg",
    "ttf",
    "webp",
    "woff",
    "woff2",
  ]);
  const shortCacheExtensions = new Set(["css", "js", "json", "map", "md"]);

  if (!extension || pathname.endsWith(".html")) {
    return response;
  }

  const headers = new Headers(response.headers);
  if (immutableExtensions.has(extension)) {
    headers.set("Cache-Control", "public, max-age=604800, stale-while-revalidate=86400");
  } else if (shortCacheExtensions.has(extension)) {
    headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
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

// ----------------------
// IP 查询
// ----------------------
async function handleGeoIP(request, allowOrigin, ctx) {
  const cf = request.cf || {};
  const ip = request.headers.get("CF-Connecting-IP") || "";

  // Cloudflare 自带 GeoIP：优先使用，不消耗第三方额度
  if (cf.latitude && cf.longitude) {
    return buildResponse({
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
    }, 200, allowOrigin);
  }

  // 极少数情况下 Cloudflare 没有经纬度，再 fallback 到 ipwho.is
  const geoCache = getDefaultCache();
  const cacheKey = geoCache ? await buildInternalCacheRequest("geoip", ip) : null;

  if (geoCache && cacheKey) {
    const cached = await geoCache.match(cacheKey);
    if (cached) {
      return buildResponse(await cached.json(), 200, allowOrigin);
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

    return buildResponse(data, res.ok ? 200 : 500, allowOrigin);
  } catch (err) {
    return buildResponse(
      { success: false, error: err.message || "GeoIP lookup failed" },
      500,
      allowOrigin
    );
  }
}