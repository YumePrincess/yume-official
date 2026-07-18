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

function safeLoadingText(key, fallback) {
    try {
        return translate(key);
    } catch (err) {
        return fallback;
    }
}

function waitForDocumentReady() {
    if (document.readyState !== 'loading') {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
    });
}

function waitForWindowLoad() {
    if (document.readyState === 'complete') {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        window.addEventListener('load', resolve, { once: true });
    });
}

function waitForImageLoad(img) {
    if (!img) {
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        let sourceObserver;

        const settle = () => {
            img.removeEventListener('load', settle);
            img.removeEventListener('error', settle);
            if (sourceObserver) sourceObserver.disconnect();
            resolve();
        };

        const checkCurrentSource = () => {
            if (img.getAttribute('src') && img.complete) settle();
        };

        img.addEventListener('load', settle, { once: true });
        img.addEventListener('error', settle, { once: true });

        if (!img.getAttribute('src') && 'MutationObserver' in window) {
            sourceObserver = new MutationObserver(checkCurrentSource);
            sourceObserver.observe(img, { attributes: true, attributeFilter: ['src'] });
        }

        checkCurrentSource();
    });
}

function loadFullFont() {
    if (!('FontFace' in window) || !document.fonts) {
        return Promise.resolve();
    }

    const font = new FontFace(
        "MiSans",
        "url(" + "./font/MiSans-Regular.woff2" + ")"
    );

    return font.load()
        .then((loadedFont) => {
            document.fonts.add(loadedFont);
            return loadedFont;
        })
        .catch((err) => {
            console.warn('Font load failed', err);
            return null;
        });
}

function loadPageFonts() {
    return loadFullFont().then(() => {
        return document.fonts ? document.fonts.ready : undefined;
    });
}

const yumeLoading = (() => {
    const resourceProgressStart = 8;
    const resourceProgressEnd = 94;
    const pendingTasks = [];
    let currentProgress = 0;
    let finishing = false;
    let resourcesTracked = false;

    function setProgress(value, text) {
        const nextProgress = Math.max(currentProgress, Math.min(100, Math.round(value)));
        currentProgress = nextProgress;

        const progressWrap = document.querySelector('.loading-progress');
        const percent = document.getElementById('loading-percent');
        const loadingText = document.getElementById('loading-text');

        if (progressWrap) {
            progressWrap.style.setProperty('--loading-progress', `${nextProgress}%`);
            progressWrap.setAttribute('aria-valuenow', String(nextProgress));
        }
        if (percent) {
            const progressText = `${nextProgress}%`;
            percent.textContent = progressText;
            percent.dataset.progress = progressText;
        }
        if (text && loadingText) loadingText.textContent = text;
    }

    function trackResources(resources, text) {
        if (resourcesTracked) return pendingTasks;
        resourcesTracked = true;

        const totalWeight = resources.reduce((total, resource) => {
            return total + Math.max(0, resource.weight || 0);
        }, 0);
        let completedWeight = 0;

        resources.forEach((resource) => {
            const weight = Math.max(0, resource.weight || 0);
            const task = Promise.resolve(resource.promise)
                .catch((err) => {
                    console.warn(`${resource.name || 'Resource'} load failed`, err);
                    return null;
                })
                .finally(() => {
                    completedWeight += weight;
                    const ratio = totalWeight ? completedWeight / totalWeight : 1;
                    const progress = resourceProgressStart
                        + ratio * (resourceProgressEnd - resourceProgressStart);
                    setProgress(progress, text);
                });

            pendingTasks.push(task);
        });

        return pendingTasks;
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

        await waitForTrackedTasks();
        setProgress(100, safeLoadingText('LOADCOMPLETE', 'Loading complete'));

        setTimeout(function () {
            $('#loading-box').attr('class', 'loaded');
            revealPage();
        }, 360);
    }

    setProgress(resourceProgressStart, safeLoadingText('LOADING', 'Loading...'));

    return {
        setProgress,
        trackResources,
        finish
    };
})();

window.yumeLoading = yumeLoading;

const loadingResourceText = safeLoadingText('LOADTEXT', 'Loading files...');
const backgroundLoadTask = window.yumeBackgroundReady
    || waitForImageLoad(document.getElementById('bg'));

yumeLoading.trackResources([
    { name: 'Document', weight: 15, promise: waitForDocumentReady() },
    { name: 'Page resources', weight: 30, promise: waitForWindowLoad() },
    { name: 'Fonts', weight: 20, promise: loadPageFonts() },
    { name: 'Background image', weight: 35, promise: backgroundLoadTask }
], loadingResourceText);
yumeLoading.finish();

function revealPage() {
    $('#bg').css("cssText", "transform: scale(1);filter: blur(0px);transition: ease 1.5s;");
    $('#section').css("cssText", "opacity: 1;transition: ease 1.5s;");
    $('.cover').css("cssText", "opacity: 1;transition: ease 1.5s;");

    //用户欢迎
    iziToast.settings({
        timeout: 2500,
        backgroundColor: '#ffffff40',
        titleColor: '#efefef',
        messageColor: '#efefef',
        progressBar: false,
        close: false,
        closeOnEscape: true,
        position: 'topCenter',
        transitionIn: 'bounceInDown',
        transitionOut: 'flipOutX',
        displayMode: 'replace',
        layout: '1'
    });
    setTimeout(function () {
        iziToast.show({
            title: getGreeting(),
            message: translate('WELCOME_MESSAGE')
        });
    }, 800);
}

//进入问候
function getGreeting() {
    var hour = new Date().getHours();
    if (hour < 6) return translate('EARLY_MORNING');
    if (hour < 9) return translate('GOOD_MORNING');
    if (hour < 12) return translate('GOOD_SHANGWU');
    if (hour < 14) return translate('GOOD_AFTERNOON');
    if (hour < 17) return translate('GOOD_XIAWU');
    if (hour < 19) return translate('GOOD_BANGWAN');
    if (hour < 22) return translate('GOOD_EVENING');
    return translate('GOOD_NIGHT');
}

//获取时间
var t = null;
t = setTimeout(time, 1000);

function time() {
    clearTimeout(t);
    dt = new Date();
    var mm = dt.getMonth() + 1;
    var d = dt.getDate();
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
    if (h < 10) {
        h = "0" + h;
    }
    if (m < 10) {
        m = "0" + m;
    }

    // 获取当前语言的周几名称
    var weekDays = weekday[lang] || weekday['en']; // 默认到英文

    $("#time_text").html(h + '<span id="point">:</span>' + m);
    $("#day").html(mm + "&nbsp;" + translate('MONTH') + "&nbsp;" + d + "&nbsp;" + translate('DAY') + "&nbsp; " + weekDays[day]);
    t = setTimeout(time, 1000);
}

function renderWeatherSuccess(city, weather, dayTemperature, nightTemperature) {
    const $weather = $('.weather');
    $weather.removeClass('weather-error').empty();
    $('<span>', { id: 'city_text', text: city }).appendTo($weather);
    $weather.append('&nbsp;');
    $('<span>', { id: 'wea_text', text: weather }).appendTo($weather);
    $weather.append('&nbsp;');
    $('<span>', { id: 'tem_night', text: nightTemperature }).appendTo($weather);
    $weather.append('°C&nbsp;~&nbsp;');
    $('<span>', { id: 'tem_day', text: dayTemperature }).appendTo($weather);
    $weather.append('°C');
}

function renderWeatherFailure() {
    $('.weather').addClass('weather-error').text(translate('WEATHER_LOAD_FAILED'));
}

const geoWeatherApiUrl = '/api/geowea';

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

function localizeWeatherCode(code) {
    const entry = weatherCodeTranslations[String(code)] || weatherCodeTranslations.unknown;
    return entry[lang] || entry.en;
}

function formatWeatherTemperature(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "";
    return Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
}

function localizeWeatherCity(city) {
    const fallbackCity = String(city || '').trim();
    if (!fallbackCity) return Promise.resolve('');

    return translateText(fallbackCity, lang, true)
        .then(translatedCity => translatedCity || fallbackCity);
}

// 更新天气
function updateContent() {
    fetch(geoWeatherApiUrl)
        .then(res => res.json())
        .then(data => {
            const weather = data.weather || {};
            const tem_day = Number(weather.temperature_2m_max);
            const tem_night = Number(weather.temperature_2m_min);

            if (!data.success || !Number.isFinite(tem_day) || !Number.isFinite(tem_night)) {
                throw new Error(data.error || 'Weather data unavailable');
            }

            const city = data.city || '';
            const localizedWeather = localizeWeatherCode(weather.code);

            return Promise.all([
                localizeWeatherCity(city),
                localizedWeather,
                formatWeatherTemperature(tem_day),
                formatWeatherTemperature(tem_night)
            ]);
        })
        .then(([translatedCity, translatedWea, tem_day, tem_night]) => {
            // 更新页面
            renderWeatherSuccess(translatedCity, translatedWea, tem_day, tem_night);
        })
        .catch(function (err) {
            console.warn('Weather update failed', err);
            renderWeatherFailure();
        });
}

//Tab书签页
$(function () {
    $(".mark .tab .tab-item").click(function () {
        $(this).addClass("active").siblings().removeClass("active");
        $(".products .mainCont").eq($(this).index()).css("display", "flex").siblings().css("display", "none");
    })
})

//设置
$(function () {
    $(".set .tabs .tab-items").click(function () {
        $(this).addClass("actives").siblings().removeClass("actives");
        $(".productss .mainConts").eq($(this).index()).css("display", "flex").siblings().css("display", "none");
    })
})

//输入框为空时阻止跳转
$(window).keydown(function (e) {
    var key = window.event ? e.keyCode : e.which;
    if (key.toString() == "13") {
        if ($(".wd").val() == "") {
            return false;
        }
    }
});

//点击搜索按钮
$(".sou-button").click(function () {
    if ($("body").attr("class") === "onsearch") {
        if ($(".wd").val() != "") {
            $("#search-submit").click();
        }
    }
});

//鼠标中键点击事件
$(window).mousedown(function (event) {
    if (event.button == 1) {
        $("#time_text").click();
    }
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
var title1 = '雨梦搜索'
var title2 = `                                                 
`
var content = `
版 本 号：27.0
更新日期：2026-07-08

`
console.log(`%c${title1} %c${title2}
%c${content}`, styleTitle1, styleTitle2, styleContent)
