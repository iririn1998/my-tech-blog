import { defineMain } from '@storybook-astro/framework/node';

export default defineMain({
	stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
	framework: {
		name: '@storybook-astro/framework',
		options: {},
	},
});
