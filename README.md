# Town Square / Lab

X の技術スタックを参考にした、1 ページの実装サンプルです。React のストリーミング SSR、Relay と GraphQL、Fastify と Watt、PostgreSQL と Redis の接続を確認できます。

## 起動

Docker と Docker Compose を用意し、ルートで実行します。実行用イメージには Rolldown によるビルド成果物だけを含めます。サーバービルド時は、生成されたチャンクに Node.js 組み込みモジュール以外の外部 import が残らないよう検査します。Compose ではバンドル済みの Watt が Fastify をワーカー上で起動します。

```sh
docker compose up --build
```

`http://localhost:3000` を開きます。初回は PostgreSQL の起動時に `docker/postgres/001-init.sql` がスキーマとサンプルデータを作成します。データを維持したまま停止する場合は `docker compose down`、データも消して初期化し直す場合は `docker compose down -v` を使います。

ローカルビルドには Node.js 26 と pnpm 12 が必要です。`pnpm install`、`pnpm build` でビルドできます。ローカルで Web を Watt 経由で起動する場合は `DATABASE_URL`、`REDIS_URL`、`PORT` を設定して `pnpm dev` を実行してください。Compose の構成でも Watt のランタイム、ワーカー、Service をバンドルして起動します。

## コードの場所

- `apps/web/src/server.tsx`: Fastify、GraphQL、初期データ取得とストリーミング SSR
- `apps/web/src/relay.ts`: Relay 環境とサーバーレスポンスのストアへの投入
- `apps/web/src/App.tsx`: ページ、Suspense、集計表示
- `apps/web/src/PostCard.tsx`: Relay フラグメントといいね mutation
- `packages/graphql`: GraphQL スキーマとリゾルバー
- `packages/database`: PostgreSQL と Redis、キャッシュの無効化
- `packages/ui`: Base UI ダイアログと共通 UI
- `apps/web/watt.json`: Watt のサーバー・ワーカー設定
- `apps/web/scripts/build-watt.mjs`: Watt とワーカーのバンドル

`pnpm relay` で Relay のコードを生成します。`pnpm typecheck`（tsrs、TypeScript 7 系）と `pnpm lint`（oxlint）で静的検査を、`pnpm format`（oxfmt）で整形を実行できます。`pnpm-workspace.yaml` の `minimumReleaseAge: 2880` は新規依存バージョンの公開後 2 日間の待機を指定します。

認証のない検証用アプリです。いいねは誰でも操作でき、Compose 内の DB 認証情報もローカル向けです。公開サービスとして利用する設定ではありません。
