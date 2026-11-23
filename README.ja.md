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
