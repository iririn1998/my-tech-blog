import SectionHeading from './SectionHeading.astro';

const meta = {
	title: 'Components/SectionHeading',
	component: SectionHeading,
};

export default meta;

export const Default = {
	args: {
		index: '01',
		id: 'featured-heading',
		title: '特集記事',
	},
};

export const WithLink = {
	args: {
		index: '02',
		id: 'latest-heading',
		title: '最新の記事',
		slots: { default: '<a class="link-wipe" href="#">タグから探す</a>' },
	},
};
