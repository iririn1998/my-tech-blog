import FeaturedArticle from './FeaturedArticle.astro';

const meta = {
	title: 'Home/FeaturedArticle',
	component: FeaturedArticle,
};

export default meta;

export const Default = {
	args: {
		title: 'React Server Components を実務に導入して分かったこと',
		excerpt:
			'半年間の運用で見えてきた、RSC の設計指針と落とし穴を整理します。データ取得の境界をどこに引くか、クライアントコンポーネントをどう最小化するか。教科書どおりにいかなかった部分を中心に書きました。',
		tag: 'React',
		href: '#',
	},
};
