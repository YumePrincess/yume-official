const FONT_PATH_PREFIX = "/font/";
const FONT_CACHE_CONTROL = "public, max-age=31536000, immutable";

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const pathname = new URL(request.url).pathname;

    if (!pathname.startsWith(FONT_PATH_PREFIX)) {
      return response;
    }

    const headers = new Headers(response.headers);
    // wx.loadFontFace 从小程序运行环境请求字体，必须允许跨域读取。
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD");
    headers.set("Cache-Control", FONT_CACHE_CONTROL);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
