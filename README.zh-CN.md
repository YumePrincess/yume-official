# Yume Official

<p align="center">
  <img src="assets/readme/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="README.md">English · Default</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.ja.md">日本語</a>
</p>

## 简体中文

Yume Official 是 Yume 服务生态的多语言静态网站与服务入口。本仓库包含前端；API Worker 和后端服务由独立项目维护。

### 功能

- 介绍 Yume 并链接各项服务的官网首页。
- [`/search/`](https://www.yume.zone/search/) 搜索入口，以及 [`/pricing/`](https://www.yume.zone/pricing/) 服务与价格目录。
- 支持英语、简体中文、繁体中文、法语和日语的语言、主题及显示偏好。
- 提供五种语言的隐私政策、用户条款和退款政策。
- 提供短信同意与通知偏好页面，以及 Android 和 iOS 分发文件。

### 部署

网站通过 Cloudflare Workers Static Assets 部署。Wrangler 直接上传 `frontend/`，不需要单独生成构建目录。

需要 Node.js 22 或更高版本，并拥有已配置的 Cloudflare 账户和域名权限。

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npm run deploy
```

Worker 名称为 `yume-official`，绑定 `yume.zone` 和 `www.yume.zone`。API 由独立服务提供，地址为 `https://aio.yume.zone/api/*`，不包含在本仓库中。

### 版权与许可证

版权所有 © 2026 Yume Internet LLC。本项目原创代码采用 [MIT 许可证](./LICENSE)。

第三方软件、字体、音乐、图片、应用安装包及其他素材仍遵循其各自的许可证和权利声明；MIT 许可证不会自动覆盖这些内容。
