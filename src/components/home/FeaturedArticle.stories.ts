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
		date: '2026-07-18',
		imageSrc: '/images/mac-shortcuts-lgtm-image-maker/lgtm_image_creation.png',
	},
};

export const WithoutImage = {
	args: {
		title: 'MacのショートカットAppでLGTM画像を作成する',
		excerpt:
			'Macの標準アプリ「ショートカット」を使い、ローカル画像からLGTM画像を作成するツールの作り方を紹介します。',
		tag: 'Mac',
		href: '#',
		date: '2026-07-20',
	},
};
