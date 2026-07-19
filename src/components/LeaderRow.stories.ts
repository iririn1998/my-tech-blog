import LeaderRow from './LeaderRow.astro';

const meta = {
	title: 'Components/LeaderRow',
	component: LeaderRow,
	argTypes: {
		as: { control: 'select', options: ['p', 'li', 'div'] },
		size: { control: 'select', options: ['md', 'sm'] },
	},
};

export default meta;

export const Default = {
	args: {
		slots: {
			default: 'React Server Components を実務に導入して分かったこと',
			trailing: '07.18',
		},
	},
};

export const WithLink = {
	args: {
		href: '#',
		slots: {
			default: 'TypeScript 5.9 の satisfies 演算子活用パターン',
			trailing: '07.15',
		},
	},
};

export const AccentTrailing = {
	args: {
		accent: true,
		slots: {
			default: 'SaaS 企業でフロントエンドを担当',
			trailing: '現在',
		},
	},
};

export const SmallToc = {
	args: {
		as: 'li',
		size: 'sm',
		href: '#sec1',
		accent: true,
		slots: {
			default: '導入の背景',
			trailing: '1',
		},
	},
};
