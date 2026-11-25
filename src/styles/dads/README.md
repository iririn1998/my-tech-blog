# DADS コンポーネント CSS

[デジタル庁デザインシステム コードスニペット（HTML版）](https://github.com/digital-go-jp/design-system-example-components-html)の `src/components/*/*.css` を改変せずに取り込んだものです（2026-11-25 時点の `main` ブランチ）。ライセンスは同梱の [LICENSE](./LICENSE)（MIT）に従います。

| ファイル         | コンポーネント | 主な使用箇所                         |
| :--------------- | :------------- | :----------------------------------- |
| `breadcrumb.css` | パンくずリスト | `Breadcrumb.astro`                   |
| `button.css`     | ボタン         | 特集記事の「続きを読む」             |
| `chip-label.css` | チップラベル   | `Tag.astro`                          |
| `heading.css`    | 見出し         | ページ見出し、セクション見出し       |
| `link.css`       | リンク         | 目次、記事一覧                       |
| `list.css`       | リスト         | 目次                                 |
| `toc.css`        | 目次           | `TableOfContents.astro`              |

上流との差分を追いやすくするため、このディレクトリは Oxfmt の対象外にしています。見た目の調整は各コンポーネントのスコープ付きスタイルで行い、ここのファイルは直接編集しないでください。

色・文字サイズ・角丸などのトークンは npm パッケージ [`@digital-go-jp/design-tokens`](https://www.npmjs.com/package/@digital-go-jp/design-tokens) から読み込みます（`src/styles/tokens.css`）。
