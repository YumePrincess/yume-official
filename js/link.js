// 站点数据
const siteLinks = [
    { nameKey: "MESSAGE", name: "雨梦Message", link: "https://message.yume.zone/", iconType: "iconfont", icon: "icon-blog-solid" },
	  { nameKey: "YSOCIAL", name: "雨梦Social", link: "https://social.yume.zone/", iconType: "iconfont2", icon: "icon-google-circles" },
	  { nameKey: "AI", name: "雨梦AI", link: "https://ai.yume.zone/", icon: "icon-z_shangpinheji" },
	  { nameKey: "CLOUD", name: "雨梦网盘", link: "https://drive.yume.zone/", icon: "icon-cloud" },
	  { nameKey: "NAV", name: "雨梦搜索", link: "https://nav.yume.zone/", iconType: "iconfont", icon: "icon-a-daohangzhiyindingwei-05" },
	  { nameKey: "STORE", name: "雨梦Store", link: "https://store.yume.zone/", iconType: "iconfont2", icon: "icon-shop" },
	  { nameKey: "YPAY", name: "雨梦支付", link: "https://pay.yume.zone/", iconType: "iconfont2", icon: "icon-wallet", showLang: ["fr","ja","zh-tw"] },
	  { nameKey: "YAAA", name: "雨梦秋雨加速器", link: "https://akiame.yume.zone/", iconType: "iconfont2", icon: "icon-data-science", showLang: ["fr","ja","zh-tw"] },
    { nameKey: "YFDROP", name: "雨梦Drop", link: "https://drop.yume.zone/", iconType: "iconfont2", icon: "icon-menu-outline" },
    { nameKey: "YWIKI", name: "雨梦Wiki", link: "https://wiki.yume.zone/", iconType: "iconfont2", icon: "icon-doc-text" },
    { nameKey: "YACCOUNT", name: "雨梦One", link: "https://one.yume.zone/realms/yume/account", iconType: "iconfont2", icon: "icon-id-badge" }
];

// 分页（每页 6 个）
function paginate(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

function filterByLang(data) {
  return data.filter(item => {
    if (!item.showLang) return true; // 没写 = 全显示
    return item.showLang.includes(lang);
  });
}

const pages = paginate(siteLinks, 6);

let swiperInstance = null;

function renderSwiper() {
  const wrapper = document.getElementById("link-wrapper");
  wrapper.innerHTML = ""; // 清空

  const filtered = filterByLang(siteLinks);

  const pages = paginate(filtered, 6);

  pages.forEach(page => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide";

    let html = "";

    for (let i = 0; i < 6; i += 3) {
      const rowItems = page.slice(i, i + 3);
      if (rowItems.length === 0) continue;

      html += `<div class="row">`;

      rowItems.forEach((item, index) => {
        const colClass = "col col-3";

        html += `
          <div class="${colClass}">
            <a href="${item.link}" target="_blank">
              <div class="link-card cards">
                <i class="${item.iconType || 'iconfont'} ${item.icon}"></i>
                <span class="link-name" key="${item.nameKey}">
                  ${translate(item.nameKey)}
                </span>
              </div>
            </a>
          </div>
        `;
      });

      html += `</div>`;
    }

    slide.innerHTML = html;
    wrapper.appendChild(slide);
  });

  // 🔴 销毁旧实例
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
  }

  // 🔴 重新初始化
  swiperInstance = new Swiper(".swiper", {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    mousewheel: true
  });
}

// 初始化 Swiper
document.addEventListener("DOMContentLoaded", () => {
	renderSwiper();
});