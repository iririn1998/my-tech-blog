import { defineConfig } from 'oxlint';

export default defineConfig({
	env: {
		astro: true,
	},
	ignorePatterns: ['dist/**', '.astro/**', 'node_modules/**', '.pnpm-store/**'],
});
