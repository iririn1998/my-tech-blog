---
title: CSS Subgrid で組む雑誌風レイアウト
excerpt: カードの高さ揃え問題を subgrid で解決します。実務でそのまま使える最小構成のパターンを、非対応環境向けフォールバックの書き方とあわせて紹介します。
pubDate: 2026-07-10
tags: [CSS]
---

カード一覧でタイトル・本文・フッターの行を揃えたい。flexbox では届かなかったこの要件が、subgrid なら CSS だけで完結します。

## 最小構成

親グリッドの行をカード側に引き継ぐのが subgrid の本質です。カードを `grid-row: span 3` にし、内部を `grid-template-rows: subgrid` にするだけで、隣のカードと行が揃います。

```css
.cards {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.card {
	display: grid;
	grid-row: span 3;
	grid-template-rows: subgrid;
}
```

## フォールバック

`@supports (grid-template-rows: subgrid)` で分岐し、非対応環境では従来どおり `min-height` で近似します。レイアウトが多少崩れても読めることを優先しました。
