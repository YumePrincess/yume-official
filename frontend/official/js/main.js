//弹窗样式
iziToast.settings({
    timeout: 10000,
    progressBar: false,
    close: false,
    closeOnEscape: true,
    position: 'topCenter',
    transitionIn: 'bounceInDown',
    transitionOut: 'flipOutX',
    displayMode: 'replace',
    layout: '1',
    backgroundColor: '#00000040',
    titleColor: '#efefef',
    messageColor: '#efefef',
    iconColor: '#efefef',
});

function getStoredTheme() {
    return window.YumePreferences.getThemeChoice();
}

function renderTheme(theme) {
    const nextTheme = window.YumePreferences.applyTheme(theme);

    document.querySelectorAll('.theme-option').forEach(option => {
        const isActive = option.dataset.themeOption === nextTheme;
        option.classList.toggle('active', isActive);
        option.setAttribute('aria-pressed', String(isActive));
    });
}

function applyTheme(theme) {
    renderTheme(window.YumePreferences.setThemeChoice(theme));
}

renderTheme(getStoredTheme());

function initThemeSelector() {
    const themeContainer = document.querySelector('.theme-container');
    const themeButton = document.querySelector('.theme-icon');
    const themeOptions = document.querySelectorAll('.theme-option');

    if (!themeContainer || !themeButton || !themeOptions.length) return;

    renderTheme(getStoredTheme());

    themeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = themeContainer.classList.toggle('open');
        themeButton.setAttribute('aria-expanded', String(isOpen));
    });

    themeOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            event.stopPropagation();
            applyTheme(option.dataset.themeOption);
            themeContainer.classList.remove('open');
            themeButton.setAttribute('aria-expanded', 'false');
        });
    });

    document.addEventListener('click', (event) => {
        if (!themeContainer.contains(event.target)) {
            themeContainer.classList.remove('open');
            themeButton.setAttribute('aria-expanded', 'false');
        }
    });
}

document.addEventListener('DOMContentLoaded', initThemeSelector);

function syncSharedPreferences() {
    renderTheme(getStoredTheme());
    if (typeof window.syncYumeLanguagePreference === 'function') {
        window.syncYumeLanguagePreference();
    }
}

window.addEventListener('focus', syncSharedPreferences);
window.addEventListener('languagechange', syncSharedPreferences);
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncSharedPreferences();
});

const loadedScripts = new Map();
const loadedStylesheets = new Set();

function loadScriptOnce(src) {
    if (loadedScripts.has(src)) {
        return loadedScripts.get(src);
    }

    const promise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve(existing), { once: true });
            existing.addEventListener('error', reject, { once: true });
            if (existing.dataset.loaded === 'true') resolve(existing);
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => {
            script.dataset.loaded = 'true';
            resolve(script);
        };
        script.onerror = reject;
        document.body.appendChild(script);
    });

    loadedScripts.set(src, promise);
    return promise;
}

function loadStylesheetOnce(href) {
    if (loadedStylesheets.has(href) || document.querySelector(`link[href="${href}"]`)) {
        loadedStylesheets.add(href);
        return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
    loadedStylesheets.add(href);
}

function ensureMarked() {
    if (window.marked) {
        return Promise.resolve(window.marked);
    }

    return loadScriptOnce('/js/marked.min.js').then(() => window.marked);
}

async function renderMarkdown(mdText) {
    const markedLib = await ensureMarked();
    return markedLib.parse(mdText);
}

function fetchWithTimeout(input, init = {}, timeoutMs = 9000) {
    if (!window.AbortController) {
        return fetch(input, init);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(input, {
        ...init,
        signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
}

function getJsonWithSessionCache(cacheKey, url, maxAgeMs) {
    const storageKey = `yume-json-cache:${cacheKey}`;

    try {
        const cached = sessionStorage.getItem(storageKey);
        if (cached) {
            const entry = JSON.parse(cached);
            if (Date.now() - entry.time < maxAgeMs) {
                return Promise.resolve(entry.data);
            }
        }
    } catch (err) {
        console.warn('Session cache read failed', err);
    }

    return fetchWithTimeout(url)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            try {
                sessionStorage.setItem(
                    storageKey,
                    JSON.stringify({ time: Date.now(), data })
                );
            } catch (err) {
                console.warn('Session cache write failed', err);
            }

            return data;
        });
}

function safeLoadingText(key, fallback) {
    try {
        return translate(key);
    } catch (err) {
        return fallback;
    }
}

function waitForImageLoad(img) {
    if (!img || !img.getAttribute('src') || img.complete) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
    });
}

const yumeLoading = (() => {
    const pendingTasks = [];
    let currentProgress = 0;
    let finishing = false;

    function setProgress(value, text) {
        const nextProgress = Math.max(currentProgress, Math.min(100, Math.round(value)));
        const progressText = `${nextProgress}%`;
        currentProgress = nextProgress;

        const progressBar = document.getElementById('loading-progress-bar');
        const progressWrap = document.querySelector('.loading-progress');
        const percent = document.getElementById('loading-percent');
        const loadingText = document.getElementById('loading-text');

        if (progressBar) progressBar.style.width = progressText;
        if (progressWrap) {
            progressWrap.style.setProperty('--progress-value', progressText);
            progressWrap.setAttribute('aria-valuenow', String(nextProgress));
        }
        if (percent) {
            percent.textContent = progressText;
            percent.dataset.progressText = progressText;
        }
        if (text && loadingText) loadingText.textContent = text;
    }

    function track(promise, doneProgress, text) {
        const task = Promise.resolve(promise)
            .catch((err) => {
                console.error(err);
                return null;
            })
            .finally(() => {
                setProgress(doneProgress, text);
            });

        pendingTasks.push(task);
        return task;
    }

    async function waitForTrackedTasks() {
        let checkedCount = 0;
        while (checkedCount < pendingTasks.length) {
            const tasks = pendingTasks.slice(checkedCount);
            checkedCount = pendingTasks.length;
            await Promise.allSettled(tasks);
        }
    }

    async function finish() {
        if (finishing) return;
        finishing = true;

        setProgress(72, safeLoadingText('LOADTEXT', 'Loading files...'));
        await waitForTrackedTasks();
        setProgress(100, safeLoadingText('LOADCOMPLETE', 'Loading complete'));

        setTimeout(function () {
            $('#loading-box').attr('class', 'loaded');
            revealPage();
        }, 360);
    }

    setProgress(6, safeLoadingText('LOADING', 'Loading...'));

    return {
        setProgress,
        track,
        finish
    };
})();

window.yumeLoading = yumeLoading;

function revealPage() {
    $('#bg').css("cssText", "transform: scale(1);filter: blur(0px);transition: ease 1.5s;");
    $('.cover').css("cssText", "opacity: 1;transition: ease 1.5s;");
    $('#section').css("cssText", "transform: scale(1) !important;opacity: 1 !important;filter: blur(0px) !important");
    $('#change1').html(translate('DEFAULT_PAGE_SUBHEADING'));

    //用户欢迎
    setTimeout(function () {
        iziToast.show({
            timeout: 2500,
            title: getGreeting(),
            message: translate('WELCOME_MESSAGE')
        });
    }, 800);
}

//延迟加载音乐播放器
function downloadJSAtOnload() {
    loadStylesheetOnce('/css/APlayer.min.css');
    return loadScriptOnce('/js/APlayer.min.js')
        .then(() => loadScriptOnce('/js/music.js'))
        .catch(console.error);
}

//加载完成后执行
window.addEventListener('load', function () {
    yumeLoading.setProgress(64, safeLoadingText('LOADTEXT', 'Loading files...'));
    yumeLoading.track(document.fonts ? document.fonts.ready : Promise.resolve(), 78, safeLoadingText('LOADTEXT', 'Loading files...'));
    yumeLoading.track(waitForImageLoad(document.getElementById('bg')), 86, safeLoadingText('LOADTEXT', 'Loading files...'));
    yumeLoading.track(downloadJSAtOnload(), 94, safeLoadingText('LOADTEXT', 'Loading files...'));
    yumeLoading.finish();
}, false);

const weatherCodeTranslations = {
    unknown: { en: "Unknown weather", "zh-cn": "未知天气", "zh-tw": "未知天氣", fr: "Météo inconnue", ja: "不明な天気" },
    0: { en: "Clear sky", "zh-cn": "晴朗", "zh-tw": "晴朗", fr: "Ciel dégagé", ja: "晴れ" },
    1: { en: "Mainly clear", "zh-cn": "主要晴朗", "zh-tw": "大致晴朗", fr: "Principalement dégagé", ja: "ほぼ晴れ" },
    2: { en: "Partly cloudy", "zh-cn": "多云", "zh-tw": "多雲", fr: "Partiellement nuageux", ja: "一部曇り" },
    3: { en: "Overcast", "zh-cn": "阴天", "zh-tw": "陰天", fr: "Couvert", ja: "曇り" },
    45: { en: "Fog", "zh-cn": "大雾", "zh-tw": "大霧", fr: "Brouillard", ja: "霧" },
    48: { en: "Depositing rime fog", "zh-cn": "雾霾", "zh-tw": "霧霾", fr: "Brouillard givrant", ja: "着氷性の霧" },
    51: { en: "Light drizzle", "zh-cn": "轻微毛毛雨", "zh-tw": "輕微毛毛雨", fr: "Bruine légère", ja: "弱い霧雨" },
    53: { en: "Moderate drizzle", "zh-cn": "中度毛毛雨", "zh-tw": "中度毛毛雨", fr: "Bruine modérée", ja: "霧雨" },
    55: { en: "Dense drizzle", "zh-cn": "强毛毛雨", "zh-tw": "強毛毛雨", fr: "Bruine dense", ja: "強い霧雨" },
    56: { en: "Light freezing drizzle", "zh-cn": "轻微冻毛毛雨", "zh-tw": "輕微凍毛毛雨", fr: "Bruine verglaçante légère", ja: "弱い着氷性霧雨" },
    57: { en: "Dense freezing drizzle", "zh-cn": "强冻毛毛雨", "zh-tw": "強凍毛毛雨", fr: "Bruine verglaçante dense", ja: "強い着氷性霧雨" },
    61: { en: "Slight rain", "zh-cn": "小雨", "zh-tw": "小雨", fr: "Pluie faible", ja: "小雨" },
    63: { en: "Moderate rain", "zh-cn": "中雨", "zh-tw": "中雨", fr: "Pluie modérée", ja: "雨" },
    65: { en: "Heavy rain", "zh-cn": "大雨", "zh-tw": "大雨", fr: "Forte pluie", ja: "大雨" },
    66: { en: "Light freezing rain", "zh-cn": "轻微冻雨", "zh-tw": "輕微凍雨", fr: "Pluie verglaçante légère", ja: "弱い着氷性の雨" },
    67: { en: "Heavy freezing rain", "zh-cn": "强冻雨", "zh-tw": "強凍雨", fr: "Forte pluie verglaçante", ja: "強い着氷性の雨" },
    71: { en: "Slight snow", "zh-cn": "小雪", "zh-tw": "小雪", fr: "Faible neige", ja: "小雪" },
    73: { en: "Moderate snow", "zh-cn": "中雪", "zh-tw": "中雪", fr: "Neige modérée", ja: "雪" },
    75: { en: "Heavy snow", "zh-cn": "大雪", "zh-tw": "大雪", fr: "Forte neige", ja: "大雪" },
    77: { en: "Snow grains", "zh-cn": "雪粒", "zh-tw": "雪粒", fr: "Grains de neige", ja: "雪粒" },
    80: { en: "Slight rain showers", "zh-cn": "小阵雨", "zh-tw": "小陣雨", fr: "Averses faibles", ja: "弱いにわか雨" },
    81: { en: "Moderate rain showers", "zh-cn": "中阵雨", "zh-tw": "中陣雨", fr: "Averses modérées", ja: "にわか雨" },
    82: { en: "Violent rain showers", "zh-cn": "强阵雨", "zh-tw": "強陣雨", fr: "Averses violentes", ja: "激しいにわか雨" },
    85: { en: "Slight snow showers", "zh-cn": "小阵雪", "zh-tw": "小陣雪", fr: "Averses de neige faibles", ja: "弱いにわか雪" },
    86: { en: "Heavy snow showers", "zh-cn": "大阵雪", "zh-tw": "大陣雪", fr: "Fortes averses de neige", ja: "強いにわか雪" },
    95: { en: "Thunderstorm", "zh-cn": "雷雨", "zh-tw": "雷雨", fr: "Orage", ja: "雷雨" },
    96: { en: "Thunderstorm with slight hail", "zh-cn": "轻微雷雨伴冰雹", "zh-tw": "輕微雷雨伴冰雹", fr: "Orage avec faible grêle", ja: "弱いひょうを伴う雷雨" },
    99: { en: "Thunderstorm with heavy hail", "zh-cn": "强雷雨伴冰雹", "zh-tw": "強雷雨伴冰雹", fr: "Orage avec forte grêle", ja: "強いひょうを伴う雷雨" }
};

function getTranslationForLang(key, targetLang) {
    return arrLang[targetLang]?.[key] || translate(key);
}

function localizeWeatherCode(code, targetLang = lang) {
    const entry = weatherCodeTranslations[String(code)] || weatherCodeTranslations.unknown;
    return entry[targetLang] || entry.en;
}

function isEnglishCityName(city) {
    return /^[A-Za-z][A-Za-z\s.'’-]*$/.test(String(city || "").trim());
}

function localizeWeatherCity(city, targetLang = lang) {
    const fallbackCity = String(city || "").trim();
    if (!fallbackCity) return Promise.resolve(getTranslationForLang("TIANQI", targetLang));

    if (targetLang === "en" && isEnglishCityName(fallbackCity)) {
        return Promise.resolve(fallbackCity);
    }

    return translateText(fallbackCity, targetLang, true)
        .then(translatedCity => translatedCity || fallbackCity)
        .catch((err) => {
            console.warn('City translation failed', err);
            return fallbackCity;
        });
}

function formatWeatherTemperature(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
}

function renderWeatherSuccess(city, weather, dayTemperature, nightTemperature) {
    const $weather = $('.weather');
    $weather.removeClass('weather-error').addClass('weather-ready').empty();
    $('<span>', { id: 'city_text', text: city }).appendTo($weather);
    $weather.append('&nbsp;');
    $('<span>', { id: 'wea_text', text: weather }).appendTo($weather);
    $weather.append('&nbsp;');
    $('<span>', { id: 'tem_night', text: nightTemperature }).appendTo($weather);
    $weather.append('°C~');
    $('<span>', { id: 'tem_day', text: dayTemperature }).appendTo($weather);
    $weather.append('°C');
}

function renderWeatherFailure() {
    $('.weather')
        .removeClass('weather-ready')
        .addClass('weather-error')
        .text(translate('WEATHER_LOAD_ERROR'));
}

// 更新一言和天气
function updateContent() {
    const contentLang = lang;

    // 获取一言
    const hitokotoTask = getJsonWithSessionCache(
        'hitokoto',
        'https://international.v1.hitokoto.cn?max_length=20',
        5 * 60 * 1000
    )
        .then(data => {
            const hitokoto = data.hitokoto;
            let from = data.from || translate('ZUOZHEBUXIANG');

            // 作者名字只有一个字，直接输出 translate('ZUOZHEBUXIANG')
            if (from.length === 1) {
                from = translate('ZUOZHEBUXIANG');
                return Promise.all([
                    translateText(hitokoto, contentLang, false),
                    Promise.resolve(from)
                ]);
            }

            // 多字作者 → 正常翻译
            return Promise.all([
                translateText(hitokoto, contentLang, false),
                translateText(from, contentLang, false)
            ]);
        })
        .then(translations => {
            if (contentLang !== lang) return;
            $('#hitokoto_text').html(translations[0]);
            $('#from_text').html(translations[1]);
        })
        .catch((err) => {
            console.error(err);
            return null;
        });

    const weatherTask = getJsonWithSessionCache('geowea', '/api/geowea', 10 * 60 * 1000)
        .then(data => {
            const weather = data.weather || {};
            const code = weather.code;
            const tem_day = Number(weather.temperature_2m_max);
            const tem_night = Number(weather.temperature_2m_min);

            if (!data.success || !Number.isFinite(tem_day) || !Number.isFinite(tem_night)) {
                throw new Error(data.error || 'Weather data unavailable');
            }

            return Promise.all([
                localizeWeatherCity(data.city, contentLang),
                localizeWeatherCode(code, contentLang),
                formatWeatherTemperature(tem_day),
                formatWeatherTemperature(tem_night)
            ]);
        })
        .then(([translatedCity, translatedWea, tem_day, tem_night]) => {
            if (contentLang !== lang) return;
            renderWeatherSuccess(translatedCity, translatedWea, tem_day, tem_night);
        })
        .catch((err) => {
            console.error(err);
            if (contentLang === lang) {
                renderWeatherFailure();
            }
            return null;
        });

    return Promise.allSettled([hitokotoTask, weatherTask]);
}

//获取时间
var t = null;
t = setTimeout(time, 1000);

// 用于更新时间和日期的函数
function time() {
    clearTimeout(t);
    dt = new Date();
    var y = dt.getFullYear() - 2018; 
    var mm = dt.getMonth() + 1;
    var d = dt.getDate();

    // 星期几
    var weekday = {
        "en": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "fr": ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
        "zh-cn": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        "zh-tw": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        "ja": ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"]
    };

    var day = dt.getDay();
    var h = dt.getHours();
    var m = dt.getMinutes();
    var s = dt.getSeconds();
    if (h < 10) h = "0" + h;
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;

    // 当前语言
    var currentLang = lang;
    var weekDays = weekday[currentLang] || weekday['en'];

    // 月份简写
    var monthShort = {
        en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        fr: ["Janv.","Févr.","Mars","Avr.","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."]
    };

    // 在 time() 内部定义日期格式
    function formatEraDate(lang, era, y, mm, d) {
        switch (lang) {
            case "ja":
            case "zh-cn":
            case "zh-tw":
                return `${era}${y}${translate('YEAR')}${mm}${translate('MONTH')}${d}${translate('DAY')}`;

            case "en":
                return `${d} ${monthShort.en[mm - 1]}, ${era}${y}`;

            case "fr":
                return `${d} ${monthShort.fr[mm - 1]}, ${era}${y}`;

            default:
                return `${era}${y}, ${monthShort.en[mm - 1]} ${d}`;
        }
    }

    // 使用年号格式
    var dateStr = formatEraDate(currentLang, translate('REIWA'), y, mm, d);

    // 输出
    $("#time").html(
        "<span class='time-date'>" + dateStr + "&nbsp;" +
        "<span class='weekday'>" + weekDays[day] + "</span></span>" +
        "<span class='time-text'>" + h + ":" + m + ":" + s + "</span>"
    );

    t = setTimeout(time, 1000);
}

//链接提示文字
$("#social").mouseover(function () {
    $("#social").addClass("social-glass");
    $("#link-text").css({
        "display": "block",
    });
}).mouseout(function () {
    $("#social").removeClass("social-glass");
    $("#link-text").css({
        "display": "none"
    });
});

$("#github").mouseover(function () {
    $("#link-text").html(translate('GOGITHUB'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#phone").mouseover(function () {
    $("#link-text").html(translate('GOPHONE'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#qq").mouseover(function () {
    $("#link-text").html(translate('GOQQ'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#wechat").mouseover(function () {
    $("#link-text").html(translate('YOVXFWH'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#email").mouseover(function () {
    $("#link-text").html(translate('GOEMAIL'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#telegram").mouseover(function () {
    $("#link-text").html(translate('GOXTELFACE'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#twitter").mouseover(function () {
    $("#link-text").html(translate('GOXTELFACE'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#facebook").mouseover(function () {
    $("#link-text").html(translate('GOXTELFACE'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});

//更多页面切换
var shoemore = false;
var previousWidth = null;

$('#switchmore').on('click', function () {
    shoemore = !shoemore;

    // 获取当前按钮宽度
    if (shoemore) {
        previousWidth = $(this).outerWidth();
    }

    // 切换页面样式
    if (shoemore && $(document).width() >= 720) {
        $('#container').attr('class', 'container mores');
        $("#change").html("Oops&nbsp;!");
        $("#change1").html(translate('MORE_PAGE_SUBHEADING'));
    } else {
        $('#container').attr('class', 'container');
        $("#change").html("Hello&nbsp;World&nbsp;!");
        $("#change1").html(translate('DEFAULT_PAGE_SUBHEADING'));
    }

    // 按钮宽度锁定
    if (shoemore) {
        $(this).css('width', previousWidth + 'px');
    } else {
        $(this).css('width', '');
    }

    // --- 打开 more 时强制同步位置 ---
    if (shoemore) {
        syncMore();            // 第一次同步
        setTimeout(syncMore, 50);  // 延迟同步，确保布局稳定
    }
});

//更多页面动态计算
const more = document.getElementById('more');
const rightCol = document.querySelector('.col.right');

function syncMore() {
    // 如果 more 或 rightCol 不可见，跳过
    if (more.offsetParent === null || rightCol.offsetParent === null) return;

    const rect = rightCol.getBoundingClientRect();

    // rect 为 0 时不更新，避免错位
    if (rect.width === 0 || rect.left === 0) return;

    more.style.width = Math.round(rect.width) + 'px';
    more.style.left = Math.round(rect.left) + 'px';
}

syncMore();

window.addEventListener('resize', syncMore);

//更多页面关闭按钮
$('#close').on('click', function () {
    $('#switchmore').click();
});

//移动端菜单栏切换
var switchmenu = false;
$('#switchmenu').on('click', function () {
    switchmenu = !switchmenu;
    if (switchmenu) {
        $('#row').attr('class', 'row menus');
        $("#menu").html("<i class='iconfont icon-times'></i>");
    } else {
        $('#row').attr('class', 'row');
        $("#menu").html("<i class='iconfont icon-bars'>");
    }
});

//更多弹窗页面
$('#openmore').on('click', function () {
    $('#box').css("display", "block");
    $('#row').css("display", "none");
    $('#more').css("cssText", "display:none !important");
});
$('#openmore1').on('click', function () {
    $('#box').css("display", "block");
    $('#row').css("display", "none");
    $('#more').css("cssText", "display:none !important");
});
$('#closemore').on('click', function () {
    $('#box').css("display", "none");
    $('#row').css("display", "flex");
    $('#more').css("display", "flex");
});

//监听网页宽度
window.addEventListener('load', function () {
    window.addEventListener('resize', function () {
        //关闭移动端样式
        if (window.innerWidth >= 600) {
            $('#row').attr('class', 'row');
            $("#menu").html("<i class='iconfont icon-bars'>");
            //移除移动端切换功能区
            $('#rightone').attr('class', 'row rightone');
        }

        if (window.innerWidth <= 720) {
            //移动端隐藏更多页面
            $('#container').attr('class', 'container');
            $("#change").html("Hello&nbsp;World&nbsp;!");
            $("#change1").html(translate('DEFAULT_PAGE_SUBHEADING'));

            //移动端隐藏弹窗页面
            $('#box').css("display", "none");
            $('#row').css("display", "flex");
            $('#more').css("display", "flex");
        }
    })
})

//移动端切换功能区
var changemore = false;
$('#changemore').on('click', function () {
    changemore = !changemore;
    if (changemore) {
        $('#rightone').attr('class', 'row menus mobile');
    } else {
        $('#rightone').attr('class', 'row menus');
    }
});

// 初始化 changemore1 状态
var changemore1 = false;

// 判断屏幕宽度是否在 720px 到 992px 之间
function checkScreenWidth() {
    return window.innerWidth > 720 && window.innerWidth < 992;
}

// 只在符合条件的宽度范围内绑定点击事件
function bindChangeMoreEvent() {
    if (checkScreenWidth()) {
        $('#changemore1').on('click', function () {
            changemore1 = !changemore1;
            if (changemore1) {
                $('#rightone').attr('class', 'row menus mobile');
            } else {
                $('#rightone').attr('class', 'row menus');
            }
        });
    } else {
        // 如果窗口尺寸不符合要求，移除事件监听
        $('#changemore1').off('click');
    }
}

// 初始加载时检查窗口大小并绑定事件
bindChangeMoreEvent();

// 监听窗口大小变化，动态绑定或解绑事件
$(window).on('resize', function () {
    bindChangeMoreEvent();
});

//更多页面显示关闭按钮
$("#more").hover(function () {
    $('#close').css("display", "block");
}, function () {
    $('#close').css("display", "none");
})

//屏蔽右键
document.addEventListener('contextmenu', function (event) {
    iziToast.show({
        timeout: 2000,
        iconUrl: '/img/icon/warn.png',
        message: translate('NOYOUJIAN')
    });
    event.preventDefault(); // 取消右键菜单
});

//自动变灰
var myDate = new Date;
var mon = myDate.getMonth() + 1;
var date = myDate.getDate();
var days = ['3.11', '6.04', '8.15'];
for (var day of days) {
    var d = day.split('.');
    if (mon == d[0] && date == d[1]) {
        document.write(
            '<style>html{-webkit-filter:grayscale(100%);-moz-filter:grayscale(100%);-ms-filter:grayscale(100%);-o-filter:grayscale(100%);filter:progid:DXImageTransform.Microsoft.BasicImage(grayscale=1);_filter:none}</style>'
        )
        $("#change").html("Silence&nbsp;in&nbsp;silence");
        $("#change1").html(translate('SILENCE'));
        window.addEventListener('load', function () {
            iziToast.show({
                timeout: 14000,
                iconUrl: '/img/icon/candle.png',
                message: translate('SILENCE1')
            });
        }, false);
    }
}

// 电话弹窗元素
const phoneButton = document.getElementById('phone');
const popup = document.getElementById('popup');
const confirmButton = document.getElementById('confirm-button');
const cancelButton = document.getElementById('cancel-button');

// 微信弹窗元素
const wechatButton = document.getElementById('wechat');
const wechatPopup = document.getElementById('wechat-popup');
const wechatCancel = document.getElementById('wechat-cancel');
const wechatLink = document.getElementById('wechat-link');

// 电话弹窗
phoneButton.addEventListener('click', (event) => {
    event.preventDefault();
    popup.classList.add('show');
});

confirmButton.addEventListener('click', () => {
    window.location.href = 'tel:+862288692668';
});

cancelButton.addEventListener('click', () => {
    popup.classList.remove('show');
});

// 点击遮罩关闭
popup.addEventListener('click', (event) => {
    if (event.target === popup) popup.classList.remove('show');
});

// 微信弹窗
wechatButton.addEventListener('click', (event) => {
    event.preventDefault();
    wechatPopup.classList.add('show');
});

wechatCancel.addEventListener('click', () => {
    wechatPopup.classList.remove('show');
});

wechatLink.addEventListener('click', () => {
    window.location.href = 'http://weixin.qq.com/r/mp/diDr8ynE73SQrW2Q93Vk';
});

// 点击遮罩关闭
wechatPopup.addEventListener('click', (event) => {
    if (event.target === wechatPopup) wechatPopup.classList.remove('show');
});

// 解析 URL 参数
const urlParams = new URLSearchParams(window.location.search);

function getUrlParamIgnoreCase(name) {
    const expectedName = name.toLowerCase();

    for (const [key, value] of urlParams.entries()) {
        if (key.toLowerCase() === expectedName) {
            return value;
        }
    }

    return null;
}

// 1. support=email → 自动跳转 mailto
if ((getUrlParamIgnoreCase('support') || '').toLowerCase() === 'email') {
    window.location.href = "mailto:support@yume.zone";
}

// 2. appmode=true → 隐藏 app 下载区域
if ((getUrlParamIgnoreCase('appmode') || '').toLowerCase() === 'true') {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.display = 'none';
    }
}

//服务条款
document.addEventListener("DOMContentLoaded", () => {

    const termsBox = document.getElementById("termsBox");
    const openTermsBtn = document.getElementById("open-terms");
    const closeBtn = document.getElementById("termsCloseBtn");

    // 打开与关闭弹窗
    function getActiveTermType() {
        const activeTab = document.querySelector(".terms-tab.active");
        return activeTab ? activeTab.dataset.target.replace("terms-", "") : "user";
    }

    window.openTerms = function () {
        termsBox.style.display = "block";
        loadTermsContent(getActiveTermType());
    };

    openTermsBtn.addEventListener("click", openTerms);

    closeBtn.addEventListener("click", () => {
        termsBox.style.display = "none";
    });

    // 多语言 Markdown 加载
    async function loadTermsContent(type) {
        let fileLang = lang;  // 使用 lang 作为当前语言

        // 正确路径
        let url = `/terms/${type}/${fileLang}.md`;

        try {
            let response = await fetchWithTimeout(url);

            // 如果文件存在，加载内容
            if (response.ok) {
                const mdText = await response.text();
                const html = await renderMarkdown(mdText);
                document.getElementById(`terms-${type}`).innerHTML = html;
            } else {
                // 如果文件不存在，显示错误信息
                const errorText = translate("TERMS_LOAD_ERROR");
                document.getElementById(`terms-${type}`).innerHTML =
                    `<p style="color:#ffdddd">${errorText}：${url}</p>`;
            }

        } catch (e) {
            // 如果加载文件时发生错误
            const errorText = translate("TERMS_LOAD_ERROR");
            document.getElementById(`terms-${type}`).innerHTML =
                `<p style="color:#ffdddd">${errorText}：${url}</p>`;
        }
    }

    // Tab 切换
    const tabs = document.querySelectorAll(".terms-tab");
    const panels = document.querySelectorAll(".terms-panel");
    const termsMenu = document.querySelector(".terms-menu");
    const termAliases = {
        user: "user",
        terms: "user",
        privacy: "privacy",
        refund: "refunds",
        refunds: "refunds"
    };

    function normalizeTermType(value) {
        return termAliases[(value || "").trim().toLowerCase()] || "";
    }

    if (termsMenu) {
        termsMenu.addEventListener("wheel", (event) => {
            if (termsMenu.scrollWidth <= termsMenu.clientWidth) return;
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

            event.preventDefault();
            termsMenu.scrollLeft += event.deltaY;
        }, { passive: false });
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {

            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const target = tab.dataset.target.replace("terms-", "");

            panels.forEach(panel => panel.classList.remove("show"));
            document.getElementById(`terms-${target}`).classList.add("show");

            // 加载对应的 Markdown 文件
            loadTermsContent(target);
        });
    });

    // URL 参数自动打开条款
    function openTermsFromURL() {
        const term = normalizeTermType(getUrlParamIgnoreCase("terms"));

        if (!term) return;

        const targetTab = document.querySelector(`.terms-tab[data-target="terms-${term}"]`);
        const targetPanel = document.getElementById(`terms-${term}`);

        if (targetTab && targetPanel) {
            tabs.forEach(t => t.classList.remove("active"));
            targetTab.classList.add("active");

            panels.forEach(p => p.classList.remove("show"));
            targetPanel.classList.add("show");

            // 加载对应的 Markdown 文件
            window.openTerms();
        }
    }

    // URL 参数解析
    openTermsFromURL();

    // 语言模块完成切换后，按解析后的有效语言重新加载当前条款。
    document.addEventListener('yume:languagechange', function () {
        // 重新加载当前条款
        if (termsBox.style.display !== "none") {
            loadTermsContent(getActiveTermType());
        }
    });

});

//系统公告
document.addEventListener("DOMContentLoaded", () => {

    const box = document.getElementById("announcementBox");
    const closeBtn = document.getElementById("announcementCloseBtn");
    const contentPanel = document.getElementById("announcement-content");

        // 打开与关闭弹窗
        window.openAnnouncement = function () {
        box.style.display = "block";
    };

    closeBtn.addEventListener("click", () => {
        box.style.display = "none";
    });

        // 加载公告 Markdown（多语言）
        async function loadAnnouncement(mdUrl) {
        try {
            const res = await fetchWithTimeout(mdUrl);
            if (!res.ok) throw new Error();

            const mdText = await res.text();
            const html = await renderMarkdown(mdText);
            contentPanel.innerHTML = html;

        } catch (e) {
            contentPanel.innerHTML =
                `<p style="color:#ffdddd">${translate("NO_ANNOUNCEMENT")}</p>`;
        }
    }

        // 从 Worker 获取公告信息（让 Worker 决定是否有效）
        async function fetchAnnouncement() {
        try {
            const res = await fetchWithTimeout("/api/announcement", { cache: "no-store" });
            const data = await res.json();

            const { md } = data;

            // 如果 Worker 判定当前没有有效公告，会返回 md: null
            if (!md) {
                contentPanel.innerHTML = `<p>${translate("NO_ANNOUNCEMENT")}</p>`;
                return false;
            }

            // 选择对应语言的 md 文件（注意防御：md 存在才取字段）
            const mdUrl = md[lang] || md["en"];

            if (!mdUrl) {
                contentPanel.innerHTML = `<p>${translate("NO_ANNOUNCEMENT")}</p>`;
                return false;
            }

            await loadAnnouncement(mdUrl + "?t=" + Date.now()); // 强制不缓存
            return true;

        } catch (e) {
            contentPanel.innerHTML = `<p>${translate("NO_ANNOUNCEMENT")}</p>`;
            return false;
        }
    }

        // 页面加载时自动检查公告
        const announcementReady = (async () => {
        const ok = await fetchAnnouncement();
        if (ok) window.openAnnouncement();
    })();

    window.yumeLoading?.track(
        announcementReady,
        90,
        safeLoadingText('LOADTEXT', 'Loading files...')
    );

        // 语言模块完成切换后，按解析后的有效语言重新加载公告。
        document.addEventListener('yume:languagechange', async function () {
        // 重新加载公告
        await fetchAnnouncement();
    });

});

//控制台输出
var styleTitle1 = `
font-size: 20px;
font-weight: 600;
color: rgb(244,167,89);
`
var styleTitle2 = `
font-size:12px;
color: rgb(244,167,89);
`
var styleContent = `
color: rgb(30,152,255);
`
var title1 = 'Yume Official'
var title2 = `
 YUME INTERNET LLC.                                               
`
var content = `
版 本 号：27.0
Version: 27.0
更新日期：2026-07-08
Release Date: 2026‑07‑08

更新说明：
Update Notes:

1. 优化 美术设计
1. Optimized art design

更多详见更新日志板块。
For more details, please refer to the update log section.

、
`
console.log(`%c${title1} %c${title2}
%c${content}`, styleTitle1, styleTitle2, styleContent)
