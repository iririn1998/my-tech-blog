import CmykFigure from './CmykFigure.astro';

const meta = {
	title: 'Components/CmykFigure',
	component: CmykFigure,
};

export default meta;

export const Placeholder = {
	args: {
		aspectRatio: '3 / 2',
		placeholder: '特集記事の写真',
	},
};

export const Portrait = {
	args: {
		aspectRatio: '4 / 5',
		placeholder: 'プロフィール写真',
	},
};

export const WithCaption = {
	args: {
		aspectRatio: '4 / 5',
		placeholder: 'プロフィール写真',
		slots: {
			caption: '筆者近影 — 写真は4色の版に分解して印刷されます。',
		},
	},
};
