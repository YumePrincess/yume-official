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

## 繁體中文

Yume Official 是 Yume 服務生態的多語言靜態網站與服務入口。本儲存庫包含前端；API Worker 與後端服務由獨立專案維護。

### 功能

- 介紹 Yume 並連結各項服務的官方首頁。
- [`/search/`](https://www.yume.zone/search/) 搜尋入口，以及 [`/pricing/`](https://www.yume.zone/pricing/) 服務與價格目錄。
- 支援英文、簡體中文、繁體中文、法文和日文的語言、主題及顯示偏好。
- 提供五種語言的隱私權政策、使用者條款和退款政策。
- 提供簡訊同意與通知偏好頁面，以及 Android 和 iOS 發佈檔案。

### 部署

網站透過 Cloudflare Workers Static Assets 部署。Wrangler 直接上傳 `frontend/`，不需要另外產生建置目錄。

需要 Node.js 22 或更新版本，並具備已設定的 Cloudflare 帳戶及網域權限。

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npm run deploy
```

Worker 名稱為 `yume-official`，綁定 `yume.zone` 與 `www.yume.zone`。API 由獨立服務提供，網址為 `https://aio.yume.zone/api/*`，不包含在本儲存庫中。

### 著作權與授權

版權所有 © 2026 Yume Internet LLC。本專案原創程式碼採用 [MIT 授權條款](./LICENSE)。

第三方軟體、字型、音樂、圖片、應用程式套件及其他素材仍依各自的授權與權利聲明使用；MIT 授權不會自動涵蓋這些內容。
