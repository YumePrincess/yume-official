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

//加载完成后执行
window.addEventListener('load', function () {

    //载入动画
    $('#loading-box').attr('class', 'loaded');
    $('#bg').css("cssText", "transform: scale(1);filter: blur(0px);transition: ease 1.5s;");
    $('.cover').css("cssText", "opacity: 1;transition: ease 1.5s;");
    $('#section').css("cssText", "transform: scale(1) !important;opacity: 1 !important;filter: blur(0px) !important");
    $('#change1').html(translate('DEFAULT_PAGE_SUBHEADING'));

    //用户欢迎
    setTimeout(function () {
        iziToast.show({
            timeout: 2500,
            title: hello,
            message: translate('WELCOME_MESSAGE')
        });
    }, 800);
}, false)

setTimeout(function () {
    $('#loading-text').html(translate('LOADTEXT'))
}, 3000);

//延迟加载音乐播放器
function downloadJSAtOnload() {
    var element = document.createElement("script");
    element.src = "/js/music.js";
    document.body.appendChild(element);
}
if (window.addEventListener)
    window.addEventListener("load", downloadJSAtOnload, false);
else if (window.attachEvent)
    window.attachEvent("onload", downloadJSAtOnload);
else window.onload = downloadJSAtOnload;

// ======== 新春灯笼自动展示（农历腊月三十 ~ 正月十五） ========
// 判断当前语言是否为中文
function isChineseLang() {
    return lang === "zh-cn" || lang === "zh-tw";
}

// 春节灯笼展示区间（农历腊月二十六 ~ 正月十五）
// 公历日期表：2026 ~ 2050
const springFestivalRanges = {
    2026: { start: "2026-02-13", end: "2026-03-02" },
    2027: { start: "2027-02-02", end: "2027-02-21" },
    2028: { start: "2028-01-22", end: "2028-02-10" },
    2029: { start: "2029-02-09", end: "2029-02-28" },
    2030: { start: "2030-01-31", end: "2030-02-19" },
    2031: { start: "2031-02-18", end: "2031-03-09" },
    2032: { start: "2032-02-07", end: "2032-02-26" },
    2033: { start: "2033-01-27", end: "2033-02-15" },
    2034: { start: "2034-02-14", end: "2034-03-05" },
    2035: { start: "2035-02-04", end: "2035-02-23" },
    2036: { start: "2036-01-24", end: "2036-02-12" },
    2037: { start: "2037-02-11", end: "2037-03-02" },
    2038: { start: "2038-01-31", end: "2038-02-19" },
    2039: { start: "2039-02-19", end: "2039-03-10" },
    2040: { start: "2040-02-08", end: "2040-02-27" },
    2041: { start: "2041-01-28", end: "2041-02-16" },
    2042: { start: "2042-02-15", end: "2042-03-06" },
    2043: { start: "2043-02-05", end: "2043-02-24" },
    2044: { start: "2044-01-25", end: "2044-02-13" },
    2045: { start: "2045-02-12", end: "2045-03-03" },
    2046: { start: "2046-02-01", end: "2046-02-20" },
    2047: { start: "2047-01-22", end: "2047-02-10" },
    2048: { start: "2048-02-10", end: "2048-03-01" },
    2049: { start: "2049-01-29", end: "2049-02-17" },
    2050: { start: "2050-02-17", end: "2050-03-08" }
};

// 判断是否在春节区间（不使用农历算法）
function isSpringFestival() {
    const today = new Date();
    const year = today.getFullYear();

    if (!springFestivalRanges[year]) return false;

    const range = springFestivalRanges[year];
    const start = new Date(range.start);
    const end = new Date(range.end);

    return today >= start && today <= end;
}

// 主灯笼控制函数（唯一入口）
function updateLantern() {
    const showLantern = isChineseLang() && isSpringFestival();

    if (showLantern) {
        document.body.classList.add("lantern-active");

        if (!document.getElementById("lantern-css")) {
            let link = document.createElement("link");
            link.id = "lantern-css";
            link.rel = "stylesheet";
            link.href = "/css/lantern.css";
            document.body.appendChild(link);

            let script = document.createElement("script");
            script.id = "lantern-js";
            script.src = "/js/lantern.js";
            document.body.appendChild(script);
        }
    } else {
        document.body.classList.remove("lantern-active");

        document.getElementById("lantern-css")?.remove();
        document.getElementById("lantern-js")?.remove();
    }
}

//火狐浏览器独立样式
if (isFirefox = navigator.userAgent.indexOf("Firefox") > 0) {
    var head = document.getElementsByTagName('head')[0];
    var link = document.createElement('link');
    link.href = '/css/firefox.css';
    link.rel = 'stylesheet';
    link.type = 'text/css';
    head.appendChild(link);
    window.addEventListener('load', function () {
        iziToast.show({
            timeout: 8000,
            iconUrl: '/img/icon/warn.png',
            message: translate('FIREFOX')
        });
    }, false)
}

// 更新一言和天气
function updateContent() {
    // 获取一言
    fetch('https://international.v1.hitokoto.cn?max_length=20')
        .then(response => response.json())
        .then(data => {
            const hitokoto = data.hitokoto;
            let from = data.from;

            // 如果 from 只有一个字，则在后面加上“（作者）”
            if (from.length === 1) {
                from = from + '（作者）';
            }

            // 中文内容 → zh-cn 不翻译，zh-tw 用 OpenCC
            return Promise.all([
                translateText(hitokoto, lang, false), // 一言内容（非城市）
                translateText(from, lang, false)      // 作者（非城市）
            ]);
        })
        .then(translations => {
            $('#hitokoto_text').html(translations[0]);
            $('#from_text').html(translations[1]);
        })
        .catch(console.error);

    // 完整 WMO 天气代码映射（Open-Meteo 官方）
    const weatherMap = {
        0: "晴",
        1: "主要晴朗",
        2: "多云",
        3: "阴天",
        45: "雾",
        48: "雾霾",
        51: "轻微毛毛雨",
        53: "中度毛毛雨",
        55: "强毛毛雨",
        56: "轻微冻毛毛雨",
        57: "强冻毛毛雨",
        61: "小雨",
        63: "中雨",
        65: "大雨",
        66: "轻微冻雨",
        67: "强冻雨",
        71: "小雪",
        73: "中雪",
        75: "大雪",
        77: "雪粒",
        80: "小阵雨",
        81: "中阵雨",
        82: "强阵雨",
        85: "小阵雪",
        86: "大阵雪",
        95: "雷雨",
        96: "轻微雷雨伴冰雹",
        99: "强雷雨伴冰雹"
    };

    // 主流程：使用 ipwho.is 获取经纬度（支持 HTTPS，不会被浏览器拦截）
    fetch('https://yumeofficialapi.yume.zone/geoip')
        .then(res => res.json())
        .then(ipInfo => {
            const lat = ipInfo.latitude;
            const lon = ipInfo.longitude;
            const city = ipInfo.city;

            // 请求 Open-Meteo：当前天气 + 当天最高/最低温度
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

            return Promise.all([
                fetch(url).then(res => res.json()),
                city
            ]);
        })
        .then(([weatherData, city]) => {
            // 当前天气代码
            const code = weatherData.current.weather_code;
            const wea = weatherMap[code] || "未知天气";

            // 当天最高/最低温度
            const tem_day = Number(weatherData.daily.temperature_2m_max[0]);
            const tem_night = Number(weatherData.daily.temperature_2m_min[0]);

            // 如果天气描述只有一个字（如“晴”），加“天”
            const modifiedWea = wea.length === 1 ? wea + "天" : wea;

            return Promise.all([
                translateText(modifiedWea, lang, false), // 天气描述（非城市）
                translateText(city, lang, true),         // 城市名称（需要 DeepL）
                tem_day,
                tem_night
            ]);
        })
        .then(([translatedWea, translatedCity, tem_day, tem_night]) => {
            // 更新页面
            $('#wea_text').html(translatedWea);
            $('#city_text').html(translatedCity);
            $('#tem_day').text(tem_day);
            $('#tem_night').text(tem_night);
        })
        .catch(console.error);
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
    var currentLang = lang;  // ⭐ 直接使用 lang.js 处理好的语言
    var weekDays = weekday[currentLang] || weekday['en'];

    // ⭐ 月份简写（仅英语/法语）
    var monthShort = {
        en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        fr: ["Janv.","Févr.","Mars","Avr.","Mai","Juin","Juil.","Août","Sept.","Oct.","Nov.","Déc."]
    };

    // ⭐ 在 time() 内部定义日期格式（最小改动）
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

    // ⭐ 使用年号格式
    var dateStr = formatEraDate(currentLang, translate('REIWA'), y, mm, d);

    // ⭐ 输出（星期几完全保留）
    $("#time").html(
        dateStr + "&nbsp;" +
        "<span class='weekday'>" + weekDays[day] + "</span><br>" +
        "<span class='time-text'>" + h + ":" + m + ":" + s + "</span>"
    );

    t = setTimeout(time, 1000);
}

//链接提示文字
$("#social").mouseover(function () {
    $("#social").css({
        "background": "rgb(0 0 0 / 25%)",
        'border-radius': '6px',
        "backdrop-filter": "blur(5px)"
    });
    $("#link-text").css({
        "display": "block",
    });
}).mouseout(function () {
    $("#social").css({
        "background": "none",
        "border-radius": "6px",
        "backdrop-filter": "none"
    });
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
    $("#link-text").html(translate('GOQQWX'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#wechat").mouseover(function () {
    $("#link-text").html(translate('GOQQWX'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#email").mouseover(function () {
    $("#link-text").html(translate('GOEMAIL'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#telegram").mouseover(function () {
    $("#link-text").html(translate('GOX'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#twitter").mouseover(function () {
    $("#link-text").html(translate('GOTEL'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});
$("#facebook").mouseover(function () {
    $("#link-text").html(translate('GOTEL'));
}).mouseout(function () {
    $("#link-text").html(translate('LINE'));
});

//更多页面切换
var shoemore = false;
var previousWidth = null;

$('#switchmore').on('click', function () {
    shoemore = !shoemore;

    // 获取当前的宽度
    if (shoemore) {
        previousWidth = $(this).outerWidth(); // 存储当前宽度
    }

    if (shoemore && $(document).width() >= 720) {
        $('#container').attr('class', 'container mores');
        $("#change").html("Oops&nbsp;!");
        $("#change1").html(translate('MORE_PAGE_SUBHEADING'));
    } else {
        $('#container').attr('class', 'container');
        $("#change").html("Hello&nbsp;World&nbsp;!");
        $("#change1").html(translate('DEFAULT_PAGE_SUBHEADING'));
    }

    // 设置切换后的宽度，使用 max 和 min 宽度进行动态调整
    if (shoemore) {
        $(this).css('width', previousWidth + 'px'); // 应用之前的宽度
    } else {
        $(this).css('width', ''); // 清除自定义宽度以便恢复自适应
    }
});

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
var days = ['3.11', '8.15'];
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

function translate(key) {
    return arrLang[lang][key] || key;  // 默认返回原始 key
}

function checkOrientation() {
    if (window.innerWidth < 720) {
        document.getElementById('orientation-warning').style.display = 'block';
    } else {
        document.getElementById('orientation-warning').style.display = 'none';
    }
}

// 关闭按钮功能
    document.getElementById('close-warning').addEventListener('click', function() {
        document.getElementById('orientation-warning').style.display = 'none';
    });

// 初始检查
checkOrientation();

// 监听窗口大小变化
window.addEventListener('resize', checkOrientation);

// 获取相关元素
const phoneButton = document.getElementById('phone');
const popup = document.getElementById('popup');
const confirmButton = document.getElementById('confirm-button');
const cancelButton = document.getElementById('cancel-button');

// 点击电话按钮时显示弹窗
phoneButton.addEventListener('click', () => {
  popup.style.display = 'flex';
});

// 点击确定按钮后跳转到拨号链接
confirmButton.addEventListener('click', () => {
  window.location.href = 'tel:+862288692668';
});

// 点击取消按钮时关闭弹窗
cancelButton.addEventListener('click', () => {
  popup.style.display = 'none';
});

// 如果点击弹窗外部区域，关闭弹窗
window.addEventListener('click', (event) => {
  if (event.target === popup) {
    popup.style.display = 'none';
  }
});

phoneButton.addEventListener('click', (event) => {
  event.preventDefault();  // 阻止默认行为
  popup.style.display = 'flex';
});

window.addEventListener('resize', adjustAplayerDisplay);
window.addEventListener('DOMContentLoaded', adjustAplayerDisplay);

function adjustAplayerDisplay() {
    const aplayerDiv = document.getElementById('aplayer');
    const boxLeft = document.querySelector('.box-left');
    const boxRight = document.querySelector('.box-right');

    // 判断屏幕宽度
    if (window.innerWidth < 840) {
        // 如果是小于840px，将 Aplayer 显示在 (1) 位置（左侧）
        if (!boxLeft.contains(aplayerDiv)) {
            boxLeft.appendChild(aplayerDiv);  // 将 aplayer 移到左侧
        }
        // 确保右侧的 aplayer 隐藏
        if (boxRight.contains(aplayerDiv)) {
            boxRight.removeChild(aplayerDiv);
        }
    } else {
        // 如果是大于840px，将 Aplayer 显示在 (2) 位置（右侧）
        if (!boxRight.contains(aplayerDiv)) {
            boxRight.appendChild(aplayerDiv);  // 将 aplayer 移到右侧
        }
        // 确保左侧的 aplayer 隐藏
        if (boxLeft.contains(aplayerDiv)) {
            boxLeft.removeChild(aplayerDiv);
        }
    }
}

// 获取当前 URL 参数
const urlParams = new URLSearchParams(window.location.search);

// 检查是否存在 appmode=true 参数
if (urlParams.get('appmode') === 'true') {
  // 隐藏应用下载区域
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

    // -----------------------------
    // 打开与关闭弹窗
    // -----------------------------
    window.openTerms = function () {
        termsBox.style.display = "block";
    };

    openTermsBtn.addEventListener("click", openTerms);

    closeBtn.addEventListener("click", () => {
        termsBox.style.display = "none";
    });

    // -----------------------------
    // 多语言 Markdown 加载
    // -----------------------------
    async function loadTermsContent(type) {
        // 使用 lang.js 中的 lang 变量，lang.js 会确保 lang 是有效的语言
        let fileLang = lang;  // 使用 lang 作为当前语言

        // 正确路径
        let url = `/terms/${type}/${fileLang}.md`;

        try {
            let response = await fetch(url);

            // 如果文件存在，加载内容
            if (response.ok) {
                const mdText = await response.text();
                const html = marked.parse(mdText);
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

    // -----------------------------
    // Tab 切换
    // -----------------------------
    const tabs = document.querySelectorAll(".terms-tab");
    const panels = document.querySelectorAll(".terms-panel");

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

    // -----------------------------
    // URL 参数自动打开条款
    // -----------------------------
    function openTermsFromURL() {
        const params = new URLSearchParams(window.location.search);
        const term = params.get("terms");

        if (!term) return;

        window.openTerms();

        const targetTab = document.querySelector(`.terms-tab[data-target="terms-${term}"]`);
        const targetPanel = document.getElementById(`terms-${term}`);

        if (targetTab && targetPanel) {
            tabs.forEach(t => t.classList.remove("active"));
            targetTab.classList.add("active");

            panels.forEach(p => p.classList.remove("show"));
            targetPanel.classList.add("show");

            // 加载对应的 Markdown 文件
            loadTermsContent(term);
        }
    }

    // 默认加载用户条款
    loadTermsContent("user");

    // URL 参数解析
    openTermsFromURL();

    // -----------------------------
    // 监听语言切换（与你的语言系统完全兼容）
    // -----------------------------
    $(".translate").click(function () {
        const selectedLang = $(this).attr("id");

        if ('localStorage' in window) {
            localStorage.setItem('lang', selectedLang);
        }

        lang = selectedLang;

        // 重新加载当前条款
        const activeTab = document.querySelector(".terms-tab.active");
        if (activeTab) {
            const type = activeTab.dataset.target.replace("terms-", "");
            loadTermsContent(type);
        }
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
版 本 号：26.1
更新日期：2026-02-22

更新说明：
1. 新增 服务条款、隐私政策、退款政策
2. 新增 繁体中文支持
3. 移除 简体中文部分功能
4. 优化 页面加载缓慢
5. 优化 音乐延迟加载
、
`
console.log(`%c${title1} %c${title2}
%c${content}`, styleTitle1, styleTitle2, styleContent)