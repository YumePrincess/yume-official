// 背景图片 Cookies 
function setBgImg(bg_img) {
    if (bg_img) {
        Cookies.set('bg_img', bg_img, {
            expires: 36500
        });
        return true;
    }
    return false;
}

// 获取背景图片 Cookies
function getBgImg() {
    var bg_img_local = Cookies.get('bg_img');
    if (bg_img_local && bg_img_local !== "{}") {
        return JSON.parse(bg_img_local);
    } else {
        setBgImg(bg_img_preinstall);
        return bg_img_preinstall;
    }
}

var bg_img_preinstall = {
    "type": "5", // 1:默认背景 2:每日一图 3:随机风景 4:随机动漫
    "path": "", //自定义图片
};


// 更改背景图片
function setBgImgInit() {
    var bg_img = getBgImg();
    $("input[name='wallpaper-type'][value=" + bg_img["type"] + "]").click();

    switch (bg_img["type"]) {
        case "1":
            var pictures = new Array();
            /*
			pictures[0] = './img/background1.webp';
            pictures[1] = './img/background2.webp';
            pictures[2] = './img/background3.webp';
            pictures[3] = './img/background4.webp';
            pictures[4] = './img/background5.webp';
            pictures[5] = './img/background6.webp';
            pictures[6] = './img/background7.webp';
            pictures[7] = './img/background8.webp';
            pictures[8] = './img/background9.webp';
            pictures[9] = './img/background10.webp';
			*/
			pictures[0] = './img/NIKKI/1.jpg';
            pictures[1] = './img/NIKKI/2.jpg';
            pictures[2] = './img/NIKKI/3.jpg';
            pictures[3] = './img/NIKKI/4.jpg';
            pictures[4] = './img/NIKKI/5.jpg';
            pictures[5] = './img/NIKKI/6.jpg';
            pictures[6] = './img/NIKKI/7.jpg';
            pictures[7] = './img/NIKKI/8.jpg';
            pictures[8] = './img/NIKKI/9.jpg';
            pictures[9] = './img/NIKKI/10.jpg';
            var rd = Math.floor(Math.random() * 10);
            $('#bg').attr('src', pictures[rd]) //随机默认壁纸
            break;
        case "2":
            $('#bg').attr('src', 'https://api.dujin.org/bing/1920.php'); //必应每日
            break;
        case "3":
            $('#bg').attr('src', 'https://api.ixiaowai.cn/gqapi/gqapi.php'); //随机风景
            break;
        case "4":
            $('#bg').attr('src', 'https://api.ixiaowai.cn/api/api.php'); //随机动漫
            break;
		case "5":
            var pictures = new Array();
			pictures[0] = './img/MHFJ/1.jpg';
            pictures[1] = './img/MHFJ/2.jpg';
            pictures[2] = './img/MHFJ/3.jpg';
            pictures[3] = './img/MHFJ/4.jpg';
            pictures[4] = './img/MHFJ/5.jpg';
            pictures[5] = './img/MHFJ/6.jpg';
            pictures[6] = './img/MHFJ/7.jpg';
            pictures[7] = './img/MHFJ/8.jpg';
            pictures[8] = './img/MHFJ/9.jpg';
            pictures[9] = './img/MHFJ/10.jpg';
            var rd = Math.floor(Math.random() * 10);
            $('#bg').attr('src', pictures[rd]) //随机默认壁纸
            break;	
    }
}

$(document).ready(function () {
    // 壁纸数据加载
    setBgImgInit();
    // 设置背景图片
    $("#wallpaper").on("click", ".set-wallpaper", function () {
        var type = $(this).val();
        var bg_img = getBgImg();
        bg_img["type"] = type;

        if (type === "1") {
            setBgImg(bg_img);
            var pictures = new Array();
			/*
            pictures[0] = './img/background1.webp';
            pictures[1] = './img/background2.webp';
            pictures[2] = './img/background3.webp';
            pictures[3] = './img/background4.webp';
            pictures[4] = './img/background5.webp';
            pictures[5] = './img/background6.webp';
            pictures[6] = './img/background7.webp';
            pictures[7] = './img/background8.webp';
            pictures[8] = './img/background9.webp';
            pictures[9] = './img/background10.webp';
			*/
			pictures[0] = './img/NIKKI/1.jpg';
            pictures[1] = './img/NIKKI/2.jpg';
            pictures[2] = './img/NIKKI/3.jpg';
            pictures[3] = './img/NIKKI/4.jpg';
            pictures[4] = './img/NIKKI/5.jpg';
            pictures[5] = './img/NIKKI/6.jpg';
            pictures[6] = './img/NIKKI/7.jpg';
            pictures[7] = './img/NIKKI/8.jpg';
            pictures[8] = './img/NIKKI/9.jpg';
            pictures[9] = './img/NIKKI/10.jpg';
            var rd = Math.floor(Math.random() * 10);
            $('#bg').attr('src', pictures[rd]) //随机默认壁纸
            iziToast.show({
                message: translate('BIZHISHEDINGCHENGGONG'),
            });
        }

        if (type === "2") {
            setBgImg(bg_img);
            $('#bg').attr('src', 'https://api.dujin.org/bing/1920.php'); //必应每日
            iziToast.show({
                message: translate('BIZHISHEDINGCHENGGONG'),
            });
        }

        if (type === "3") {
            setBgImg(bg_img);
            $('#bg').attr('src', 'https://tu.ltyuanfang.cn/api/fengjing.php'); //随机风景
            iziToast.show({
                message: translate('BIZHISHEDINGCHENGGONG'),
            });
        }

        if (type === "4") {
            setBgImg(bg_img);
            $('#bg').attr('src', 'https://www.dmoe.cc/random.php'); //随机动漫
            iziToast.show({
                message: translate('BIZHISHEDINGCHENGGONG'),
            });
        }
		
		if (type === "5") {
            setBgImg(bg_img);
            var pictures = new Array();
            pictures[0] = './img/MHFJ/1.jpg';
            pictures[1] = './img/MHFJ/2.jpg';
            pictures[2] = './img/MHFJ/3.jpg';
            pictures[3] = './img/MHFJ/4.jpg';
            pictures[4] = './img/MHFJ/5.jpg';
            pictures[5] = './img/MHFJ/6.jpg';
            pictures[6] = './img/MHFJ/7.jpg';
            pictures[7] = './img/MHFJ/8.jpg';
            pictures[8] = './img/MHFJ/9.jpg';
            pictures[9] = './img/MHFJ/10.jpg';
            var rd = Math.floor(Math.random() * 10);
            $('#bg').attr('src', pictures[rd]) //随机默认壁纸
            iziToast.show({
                message: translate('BIZHISHEDINGCHENGGONG'),
            });
        }
    });
});