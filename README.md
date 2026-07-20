# いりりんご🍎web牧場

Web フロントエンドを中心に、試したこと・つまずいたこと・直したことを記録する個人技術ブログです。

Astro の Content Collections で Markdown 記事を管理し、Cloudflare Workers へ静的サイトとしてデプロイします。コンポーネントは Storybook でも確認できます。

## 主な機能

- 注目記事と最新記事を表示するトップページ
- Markdown から生成する記事ページと目次
- タグ別の記事一覧
- canonical URL、Open Graph、サイトマップの生成
- Storybook による UI コンポーネントの確認

## 技術スタック

- [Astro](https://astro.build/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Storybook](https://storybook.js.org/)
- [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html) / [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)
- [Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [mise](https://mise.jdx.dev/) / [pnpm](https://pnpm.io/)

## セットアップ

Node.js と pnpm のバージョンは `mise.toml` で管理しています。

```sh
mise install
pnpm install
```

開発サーバーはバックグラウンドで起動します。

```sh
pnpm exec astro dev --background
```

起動後は `http://localhost:4321` で確認できます。サーバーの状態確認、ログ表示、停止には次のコマンドを使用します。

```sh
pnpm exec astro dev status
pnpm exec astro dev logs
pnpm exec astro dev stop
```

## コマンド

| コマンド                  | 内容                                           |
| :------------------------ | :--------------------------------------------- |
| `pnpm dev`                | 開発サーバーをフォアグラウンドで起動           |
| `pnpm build`              | 本番用サイトを `dist/` に生成                  |
| `pnpm preview`            | 本番ビルドをローカルでプレビュー               |
| `pnpm storybook`          | Storybook を `localhost:6006` で起動           |
| `pnpm build-storybook`    | 静的な Storybook を `storybook-static/` に生成 |
| `pnpm preview:cloudflare` | Cloudflare Workers 上の挙動をローカルで確認    |
| `pnpm deploy`             | ビルドして Cloudflare Workers へデプロイ       |
| `pnpm typecheck`          | Astro と TypeScript の型チェック               |
| `pnpm lint`               | Oxlint でコードを検査                          |
| `pnpm lint:fix`           | Oxlint の安全な修正を適用                      |
| `pnpm format`             | Oxfmt でファイルを整形                         |
| `pnpm format:check`       | ファイルを変更せずフォーマットを検査           |
| `pnpm astro -- --help`    | Astro CLI のヘルプを表示                       |

## 記事の追加

`src/content/blog/` に Markdown ファイルを追加します。ファイル名が記事 URL の slug になります。

```md
---
title: 記事タイトル
excerpt: 記事の概要
pubDate: 2026-07-20
tags: [Astro, TypeScript]
featured: false
showToc: true
---

ここから本文です。
```

| フィールド | 必須 | 説明                                             |
| :--------- | :--: | :----------------------------------------------- |
| `title`    |  ✓   | 記事タイトル                                     |
| `excerpt`  |  ✓   | 一覧とメタタグに使用する概要                     |
| `pubDate`  |  ✓   | 公開日                                           |
| `tags`     |  ✓   | 1 件以上のタグ                                   |
| `featured` |      | トップページの注目記事にするか。既定値は `false` |
| `showToc`  |      | `h2` 見出しから目次を表示するか。既定値は `true` |

記事内の画像は `public/images/` に配置し、`/images/...` から参照します。

## ディレクトリ構成

```text
.
├── .github/workflows/      # GitHub Actions のデプロイワークフロー
├── public/                 # 画像、favicon、Cloudflare Pages のヘッダー設定
├── src/
│   ├── components/        # UI コンポーネントと Storybook stories
│   ├── content/blog/      # Markdown 記事
│   ├── layouts/           # 共通・記事レイアウト
│   ├── pages/             # Astro のページと動的ルート
│   ├── styles/            # グローバルスタイルとデザイントークン
│   ├── utils/             # 日付・タグ関連のユーティリティ
│   └── content.config.ts  # blog コレクションのスキーマ
├── astro.config.mjs       # Astro、サイト URL、サイトマップの設定
├── wrangler.jsonc         # Cloudflare Workers Static Assets の設定
└── package.json
```

## Cloudflare Workers へのデプロイ

`.github/workflows/deploy.yml` により、GitHub の **Actions > Deploy to Cloudflare Workers > Run workflow** から手動実行した場合だけ、Cloudflare Workers へデプロイします。push や pull request では実行されません。

ワークフローは型チェックと lint の後に Astro をビルドし、`wrangler.jsonc` の設定を使ってデプロイします。同時に複数のデプロイが発生した場合は、最新の実行を優先します。

### GitHub の設定

1. Cloudflare ダッシュボードで **Edit Cloudflare Workers** テンプレートから API トークンを作成します。対象アカウントと `iririn.com` の Zone のみにスコープを限定してください。
2. Cloudflare ダッシュボードの Workers & Pages から Account ID を確認します。
3. GitHub の **Settings > Environments** で `production` Environment を作成し、次の Environment secrets を登録します。

| Secret 名               | 値                        |
| :---------------------- | :------------------------ |
| `CLOUDFLARE_API_TOKEN`  | 手順 1 で作成したトークン |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare の Account ID  |

必要に応じて `production` Environment に Environment variable `SITE_URL` を追加できます。canonical URL とサイトマップに使用するオリジンを末尾のスラッシュなしで指定してください。未指定の場合は `https://iririn.com` が使用されます。

```text
SITE_URL=https://iririn.com
```

Environment には、デプロイ前の承認や `main` ブランチだけを許可する保護ルールも設定できます。

Cloudflare Workers Builds の Git 連携は push を契機に自動デプロイされます。手動デプロイだけに限定する場合は Workers Builds を無効にしてください。

静的アセットの出力先、Worker 名、カスタムドメインなどは `wrangler.jsonc` で管理します。ローカルから手動でデプロイする場合は `pnpm deploy` を使用できます。
