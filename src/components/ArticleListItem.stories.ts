import ArticleListItem from './ArticleListItem.astro';

const meta = {
	title: 'Components/ArticleListItem',
	component: ArticleListItem,
};

export default meta;

export const Default = {
	args: {
		title: 'TypeScriptの循環importを理解して直す',
		excerpt:
			'TypeScriptで循環importが起きる仕組み、実行時にReferenceErrorやundefinedが起きる理由、madgeなどでの検出方法、型のみimportや依存の整理といった解決パターンをまとめます。',
		tags: ['TypeScript', 'JavaScript', '設計'],
		href: '#',
		date: '2026-07-21',
		readingMinutes: 12,
	},
};

export const LongExcerpt = {
	args: {
		title: 'Vite のビルドを 40% 速くした話',
		excerpt:
			'依存の事前バンドルと chunk 分割の見直しで、CI のビルド時間を4割削減した記録です。計測の方法と、試したものの効果が薄かった施策も正直に書きました。長い抜粋は2行でクランプされ、それ以降は省略されます。この文章はクランプの確認用にわざと長くしてあります。',
		tags: ['ビルドツール'],
		href: '#',
		date: '2026-07-08',
		readingMinutes: 8,
	},
};
