# Yume Official

<p align="center">
  <img src="assets/readme/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="#english">English · Default</a> ·
  <a href="#简体中文">简体中文</a> ·
  <a href="#繁體中文">繁體中文</a> ·
  <a href="#français">Français</a> ·
  <a href="#日本語">日本語</a>
</p>

## English

Yume Official is the multilingual static website and service portal for the Yume ecosystem. This repository contains the front end; the API Worker and backend services are maintained separately.

### Features

- A home page that introduces Yume and links to its services.
- A search portal at [`/search/`](https://www.yume.zone/search/) and a service and pricing catalog at [`/pricing/`](https://www.yume.zone/pricing/).
- Language, theme, and display preferences for English, Simplified Chinese, Traditional Chinese, French, and Japanese.
- Privacy, user terms, and refund documents in all five languages.
- An SMS consent and notification-preference page, plus Android and iOS distribution files.

### Deployment

The site is deployed to Cloudflare Workers Static Assets. Wrangler uploads `frontend/` directly; there is no separate build output.

Requirements: Node.js 22 or later and access to the configured Cloudflare account and domains.

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npm run deploy
```

The Worker is `yume-official`, serving `yume.zone` and `www.yume.zone`. The API is served separately at `https://aio.yume.zone/api/*` and is not included in this repository.

### Copyright and license

Copyright © 2026 Yume Internet LLC. The original project code is licensed under the [MIT License](./LICENSE).

Third-party software, fonts, music, images, app packages, and other materials retain their respective licenses and rights; the MIT license does not automatically relicense them.

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

## Français

Yume Official est le site statique multilingue et le portail de services de l’écosystème Yume. Ce dépôt contient l’interface ; l’API Worker et les services backend sont maintenus dans des projets distincts.

### Fonctionnalités

- Une page d’accueil qui présente Yume et réunit les liens vers ses services.
- Un portail de recherche sur [`/search/`](https://www.yume.zone/search/) et un catalogue de services et de tarifs sur [`/pricing/`](https://www.yume.zone/pricing/).
- Des préférences de langue, de thème et d’affichage en anglais, chinois simplifié, chinois traditionnel, français et japonais.
- Les politiques de confidentialité, conditions d’utilisation et règles de remboursement en cinq langues.
- Une page de consentement et de préférences pour les SMS, ainsi que les fichiers de distribution Android et iOS.

### Déploiement

Le site est déployé avec Cloudflare Workers Static Assets. Wrangler téléverse directement `frontend/`, sans répertoire de build séparé.

Prérequis : Node.js 22 ou version ultérieure, ainsi qu’un accès au compte Cloudflare et aux domaines configurés.

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npm run deploy
```

Le Worker s’appelle `yume-official` et dessert `yume.zone` et `www.yume.zone`. L’API est fournie séparément à `https://aio.yume.zone/api/*` et ne fait pas partie de ce dépôt.

### Droits d’auteur et licence

Copyright © 2026 Yume Internet LLC. Le code original du projet est sous [licence MIT](./LICENSE).

Les logiciels, polices, musiques, images, paquets d’application et autres contenus tiers restent soumis à leurs propres licences et droits ; la licence MIT ne les couvre pas automatiquement.

## 日本語

Yume Official は、Yume のサービスを紹介する多言語対応の静的サイトです。このリポジトリにはフロントエンドが含まれます。API Worker とバックエンドサービスは別のプロジェクトで管理しています。

### 主な機能

- Yume と各サービスを紹介するトップページ。
- [`/search/`](https://www.yume.zone/search/) の検索ポータルと、[`/pricing/`](https://www.yume.zone/pricing/) のサービス・料金一覧。
- 英語、簡体字中国語、繁体字中国語、フランス語、日本語の言語・テーマ・表示設定。
- 5 言語のプライバシーポリシー、利用規約、返金ポリシー。
- SMS の同意・通知設定ページと、Android および iOS 向け配布ファイル。

### デプロイ

Cloudflare Workers Static Assets で配信します。Wrangler が `frontend/` を直接アップロードするため、別のビルド出力ディレクトリはありません。

Node.js 22 以降と、設定済みの Cloudflare アカウントおよびドメインへのアクセスが必要です。

```bash
npm ci
npm run check
npx wrangler deploy --dry-run --config wrangler.jsonc
npm run deploy
```

Worker 名は `yume-official`、ドメインは `yume.zone` と `www.yume.zone` です。API は `https://aio.yume.zone/api/*` で別途提供され、このリポジトリには含まれません。

### 著作権とライセンス

Copyright © 2026 Yume Internet LLC。本プロジェクトのオリジナルコードは [MIT License](./LICENSE) の下で公開します。

第三者のソフトウェア、フォント、音楽、画像、アプリパッケージなどは、それぞれのライセンスと権利に従います。MIT License がこれらを自動的に再許諾することはありません。
