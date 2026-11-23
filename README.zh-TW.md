<p align="center">
  <img src="assets/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a>
</p>

# Yume Official Backend

Yume Official Backend 是適用於 Cloudflare Workers 的檔案管理與分享服務。檔案使用 Cloudflare R2 儲存，應用程式中繼資料使用 D1 儲存。

預設的 Worker 部署名稱與 D1 資料庫名稱皆為 `yume-official-backend`。

### 功能

- 管理後台支援上傳、下載、預覽、編輯文字檔、管理資料夾及建立 ZIP 壓縮檔。
- 支援分享檔案與資料夾，可設定密碼與到期時間，並提供公開訪客檔案瀏覽器。
- 透過 `/dav` 提供 WebDAV 存取。
- 從 YAML 檔案發布 Clash/Mihomo 訂閱，並產生加密分享連結。
- 可選擇啟用 OIDC 登入與電子郵件允許清單；停用 OIDC 後可使用密碼登入。
- 整合公告、翻譯、地理位置、天氣與 Workers AI API。
- 介面支援英文、法文、日文、簡體中文及繁體中文。

### 部署

需求：Node.js 20 或更新版本、npm，以及已啟用 Workers、R2、D1、Queues 與 Workers AI 的 Cloudflare 帳戶。

1. 安裝相依套件，從範例建立部署設定，並登入 Wrangler：

   ```sh
   npm install
   cp wrangler.example.jsonc wrangler.jsonc
   npx wrangler login
   ```

   複製指令會覆寫現有的 `wrangler.jsonc`。請妥善保管帳戶專屬設定與憑證。

2. 建立設定中使用的資源，或修改設定以符合現有資源：

   ```sh
   npx wrangler r2 bucket create yume-oss
   npx wrangler d1 create yume-official-backend
   npx wrangler queues create yume-oss-cache-purge
   ```

   將 Wrangler 回傳的 D1 資料庫 ID 與限流 namespace ID 填入 `wrangler.jsonc`，並設定自訂網域、R2 公開 URL、Bucket、資料庫與佇列名稱。

3. 套用資料庫 migration：

   ```sh
   npx wrangler d1 migrations apply VAULT_DB --remote
   ```

4. 使用 Wrangler 設定 Secret。範例設定要求 `DEEPL_API_KEY` 和 `AI_API_KEY`；請依啟用的功能設定其他 Secret：

   ```sh
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET
   npx wrangler secret put DEEPL_API_KEY
   npx wrangler secret put AI_API_KEY
   ```

   若使用 OIDC，請在 `wrangler.jsonc` 設定 OIDC 變數，並設定 `OIDC_CLIENT_SECRET`。若使用 R2 快取清除事件，請設定 `CACHE_PURGE_ZONE_ID` 與 `CACHE_PURGE_API_TOKEN`。

5. 若要在物件變更時清除 R2 URL 快取，請將 Bucket 事件連接至佇列：

   ```sh
   npx wrangler r2 bucket notification create yume-oss --event-type object-create --queue yume-oss-cache-purge
   npx wrangler r2 bucket notification create yume-oss --event-type object-delete --queue yume-oss-cache-purge
   ```

6. 在本機執行、檢查型別並部署：

   ```sh
   npm run dev
   npm run typecheck
   npm run deploy
   ```

範例設定預設啟用密碼登入。若使用 OIDC，請在 `wrangler.jsonc` 設定 issuer、client ID、callback URL 及允許登入的電子郵件，並透過 Wrangler Secret 設定 `OIDC_CLIENT_SECRET`。請勿將真實憑證或正式環境帳戶設定提交至公開儲存庫。

### 著作權與授權條款

Copyright © 2026 Yume Internet LLC。本專案依 MIT License 發布。授權條款全文與條件請參閱 [LICENSE](LICENSE)。
