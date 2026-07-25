(function (global) {
  'use strict';

  var LANGUAGE_COOKIE = 'yume-preference-language';
  var LANGUAGE_STORAGE = 'lang';
  var THEME_COOKIE = 'yume-preference-theme';
  var THEME_STORAGE = 'yume-theme';
  var SUPPORTED_THEMES = ['auto', 'dark', 'light'];
  var SUPPORTED_LANGUAGES = ['en', 'fr', 'ja', 'zh-cn', 'zh-tw'];
  var mediaQuery = global.matchMedia ? global.matchMedia('(prefers-color-scheme: dark)') : null;
  var lastLanguageChoice = '';
  var lastThemeChoice = '';
  var lastResolvedTheme = '';

  function readCookie(name) {
    var prefix = name + '=';
    var parts = document.cookie ? document.cookie.split(';') : [];
    for (var index = 0; index < parts.length; index += 1) {
      var part = parts[index].trim();
      if (part.indexOf(prefix) !== 0) continue;
      try {
        return decodeURIComponent(part.slice(prefix.length));
      } catch (_) {
        return part.slice(prefix.length);
      }
    }
    return '';
  }

  function writeCookie(name, value) {
    var hostname = global.location.hostname.toLowerCase().replace(/\.$/, '');
    var attributes = [
      name + '=' + encodeURIComponent(value),
      'Path=/',
      'Max-Age=31536000',
      'SameSite=Lax',
    ];
    if (hostname === 'yume.zone' || hostname.endsWith('.yume.zone')) {
      attributes.push('Domain=yume.zone');
    }
    if (global.location.protocol === 'https:') attributes.push('Secure');
    document.cookie = attributes.join('; ');
  }

  function readStorage(key) {
    try {
      return global.localStorage.getItem(key) || '';
    } catch (_) {
      return '';
    }
  }

  function writeStorage(key, value) {
    try {
      global.localStorage.setItem(key, value);
    } catch (_) {
      // The parent-domain cookie remains the cross-site source of truth.
    }
  }

  function normalizeConcreteLanguage(value) {
    var next = String(value || '').trim().toLowerCase().replace(/_/g, '-');
    if (
      next.startsWith('zh-tw') || next.startsWith('zh-hk') ||
      next.startsWith('zh-mo') || next.startsWith('zh-hant')
    ) return 'zh-tw';
    if (
      next === 'zh' || next.startsWith('zh-cn') ||
      next.startsWith('zh-sg') || next.startsWith('zh-hans')
    ) return 'zh-cn';
    var shortLanguage = next.slice(0, 2);
    return SUPPORTED_LANGUAGES.indexOf(shortLanguage) >= 0 ? shortLanguage : '';
  }

  function normalizeLanguageChoice(value) {
    var next = String(value || '').trim().toLowerCase();
    return next === 'auto' ? 'auto' : normalizeConcreteLanguage(next);
  }

  function normalizeThemeChoice(value) {
    var next = String(value || '').trim().toLowerCase();
    if (next === 'true') return 'dark';
    if (next === 'false') return 'light';
    return SUPPORTED_THEMES.indexOf(next) >= 0 ? next : '';
  }

  function getChoice(cookieName, storageKey, legacyKeys, normalize, fallback) {
    var cookieChoice = normalize(readCookie(cookieName));
    if (cookieChoice) {
      if (readStorage(storageKey) !== cookieChoice) writeStorage(storageKey, cookieChoice);
      return cookieChoice;
    }

    var storedChoice = normalize(readStorage(storageKey));
    if (!storedChoice) {
      for (var index = 0; index < legacyKeys.length; index += 1) {
        storedChoice = normalize(readStorage(legacyKeys[index]));
        if (storedChoice) break;
      }
    }
    if (!storedChoice) return fallback;

    writeCookie(cookieName, storedChoice);
    writeStorage(storageKey, storedChoice);
    return storedChoice;
  }

  function setChoice(cookieName, storageKey, normalize, value, fallback) {
    var choice = normalize(value) || fallback;
    writeCookie(cookieName, choice);
    writeStorage(storageKey, choice);
    return choice;
  }

  function readLanguageQuery() {
    var searchParams = new URLSearchParams(global.location.search);
    for (var entry of searchParams.entries()) {
      if (entry[0].toLowerCase() === 'lang') return entry[1];
    }
    return '';
  }

  function clearLanguageQuery() {
    var url = new URL(global.location.href);
    var keysToDelete = [];
    for (var key of url.searchParams.keys()) {
      if (key.toLowerCase() === 'lang') keysToDelete.push(key);
    }
    if (!keysToDelete.length) return;
    keysToDelete.forEach(function (key) { url.searchParams.delete(key); });
    global.history.replaceState(global.history.state, '', url.toString());
  }

  function hasLanguagePreference() {
    return Boolean(
      normalizeLanguageChoice(readLanguageQuery()) ||
      normalizeLanguageChoice(readCookie(LANGUAGE_COOKIE)) ||
      normalizeLanguageChoice(readStorage(LANGUAGE_STORAGE)) ||
      normalizeLanguageChoice(readStorage('yume-language'))
    );
  }

  function getLanguageChoice(urlChoice) {
    var queryChoice = arguments.length ? urlChoice : readLanguageQuery();
    var normalizedUrlChoice = normalizeLanguageChoice(queryChoice);
    if (normalizedUrlChoice) return normalizedUrlChoice;
    return getChoice(
      LANGUAGE_COOKIE,
      LANGUAGE_STORAGE,
      ['yume-language'],
      normalizeLanguageChoice,
      'auto'
    );
  }

  function setLanguageChoice(value) {
    var choice = setChoice(
      LANGUAGE_COOKIE,
      LANGUAGE_STORAGE,
      normalizeLanguageChoice,
      value,
      'auto'
    );
    writeStorage('yume-language', choice);
    clearLanguageQuery();
    syncPreferences();
    return choice;
  }

  function resolveLanguage(choice) {
    var normalizedChoice = normalizeLanguageChoice(choice);
    if (normalizedChoice && normalizedChoice !== 'auto') return normalizedChoice;
    var browserLanguages = Array.isArray(global.navigator.languages)
      ? global.navigator.languages
      : [global.navigator.language];
    for (var index = 0; index < browserLanguages.length; index += 1) {
      var language = normalizeConcreteLanguage(browserLanguages[index]);
      if (language) return language;
    }
    return 'en';
  }

  function getAutoLanguageLabel() {
    return {
      fr: 'Automatique (Auto)',
      ja: '自動 (Auto)',
      'zh-cn': '自动 (Auto)',
      'zh-tw': '自動 (Auto)',
    }[resolveLanguage('auto')] || 'Auto';
  }

  function getThemeChoice() {
    return getChoice(
      THEME_COOKIE,
      THEME_STORAGE,
      ['cloudvault-theme', 'cv-dark'],
      normalizeThemeChoice,
      'auto'
    );
  }

  function setThemeChoice(value) {
    var choice = setChoice(
      THEME_COOKIE,
      THEME_STORAGE,
      normalizeThemeChoice,
      value,
      'auto'
    );
    var resolvedTheme = resolveTheme(choice);
    writeStorage('cloudvault-theme', resolvedTheme);
    writeStorage('cv-dark', resolvedTheme === 'dark' ? 'true' : 'false');
    syncPreferences();
    return choice;
  }

  function resolveTheme(choice) {
    var normalizedChoice = normalizeThemeChoice(choice) || 'auto';
    if (normalizedChoice !== 'auto') return normalizedChoice;
    return mediaQuery && mediaQuery.matches ? 'dark' : 'light';
  }

  function applyTheme(choice) {
    var normalizedChoice = normalizeThemeChoice(choice) || 'auto';
    var theme = resolveTheme(normalizedChoice);
    var root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.dataset.theme = theme;
    root.dataset.themeChoice = normalizedChoice;
    root.style.colorScheme = theme === 'dark' ? 'dark light' : 'light dark';
    return theme;
  }

  function syncPreferences() {
    var languageChoice = getLanguageChoice('');
    var themeChoice = getThemeChoice();
    var resolvedTheme = applyTheme(themeChoice);

    if (lastLanguageChoice && lastLanguageChoice !== languageChoice) {
      global.dispatchEvent(new CustomEvent('yume-language-preference-change', {
        detail: { choice: languageChoice, language: resolveLanguage(languageChoice) },
      }));
    }
    if (lastThemeChoice && (lastThemeChoice !== themeChoice || lastResolvedTheme !== resolvedTheme)) {
      global.dispatchEvent(new CustomEvent('yume-theme-change', {
        detail: { choice: themeChoice, theme: resolvedTheme },
      }));
    }
    lastLanguageChoice = languageChoice;
    lastThemeChoice = themeChoice;
    lastResolvedTheme = resolvedTheme;
    return { languageChoice: languageChoice, themeChoice: themeChoice, theme: resolvedTheme };
  }

  global.YumePreferences = Object.freeze({
    getLanguageChoice: getLanguageChoice,
    setLanguageChoice: setLanguageChoice,
    hasLanguagePreference: hasLanguagePreference,
    resolveLanguage: resolveLanguage,
    getAutoLanguageLabel: getAutoLanguageLabel,
    getThemeChoice: getThemeChoice,
    setThemeChoice: setThemeChoice,
    resolveTheme: resolveTheme,
    applyTheme: applyTheme,
    sync: syncPreferences,
  });

  syncPreferences();
  global.addEventListener('pageshow', syncPreferences);
  global.addEventListener('focus', syncPreferences);
  global.addEventListener('storage', function (event) {
    if ([LANGUAGE_STORAGE, THEME_STORAGE, 'yume-language', 'cloudvault-theme', 'cv-dark'].indexOf(event.key) >= 0) {
      syncPreferences();
    }
  });
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) syncPreferences();
  });
  if (mediaQuery) {
    var handleSystemTheme = function () {
      if (getThemeChoice() === 'auto') syncPreferences();
    };
    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', handleSystemTheme);
    else if (mediaQuery.addListener) mediaQuery.addListener(handleSystemTheme);
  }
  if (global.cookieStore && global.cookieStore.addEventListener) {
    global.cookieStore.addEventListener('change', function (event) {
      var changed = (event.changed || []).concat(event.deleted || []);
      if (changed.some(function (cookie) {
        return cookie.name === LANGUAGE_COOKIE || cookie.name === THEME_COOKIE;
      })) syncPreferences();
    });
  }
})(window);
