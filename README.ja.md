<p align="center">
  <img src="assets/yumeofficial.png" alt="Yume Official" width="540">
</p>

<p align="center">
  <a href="README.md">English</a> · <a href="README.fr.md">Français</a> · <a href="README.ja.md">日本語</a> · <a href="README.zh-CN.md">简体中文</a> · <a href="README.zh-TW.md">繁體中文</a>
</p>

# Yume Official Backend

Yume Official Backend は、Cloudflare Workers 向けのファイル管理・共有サービスです。ファイルの保存に Cloudflare R2、アプリケーションのメタデータ保存に D1 を使用します。

Worker のデプロイ名と D1 データベース名の既定値は、どちらも `yume-official-backend` です。

### 主な機能

- 管理画面からのアップロード、ダウンロード、プレビュー、テキストファイル編集、フォルダー管理、ZIP 作成。
- パスワードや有効期限を設定できるファイル・フォルダーの公開共有と、ゲスト向けファイル一覧。
- `/dav` での WebDAV アクセス。
- YAML ファイルから Clash/Mihomo サブスクリプションを公開し、暗号化された共有 URL を発行。
- メールアドレスの許可リストを使った任意の OIDC ログイン。OIDC を無効にするとパスワードログインを利用できます。
- お知らせ、翻訳、位置情報、天気、Workers AI の API を統合。
- 英語、フランス語、日本語、簡体字中国語、繁体字中国語の UI。

### デプロイ

必要なもの：Node.js 20 以降、npm、Workers・R2・D1・Queues・Workers AI を利用できる Cloudflare アカウント。

1. 依存関係をインストールし、サンプルからデプロイ設定を作成して Wrangler にログインします。

   ```sh
   npm install
   cp wrangler.example.jsonc wrangler.jsonc
   npx wrangler login
   ```

   このコピーコマンドは既存の `wrangler.jsonc` を上書きします。アカウント固有の設定や認証情報は公開しないでください。

2. 設定ファイルに記載されたリソースを作成するか、既存リソースに合わせて設定を変更します。

   ```sh
   npx wrangler r2 bucket create yume-oss
   npx wrangler d1 create yume-official-backend
   npx wrangler queues create yume-oss-cache-purge
   ```

   Wrangler が返す D1 データベース ID とレート制限の namespace ID を `wrangler.jsonc` に設定します。カスタムドメイン、R2 の公開 URL、バケット・データベース・キュー名も設定してください。

3. データベースのマイグレーションを適用します。

   ```sh
   npx wrangler d1 migrations apply VAULT_DB --remote
   ```

4. Wrangler で Secret を登録します。サンプル設定では `DEEPL_API_KEY` と `AI_API_KEY` が必須です。利用する機能に応じてほかの Secret も登録してください。

   ```sh
   npx wrangler secret put ADMIN_PASSWORD
   npx wrangler secret put SESSION_SECRET
   npx wrangler secret put DEEPL_API_KEY
   npx wrangler secret put AI_API_KEY
   ```

   OIDC を使う場合は `wrangler.jsonc` の OIDC 変数を設定し、`OIDC_CLIENT_SECRET` を登録します。R2 キャッシュ消去イベントを使う場合は `CACHE_PURGE_ZONE_ID` と `CACHE_PURGE_API_TOKEN` を登録します。

5. オブジェクトの変更時に R2 URL のキャッシュを消去するには、バケットイベントをキューに接続します。

   ```sh
   npx wrangler r2 bucket notification create yume-oss --event-type object-create --queue yume-oss-cache-purge
   npx wrangler r2 bucket notification create yume-oss --event-type object-delete --queue yume-oss-cache-purge
   ```

6. ローカル実行、型チェック、デプロイを行います。

   ```sh
   npm run dev
   npm run typecheck
   npm run deploy
   ```

サンプル設定ではパスワードログインが有効です。OIDC を使う場合は、issuer、client ID、callback URL、許可するメールアドレスを `wrangler.jsonc` に設定し、`OIDC_CLIENT_SECRET` を Wrangler Secret として登録してください。実際の認証情報や本番アカウントの設定を公開コミットに含めないでください。

### 著作権とライセンス

Copyright © 2026 Yume Internet LLC. 本プロジェクトは MIT License の下で配布されています。ライセンスの本文と条件は [LICENSE](LICENSE) を参照してください。
