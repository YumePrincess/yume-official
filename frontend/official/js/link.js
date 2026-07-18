// 站点数据
const siteLinks = [
  {
    nameKey: "YMAIL",
    name: "雨梦邮箱",
    link: "https://mail.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m7 7.5l2.942 1.74c1.715 1.014 2.4 1.014 4.116 0L17 7.5"/><path d="M12.5 19.5s-2.43-.012-3.401-.037c-3.149-.079-4.723-.118-5.854-1.254c-1.131-1.135-1.164-2.668-1.23-5.733a69 69 0 0 1 0-2.952c.066-3.065.099-4.598 1.23-5.733C4.376 2.655 5.95 2.616 9.099 2.537a115 115 0 0 1 5.802 0c3.149.079 4.723.118 5.854 1.254c1.131 1.135 1.164 2.668 1.23 5.733c.01.493.015 1.485.015 1.976"/><path d="M22 17v-2.5c-2 0-3.5-1-3.5-1s-1.5 1-3.5 1V17c0 3.5 3.5 4.5 3.5 4.5s3.5-1 3.5-4.5"/></g></svg>`
  },
  {
    nameKey: "CLOUD",
    name: "雨梦网盘",
    link: "https://drive.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6.5 18H13v2H6.5c-1.5 0-2.81-.5-3.89-1.57C1.54 17.38 1 16.09 1 14.58q0-1.95 1.17-3.48C3.34 9.57 4 9.43 5.25 9.15c.42-1.53 1.25-2.77 2.5-3.72S10.42 4 12 4c1.95 0 3.6.68 4.96 2.04c1.12 1.12 1.77 2.46 1.97 3.96c-.7 0-1.37.19-1.98.46a4.8 4.8 0 0 0-1.41-3C14.56 6.5 13.38 6 12 6s-2.56.5-3.54 1.46C7.5 8.44 7 9.62 7 11h-.5c-.97 0-1.79.34-2.47 1.03c-.69.68-1.03 1.5-1.03 2.47s.34 1.79 1.03 2.5c.68.66 1.5 1 2.47 1m16.5-.7v3.5c0 .6-.6 1.2-1.3 1.2h-5.5c-.6 0-1.2-.6-1.2-1.3v-3.5c0-.6.6-1.2 1.2-1.2v-1.5c0-1.4 1.4-2.5 2.8-2.5s2.8 1.1 2.8 2.5V16c.6 0 1.2.6 1.2 1.3m-2.5-2.8c0-.8-.7-1.3-1.5-1.3s-1.5.5-1.5 1.3V16h3z"/></svg>`
  },
  {
    nameKey: "AI",
    name: "雨梦智能",
    link: "https://ai.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" d="M11.5 6C7.022 6 4.782 6 3.391 7.172S2 10.229 2 14s0 5.657 1.391 6.828S7.021 22 11.5 22c4.478 0 6.718 0 8.109-1.172S21 17.771 21 14c0-1.17 0-2.158-.041-3"/><path stroke-linejoin="round" d="m18.5 2l.258.697c.338.914.507 1.371.84 1.704c.334.334.791.503 1.705.841L22 5.5l-.697.258c-.914.338-1.371.507-1.704.84c-.334.334-.503.791-.841 1.705L18.5 9l-.258-.697c-.338-.914-.507-1.371-.84-1.704c-.334-.334-.791-.503-1.705-.841L15 5.5l.697-.258c.914-.338 1.371-.507 1.704-.84c.334-.334.503-.791.841-1.705z"/><path stroke-linecap="round" stroke-linejoin="round" d="m15.5 12l1.227 1.057c.515.445.773.667.773.943s-.258.498-.773.943L15.5 16m-8-4l-1.227 1.057c-.515.445-.773.667-.773.943s.258.498.773.943L7.5 16m5-5l-2 6"/></g></svg>`
  },
  {
    nameKey: "YCHAT",
    name: "雨梦Chat",
    link: "https://chat.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path stroke-width="2" d="M12.005 11h.008M8.01 11h.009"/><path stroke-width="1.5" d="M12 3c-1.48 0-2.905.03-4.244.088c-2.44.105-3.66.157-4.626 1.13c-.965.972-1.007 2.159-1.09 4.532a64 64 0 0 0 0 4.5c.083 2.373.125 3.56 1.09 4.532c.965.973 2.186 1.025 4.626 1.13l.244.01v2.348a.73.73 0 0 0 1.205.554l2.18-1.869c.547-.47.821-.704 1.147-.828s.696-.131 1.437-.145q1.171-.023 2.275-.07c2.44-.105 3.66-.157 4.626-1.13c.965-.972 1.007-2.159 1.09-4.532q.032-.854.038-1.75"/><path stroke-width="1.5" d="M21.109 2.598C20.373 2.222 19.473 2 18.5 2s-1.873.222-2.609.598c-.36.185-.541.277-.716.568S15 3.737 15 4.299v1.396c0 2.273 1.767 3.537 2.79 4.079c.285.15.428.226.71.226s.425-.075.71-.226C20.234 9.232 22 7.968 22 5.694V4.3c0-.562 0-.843-.175-1.133s-.355-.383-.716-.568"/></g></svg>`
  },
  {
    nameKey: "YSEARCH",
    name: "雨梦搜索",
    link: "https://search.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M8 .8A7.2 7.2 0 1 0 15.2 8A7.21 7.21 0 0 0 8 .8m0 13.553A6.353 6.353 0 1 1 14.355 8A6.36 6.36 0 0 1 8 14.353m3.2-10.12L6.682 6.492a.42.42 0 0 0-.19.19l-2.259 4.517a.423.423 0 0 0 .569.568L9.319 9.51a.42.42 0 0 0 .19-.19L11.77 4.8a.423.423 0 0 0-.57-.568m-2.385 4.58l-3.255 1.63l1.623-3.255l3.255-1.623z"/></svg>`
  },
  {
    nameKey: "YACCOUNT",
    name: "雨梦Account",
    link: "https://account.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M2 12c0-3.771 0-5.657 1.172-6.828S6.229 4 10 4h4c3.771 0 5.657 0 6.828 1.172S22 8.229 22 12s0 5.657-1.172 6.828S17.771 20 14 20h-4c-3.771 0-5.657 0-6.828-1.172S2 15.771 2 12"/><path d="M9 12.5a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5m0 0a4 4 0 0 1 4 4m-4-4a4 4 0 0 0-4 4M15 9h4m-4 3h4"/></g></svg>`
  },
  {
    nameKey: "YPUBLIC",
    name: "雨梦Public",
    showLang: ["fr", "ja", "en", "zh-cn", "zh-tw"],
    link: "https://public.yume.zone/",
    Svg: `<svg class="icon-35px-pd5" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M3.5 8V6.25c0-.966.784-1.75 1.75-1.75h2.879a.75.75 0 0 1 .53.22l1.53 1.53l-1.53 1.53a.75.75 0 0 1-.53.22zm1.75-5A3.25 3.25 0 0 0 2 6.25v11.5A3.25 3.25 0 0 0 5.25 21h7.275l-1.012-1.013a1.8 1.8 0 0 1-.345-.487H5.25a1.75 1.75 0 0 1-1.75-1.75V9.5h4.629a2.25 2.25 0 0 0 1.59-.659L11.562 7h7.189c.966 0 1.75.784 1.75 1.75v5.918c.176.084.342.199.487.345L22 16.025V8.75a3.25 3.25 0 0 0-3.25-3.25h-7.19L9.72 3.659A2.25 2.25 0 0 0 8.129 3zm10.53 13.78a.75.75 0 1 0-1.06-1.06l-2.5 2.5a.75.75 0 0 0 0 1.06l2.5 2.5a.75.75 0 1 0 1.06-1.06l-1.22-1.22h5.88l-1.22 1.22a.75.75 0 1 0 1.06 1.06l2.5-2.5a.75.75 0 0 0 0-1.06l-2.5-2.5a.75.75 0 1 0-1.06 1.06L20.44 18h-5.88z"/></svg>`
  },
];

// 分页
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
