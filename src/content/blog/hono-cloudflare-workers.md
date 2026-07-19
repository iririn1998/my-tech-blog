---
title: Hono + Cloudflare Workers で作る軽量 API
excerpt: エッジで動く軽量 API を Hono で組む手順です。ルーティング、バリデーション、デプロイまでを最小構成で一気に通します。
pubDate: 2026-06-24
tags: [バックエンド]
---

「このくらいの API にコンテナは大げさ」— そんな場面で、Hono + Workers は現時点の最短ルートだと思います。個人開発の API をこの構成に寄せた手順をまとめます。

## 最小構成

ルーターとハンドラーだけの構成から始めます。Hono の API は Express に近く、学習コストはほぼありません。

```ts
import { Hono } from 'hono';

const app = new Hono();

app.get('/posts/:id', (c) => {
	return c.json({ id: c.req.param('id') });
});

export default app;
```

## バリデーション

`@hono/zod-validator` でリクエストを検証します。スキーマから型が導出されるので、ハンドラー内は型安全に書けます。

## デプロイ

`wrangler deploy` 一発です。コールドスタートが実質ゼロなので、低頻度アクセスの個人 API には特に向いています。
