import Tag from './Tag.astro';

const meta = {
	title: 'Components/Tag',
	component: Tag,
	argTypes: {
		variant: {
			control: 'select',
			options: ['accent', 'outline', 'neutral'],
		},
	},
};

export default meta;

export const Accent = {
	args: {
		variant: 'accent',
		slots: { default: 'React' },
	},
};

export const Outline = {
	args: {
		variant: 'outline',
		slots: { default: 'TypeScript' },
	},
};

export const Neutral = {
	args: {
		variant: 'neutral',
		slots: { default: '特集' },
	},
};

export const AsLink = {
	args: {
		variant: 'outline',
		href: '#tag-React',
		slots: { default: 'React 1' },
	},
};
