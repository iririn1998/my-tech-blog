import ArticleHeader from './ArticleHeader.astro';

const meta = {
	title: 'Article/ArticleHeader',
	component: ArticleHeader,
};

export default meta;

export const Default = {
	args: {
		title: 'React Server Components を実務に導入して分かったこと',
		date: '2026-07-18',
		tags: ['React', '設計'],
	},
};

export const SingleTag = {
	args: {
		title: 'TypeScript 5.9 の satisfies 演算子活用パターン',
		date: '2026-07-15',
		tags: ['TypeScript'],
	},
};
