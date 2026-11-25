import Breadcrumb from './Breadcrumb.astro';

const meta = {
	title: 'Components/Breadcrumb',
	component: Breadcrumb,
};

export default meta;

export const Default = {
	args: {
		items: [{ label: 'タグ別一覧' }],
	},
};

export const LongTitle = {
	args: {
		items: [{ label: 'React Server Components を実務に導入して分かったこと' }],
	},
};
