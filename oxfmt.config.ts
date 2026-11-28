import { defineConfig } from 'oxfmt';

export default defineConfig({
	printWidth: 100,
	tabWidth: 2,
	useTabs: true,
	singleQuote: true,
	trailingComma: 'all',
	ignorePatterns: ['dist/**', '.astro/**', 'node_modules/**', '.pnpm-store/**'],
});
