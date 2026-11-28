import FeaturedArticle from './FeaturedArticle.astro';

const meta = {
	title: 'Home/FeaturedArticle',
	component: FeaturedArticle,
};

export default meta;

export const Default = {
	args: {
		title: 'MacのショートカットAppでLGTM画像を作成する',
		excerpt:
			'Macの標準アプリ「ショートカット」を使い、ローカル画像からLGTM画像を作成するツールの作り方を紹介します。',
		tags: ['Mac', 'ショートカット', 'LGTM'],
		href: '#',
		date: '2026-07-20',
		fileName: 'posts/mac-shortcuts-lgtm-image-maker.md',
		readingMinutes: 4,
	},
};

export const LongTitle = {
	args: {
		title: 'React Server Components を実務に導入して分かったこと',
		excerpt:
			'半年間の運用で見えてきた、RSC の設計指針と落とし穴を整理します。データ取得の境界をどこに引くか、クライアントコンポーネントをどう最小化するか。教科書どおりにいかなかった部分を中心に書きました。',
		tags: ['React', '設計'],
		href: '#',
		date: '2026-07-18',
		fileName: 'posts/react-server-components.md',
		readingMinutes: 15,
	},
};
