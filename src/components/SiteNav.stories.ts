import SiteNav from './SiteNav.astro';

const meta = {
	title: 'Components/SiteNav',
	component: SiteNav,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;

export const Default = {};

export const WithContextTitle = {
	args: {
		contextTitle: 'TypeScriptの循環importを理解して直す',
	},
};
