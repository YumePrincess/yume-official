import { Env, SiteSettings, DEFAULT_SETTINGS } from '../utils/types';
import { json } from '../utils/response';
import { getSetting, putSetting } from '../utils/db';

const SETTINGS_KEY = 'site';
const SUPPORTED_LANGUAGES = new Set(['auto', 'en', 'fr', 'ja', 'zh-CN', 'zh-TW']);

export async function getSettings(env: Env): Promise<SiteSettings> {
  const raw = await getSetting(env, SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function handleGetSettings(request: Request, env: Env): Promise<Response> {
  return json(await getSettings(env));
}

export async function handlePutSettings(request: Request, env: Env): Promise<Response> {
  const body = await request.json<Partial<SiteSettings>>();
  const current = await getSettings(env);

  if (typeof body.guestPageEnabled === 'boolean') {
    current.guestPageEnabled = body.guestPageEnabled;
  }
  if (typeof body.showLoginButton === 'boolean') {
    current.showLoginButton = body.showLoginButton;
  }
  if (typeof body.siteName === 'string') {
    current.siteName = body.siteName.trim().slice(0, 50) || 'Yume AIO Backend';
  }
  if (typeof body.siteIconUrl === 'string') {
    current.siteIconUrl = body.siteIconUrl.trim().slice(0, 500);
  }
  if (typeof body.logoBarImageUrl === 'string') {
    current.logoBarImageUrl = body.logoBarImageUrl.trim().slice(0, 1000) || DEFAULT_SETTINGS.logoBarImageUrl;
  }
  if (typeof body.backgroundImageUrl === 'string') {
    current.backgroundImageUrl = body.backgroundImageUrl.trim().slice(0, 1000);
  }
  if (typeof body.language === 'string' && SUPPORTED_LANGUAGES.has(body.language)) {
    current.language = body.language;
  }

  await putSetting(env, SETTINGS_KEY, JSON.stringify(current));
  return json(current);
}
