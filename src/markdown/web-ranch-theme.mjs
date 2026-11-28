/**
 * コードブロック用の Shiki テーマ。ライト / ダークどちらのテーマでも暗い背景で表示する。
 * 背景 #111618 に対して、すべてのトークンでコントラスト比 5:1 以上を確保している。
 *
 * @type {import('shiki').ThemeRegistration}
 */
const webRanchTheme = {
	name: 'web-ranch-dark',
	type: 'dark',
	fg: '#c9d2ce',
	bg: '#111618',
	colors: {
		'editor.background': '#111618',
		'editor.foreground': '#c9d2ce',
	},
	tokenColors: [
		{
			scope: ['comment', 'punctuation.definition.comment'],
			settings: { foreground: '#7d8a86' },
		},
		{
			scope: [
				'keyword',
				'keyword.control',
				'keyword.operator.new',
				'keyword.operator.expression',
				'keyword.operator.logical',
				'storage',
				'storage.type',
				'storage.modifier',
				'variable.language',
				'entity.name.tag',
			],
			settings: { foreground: '#7ad7a8' },
		},
		{
			// 代入・算術などの演算子は本文色にして、キーワードと区別する
			scope: ['keyword.operator', 'punctuation'],
			settings: { foreground: '#c9d2ce' },
		},
		{
			scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'],
			settings: { foreground: '#f2b880' },
		},
		{
			scope: [
				'entity.name.type',
				'entity.name.class',
				'entity.other.inherited-class',
				'support.type',
				'support.class',
				'support.type.property-name',
				'meta.object-literal.key',
				'entity.other.attribute-name',
			],
			settings: { foreground: '#9cc9ff' },
		},
		{
			scope: ['entity.name.function', 'support.function', 'variable.function'],
			settings: { foreground: '#d7b4f8' },
		},
		{
			scope: ['constant.numeric', 'constant.language', 'support.constant', 'constant.other'],
			settings: { foreground: '#ffb3ad' },
		},
		{
			scope: ['markup.heading', 'markup.bold'],
			settings: { foreground: '#e9edea', fontStyle: 'bold' },
		},
		{
			scope: ['markup.inserted'],
			settings: { foreground: '#7ad7a8' },
		},
		{
			scope: ['markup.deleted', 'invalid'],
			settings: { foreground: '#ff8a82' },
		},
	],
};

export default webRanchTheme;
