import TableOfContents from './TableOfContents.astro';

const meta = {
	title: 'Article/TableOfContents',
	component: TableOfContents,
};

export default meta;

export const Default = {
	args: {
		headings: [
			{ slug: 'sec1', text: '導入の背景' },
			{ slug: 'sec2', text: 'データ取得の境界を引く' },
			{ slug: 'sec3', text: 'つまずいたポイント' },
			{ slug: 'sec4', text: '成果と数字' },
			{ slug: 'sec5', text: 'まとめ' },
		],
	},
};

export const Short = {
	args: {
		headings: [
			{ slug: 'sec1', text: '最小構成' },
			{ slug: 'sec2', text: 'フォールバック' },
		],
	},
};
