// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL ?? 'https://my-tech-blog.pages.dev';

// https://astro.build/config
export default defineConfig({
	site,
	trailingSlash: 'always',
	integrations: [sitemap()],
	markdown: {
		shikiConfig: {
			theme: 'github-light',
		},
	},
});
