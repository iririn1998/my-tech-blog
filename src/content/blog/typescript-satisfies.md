---
title: TypeScript 5.9 の satisfies 演算子活用パターン
excerpt: 型推論を保ったまま制約を掛ける satisfies の使いどころを、設定オブジェクトの型付けを例に紹介します。as const との併用や、型の絞り込みが崩れる場合の対処もあわせて整理しました。
pubDate: 2026-07-15
tags: [TypeScript]
---

型注釈を付けると推論が失われ、付けないと制約が掛からない。設定オブジェクトの型付けで誰もが直面するこのジレンマを、`satisfies` はきれいに解決してくれます。

## 基本パターン

`satisfies` は「値が型を満たすことを検査しつつ、推論結果は保つ」演算子です。ルート定義やテーマ定義のような、キーを列挙して使い回すオブジェクトで威力を発揮します。

```ts
const routes = {
	home: '/',
	posts: '/posts',
	tags: '/tags',
} satisfies Record<string, `/${string}`>;

// routes.home の型は string ではなく '/' のまま
```

## as const との併用

リテラル型まで固定したい場合は `as const satisfies` を使います。順序に意味がある配列の定義で特に有効です。

## 絞り込みが崩れるケース

ユニオン型のプロパティに `satisfies` を通すと、期待した絞り込みが効かない場合があります。その際は判別可能ユニオンに構造を寄せるのが確実でした。
