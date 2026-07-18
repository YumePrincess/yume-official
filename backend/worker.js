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
        const isProtectedApi = PROTECTED_API_PATHS.has(url.pathname);

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
      const protectedOrigin = getProtectedApiOrigin(request, url);
      const isProtectedApi = PROTECTED_API_PATHS.has(url.pathname);

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
const ALLOWED_ORIGIN_DOMAINS = ["yume.zone", "princess.work"];
const API_METHODS = new Map([
  ["/announcement", ["GET"]],
  ["/translate", ["POST"]],
  ["/geoip", ["GET"]],
  ["/geowea", ["GET"]],
]);

async function handleApiRequest(request, env, allowOrigin, ctx) {
  const url = new URL(request.url);
  const route = url.pathname.slice("/api".length);
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
