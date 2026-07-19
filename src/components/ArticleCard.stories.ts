import ArticleCard from './ArticleCard.astro';

const meta = {
	title: 'Components/ArticleCard',
	component: ArticleCard,
};

export default meta;

export const Default = {
	args: {
		title: 'TypeScript 5.9 の satisfies 演算子活用パターン',
		excerpt:
			'型推論を保ったまま制約を掛ける satisfies の使いどころを、設定オブジェクトの型付けを例に紹介します。as const との併用や、型の絞り込みが崩れる場合の対処もあわせて整理しました。',
		tag: 'TypeScript',
		href: '#',
	},
};

export const LongExcerpt = {
	args: {
		title: 'Vite のビルドを 40% 速くした話',
		excerpt:
			'依存の事前バンドルと chunk 分割の見直しで、CI のビルド時間を4割削減した記録です。計測の方法と、試したものの効果が薄かった施策も正直に書きました。長い抜粋は3行でクランプされ、それ以降は省略されます。この文章はクランプの確認用にわざと長くしてあります。',
		tag: 'ビルドツール',
		href: '#',
	},
};
