# 技術スタック検証用 Web サービスの実装計画

## 目的

[X Engineering の記事](https://blog.x.com/en/engineering/rebuilding-the-global-town-square-from-scratch)を参考に、記事の主要なライブラリが実装の中でどのように連携するかを確認できるサンプルを作る。SNS の全機能を再現することより、コードを読んで動作を追えることを優先する。

画面のルートは `/` のみとし、その中に各技術のサンプルをまとめる。GraphQL API やヘルスチェックなど、画面以外のエンドポイントは必要に応じて設ける。

## 技術構成

| 領域 | 採用予定 | 用途 |
| --- | --- | --- |
| パッケージ管理 | pnpm workspace | モノレポの依存関係とスクリプトの管理 |
| 言語・実行環境 | TypeScript、Node.js 26 | Web アプリと API |
| ビルド・開発 | Vite、Rolldown | クライアント・サーバーのビルドと開発 |
| UI | React、Tailwind CSS、Base UI | サーバー・ブラウザ双方の描画と共通 UI |
| Web サーバー | Fastify、Platformatic Watt | HTTP 応答、SSR、ワーカー管理 |
| データ取得 | GraphQL、Relay | クエリ、フラグメント、mutation、クライアントキャッシュ |
| 永続化 | PostgreSQL | プロフィール、投稿、いいね数の保存 |
| キャッシュ | Redis | 投稿数などの集計値のキャッシュ例 |
| 実行環境 | Docker、Docker Compose | ビルド成果物と依存サービスの起動 |

Redis は会話中のミドルウェア名をそのように解釈した暫定案とする。記事で DB やキャッシュの製品は指定されていないため、PostgreSQL と Redis はこのサンプルの選定である。X 固有の XDS やサーバーパッケージは使わず、Base UI などで小さく代替する。

Vite Plus は必須にせず、pnpm workspace を基礎にする。導入する場合は、Vite、Relay のコード生成、SSR、Watt との互換性を先に確認する。型検査は公式 TypeScript コンパイラを基準とし、記事の tsrs は互換性を確認できる場合に追加で評価する。

## サンプル画面

1 ページに以下を配置する。デザインはシンプルなプロフィールと投稿一覧をベースにし、必要に応じて各サンプルの役割を短く表示する。

- **プロフィールと投稿一覧**：GraphQL から取得し、Relay のクエリとコンポーネント単位のフラグメントを使う。
- **ストリーミング表示**：意図的に遅延させたデータ取得を Suspense 境界に置き、先にページのシェル、その後に対象領域を送る。
- **いいね操作**：Relay mutation で PostgreSQL の値を更新し、画面に結果を反映する。認証は設けず、サンプル用の操作とする。
- **集計表示**：投稿数などを PostgreSQL から取得し、Redis にキャッシュする。更新時の無効化も実装する。
- **共通 UI**：ボタンやダイアログなどに Base UI と Tailwind CSS を使う。

初期データを用意し、起動後すぐに動作を確認できるようにする。カード画像は飾りとして静的な画像または CSS で表現し、画像生成サービスは作らない。

## 構成案

```text
apps/
  web/              # Vite、React、Relay、Fastify、SSR、Watt
packages/
  ui/               # 共通 UI コンポーネント
  graphql/          # スキーマとリゾルバー
  database/         # DB アクセス、スキーマ、初期データ
compose.yaml
Dockerfile
pnpm-workspace.yaml
```

パッケージの境界は、依存関係と実装を追いやすい最小単位とする。GraphQL は Fastify に組み込み、独立した API コンテナは作らない。GraphQL 実装と DB アクセス用ライブラリは、実装時に Node.js 26 との互換性を確認して選ぶ。

## SSR とデータの流れ

1. Fastify が `/` のリクエストを受け、画面に必要な GraphQL クエリを開始する。
2. React のストリーミング SSR でシェルを先に返し、遅延データを含む領域は解決後に送る。
3. サーバーで受け取った GraphQL レスポンスを安全に HTML に埋め込み、ブラウザ側の Relay 環境で再利用する。初回表示に必要な同じデータの重複取得を避ける。
4. ハイドレーション後の操作は Relay mutation を通じて GraphQL に送る。更新結果とキャッシュを整合させる。

外部データの HTML 埋め込み時は、スクリプト文脈でのエスケープを含めて安全にシリアライズする。遅延部分の失敗時には、画面全体を止めずに確認できるエラー表示を用意する。

## Docker Compose

- マルチステージ Dockerfile で pnpm によるインストールとビルドを行い、実行ステージにビルド成果物と実行に必要な依存関係を含める。
- Compose で Web、PostgreSQL、Redis を起動する。Web は Watt 経由で Fastify を起動する。
- PostgreSQL のデータはボリュームに保存し、初回セットアップ時にスキーマと初期データを投入する。再起動時に重複投入しないようにする。
- 接続先などは環境変数で渡し、依存サービスのヘルスチェックと Web 側の接続失敗時の扱いを用意する。
- 起動方法、初期化方法、データの削除方法、各サンプルのコードの場所を README に記載する。

## 実装順序

1. pnpm workspace、共通設定、Docker Compose、PostgreSQL と Redis の接続を用意する。
2. Fastify、Watt、Vite、React を接続し、`/` を SSR する。
3. GraphQL スキーマ、初期データ、Relay のコード生成とクエリを追加する。
4. Suspense とストリーミング SSR、サーバー取得レスポンスのブラウザでの再利用を実装する。
5. いいね mutation、Redis の集計キャッシュと無効化を追加する。
6. Base UI と Tailwind CSS で画面を整え、Docker の本番ビルドと README を仕上げる。

## 完了条件と確認

- `docker compose up --build` で各サービスが起動し、`/` で初期データを表示できる。
- 遅延領域の完了前にページの一部が届き、後から対象領域が表示されることを確認できる。
- 初回 SSR のデータを Relay が再利用し、同一データをハイドレーション時に不要に再取得しないことを確認できる。
- いいね操作が画面と PostgreSQL に反映され、再読み込み後も維持される。集計キャッシュは対象データの更新後に古い値を返し続けない。
- 型検査、lint、ビルドと、主要な SSR・mutation の動作確認を実行する。Compose の初回起動と再起動も確認する。

## 今回作らないもの

複数画面、認証、フォロー、検索、通知、ファイルアップロード、実際の SNS 規模の分散処理、クローラー専用描画、Rust によるカード画像生成は対象外とする。
