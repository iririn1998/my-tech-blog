# いりりんご🍎web牧場

Web フロントエンドを中心に、試したこと・つまずいたこと・直したことを記録する個人技術ブログです。

Astro の Content Collections で Markdown 記事を管理し、Cloudflare Workers へ静的サイトとしてデプロイします。コンポーネントは Storybook でも確認できます。

## 主な機能

- 注目記事と最新記事を表示するトップページ
- Markdown から生成する記事ページと目次（現在地の表示・読了率・残り時間つき）
- タグ別の記事一覧
- ライト / ダークテーマの切り替え（OS の設定にも追従）
- コードブロックのコピー、行番号、ファイル名表示、行ハイライト
- canonical URL、Open Graph、サイトマップの生成
- Storybook による UI コンポーネントの確認

## デザインとモーション

デザインのコンセプトは「Quiet Motion — 読むことを邪魔しない動き」です。アニメーションは装飾ではなく、現在地・進捗・状態の変化を伝えるためだけに使います。

1. 本文は動かさない（記事本文・コード・画像は表示後に動かさない）
2. 動きは状態を伝えるときだけ（ホバー・現在地・進捗・完了）
3. 速く、一度だけ（操作への反応は 200ms 以内、スクロールでの出現は初回のみ）
4. いつでも減らせる（`prefers-reduced-motion` では即時切り替え）

色・文字・動きの値は `src/styles/tokens.css` にまとめています。動きの時間は `--dur-instant` (120ms) / `--dur-fast` (200ms) / `--dur-base` (320ms) / `--dur-slow` (560ms)、加減速は `--ease-out` / `--ease-standard` / `--ease-in` の 3 種類です。

実装は CSS の新しい仕様を中心にしています。未対応のブラウザでは動きなしで同じ内容が表示されます。

- ページ遷移: View Transitions API（`@view-transition` によるページ間遷移。一覧の記事タイトルが記事ページの見出しへ変形）
- スクロールで現れる要素・ページトップへ戻るボタン: Scroll-driven Animations（`animation-timeline`）
- 目次シート: `<dialog>` と `@starting-style`
- テーマ切替: `document.startViewTransition()` による円形リビール

## 技術スタック

- [Astro](https://astro.build/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- フォント: [IBM Plex Sans JP](https://fonts.google.com/specimen/IBM+Plex+Sans+JP) / [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)（Google Fonts）
- コードハイライト: [Shiki](https://shiki.style/)（独自テーマ `src/markdown/web-ranch-theme.mjs`）
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

コードブロックでは、言語名の後ろにファイル名とハイライトする行を指定できます。

````md
```ts title="user.ts" {1,4-5}
import type { Post } from './post';
```
````

## ディレクトリ構成

```text
.
├── .github/workflows/      # GitHub Actions のデプロイワークフロー
├── public/                 # 画像、favicon、Cloudflare Pages のヘッダー設定
├── src/
│   ├── components/        # UI コンポーネントと Storybook stories
│   ├── content/blog/      # Markdown 記事
│   ├── layouts/           # 共通・記事レイアウト
│   ├── markdown/          # コードブロックの Shiki テーマと transformer
│   ├── pages/             # Astro のページと動的ルート
│   ├── scripts/           # テーマ切替・記事ページ（目次・読了率・コピー）・トーストのスクリプト
│   ├── styles/            # グローバルスタイルとデザイントークン
│   ├── utils/             # 日付・タグ・読了目安のユーティリティ
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
