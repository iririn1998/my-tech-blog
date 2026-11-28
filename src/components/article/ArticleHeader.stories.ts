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
		excerpt:
			'半年間の運用で見えてきた、RSC の設計指針と落とし穴を整理します。データ取得の境界をどこに引くか、クライアントコンポーネントをどう最小化するか。',
		readingMinutes: 15,
		sectionCount: 5,
	},
};

export const SingleTag = {
	args: {
		title: 'TypeScript 5.9 の satisfies 演算子活用パターン',
		date: '2026-07-15',
		tags: ['TypeScript'],
	},
};
