import TagSection from './TagSection.astro';

const meta = {
	title: 'Tags/TagSection',
	component: TagSection,
};

export default meta;

export const SinglePost = {
	args: {
		name: 'React',
		posts: [
			{
				title: 'React Server Components を実務に導入して分かったこと',
				href: '#',
				dateLabel: '07.18',
				datetime: '2026-07-18',
			},
		],
	},
};

export const MultiplePosts = {
	args: {
		name: 'テスト',
		posts: [
			{
				title: 'Playwright で E2E テストを安定させる7つの工夫',
				href: '#',
				dateLabel: '07.03',
				datetime: '2026-07-03',
			},
			{
				title: 'Storybook を捨てて得たもの',
				href: '#',
				dateLabel: '06.06',
				datetime: '2026-06-06',
			},
		],
	},
};
