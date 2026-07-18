var searchCookieKeys = Object.freeze({
    searchEngines: 'yume-search-se-list',
    defaultSearchEngine: 'yume-search-se-default',
    background: 'yume-search-bg-img',
    quickLinks: 'yume-search-quick-list'
});

var searchCookieImportMap = Object.freeze({
    se_list: searchCookieKeys.searchEngines,
    se_default: searchCookieKeys.defaultSearchEngine,
    bg_img: searchCookieKeys.background,
    quick_list: searchCookieKeys.quickLinks,
    'yume-search-se-list': searchCookieKeys.searchEngines,
    'yume-search-se-default': searchCookieKeys.defaultSearchEngine,
    'yume-search-bg-img': searchCookieKeys.background,
    'yume-search-quick-list': searchCookieKeys.quickLinks
});

function setSearchCookie(name, value) {
    Cookies.set(name, value, {
        expires: 36500,
        path: '/',
        sameSite: 'Lax',
        secure: window.location.protocol === 'https:'
    });
}

// 默认搜索引擎列表
var se_list_preinstall = {
    '1': {
        id: 1,
        titleKey: 'BING',
        title: translate('BING'),
        url: "https://www.bing.com/search",
        name: "q",
        icon: "iconfont icon-bing",
    },
    '2': {
        id: 2,
        titleKey: 'BAIDU',
        title: translate('BAIDU'),
        url: "https://www.baidu.com/s",
        name: "wd",
        icon: "iconfont icon-baidu",
    },
    '3': {
        id: 3,
        titleKey: 'GUGE',
        title: translate('GUGE'),
        url: "https://www.google.com/search",
        name: "q",
        icon: "iconfont icon-google",
    },
    '4': {
        id: 4,
        titleKey: 'SOGO',
        title: translate('SOGO'),
        url: "https://www.sogou.com/web",
        name: "query",
        icon: "iconfont icon-sougousousuo",
    },
    '5': {
        id: 5,
        title: "360",
        url: "https://www.so.com/s",
        name: "q",
        icon: "iconfont icon-360sousuo",
    },
    '6': {
        id: 6,
        titleKey: 'WEIBO',
        title: translate('WEIBO'),
        url: "https://s.weibo.com/weibo",
        name: "q",
        icon: "iconfont icon-xinlangweibo",
    },
    '7': {
        id: 7,
        titleKey: 'ZHIHU',
        title: translate('ZHIHU'),
        url: "https://www.zhihu.com/search",
        name: "q",
        icon: "iconfont icon-zhihu",
    },
    '8': {
        id: 8,
        title: "Github",
        url: "https://github.com/search",
        name: "q",
        icon: "iconfont icon-github",
    },
    '9': {
        id: 9,
        title: "BiliBili",
        url: "https://search.bilibili.com/all",
        name: "keyword",
        icon: "iconfont icon-bilibilidonghua",
    },
    '10': {
        id: 10,
        titleKey: 'TAOBAO',
        title: translate('TAOBAO'),
        url: "https://s.taobao.com/search",
        name: "q",
        icon: "iconfont icon-taobao",
    },
    '11': {
        id: 11,
        titleKey: 'JD',
        title: translate('JD'),
        url: "https://search.jd.com/Search",
        name: "keyword",
        icon: "iconfont icon-jingdong",
    }
};

function getLocalizedTitle(item) {
    return item.titleKey ? translate(item.titleKey) : item.title;
}

// 默认快捷方式
var quick_list_preinstall = {
	'1': {
        title: "Yume Official",
        url: "https://www.yume.zone/",
    },
	'2': {
        title: "Yume Drive",
        url: "https://drive.yume.zone/",
    },
    '3': {
        title: "Yume Intelligence",
        url: "https://ai.yume.zone/",
    },
    '4': {
        title: "Vercel",
        url: "https://vercel.com/",
    },
    '5': {
        title: "GitHub",
        url: "https://github.com/",
    },
    '6': {
        title: "Cloudflare",
        url: "https://dash.cloudflare.com/",
    },
    '7': {
        title: "W3school",
        url: "https://www.w3school.com.cn/",
    },
    '8': {
        title: "BiliBili",
        url: "https://www.bilibili.com/",
    },
	'9': {
        title: "CSDN",
        url: "https://www.csdn.net/",
    },
	'10': {
        title: "Office",
        url: "https://www.office.com/",
    }
};

// 获取搜索引擎列表
function getSeList() {
    var se_list_local = Cookies.get(searchCookieKeys.searchEngines);
    if (se_list_local !== "{}" && se_list_local) {
        return JSON.parse(se_list_local);
    } else {
        setSeList(se_list_preinstall);
        return se_list_preinstall;
    }
}

// 设置搜索引擎列表
function setSeList(se_list) {
    if (se_list) {
        setSearchCookie(searchCookieKeys.searchEngines, se_list);
        return true;
    }
    return false;
}

// 获得默认搜索引擎
function getSeDefault() {
    var se_default = Cookies.get(searchCookieKeys.defaultSearchEngine);
    return se_default ? se_default : "1";
}

// 背景图片；未保存过偏好时默认使用“每日必应”
var bg_img_preinstall = {
    "type": "2", // 1:默认壁纸 2:每日必应 3:随机风景 4:随机二次元 5:自定义壁纸
    "path": "", // 自定义图片
};
var wallpaper_request_id = 0;

function getDefaultBgImg() {
    return {
        type: bg_img_preinstall.type,
        path: bg_img_preinstall.path
    };
}

function normalizeBgImg(bg_img) {
    var valid_types = ["1", "2", "3", "4", "5"];
    if (!bg_img || valid_types.indexOf(String(bg_img.type)) === -1) return null;

    var normalized = {
        type: String(bg_img.type),
        path: typeof bg_img.path === "string" ? bg_img.path.trim() : ""
    };

    if (normalized.type === "5" && !normalized.path) return null;
    return normalized;
}

// 获取背景图片
function getBgImg() {
    var bg_img_local = Cookies.get(searchCookieKeys.background);
    if (bg_img_local && bg_img_local !== "{}") {
        try {
            var saved_bg_img = normalizeBgImg(JSON.parse(bg_img_local));
            if (saved_bg_img) return saved_bg_img;
        } catch (err) {
            console.warn('Wallpaper preference parse failed', err);
        }
    }

    var default_bg_img = getDefaultBgImg();
    setBgImg(default_bg_img);
    return default_bg_img;
}

// 设置背景图片
function setBgImg(bg_img) {
    if (bg_img) {
        setSearchCookie(searchCookieKeys.background, bg_img);
        return true;
    }
    return false;
}

function getWallpaperSource(bg_img) {
    switch (bg_img["type"]) {
        case "1":
            var pictures = [
                './img/background1.webp',
                './img/background2.webp',
                './img/background3.webp',
                './img/background4.webp',
                './img/background5.webp',
                './img/background6.webp',
                './img/background7.webp',
                './img/background8.webp',
                './img/background9.webp',
                './img/background10.webp'
            ];
            return pictures[Math.floor(Math.random() * pictures.length)];
        case "2":
            return 'https://api.dujin.org/bing/1920.php';
        case "3":
            return 'https://api.ixiaowai.cn/gqapi/gqapi.php';
        case "4":
            return 'https://api.ixiaowai.cn/api/api.php';
        case "5":
            return bg_img["path"];
        default:
            return 'https://api.dujin.org/bing/1920.php';
    }
}

function applyWallpaper(bg_img, preload) {
    var bg = document.getElementById('bg');
    var source = getWallpaperSource(bg_img);
    var request_id = ++wallpaper_request_id;

    if (!bg || !source) {
        return Promise.reject(new Error('Wallpaper source is unavailable'));
    }

    var absolute_source;
    try {
        absolute_source = new URL(source, document.baseURI).href;
    } catch (err) {
        return Promise.reject(err);
    }

    if ((bg.currentSrc || bg.src) === absolute_source && bg.complete && bg.naturalWidth > 0) {
        bg.classList.remove('error');
        return Promise.resolve(true);
    }

    if (!preload) {
        return new Promise(function (resolve, reject) {
            function cleanup() {
                bg.removeEventListener('load', handleLoad);
                bg.removeEventListener('error', handleError);
            }

            function handleLoad() {
                cleanup();
                if (request_id !== wallpaper_request_id) return resolve(false);
                bg.classList.remove('error');
                resolve(true);
            }

            function handleError() {
                cleanup();
                if (request_id !== wallpaper_request_id) return resolve(false);
                reject(new Error('Wallpaper failed to load'));
            }

            bg.addEventListener('load', handleLoad, { once: true });
            bg.addEventListener('error', handleError, { once: true });
            bg.classList.remove('error');
            bg.src = source;

            if (bg.complete) setTimeout(function () {
                if (bg.naturalWidth > 0) handleLoad();
                else handleError();
            }, 0);
        });
    }

    return new Promise(function (resolve, reject) {
        var preloaded_bg = new Image();

        preloaded_bg.onload = function () {
            var decode_task = typeof preloaded_bg.decode === 'function'
                ? preloaded_bg.decode().catch(function () {})
                : Promise.resolve();

            decode_task.then(function () {
                if (request_id !== wallpaper_request_id) return resolve(false);
                bg.classList.remove('error');
                bg.src = preloaded_bg.src;
                resolve(true);
            });
        };

        preloaded_bg.onerror = function () {
            if (request_id !== wallpaper_request_id) return resolve(false);
            reject(new Error('Wallpaper failed to load'));
        };

        preloaded_bg.src = source;
    });
}

function setBgImgInit() {
    var bg_img = getBgImg();
    $("input[name='wallpaper-type'][value=" + bg_img["type"] + "]").prop('checked', true);

    if (bg_img["type"] === "5") {
        $("#wallpaper-url").val(bg_img["path"]);
        $("#wallpaper-button").show();
        $("#wallpaper_url").show();
    } else {
        $("#wallpaper_url").hide();
        $("#wallpaper-button").hide();
    }

    return applyWallpaper(bg_img, false);
}

// 在 DOM 解析完成前启动背景图请求，供载入进度统一等待。
window.yumeBackgroundReady = setBgImgInit();

var wallpaper_description_keys = {
    "1": "XSMRBZ",
    "2": "XSMRYT",
    "3": "XSSJFJ",
    "4": "XSJ2CY",
    "5": "ZDYBZDZ"
};

function applyAndRememberWallpaper(bg_img) {
    setBgImg(bg_img);

    return applyWallpaper(bg_img, true)
        .then(function (applied) {
            if (!applied) return false;
            iziToast.show({
                message: translate('BZSZCG')
            });
            return true;
        })
        .catch(function (err) {
            console.warn('Wallpaper switch failed', err);
            iziToast.show({
                message: translate('BZJZSB')
            });
            return false;
        });
}

// 搜索框高亮
function focusWd() {
    $("body").addClass("onsearch");
}

// 搜索框取消高亮
function blurWd() {
    $("body").removeClass("onsearch");
    //隐藏输入
    $(".wd").val("");
    //隐藏搜索建议
    $("#keywords").hide();
}

// 搜索建议提示
function keywordReminder() {
    var keyword = $(".wd").val();
    if (keyword != "") {
        $.ajax({
            url: 'https://suggestion.baidu.com/su?wd=' + keyword,
            dataType: 'jsonp',
            jsonp: 'cb', //回调函数的参数名(键值)key
            success: function (data) {
                //获取宽度
                $("#keywords").css("width", $('.sou').width());
                $("#keywords").empty().show();
                $.each(data.s, function (i, val) {
                    $('#keywords').append(`<div class="keyword" data-id="${i + 1}"><i class='iconfont icon-sousuo'></i>${val}</div>`);
                });
                $("#keywords").attr("data-length", data.s["length"]);
                $(".keyword").click(function () {
                    $(".wd").val($(this).text());
                    $("#search-submit").click();
                });
            },
            error: function () {
                $("#keywords").empty().show();
                $("#keywords").hide();
            }
        })
    } else {
        $("#keywords").empty().show();
        $("#keywords").hide();
    }
}

// 搜索框数据加载
function searchData() {
    var se_default = getSeDefault();
    var se_list = getSeList();
    var defaultSe = se_list[se_default];
    if (defaultSe) {
        $(".search").attr("action", defaultSe["url"]);
        $("#icon-se").attr("class", defaultSe["icon"]);
        $(".wd").attr("name", defaultSe["name"]);
    }

    // 判断窗口大小，添加输入框自动完成
    // var wid = $("body").width();
    // if (wid < 640) {
    //     $(".wd").attr('autocomplete', 'off');
    // } else {
    //     $(".wd").focus();
    //     focusWd();
    // }
}

// 搜索引擎列表加载
function seList() {
    var html = "";
    var se_list = getSeList();
    for (var i in se_list) {
        html += `<div class='se-li' data-url='${se_list[i]["url"]}' data-name='${se_list[i]["name"]}' data-icon='${se_list[i]["icon"]}'>
        <a class='se-li-text'><i id='icon-sou-list' class='${se_list[i]["icon"]}'></i><span>${getLocalizedTitle(se_list[i])}</span></a></div>`;
    }
    $(".search-engine-list").html(html);
}

// 设置-搜索引擎列表加载
function setSeInit() {
    var se_default = getSeDefault();
    var se_list = getSeList();
    var html = "";
    for (var i in se_list) {
        var tr = `<div class='se_list_div'><div class='se_list_num'>${i}</div>`;
        if (i === se_default) {
            tr = `<div class='se_list_div'><div class='se_list_num'>
            <i class='iconfont icon-home'></i></div>`;
        }
        tr += `<div class='se_list_name'>${getLocalizedTitle(se_list[i])}</div>
        <div class='se_list_button'>
        <button class='set_se_default' value='${i}' style='border-radius: 8px 0px 0px 8px;'>
        <i class='iconfont icon-home'></i></button>
        <button class='edit_se' value='${i}'>
        <i class='iconfont icon-xiugai'></i></button>
        <button class='delete_se' value='${i}' style='border-radius: 0px 8px 8px 0px;'>
        <i class='iconfont icon-delete'></i></button></div>
        </div>`;
        html += tr;
    }
    $(".se_list_table").html(html);
}

// 获取快捷方式列表
function getQuickList() {
    var quick_list_local = Cookies.get(searchCookieKeys.quickLinks);
    if (quick_list_local !== "{}" && quick_list_local) {
        return JSON.parse(quick_list_local);
    } else {
        setQuickList(quick_list_preinstall);
        return quick_list_preinstall;
    }
}

// 设置快捷方式列表
function setQuickList(quick_list) {
    if (quick_list) {
        setSearchCookie(searchCookieKeys.quickLinks, quick_list);
        return true;
    }
    return false;
}

// 快捷方式数据加载
function quickData() {
    var html = "";
    var quick_list = getQuickList();
    for (var i in quick_list) {
        html += `<div class="quick">
                    <a href="${quick_list[i]['url']}" target="_blank">${quick_list[i]['title']}</a>
                </div>`;
    }
    $(".quick-all").html(html + `<div class="quick"><a id="set-quick"><i class="iconfont icon-tianjia-"></i></a></div>`);
}

// 设置-快捷方式加载
function setQuickInit() {
    var quick_list = getQuickList();
    var html = "";
    for (var i in quick_list) {
        tr = `
        <div class='quick_list_div'>
            <div class='quick_list_div_num'>${i}</div>
            <div class='quick_list_div_name'>${quick_list[i]['title']}</div>
            <div class='quick_list_div_button'>
                <button class='edit_quick' value='${i}' style='border-radius: 8px 0px 0px 8px;'>
                <i class='iconfont icon-xiugai'></i></button>
                <button class='delete_quick' value='${i}' style='border-radius: 0px 8px 8px 0px;'>
                <i class='iconfont icon-delete'></i></button>
            </div>
        </div>`;
        html += tr;
    }
    $(".quick_list_table").html(html);
}

/**
 * 下载文本为文件
 * @param filename 文件名
 * @param text     内容
 */
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// 打开设置
function openSet() {
    $("#menu").addClass('on');

    openBox();

    //更改设置图标
    $("#icon-menu").attr("class", "iconfont icon-home");
    $("#menu").attr({
        "title": translate('HOME'),
        "aria-label": translate('HOME')
    });

    //隐藏书签打开设置
    $(".mark").css({
        "display": "none",
    });
    $(".set").css({
        "display": "flex",
    });
}

// 关闭设置
function closeSet() {
    $("#menu").removeClass('on');

    closeBox();

    //更改设置图标
    $("#icon-menu").attr("class", "iconfont icon-shezhi");
    $("#menu").attr({
        "title": translate('SETTINGS'),
        "aria-label": translate('SETTINGS')
    });

    //隐藏设置
    $(".set").css({
        "display": "none",
    });

    // 刷新主页数据
    seList();
    quickData();
}

// 书签显示
function openBox() {
    $("#content").addClass('box');
    $(".mark").css({
        "display": "flex",
    });
    //时间上移
    $(".tool-all").css({
        "transform": 'translateY(-160%)'
    });
    //背景模糊
    $('#bg').css({
        "transform": 'scale(1.08)',
        "filter": "blur(10px)",
        "transition": "ease 0.3s",
    });
}

// 书签关闭
function closeBox() {
    $("#content").removeClass('box');
    $(".mark").css({
        "display": "none",
    });
    //时间下移
    $(".tool-all").css({
        "transform": 'translateY(-120%)'
    });
    //背景模糊
    $('#bg').css({
        "transform": 'scale(1)',
        "filter": "blur(0px)",
        "transition": "ease 0.3s",
    });
}

//显示设置搜索引擎列表
function showSe() {
    $(".se_list").show();
    $(".se_add_preinstall").show();
}

//隐藏设置搜索引擎列表
function hideSe() {
    $(".se_list").hide();
    $(".se_add_preinstall").hide();
}

//显示设置快捷方式列表
function showQuick() {
    $(".quick_list").show();
    $(".se_add_preinstalls").show();
}

//隐藏设置快捷方式列表
function hideQuick() {
    $(".quick_list").hide();
    $(".se_add_preinstalls").hide();
}


$(document).ready(function () {

    // 搜索框数据加载
    searchData();

    // 搜索引擎列表加载
    seList();

    // 快捷方式数据加载
    quickData();

    // 点击事件
    $(document).on('click', function (e) {
        // 选择搜索引擎点击
        if ($(".search-engine").is(":hidden") && $(".se").is(e.target) || $(".search-engine").is(":hidden") && $("#icon-se").is(e.target)) {
            if ($(".se").is(e.target) || $("#icon-se").is(e.target)) {
                //获取宽度
                $(".search-engine").css("width", $('.sou').width() - 30);
                //出现动画
                $(".search-engine").slideDown(160);
            }
        } else {
            if (!$(".search-engine").is(e.target) && $(".search-engine").has(e.target).length === 0) {
                $(".search-engine").slideUp(160);
            }
        }

        // 自动提示隐藏
        if (!$(".sou").is(e.target) && $(".sou").has(e.target).length === 0) {
            $("#keywords").hide();
        }
    });

    // 时间点击
    $("#time_text").click(function () {
        if ($("#content").attr("class") === "box") {
            closeBox();
            closeSet();
            blurWd();
        } else {
            openBox();
        }
    });

    // 搜索引擎列表点击
    $(".search-engine-list").on("click", ".se-li", function () {
        var url = $(this).attr('data-url');
        var name = $(this).attr('data-name');
        var icon = $(this).attr('data-icon');
        $(".search").attr("action", url);
        $(".wd").attr("name", name);
        $("#icon-se").attr("class", icon);
        $(".search-engine").slideUp(160);
    });

    // 搜索引擎列表点击
    $(".search-engine-list").on("click", ".se-li", function () {
        var url = $(this).attr('data-url');
        var name = $(this).attr('data-name');
        var icon = $(this).attr('data-icon');
        $(".search").attr("action", url);
        $(".wd").attr("name", name);
        $("#icon-se").attr("class", icon);
        $(".search-engine").slideUp(160);
    });

    // 搜索框点击事件
    $(document).on('click', '.sou', function () {
        focusWd();
        $(".search-engine").slideUp(160);
    });

    $(document).on('click', '.wd', function () {
        focusWd();
        keywordReminder();
        $(".search-engine").slideUp(160);
    });

    // 点击其他区域关闭事件
    $(document).on('click', '.close_sou', function () {
        blurWd();
        closeSet();
    });

    // 点击搜索引擎时隐藏自动提示
    $(document).on('click', '.se', function () {
        $('#keywords').toggle();
    });

    // 恢复自动提示
    $(document).on('click', '.se-li', function () {
        $('#keywords').show();
    });

    // 自动提示 (调用百度 api）
    $('.wd').keyup(function (event) {
        var key = event.keyCode;
        // 屏蔽上下键
        var shieldKey = [38, 40];
        if (shieldKey.includes(key)) return;
        keywordReminder();
    });

    // 点击自动提示的搜索建议
    $("#keywords").on("click", ".wd", function () {
        var wd = $(this).text();
        $(".wd").val(wd);
        $(".search").submit();
        //隐藏输入
        $(".wd").val("");
        $("#keywords").hide();
    });

    // 自动提示键盘方向键选择操作
    $(".wd").keydown(function (event) { //上下键获取焦点
        var key = event.keyCode;
        if ($.trim($(this).val()).length === 0) return;

        var id = $(".choose").attr("data-id");
        if (id === undefined) id = 0;

        if (key === 38) {
            /*向上按钮*/
            id--;
        } else if (key === 40) {
            /*向下按钮*/
            id++;
        } else {
            return;
        }
        var length = $("#keywords").attr("data-length");
        if (id > length) id = 1;
        if (id < 1) id = length;

        $(".keyword[data-id=" + id + "]").addClass("choose").siblings().removeClass("choose");
        $(".wd").val($(".keyword[data-id=" + id + "]").text());
    });

    // 菜单点击
    $("#menu").click(function () {
        if ($(this).attr("class") === "on") {
            closeSet();
        } else {
            openSet();

            // 设置内容加载
            setSeInit(); //搜索引擎设置
            setQuickInit(); //快捷方式设置
        }
    });

    // 快捷方式添加按钮点击
    $("#set-quick").click(function () {
        openSet();

        // 设置内容加载
        setSeInit(); //搜索引擎设置
        setQuickInit(); //快捷方式设置

        //添加快捷方式
        $("#set-quick-menu").trigger('click');
        $(".set_quick_list_add").trigger('click');
    });

    // 修改默认搜索引擎
    $(".se_list_table").on("click", ".set_se_default", function () {
        var name = $(this).val();
        setSearchCookie(searchCookieKeys.defaultSearchEngine, name);
        iziToast.show({
            timeout: 8000,
            message: translate('SFSZMRSS'),
            buttons: [
                [makeToastButton("QUEREN"), function (instance, toast) {
                    setSeInit();
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                    iziToast.show({
                        message: translate('SZCG')
                    });
                    setTimeout(function () {
                        window.location.reload()
                    }, 1000);
                }, true],
                [makeToastButton("QUXIAO"), function (instance, toast) {
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                }]
            ]
        });
    });

    // 搜索引擎添加
    $(".set_se_list_add").click(function () {
        $(".se_add_content input").val("");

        hideSe();
        $(".se_add_content").show();
    });

    // 搜索引擎保存
    $(".se_add_save").click(function () {
        var key_inhere = $(".se_add_content input[name='key_inhere']").val();
        var key = $(".se_add_content input[name='key']").val();
        var title = $(".se_add_content input[name='title']").val();
        var url = $(".se_add_content input[name='url']").val();
        var name = $(".se_add_content input[name='name']").val();
        //var icon = $(".se_add_content input[name='icon']").val();
        var icon = "iconfont icon-wangluo";

        var num = /^\+?[1-9][0-9]*$/;
        if (!num.test(key)) {
            iziToast.show({
                timeout: 2000,
                message: translate('XUHAO') + key + translate('NOTZZS')
            });
            return;
        }

        var se_list = getSeList();

        if (se_list[key]) {
            iziToast.show({
                timeout: 8000,
                message: translate('SSYQ') + key + translate('HAVESZFG'),
                buttons: [
                    [makeToastButton("QUEREN"), function (instance, toast) {
                        se_list[key] = {
                            title: title,
                            url: url,
                            name: name,
                            icon: icon,
                        };
                        setSeList(se_list);
                        setSeInit();
                        $(".se_add_content").hide();
                        //显示列表
                        showSe();

                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                        iziToast.show({
                            message: translate('FGCG')
                        });
                    }, true],
                    [makeToastButton("QUXIAO"), function (instance, toast) {
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                    }]
                ]
            });
            return;
        }

        if (key_inhere && key !== key_inhere) {
            delete se_list[key_inhere];
        }

        se_list[key] = {
            title: title,
            url: url,
            name: name,
            icon: icon,
        };
        setSeList(se_list);
        setSeInit();
        iziToast.show({
            timeout: 2000,
            message: translate('TJCG')
        });
        $(".se_add_content").hide();
        showSe();
    });

    // 关闭表单
    $(".se_add_cancel").click(function () {
        $(".se_add_content").hide();

        //显示列表
        showSe();
    });

    // 搜索引擎修改
    $(".se_list").on("click", ".edit_se", function () {

        var se_list = getSeList();
        var key = $(this).val();
        $(".se_add_content input[name='key_inhere']").val(key);
        $(".se_add_content input[name='key']").val(key);
        $(".se_add_content input[name='title']").val(se_list[key]["title"]);
        $(".se_add_content input[name='url']").val(se_list[key]["url"]);
        $(".se_add_content input[name='name']").val(se_list[key]["name"]);
        // $(".se_add_content input[name='icon']").val("iconfont icon-Earth");

        //隐藏列表
        hideSe();

        $(".se_add_content").show();
    });

    // 搜索引擎删除
    $(".se_list").on("click", ".delete_se", function () {
        var se_default = getSeDefault();
        var key = $(this).val();
        if (key == se_default) {
            iziToast.show({
                message: translate('CNRMR')
            });
        } else {
            iziToast.show({
                timeout: 8000,
                message: translate('SSYQ') + key + translate('SFSC'),
                buttons: [
                    [makeToastButton("QUEREN"), function (instance, toast) {
                        var se_list = getSeList();
                        delete se_list[key];
                        setSeList(se_list);
                        setSeInit();
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                        iziToast.show({
                            message: translate('SCCG')
                        });
                    }, true],
                    [makeToastButton("QUXIAO"), function (instance, toast) {
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                    }]
                ]
            });
        }
    });

    // 恢复预设搜索引擎
    $(".set_se_list_preinstall").click(function () {
        iziToast.show({
            timeout: 8000,
            message: translate('XYYQQK'),
            buttons: [
                [makeToastButton("QUEREN"), function (instance, toast) {
                    setSeList(se_list_preinstall);
                    setSearchCookie(searchCookieKeys.defaultSearchEngine, 1);
                    setSeInit();
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                    iziToast.show({
                        message: translate('CZCG')
                    });
                    setTimeout(function () {
                        window.location.reload()
                    }, 1000);
                }, true],
                [makeToastButton("QUXIAO"), function (instance, toast) {
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                }]
            ]
        });
    });

    // 设置-快捷方式添加
    $(".set_quick_list_add").click(function () {
        $(".quick_add_content input").val("");
        $(".quick_add_content").show();

        //隐藏列表
        hideQuick();
    });

    // 设置-快捷方式保存
    $(".quick_add_save").click(function () {
        var key_inhere = $(".quick_add_content input[name='key_inhere']").val();
        var key = $(".quick_add_content input[name='key']").val();
        var title = $(".quick_add_content input[name='title']").val();
        var url = $(".quick_add_content input[name='url']").val();
        var img = $(".quick_add_content input[name='img']").val();

        var num = /^\+?[1-9][0-9]*$/;
        if (!num.test(key)) {
            iziToast.show({
                timeout: 2000,
                message: translate('KJFS') + key + translate('NOTZZS')
            });
            return;
        }

        var quick_list = getQuickList();

        if (quick_list[key]) {
            iziToast.show({
                timeout: 8000,
                message: translate('KJFS') + key + translate('HAVESZFG'),
                buttons: [
                    [makeToastButton("QUEREN"), function (instance, toast) {
                        quick_list[key] = {
                            title: title,
                            url: url,
                            img: img,
                        };
                        setQuickList(quick_list);
                        setQuickInit();
                        $(".quick_add_content").hide();
                        //显示列表
                        showQuick();

                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                        iziToast.show({
                            message: translate('FGCG')
                        });
                    }, true],
                    [makeToastButton("QUXIAO"), function (instance, toast) {
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                    }]
                ]
            });
            return;
        }

        if (key_inhere && key != key_inhere) {
            delete quick_list[key_inhere];
        }

        quick_list[key] = {
            title: title,
            url: url,
            img: img,
        };
        setQuickList(quick_list);
        setQuickInit();
        $(".quick_add_content").hide();
        iziToast.show({
            timeout: 2000,
            message: translate('TJCG')
        });

        //显示列表
        showQuick();
    });

    // 设置-快捷方式关闭添加表单
    $(".quick_add_cancel").click(function () {
        $(".quick_add_content").hide();

        //显示列表
        showQuick();
    });

    //恢复预设快捷方式
    $(".set_quick_list_preinstall").click(function () {
        iziToast.show({
            timeout: 8000,
            message: translate('QKKJFS'),
            buttons: [
                [makeToastButton("QUEREN"), function (instance, toast) {
                    setQuickList(quick_list_preinstall);
                    setQuickInit();
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                    iziToast.show({
                        timeout: 2000,
                        message: translate('CZCG')
                    });
                    // setTimeout(function () {
                    //     window.location.reload()
                    // }, 1000);
                }, true],
                [makeToastButton("QUXIAO"), function (instance, toast) {
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                }]
            ]
        });
    });

    // 快捷方式修改
    $(".quick_list").on("click", ".edit_quick", function () {

        var quick_list = getQuickList();
        var key = $(this).val();
        $(".quick_add_content input[name='key_inhere']").val(key);
        $(".quick_add_content input[name='key']").val(key);
        $(".quick_add_content input[name='title']").val(quick_list[key]["title"]);
        $(".quick_add_content input[name='url']").val(quick_list[key]["url"]);
        $(".quick_add_content input[name='img']").val(quick_list[key]["img"]);

        //隐藏列表
        hideQuick();

        $(".quick_add_content").show();
    });

    // 快捷方式删除
    $(".quick_list").on("click", ".delete_quick", function () {

        var key = $(this).val();

        iziToast.show({
            timeout: 8000,
            message: translate('KJFS') + key + translate('SFSC'),
            buttons: [
                [makeToastButton("QUEREN"), function (instance, toast) {
                    var quick_list = getQuickList();
                    delete quick_list[key];
                    setQuickList(quick_list);
                    setQuickInit();
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                    iziToast.show({
                        timeout: 2000,
                        message: translate('SCCG')
                    });
                }, true],
                [makeToastButton("QUXIAO"), function (instance, toast) {
                    instance.hide({
                        transitionOut: 'flipOutX',
                    }, toast, 'buttonName');
                }]
            ]
        });
    });

    // 壁纸设置：选择后立即预载并切换，同时保存本次选择。
    $("#wallpaper").on("click", ".set-wallpaper", function () {
        var type = $(this).val();
        var bg_img = getBgImg();
        bg_img["type"] = type;

        $('#wallpaper_text').html(translate(wallpaper_description_keys[type]));

        if (type === "5") {
            $("#wallpaper_url").fadeIn(100);
            $("#wallpaper-button").fadeIn(100);
            $("#wallpaper-url").val(bg_img["path"]);
            if (bg_img["path"]) applyAndRememberWallpaper(bg_img);
        } else {
            $("#wallpaper_url").fadeOut(300);
            $("#wallpaper-button").fadeOut(300);
            applyAndRememberWallpaper(bg_img);
        }
    });

    // 自定义壁纸设置保存
    $(".wallpaper_save").click(function () {
        var url = $("#wallpaper-url").val();
        var reg = /^http(s)?:\/\/(([\w-]+\.)+[\w-]|localhost)+(:[0-9]{1,5})?(\/[\w- ./?%&=]*)?$/g;
        if (!reg.test(url)) {
            iziToast.show({
                message: translate('QSRZQLJ'),
            });
        } else {
            var bg_img = getBgImg();
            bg_img["type"] = "5";
            bg_img["path"] = url;
            $('#wallpaper_text').html(translate('ZDYBZDZ'));
            applyAndRememberWallpaper(bg_img);
        }
    });

    // 我的数据导出
    $("#my_data_out").click(function () {
        var cookies = {};
        Object.keys(searchCookieKeys).forEach(function (setting) {
            var cookieName = searchCookieKeys[setting];
            var value = Cookies.get(cookieName);
            if (typeof value === 'string') cookies[cookieName] = value;
        });
        var json = JSON.stringify(cookies);
        download("Yume-Search-back-up-" + $.now() + ".json", json);
        iziToast.show({
            timeout: 2000,
            message: translate('YDCCG')
        });
    });

    // 我的数据导入 点击触发文件选择
    $("#my_data_in").click(function () {
        $("#my_data_file").click();
    });

    // 选择文件后读取文件内容
    $("#my_data_file").change(function () {
        var selectedFile = document.getElementById('my_data_file').files[0];
        //var name = selectedFile.name;//读取选中文件的文件名
        //var size = selectedFile.size;//读取选中文件的大小
        //console.log("文件名:"+name+" 大小:"+size);

        var reader = new FileReader(); //这是核心,读取操作就是由它完成.
        reader.readAsText(selectedFile); //读取文件的内容,也可以读取文件的URL
        reader.onload = function () {
            //当读取完成后回调这个函数,然后此时文件的内容存储到了result中,直接操作即可
            //console.log(this.result);

            // json 格式校验
            var mydata;
            try {
                mydata = JSON.parse(this.result);
            } catch (e) {
                iziToast.show({
                    timeout: 2000,
                    message: translate('SJJXYC')
                });
                return;
            }
            if (!mydata || typeof mydata !== 'object' || Array.isArray(mydata)) {
                iziToast.show({
                    timeout: 2000,
                    message: translate('SJGSCW')
                });
                return;
            }

            var importKeys = Object.keys(searchCookieImportMap).filter(function (key) {
                return Object.prototype.hasOwnProperty.call(mydata, key) && typeof mydata[key] === 'string';
            });
            if (!importKeys.length) {
                iziToast.show({
                    timeout: 2000,
                    message: translate('SJGSCW')
                });
                return;
            }

            iziToast.show({
                timeout: 8000,
                message: translate('SJFGQR'),
                buttons: [
                    [makeToastButton("QUEREN"), function (instance, toast) {
                        importKeys.forEach(function (key) {
                            setSearchCookie(searchCookieImportMap[key], mydata[key]);
                        });
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                        iziToast.show({
                            timeout: 2000,
                            message: translate('DRCG')
                        });
                        setTimeout(function () {
                            window.location.reload()
                        }, 1000);
                    }, true],
                    [makeToastButton("QUXIAO"), function (instance, toast) {
                        instance.hide({
                            transitionOut: 'flipOutX',
                        }, toast, 'buttonName');
                        setTimeout(function () {
                            window.location.reload()
                        }, 1000);
                    }]
                ]
            });
        }
    });
});
