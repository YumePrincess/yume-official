import { Env, SiteSettings, DEFAULT_SETTINGS } from '../utils/types';
import { error, json } from '../utils/response';
import { getSetting, putSetting } from '../utils/db';

const SETTINGS_KEY = 'site';
const SUPPORTED_LANGUAGES = new Set(['auto', 'en', 'fr', 'ja', 'zh-CN', 'zh-TW']);

function normalizeClashConfigFolder(value: string): string | null {
  const normalized = value.trim().replace(/^\/+|\/+$/g, '');
  if (!normalized || normalized === 'root' || normalized.includes('..') || normalized.split('/').some(part => !part.trim())) {
    return null;
  }
  return normalized;
}

export async function getSettings(env: Env): Promise<SiteSettings> {
  const raw = await getSetting(env, SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const settings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as SiteSettings;
    const folder = typeof settings.clashConfigFolder === 'string'
      ? normalizeClashConfigFolder(settings.clashConfigFolder)
      : null;
    settings.clashConfigFolder = folder || DEFAULT_SETTINGS.clashConfigFolder;
    return settings;
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
  if (typeof body.clashConfigFolder === 'string') {
    const folder = normalizeClashConfigFolder(body.clashConfigFolder);
    if (!folder) return error('Invalid Clash configuration folder', 400);
    current.clashConfigFolder = folder;
  }

  await putSetting(env, SETTINGS_KEY, JSON.stringify(current));
  return json(current);
}
