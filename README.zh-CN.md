<p align="center">
  <img src="assets/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a>
</p>

# Yume Official Backend

Yume Official Backend 是面向 Cloudflare Workers 的文件管理与分享服务。文件存储使用 Cloudflare R2，应用元数据存储使用 D1。

默认的 Worker 部署名称和 D1 数据库名称均为 `yume-official-backend`。

### 功能

- 管理后台支持上传、下载、预览、编辑文本文件、管理文件夹和创建 ZIP 压缩包。
- 支持分享文件和文件夹，可选密码与过期时间，并提供公开访客文件浏览器。
- 通过 `/dav` 提供 WebDAV 访问。
- 从 YAML 文件发布 Clash/Mihomo 订阅，并生成加密分享链接。
- 可选 OIDC 登录及邮箱白名单；关闭 OIDC 后可使用密码登录。
- 集成公告、翻译、地理位置、天气和 Workers AI API。
- 界面支持英语、法语、日语、简体中文和繁体中文。

### 部署

需要 Node.js 20 或更高版本、npm，以及已启用 Workers、R2、D1、Queues 和 Workers AI 的 Cloudflare 账户。

1. 安装依赖，从示例创建部署配置，并登录 Wrangler：

   ```sh
   npm install
   cp wrangler.example.jsonc wrangler.jsonc
   npx wrangler login
   ```

   复制命令会覆盖已有的 `wrangler.jsonc`。请妥善保管账户专属配置和凭证。

2. 创建配置中使用的资源，或将配置改为匹配已有资源：

   ```sh
   npx wrangler r2 bucket create yume-oss
   npx wrangler d1 create yume-official-backend
   npx wrangler queues create yume-oss-cache-purge
   ```

   将 Wrangler 返回的 D1 数据库 ID 和限流 namespace ID 填入 `wrangler.jsonc`，并配置自定义域名、R2 公共 URL、Bucket、数据库和队列名称。

3. 应用数据库迁移：

   ```sh
   npx wrangler d1 migrations apply VAULT_DB --remote
   ```

4. 使用 Wrangler 设置 Secret。示例配置要求 `DEEPL_API_KEY` 和 `AI_API_KEY`；根据启用的功能设置其他 Secret：

   ```sh
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET
   npx wrangler secret put DEEPL_API_KEY
   npx wrangler secret put AI_API_KEY
   ```

   使用 OIDC 时，在 `wrangler.jsonc` 中配置 OIDC 变量，并设置 `OIDC_CLIENT_SECRET`。使用 R2 缓存清理事件时，设置 `CACHE_PURGE_ZONE_ID` 和 `CACHE_PURGE_API_TOKEN`。

5. 如需在对象变更时清除 R2 URL 缓存，将 Bucket 事件连接到队列：

   ```sh
   npx wrangler r2 bucket notification create yume-oss --event-type object-create --queue yume-oss-cache-purge
   npx wrangler r2 bucket notification create yume-oss --event-type object-delete --queue yume-oss-cache-purge
   ```

6. 本地运行、类型检查并部署：

   ```sh
   npm run dev
   npm run typecheck
   npm run deploy
   ```

示例配置默认启用密码登录。若使用 OIDC，请在 `wrangler.jsonc` 中配置 issuer、client ID、回调 URL 和允许登录的邮箱，并通过 Wrangler Secret 设置 `OIDC_CLIENT_SECRET`。不要将真实凭证或生产账户配置提交到公开仓库。

### 版权与许可证

Copyright © 2026 Yume Internet LLC。本项目根据 MIT License 发布。许可证正文和条件请参阅 [LICENSE](LICENSE)。
