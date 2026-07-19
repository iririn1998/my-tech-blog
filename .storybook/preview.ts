import type { Preview } from '@storybook-astro/framework';
import '../src/styles/global.css';

const preview: Preview = {
	parameters: {
		layout: 'padded',
	},
};

export default preview;
