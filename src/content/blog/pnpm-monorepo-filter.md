---
title: pnpm --filterを用いよう
excerpt: pnpmのmonorepoで規模が大きくなるほど重くなるCIを、pnpm --filterの差分フィルタで「変更があったパッケージとその依存元だけ」に絞る方法をまとめます。フィルタ記法の基本から、GitHub Actionsへの組み込み、運用上の落とし穴までを扱います。
pubDate: 2026-09-09
tags: [pnpm, monorepo, CI]
featured: false
---

pnpmのworkspaceでmonorepoを運用していると、パッケージが増えるにつれてCIがどんどん遅くなっていきます。READMEを1行直しただけのPRで、全パッケージのlint・型チェック・テストが十数分走る。よくある光景です。

原因は単純で、`pnpm -r run test` のように「全部のパッケージで実行する」CIになっているからです。pnpmには、workspace内のパッケージを条件で絞り込む `--filter` オプションがあり、その条件として「あるコミット以降に変更があったパッケージ」を指定できます。これを使うと、**差分があるパッケージと、それに依存しているパッケージだけ**にCIを絞れます。

この記事では、`pnpm --filter` の基本的な記法から、差分ベースの絞り込み、GitHub Actionsへの組み込み、運用上の注意点までを一通りまとめます。

## 前提となるmonorepo構成

説明のために、次のようなworkspaceを想定します。

```text
.
├── pnpm-workspace.yaml
├── package.json
├── apps/
│   ├── web/        # @acme/web   → @acme/ui, @acme/utils に依存
│   └── admin/      # @acme/admin → @acme/ui に依存
└── packages/
    ├── ui/         # @acme/ui    → @acme/utils に依存
    └── utils/      # @acme/utils
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

依存関係を図にするとこうなります。矢印は「依存している」方向です。

```text
@acme/web ──→ @acme/ui ──→ @acme/utils
@acme/admin ─┘               ↑
@acme/web ───────────────────┘
```

パッケージ間の依存は、各 `package.json` で `"@acme/utils": "workspace:*"` のように[workspaceプロトコル](https://pnpm.io/workspaces#workspace-protocol-workspace)を使って宣言しているものとします。pnpmはこの宣言をもとに依存グラフを組み立てるので、後述の `...` 記法が正しく機能します。

## pnpm --filterの基本

`--filter`（短縮形は `-F`）は、コマンドを実行する対象パッケージを絞り込むオプションです。`run`、`exec`、`install`、`ls` など、workspaceを対象にするほとんどのコマンドで使えます。

```bash
# パッケージ名で指定
pnpm --filter @acme/ui run test

# globで指定（シェルに展開されないようクォートする）
pnpm --filter "@acme/*" run test

# ディレクトリで指定
pnpm --filter ./packages/ui run test
pnpm --filter "{apps/**}" run test

# 除外
pnpm --filter "@acme/*" --filter "!@acme/web" run test
```

`--filter` を複数指定すると、それぞれの選択結果の和集合になります。`!` で始まる指定は除外で、他の条件で選ばれたものから取り除きます。

ここまでは「どのパッケージか」を直接指定する使い方ですが、monorepoで本当に欲しいのは「このパッケージに関係するものをまとめて」という指定です。そのために依存関係をたどる記法があります。

## 依存関係をたどる記法

`...` をパッケージ指定の前後に付けると、依存グラフをたどって選択範囲を広げられます。

| 記法        | 意味                                                   |
| ----------- | ------------------------------------------------------ |
| `<pkg>`     | `<pkg>` のみ                                           |
| `<pkg>...`  | `<pkg>` と、`<pkg>` が依存しているパッケージ（依存先） |
| `...<pkg>`  | `<pkg>` と、`<pkg>` に依存しているパッケージ（依存元） |
| `<pkg>^...` | `<pkg>` の依存先のみ（`<pkg>` 自身を含まない）         |
| `...^<pkg>` | `<pkg>` の依存元のみ（`<pkg>` 自身を含まない）         |

先ほどの構成で試すと、次のようになります。

```bash
# @acme/ui と、それが依存する @acme/utils
pnpm --filter "@acme/ui..." exec pwd
# → packages/ui, packages/utils

# @acme/ui と、それに依存する @acme/web, @acme/admin
pnpm --filter "...@acme/ui" exec pwd
# → packages/ui, apps/web, apps/admin
```

CIで重要なのは後者の `...<pkg>` です。あるパッケージを変更したとき、壊れる可能性があるのは**そのパッケージ自身と、それを使っている側**だからです。`@acme/utils` を変更したら `@acme/ui` も `@acme/web` も `@acme/admin` も影響を受けますが、逆に `@acme/admin` を変更しても `@acme/utils` には何の影響もありません。

## 差分があるパッケージだけを選ぶ

ここからが本題です。`--filter` には、**指定したコミットやブランチ以降に変更されたファイルを含むパッケージ**を選択する `[<since>]` 記法があります。

```bash
# origin/main 以降に変更があったパッケージ
pnpm --filter "[origin/main]" run test

# 変更があったパッケージと、それに依存しているパッケージ
pnpm --filter "...[origin/main]" run test
```

`[<since>]` にはブランチ名、タグ、コミットハッシュなど、gitが解決できる参照を渡せます。pnpmは指定した参照と現在の作業ツリーの差分からファイル一覧を取り、各ファイルがどのパッケージのディレクトリに属するかを判定して対象を決めます。

先ほどの構成で、変更したパッケージごとに `...[origin/main]` が何を選ぶかを見てみます。

| 変更したパッケージ | 選択されるパッケージ                                  |
| ------------------ | ----------------------------------------------------- |
| `@acme/utils`      | `@acme/utils`, `@acme/ui`, `@acme/web`, `@acme/admin` |
| `@acme/ui`         | `@acme/ui`, `@acme/web`, `@acme/admin`                |
| `@acme/admin`      | `@acme/admin`                                         |
| （変更なし）       | なし                                                  |

`@acme/utils` のような土台のパッケージを触れば全部走り、末端の `@acme/admin` だけなら1パッケージで済みます。全パッケージを毎回回すのに比べて、末端の変更が多い日常的なPRでは大幅にCI時間を削れます。

ディレクトリと組み合わせて範囲を限定することもできます。

```bash
# packages/ 配下で変更があったものと、その依存元
pnpm --filter "...{packages/**}[origin/main]" run test
```

## GitHub Actionsに組み込む

実際にPRのCIに組み込むと、次のようなワークフローになります。

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v6

      - uses: actions/setup-node@v6
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - name: Resolve base commit
        run: echo "BASE=$(git merge-base origin/${{ github.base_ref }} HEAD)" >> "$GITHUB_ENV"

      - name: Show affected packages
        run: pnpm --filter "...[$BASE]" exec pwd

      - name: Lint / Typecheck / Test (affected only)
        run: |
          pnpm --filter "...[$BASE]" run lint
          pnpm --filter "...[$BASE]" run typecheck
          pnpm --filter "...[$BASE]" run test
```

ポイントは3つあります。

### fetch-depth: 0 でgit履歴を取得する

`actions/checkout` はデフォルトで直近1コミットしか取得しません（shallow clone）。`[<since>]` はgitで差分を取るので、比較対象のコミットが手元にないと正しく動きません。`fetch-depth: 0` で履歴全体を取るか、少なくともベースブランチを `git fetch origin main` で取得しておく必要があります。

### 比較対象はブランチの先端ではなくmerge-base

`[origin/main]` と書くと、比較対象は `origin/main` の**先端**になります。PRを作った後に `main` が進んでいると、「`main` に入った他人の変更」まで自分のPRの差分として扱われ、関係ないパッケージが選ばれてしまいます。

これを避けるために、`git merge-base` でPRブランチと `main` の分岐点を求め、そのコミットを比較対象にしています。`github.base_ref` はPRのベースブランチ名（通常は `main`）が入るので、ベースが `develop` などでもそのまま動きます。

### 対象パッケージをログに出す

`exec pwd` で、そのフィルタが何を選んだかをログに残しています。「なぜこのPRでこのパッケージのテストが走ったのか（走らなかったのか）」を後から確認できるので、最初のうちは入れておくと安心です。

## 運用上の注意点

差分ベースのCIは速くなる反面、「本当は走らせるべきだったのに走らなかった」が起きると厄介です。よくある落とし穴をまとめます。

### ルート直下の共通設定の変更が伝播しない

`tsconfig.base.json` や `pnpm-lock.yaml` のような、workspaceのルートに置いてある共通ファイルを変更した場合、それはどのサブパッケージにも属さないので、ルートのパッケージが変更されたものとして扱われます。ルートに依存しているパッケージは通常存在しないため、`...[<since>]` を使ってもサブパッケージは選ばれません。

共通設定を変えたら全部走らせたい、という要件はよくあるので、そういうファイルの変更を検出したらフィルタなしで実行するフォールバックを用意しておくと安全です。

```yaml
- name: Detect root config changes
  id: root
  run: |
    if git diff --name-only "$BASE" HEAD | grep -qE '^(pnpm-lock\.yaml|pnpm-workspace\.yaml|tsconfig\.base\.json)$'; then
      echo "changed=true" >> "$GITHUB_OUTPUT"
    fi

- name: Test (all)
  if: steps.root.outputs.changed == 'true'
  run: pnpm -r run test

- name: Test (affected only)
  if: steps.root.outputs.changed != 'true'
  run: pnpm --filter "...[$BASE]" run test
```

どのファイルを「全部走らせるトリガー」にするかはプロジェクト次第です。lockfileはほぼ確実に含めたほうがよいです。

### ドキュメントだけの変更を無視する

`README.md` を直しただけでそのパッケージのテストが走るのは無駄なので、`--changed-files-ignore-pattern` で変更検出から除外できます。

```bash
pnpm --filter "...[$BASE]" --changed-files-ignore-pattern "**/*.md" run test
```

複数パターンを指定したい場合は、オプションを複数回書きます。

### テストファイルだけの変更で依存元まで走らせない

`--test-pattern` を指定すると、変更されたファイルがそのパターンにマッチする場合に「テストの変更」とみなし、そのパッケージの依存元を選択対象から外します。テストを書き直しただけで下流まで全部走る、という無駄を減らせます。

```bash
pnpm --filter "...[$BASE]" --test-pattern "**/*.test.ts" run test
```

### 何もマッチしないときの挙動

差分がどのパッケージにも属さない場合、`--filter` は何も選ばず、`run` は「No projects matched the filters」と出力して正常終了します。CIとしては「テストすべきものがないので成功」として扱えるので、多くの場合はこの挙動で問題ありません。逆に、マッチしないことをエラーにしたい場合は `--fail-if-no-match` を付けます。

### scriptが定義されていないパッケージ

`--filter` 付きの `run` は複数パッケージを対象にするため、`test` scriptを持たないパッケージは黙ってスキップされます。単一パッケージだけが選ばれたときにも同じ挙動にしたい場合は、`--if-present` を付けておくと安全です。

### ローカルでも同じフィルタを使える

CI専用の仕組みではないので、手元でも同じコマンドが使えます。コミット前に「自分の変更で影響を受ける範囲だけテストしたい」という場面で便利です。

```bash
pnpm --filter "...[origin/main]" run test
```

ローカルでは比較対象が `origin/main` の先端でも、`git fetch` 直後であれば実用上ほとんど困りません。

## さらに速くするなら

`pnpm --filter` だけでも大きく改善しますが、規模がさらに大きくなると次のような選択肢も出てきます。

- **タスクランナーの導入**: [Turborepo](https://turborepo.com/)や[Nx](https://nx.dev/)は、同様の差分フィルタ（Turborepoは `--filter=...[origin/main]` とpnpmに近い記法）に加えて、タスク結果のキャッシュとリモートキャッシュを提供します。「変更されていないパッケージのテストは前回の結果を再利用する」ところまでいけるので、差分フィルタの次の一手として検討する価値があります。
- **ジョブの分割**: 影響を受けるパッケージ一覧を `pnpm ls --filter "...[$BASE]" --depth -1 --json` で取り出し、GitHub Actionsのmatrixに渡してパッケージごとにジョブを並列化する方法もあります。パッケージ単位のテストが重い場合に効きます。

ただし、いずれも `pnpm --filter` の上に積み上げる仕組みです。まずはworkspaceプロトコルで依存を正しく宣言し、`...[<since>]` で差分CIが正しく動く状態を作るのが先です。

## まとめ

- `pnpm --filter` はworkspace内のパッケージを条件で絞り込むオプションで、名前・glob・ディレクトリで指定できる
- `...<pkg>` で「そのパッケージに依存しているもの」まで選択範囲を広げられる。CIで欲しいのはこの方向
- `[<since>]` で「指定コミット以降に変更があったパッケージ」を選べる。`...[<since>]` と組み合わせると、差分と影響範囲だけにCIを絞れる
- GitHub Actionsでは `fetch-depth: 0` で履歴を取り、比較対象には `git merge-base` で求めた分岐点を使う
- ルート直下の共通設定はサブパッケージに伝播しないので、lockfileなどの変更時は全実行するフォールバックを用意する
- `--changed-files-ignore-pattern` や `--test-pattern` で、無駄な実行をさらに減らせる

monorepoのCIが遅いと感じたら、まずは手元で `pnpm --filter "...[origin/main]" exec pwd` を実行して、自分の変更がどこまで影響するのかを眺めてみてください。全パッケージを回す必要がないことが、目に見えて分かるはずです。
