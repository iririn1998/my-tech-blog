import HomeHero from './HomeHero.astro';

const meta = {
	title: 'Home/HomeHero',
	component: HomeHero,
	parameters: {
		layout: 'fullscreen',
	},
};

export default meta;

export const Default = {
	args: {
		tags: [
			{ name: 'TypeScript', count: 3 },
			{ name: 'JavaScript', count: 2 },
			{ name: '設計', count: 1 },
			{ name: 'Mac', count: 1 },
		],
	},
};

export const WithoutTags = {};
