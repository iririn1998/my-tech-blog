---
title: TypeScriptの循環importを理解して直す
excerpt: TypeScriptで循環importが起きる仕組み、実行時にReferenceErrorやundefinedが起きる理由、madgeなどでの検出方法、型のみimportや依存の整理といった解決パターンをまとめます。
pubDate: 2026-07-21
tags: [TypeScript, JavaScript, 設計]
featured: false
---

TypeScriptで開発していると、ある日突然「昨日まで動いていたのに `undefined` になる」「初期化順がおかしい」という不可解なバグに遭遇することがあります。原因を追うと、モジュール同士がお互いをimportし合う「循環import（循環依存）」だった、というのはよくある話です。

この記事の中心にあるのは、TypeScriptの型システムそのものというより、TypeScriptが扱うJavaScriptモジュールの実行方式です。実際の挙動は、ES ModulesかCommonJSか、そしてNode.jsやバンドラーなどの実行環境によって変わります。

この記事では、循環importが起きる仕組みから、検出方法、解決パターンまでを一通りまとめます。

## 循環importとは

モジュールAがモジュールBをimportし、モジュールBもモジュールAをimportしている状態です。直接の相互参照だけでなく、`A → B → C → A` のように間接的に一周するケースも含みます。

```ts
// a.ts
import { b } from './b.js';
export const a = 'a';
console.log('a.ts:', b); // 本体評価フェーズで実行される（実際にはここへ到達しない、後述）

// b.ts
import { a } from './a.js';
export const b = 'b';
console.log('b.ts:', a);
```

この例はES Modulesの挙動を説明する概念例です。Node.jsのネイティブESMでは相対importの拡張子が必須なので、TypeScriptを変換して実行する場合も、出力先を指す `.js` をimport specifierに書きます。tsconfigの `module` / `moduleResolution` には `NodeNext` を使い、`package.json` に `"type": "module"` を指定すると、この形式をTypeScript側でも検査しながらES Modulesとして出力できます。`.mjs` で直接試す場合は、ファイル名とimport先をどちらも `.mjs` に変更してください。詳しくは[Node.jsのES Modulesドキュメント](https://nodejs.org/api/esm.html#mandatory-file-extensions)を参照してください。

AstroやViteのようにバンドラーがモジュール解決を担当する環境では、拡張子を省略できる場合があります。大切なのはTypeScriptソースの見た目ではなく、最終的にどのモジュール形式・実行環境で動くかです。

TypeScriptの型チェックは、循環したモジュール依存を一般にはエラーにしません。問題が表面化するのは、主に実行時のモジュール初期化です。

## 実行時に何が起きるのか

ES Modulesの実行は、大まかにいうと、モジュールを読み込んで `import` / `export` のバインディングをリンクするフェーズと、各モジュールの本体を評価するフェーズに分かれています。循環があると、あるモジュールが**相手の初期化を終える前に**評価されることがあります。

先ほどの例で `a.ts` をエントリポイントにすると、次の順で動きます。

1. `a.ts` の評価を開始する前に、依存先の `b.ts` が評価対象になる
2. `b.ts` の `import { a } from './a.js'` は、`a` へのライブバインディングとしてリンクされる
3. しかし `b.ts` の本体が実行された時点では、`a.ts` の `const a` がまだ初期化されていない

結果はこうなります。

```text
ReferenceError: Cannot access 'a' before initialization
```

`b.ts` の評価中に例外が投げられると、その時点でモジュールグラフ全体の評価が中断されます。そのため、`a.ts` の本体にある `console.log('a.ts:', b)` は一度も実行されません。

CommonJS（`require`）では、循環に遭遇した時点の**初期化途中の `module.exports`** が返されます。そのため、読み取りのタイミングによっては部分的なオブジェクトや `undefined` が渡されます。`require` 自体では例外にならず、後続処理で問題が表面化することもあります。

例えば、次のコードを `a.cjs` から読み込むと、`b.cjs` 側では `a.a` がまだ設定されていないため `undefined` になります。

```js
// a.cjs
const b = require('./b.cjs');
exports.a = 'a';
console.log('a.cjs:', b.b);

// b.cjs
const a = require('./a.cjs');
exports.b = 'b';
console.log('b.cjs:', a.a); // undefined
```

これは[Node.jsのCommonJSにおける循環の説明](https://nodejs.org/api/modules.html#cycles)でも示されている挙動です。なお、循環中に受け取ったオブジェクトと、その後 `module.exports` へ再代入されたオブジェクトが同じとは限りません。CommonJSでも、初期化途中の値を前提にした設計は避けた方が安全です。

ちなみに、関数宣言だけを相互参照している場合は動くことがあります。ただし、それは「すべてのモジュールの初期化後に呼び出される」ことを意味しません。関数をトップレベルで即座に呼び出すか、初期化完了後に呼び出すか、またES ModulesとCommonJSのどちらを使うかによって結果が変わります。クラスの `extends`、デコレータ、モジュールトップレベルでの値の参照など、**初期化時に評価されるコード**が絡むと問題が表面化しやすくなります。

## よくある発生パターン

### barrelファイル（index.ts）経由の循環

よくある原因の一つが、barrelファイル経由の循環です。

```ts
// models/index.ts
export * from './user';
export * from './post';

// models/user.ts
import { Post } from './index'; // ← indexを経由してしまう

export class User {
	posts = [new Post()]; // Postを実行時の値として使う
}

// models/post.ts
export class Post {}
```

`user.ts` が `index.ts` をimportし、`index.ts` は `user.ts` を再exportしているので循環します。この例では `Post` を値として使っているため、importはJavaScript出力にも残ります。barrelファイル自体が悪いわけではありませんが、公開用のエントリポイントと内部モジュールを混同すると、意図しない循環が起きます。内部モジュールから同じbarrelを逆importせず、必要なモジュールを `./post` のように直接importする設計が安全です。

### 型の参照だけなのに循環扱いになる

```ts
// user.ts
import { Post } from './post'; // 型としてしか使っていない

export interface User {
	posts: Post[];
}

// post.ts
import { User } from './user'; // 型としてしか使っていない

export interface Post {
	author: User;
}
```

この例では、型しか使っていないにもかかわらず、ソース上は `user.ts` と `post.ts` が相互参照しています。TypeScriptの設定によっては通常のimport文が出力時に消去されますが、設定やトランスパイラによっては実行時importとして残ることがあります。また、静的解析ツールが型依存をどのように扱うかも異なります。まず実行時依存と型依存を分けて考えることが重要です。

| ソース上の書き方                     | JavaScript出力               | 実行時の依存         |
| ------------------------------------ | ---------------------------- | -------------------- |
| `import type { Post } from './post'` | 常に消去される               | 発生しない           |
| 通常のimportを型位置だけで使う       | 消去・保持・エラーのいずれか | 出力に残れば発生する |
| 通常のimportを値位置で使う           | 原則として残る               | 発生する             |

### 双方向の親子関係

`Parent` が `Child` のリストを持ち、`Child` が `parent` への参照を持つ、というモデリングでも起きます。プロパティの型注釈にしか使わないなら、両側を `import type` にできます。

一方、ORMのデコレータが関連先のクラスを実行時に参照する場合は、単純に `import type` へ変更できません。ライブラリが提供する遅延コールバックを使う、関連メタデータを別モジュールへ分離する、エンティティを組み立てる場所を一か所に集めるなど、利用しているORMの初期化方式に合わせて依存を整理します。

## 検出方法

実行時エラーが出る前に、機械的に見つけるのが理想です。

### madge

[madge](https://github.com/pahen/madge)は依存グラフを解析して循環を列挙してくれます。

```bash
npx madge --circular --extensions ts,tsx --ts-config tsconfig.json ./src
```

```text
✖ Found 2 circular dependencies!

1) models/user.ts > models/index.ts
2) services/auth.ts > services/session.ts > services/auth.ts
```

CIに組み込む場合は、プロジェクトのpackage managerに合わせてmadgeをdevDependencyとして固定し、同じコマンドをスクリプトから実行すると再現性を保てます。現行のmadgeは `--circular` と終了コードを組み合わせてCIで利用できます。`--image graph.png` で依存グラフの画像も出力できます（Graphvizが必要です）。

実行時の循環だけを確認したい場合は、`.madgerc` で型importを解析対象から外せます。

```json
{
	"detectiveOptions": {
		"ts": { "skipTypeImports": true }
	}
}
```

### ESLint（import-x/no-cycle）

[`eslint-plugin-import-x`の `no-cycle` ルール](https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-cycle.md)を使うと、エディタ上でリアルタイムに警告されます。TypeScriptを解析するため、parserとresolverも含めて設定します。

```js
// eslint.config.js
import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import { importX } from 'eslint-plugin-import-x';

export default [
	js.configs.recommended,
	importX.flatConfigs.recommended,
	importX.flatConfigs.typescript,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parser: tsParser,
			ecmaVersion: 'latest',
			sourceType: 'module',
		},
		settings: {
			'import-x/resolver-next': [createTypeScriptImportResolver()],
		},
		rules: {
			'import-x/no-cycle': 'error',
		},
	},
];
```

この設定には `@eslint/js`、`@typescript-eslint/parser`、`eslint-plugin-import-x`、`eslint-import-resolver-typescript` が必要です。`import type` は実行時効果がないため、`no-cycle` の検査対象から自動的に除外されます。

`no-cycle` は依存グラフをたどるため、比較的コストの高いルールです。`maxDepth` で探索を制限できますが、指定した深さを超える循環は検出されません。まずは全深度で試し、実際に遅い場合だけ制限するか、CIでのみ有効にするとよいです。ESLint以外のlintツールを使っている場合は、同等の循環検出機能があるかを確認してください。

### dpdm

[dpdm](https://github.com/acrazing/dpdm)はmadgeと同様のCLIツールで、TypeScriptのパス解決（`tsconfig` の `paths`）に対応しています。TypeScriptの型依存を無視するオプションもあります。

```bash
npx dpdm --no-warning --no-tree ./src/index.ts
```

`dpdm` は指定したファイルやglobを起点に解析するため、`./src/index.ts` は実際に存在するエントリポイントへ置き換えてください。型依存を無視して実行時の循環だけを確認する場合は `-T`、CIで循環検出時に失敗させる場合は `--exit-code circular:1` を追加します。

```bash
npx dpdm -T --no-warning --no-tree ./src/index.ts
npx dpdm --exit-code circular:1 ./src/index.ts
npx dpdm --exit-code circular:1 './src/**/*.ts' './src/**/*.tsx'
```

Astroのように `.astro` ファイルがページのエントリポイントになるプロジェクトでは、このコマンドで `.astro` まで解析できるとは限りません。TypeScriptの依存グラフを調べたい範囲に、実在する `.ts` / `.tsx` のエントリポイントまたはglobを指定してください。

## 解決パターン

### 1. import typeにする

importした識別子を型位置でしか使っていないなら、`import type` に変えることで実行時の依存を消せます。ただし、型レベルの参照関係まで消えるわけではありません。

```ts
// user.ts
import type { Post } from './post';

export interface User {
	posts: Post[];
}
```

`import type` はJavaScript出力から完全に消えるため、実行時の依存が発生しません。tsconfigで [`"verbatimModuleSyntax": true`](https://www.typescriptlang.org/tsconfig/verbatimModuleSyntax.html) を有効にすると、型と値のimportを明示的に区別でき、型としてしか存在しないものを通常のimport文で取り込んで型位置で使った場合にエラーになります。

判断基準は、import先がクラスかinterfaceかではなく、importした識別子をどこで使うかです。型注釈や `implements` だけなら `import type` にできますが、`new`、`extends`、`instanceof`、デコレータなどの値位置で必要なら通常のimportを使います。

### 2. 共通部分を第三のモジュールに抽出する

AとBが互いに必要としているものが、AとBの両方が依存すべき共通概念である場合は、第三のモジュールに抽出できます。

```text
Before: user.ts ⇄ post.ts
After:  user.ts → types.ts ← post.ts
```

共有する型や定数を `types.ts` のような下層モジュールに切り出し、両者がそれを参照する形にします。この第三のモジュールが `user.ts` や `post.ts` を逆importしないことが重要です。何でも入る巨大な `types.ts` にせず、可能ならドメイン上の役割が分かる名前を付けます。値の依存が共通概念に由来する場合には、循環の解決として根本的な方法です。

### 3. 依存を逆転させる

上位のモジュールが下位の具体実装を直接importしていることが原因なら、上位側に抽象を置き、下位側がそれを実装する依存性逆転で解消できます。

```ts
// logger.ts（上位・抽象を所有する側）
export interface LogTransport {
	write(message: string): void;
}

export class Logger {
	constructor(private readonly transport: LogTransport) {}

	log(message: string) {
		this.transport.write(message);
	}
}

// slackTransport.ts（下位・具体実装）
import type { LogTransport } from './logger';

export class SlackTransport implements LogTransport {
	write(message: string) {
		console.log(message);
	}
}

// main.ts（組み立てを担当する場所）
import { Logger } from './logger';
import { SlackTransport } from './slackTransport';

const logger = new Logger(new SlackTransport());
logger.log('application started');
```

`logger.ts` は具体的なtransportを一切知りません。具体実装の選択は `main.ts` のような組み立て専用の場所へ寄せるため、`Logger` と `SlackTransport` が互いを実行時にimportする必要がなくなります。

### 4. 遅延参照にする

どうしても構造をすぐに変えられない場合、問題になる値の読み取りをモジュール初期化時から呼び出し時まで遅らせる手もあります。次の例では、`registry.ts` と `defaultHandler.ts` の循環自体は残っています。

```ts
// registry.ts
import { defaultHandler } from './defaultHandler';

export const handlers = {
	default: defaultHandler,
};

// defaultHandler.ts（Before）
import { handlers } from './registry';

export function defaultHandler() {
	/* ... */
}

export const selectedHandler = handlers.default;
```

Beforeでは、`registry.ts` の `handlers` が初期化される前に `defaultHandler.ts` が値を読むため、ES Modulesでは `ReferenceError` になります。このトップレベルの読み取りを関数へ置き換えます。

```ts
// defaultHandler.ts（After）
import { handlers } from './registry';

export function defaultHandler() {
	/* ... */
}

export function getDefaultHandler() {
	return handlers.default;
}
```

Afterは、モジュールグラフ全体の評価が終わったあとに `getDefaultHandler()` を呼ぶ限り動作します。ただし静的な循環は消えておらず、検出ツールにも循環として報告されます。

静的importを動的import（`await import(...)`）へ置き換え、モジュールの読み込み自体を呼び出し時まで遅らせる方法もあります。

```ts
// defaultHandler.ts
export function defaultHandler() {
	/* ... */
}

export async function getDefaultHandler() {
	const { handlers } = await import('./registry');
	return handlers.default;
}
```

この例では `defaultHandler.ts` から `registry.ts` への静的importがなくなるため、初期評価時の依存辺を取り除けます。ただし戻り値がPromiseになり、呼び出し側まで非同期化が必要です。モジュール初期化中にトップレベルawait経由で呼ぶと別の待ち合わせ問題を作る可能性もあります。遅延参照は対症療法になりやすいため、依存関係自体の見直しを優先した方がよいです。

## まとめ

- 循環importは型チェックを通っても、実行時に `ReferenceError` や `undefined` を引き起こすことがある
- 実際の挙動は、ES ModulesかCommonJSか、Node.jsやバンドラーなどの実行環境によって変わる
- barrelファイルはよくある原因の一つ。公開用のエントリポイントと内部モジュールを分ける
- まず実行時依存と型依存を分け、madgeやdpdmなどをプロジェクトの構成に合わせてCIへ組み込む
- 型位置だけで使うなら `import type`、値の依存なら共通モジュール抽出や依存性逆転を検討する
- 遅延参照は評価タイミングを変える方法であり、静的な循環が残る場合もある。動的importは非同期化の影響を確認する

循環importは「見つけたら直す」より「入らない仕組みを作る」のが効きます。まずは実際のエントリポイントとtsconfigに合わせて、`madge --circular` や `dpdm --exit-code circular:1` を一度走らせてみてください。
