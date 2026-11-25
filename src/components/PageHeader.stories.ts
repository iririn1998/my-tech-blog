import PageHeader from './PageHeader.astro';

const meta = {
	title: 'Components/PageHeader',
	component: PageHeader,
};

export default meta;

export const Default = {
	args: {
		title: 'タグ別一覧',
		slots: {
			default: '<p>全2記事を6のタグで整理しています。タグを選ぶと該当の節へ移動します。</p>',
		},
	},
};

export const TitleOnly = {
	args: {
		title: 'このサイトについて',
	},
};
