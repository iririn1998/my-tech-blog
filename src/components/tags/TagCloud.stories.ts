import TagCloud from './TagCloud.astro';

const meta = {
	title: 'Tags/TagCloud',
	component: TagCloud,
};

export default meta;

export const Default = {
	args: {
		tags: [
			{ name: 'React', count: 1 },
			{ name: '設計', count: 1 },
			{ name: 'TypeScript', count: 1 },
			{ name: 'ビルドツール', count: 1 },
			{ name: 'CSS', count: 1 },
			{ name: 'ブラウザAPI', count: 2 },
			{ name: 'テスト', count: 2 },
			{ name: 'パフォーマンス', count: 1 },
			{ name: 'バックエンド', count: 1 },
			{ name: 'ツーリング', count: 1 },
			{ name: 'フレームワーク', count: 1 },
		],
	},
};
