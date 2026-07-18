(function (global) {
    'use strict';

    var languageCookie = 'yume-preference-language';
    var languageStorage = 'lang';
    var themeCookie = 'yume-preference-theme';
    var themeStorage = 'yume-theme';
    var supportedThemes = ['auto', 'dark', 'light'];
    var supportedLanguages = ['en', 'fr', 'ja', 'zh-cn', 'zh-tw'];

    function readCookie(name) {
        var prefix = name + '=';
        var parts = document.cookie ? document.cookie.split(';') : [];

        for (var index = 0; index < parts.length; index += 1) {
            var part = parts[index].trim();
            if (part.indexOf(prefix) !== 0) continue;

            try {
                return decodeURIComponent(part.slice(prefix.length));
            } catch (err) {
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
            'SameSite=Lax'
        ];

        if ([
            'yume.zone',
            'www.yume.zone',
            'search.yume.zone',
            'pricing.yume.zone'
        ].indexOf(hostname) >= 0) {
            attributes.push('Domain=yume.zone');
        }

        if (global.location.protocol === 'https:') {
            attributes.push('Secure');
        }

        document.cookie = attributes.join('; ');
    }

    function readStorage(key) {
        try {
            return global.localStorage.getItem(key) || '';
        } catch (err) {
            return '';
        }
    }

    function writeStorage(key, value) {
        try {
            global.localStorage.setItem(key, value);
        } catch (err) {
            // Cookies remain the cross-site source of truth when storage is unavailable.
        }
    }

    function normalizeConcreteLanguage(value) {
        var next = String(value || '').trim().toLowerCase().replace(/_/g, '-');

        if (
            next.startsWith('zh-tw') ||
            next.startsWith('zh-hk') ||
            next.startsWith('zh-mo') ||
            next.startsWith('zh-hant')
        ) {
            return 'zh-tw';
        }

        if (
            next === 'zh' ||
            next.startsWith('zh-cn') ||
            next.startsWith('zh-sg') ||
            next.startsWith('zh-hans')
        ) {
            return 'zh-cn';
        }

        var shortLanguage = next.slice(0, 2);
        return supportedLanguages.indexOf(shortLanguage) >= 0 ? shortLanguage : '';
    }

    function normalizeLanguageChoice(value) {
        var next = String(value || '').trim().toLowerCase();
        if (next === 'auto') return 'auto';
        return normalizeConcreteLanguage(next);
    }

    function normalizeThemeChoice(value) {
        var next = String(value || '').trim().toLowerCase();
        return supportedThemes.indexOf(next) >= 0 ? next : '';
    }

    function getChoice(cookieName, storageKey, normalize, fallback) {
        var cookieChoice = normalize(readCookie(cookieName));
        if (cookieChoice) {
            if (readStorage(storageKey) !== cookieChoice) {
                writeStorage(storageKey, cookieChoice);
            }
            return cookieChoice;
        }

        var storedChoice = normalize(readStorage(storageKey));
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
        keysToDelete.forEach(function (key) {
            url.searchParams.delete(key);
        });
        global.history.replaceState(global.history.state, '', url.toString());
    }

    function getLanguageChoice(urlChoice) {
        var queryChoice = arguments.length ? urlChoice : readLanguageQuery();
        var normalizedUrlChoice = normalizeLanguageChoice(queryChoice);
        if (normalizedUrlChoice) {
            return normalizedUrlChoice;
        }

        return getChoice(
            languageCookie,
            languageStorage,
            normalizeLanguageChoice,
            'auto'
        );
    }

    function setLanguageChoice(value) {
        var choice = setChoice(
            languageCookie,
            languageStorage,
            normalizeLanguageChoice,
            value,
            'auto'
        );
        clearLanguageQuery();
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
            'zh-tw': '自動 (Auto)'
        }[resolveLanguage('auto')] || 'Auto';
    }

    function getThemeChoice() {
        return getChoice(
            themeCookie,
            themeStorage,
            normalizeThemeChoice,
            'auto'
        );
    }

    function setThemeChoice(value) {
        return setChoice(
            themeCookie,
            themeStorage,
            normalizeThemeChoice,
            value,
            'auto'
        );
    }

    function applyTheme(choice) {
        var theme = normalizeThemeChoice(choice) || 'auto';

        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        return theme;
    }

    global.YumePreferences = Object.freeze({
        getLanguageChoice: getLanguageChoice,
        setLanguageChoice: setLanguageChoice,
        resolveLanguage: resolveLanguage,
        getAutoLanguageLabel: getAutoLanguageLabel,
        getThemeChoice: getThemeChoice,
        setThemeChoice: setThemeChoice,
        applyTheme: applyTheme
    });
})(window);
