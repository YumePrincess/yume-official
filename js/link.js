// 站点数据
const siteLinks = [
  {
    nameKey: "YCHAT",
    name: "雨梦Chat",
    link: "https://chat.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path stroke-width="2" d="M12.005 11h.008M8.01 11h.009"/><path stroke-width="1.5" d="M12 3c-1.48 0-2.905.03-4.244.088c-2.44.105-3.66.157-4.626 1.13c-.965.972-1.007 2.159-1.09 4.532a64 64 0 0 0 0 4.5c.083 2.373.125 3.56 1.09 4.532c.965.973 2.186 1.025 4.626 1.13l.244.01v2.348a.73.73 0 0 0 1.205.554l2.18-1.869c.547-.47.821-.704 1.147-.828s.696-.131 1.437-.145q1.171-.023 2.275-.07c2.44-.105 3.66-.157 4.626-1.13c.965-.972 1.007-2.159 1.09-4.532q.032-.854.038-1.75"/><path stroke-width="1.5" d="M21.109 2.598C20.373 2.222 19.473 2 18.5 2s-1.873.222-2.609.598c-.36.185-.541.277-.716.568S15 3.737 15 4.299v1.396c0 2.273 1.767 3.537 2.79 4.079c.285.15.428.226.71.226s.425-.075.71-.226C20.234 9.232 22 7.968 22 5.694V4.3c0-.562 0-.843-.175-1.133s-.355-.383-.716-.568"/></g></svg>`
  },
  {
    nameKey: "YMAIL",
    name: "雨梦邮箱",
    link: "https://mail.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m7 7.5l2.942 1.74c1.715 1.014 2.4 1.014 4.116 0L17 7.5"/><path d="M12.5 19.5s-2.43-.012-3.401-.037c-3.149-.079-4.723-.118-5.854-1.254c-1.131-1.135-1.164-2.668-1.23-5.733a69 69 0 0 1 0-2.952c.066-3.065.099-4.598 1.23-5.733C4.376 2.655 5.95 2.616 9.099 2.537a115 115 0 0 1 5.802 0c3.149.079 4.723.118 5.854 1.254c1.131 1.135 1.164 2.668 1.23 5.733c.01.493.015 1.485.015 1.976"/><path d="M22 17v-2.5c-2 0-3.5-1-3.5-1s-1.5 1-3.5 1V17c0 3.5 3.5 4.5 3.5 4.5s3.5-1 3.5-4.5"/></g></svg>`
  },
  {
    nameKey: "AI",
    name: "雨梦智能",
    link: "https://ai.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="currentColor" d="M20 12q0-.452-.049-.89a1 1 0 0 1 1.988-.22Q22 11.437 22 12c0 5.523-4.477 10-10 10H4a2 2 0 0 1-2-2v-8C2 6.477 6.477 2 12 2q.563 0 1.11.06a1 1 0 0 1-.22 1.989A8 8 0 0 0 4 12v8h8a8 8 0 0 0 8-8m-8 2a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm3-4a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2zm4-9a1 1 0 0 1 .946.677l.13.378c.3.879.99 1.57 1.87 1.87l.377.129a1 1 0 0 1 0 1.892l-.378.13c-.879.3-1.57.99-1.87 1.87l-.129.377a1 1 0 0 1-1.892 0l-.13-.378a3 3 0 0 0-1.87-1.87l-.377-.129a1 1 0 0 1 0-1.892l.378-.13c.879-.3 1.57-.99 1.87-1.87l.129-.377l.062-.146A1 1 0 0 1 19 1m0 3.196a5 5 0 0 1-.804.804q.449.355.804.803q.356-.447.803-.803A5 5 0 0 1 19 4.196"/></g></svg>`
  },
  {
    nameKey: "CLOUD",
    name: "雨梦网盘",
    link: "https://drive.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M18 18H6a2 2 0 1 0 0 4h12a2 2 0 1 0 0-4M9.5 8.5a1 1 0 1 0 0-2m0 2a1 1 0 0 1 0-2m0 2v-2m-1.5 6h3m-4 1V13a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v.5zm7.5-5a1 1 0 1 0 0-2m0 2a1 1 0 1 1 0-2m0 2v-2m0 6H16m-1.5 1H17V13a2 2 0 0 0-2-2h-.5zm2 6.5v.01m-3-.01v.01"/><path d="M20 20V8c0-2.828 0-4.243-.879-5.121C18.243 2 16.828 2 14 2h-4c-2.828 0-4.243 0-5.121.879C4 3.757 4 5.172 4 8v12"/></g></svg>`
  },
  {
    nameKey: "YSEARCH",
    name: "雨梦搜索",
    link: "https://search.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M8 .8A7.2 7.2 0 1 0 15.2 8A7.21 7.21 0 0 0 8 .8m0 13.553A6.353 6.353 0 1 1 14.355 8A6.36 6.36 0 0 1 8 14.353m3.2-10.12L6.682 6.492a.42.42 0 0 0-.19.19l-2.259 4.517a.423.423 0 0 0 .569.568L9.319 9.51a.42.42 0 0 0 .19-.19L11.77 4.8a.423.423 0 0 0-.57-.568m-2.385 4.58l-3.255 1.63l1.623-3.255l3.255-1.623z"/></svg>`
  },
  {
    nameKey: "STORE",
    name: "雨梦Store",
    link: "https://store.yume.zone/",
    showLang: ["fr", "ja", "en", "zh-cn", "zh-tw"],
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M8 7V6a4 4 0 1 1 8 0v1h3c.552 0 1 .449 1 1.007v12.001c0 1.1-.895 1.992-1.994 1.992H5.994A1.994 1.994 0 0 1 4 20.008v-12C4 7.45 4.445 7 5 7zm1.2 0h5.6V6a2.8 2.8 0 0 0-5.6 0zM8 8.2H5.2v11.808c0 .436.356.792.794.792h12.012a.794.794 0 0 0 .794-.792V8.2H16V11h-1.2V8.2H9.2V11H8z"/></svg>`
  },
  {
    nameKey: "YACCOUNT",
    name: "雨梦One",
    link: "https://one.yume.zone/realms/yume/account",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172S22 8.229 22 12s0 5.657-1.172 6.828S17.771 20 14 20h-4c-3.771 0-5.657 0-6.828-1.172S2 15.771 2 12"/><path d="M9 12.5a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5m0 0a4 4 0 0 1 4 4m-4-4a4 4 0 0 0-4 4M15 9h4m-4 3h4"/></g></svg>`
  }
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

      rowItems.forEach(item => {
        const colClass = "col col-3";

        html += `
          <div class="${colClass}">
            <a href="${item.link}" target="_blank">
              <div class="link-card cards">
                ${item.Svg}
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

  // 销毁旧实例
  if (swiperInstance) {
    swiperInstance.destroy(true, true);
  }

  // 重新初始化
  swiperInstance = new Swiper(".link-swiper", {
    slidesPerView: 1,
    spaceBetween: 20,

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    // ===== 核心移动端修复 =====
    simulateTouch: true,
    allowTouchMove: true,

    touchStartPreventDefault: false,
    passiveListeners: false,

    threshold: 5,
    resistanceRatio: 0,

    // 安卓惯性增强
    touchRatio: 1,

    // 防止嵌套滚动冲突
    touchAngle: 45,

    // 防止点击链接吞掉滑动
    preventClicks: false,
    preventClicksPropagation: false,

    observer: true,
    observeParents: true,

    mousewheel: true,
  });
}

// 初始化 Swiper
document.addEventListener("DOMContentLoaded", () => {
  renderSwiper();
});