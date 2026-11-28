// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { codeBlockTransformer } from './src/markdown/code-block-transformer.mjs';
import webRanchTheme from './src/markdown/web-ranch-theme.mjs';

const site = process.env.SITE_URL ?? 'https://iririn.com';

// https://astro.build/config
export default defineConfig({
	site,
	trailingSlash: 'always',
	integrations: [sitemap()],
	markdown: {
		shikiConfig: {
			// 暗い背景で全トークンのコントラスト比が 5:1 以上になる独自テーマ
			theme: webRanchTheme,
			transformers: [codeBlockTransformer()],
		},
	},
});
