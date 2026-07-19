import SectionLabel from './SectionLabel.astro';

const meta = {
	title: 'Components/SectionLabel',
	component: SectionLabel,
};

export default meta;

export const Default = {
	args: {
		slots: { default: '最新の記事' },
	},
};

export const Toc = {
	args: {
		slots: { default: '目次' },
	},
};
