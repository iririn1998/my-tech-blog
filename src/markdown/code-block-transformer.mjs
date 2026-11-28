/**
 * コードブロックの見た目を整える Shiki transformer。
 *
 * - <pre> を .code-block で包み、言語ラベル・ファイル名・コピーボタンを持つヘッダーを付ける。
 *   コピーボタンは JavaScript が動くときだけ表示する（初期状態は hidden）。
 * - コードフェンスの meta で次の指定ができる。
 *   - title="a.ts" … ヘッダーにファイル名を表示
 *   - {2,5-7}     … 指定した行をハイライト
 *
 * @typedef {import('hast').Element} Element
 * @typedef {import('hast').ElementContent} ElementContent
 */

/**
 * @param {string} tagName
 * @param {Record<string, unknown>} properties
 * @param {ElementContent[]} [children]
 * @returns {Element}
 */
function h(tagName, properties, children = []) {
	return { type: 'element', tagName, properties: /** @type {any} */ (properties), children };
}

/** @param {string} value */
function text(value) {
	return /** @type {const} */ ({ type: 'text', value });
}

/** @type {Map<string, Set<number>>} */
const highlightCache = new Map();

/**
 * "{2,5-7}" 形式の行指定を解釈する。
 * @param {string} meta
 * @returns {Set<number>}
 */
function parseHighlightLines(meta) {
	const cached = highlightCache.get(meta);
	if (cached) return cached;

	const lines = new Set();
	const match = /\{([\d\s,-]+)\}/.exec(meta);
	if (match) {
		for (const part of match[1].split(',')) {
			const [start, end] = part.trim().split('-').map(Number);
			if (!Number.isInteger(start)) continue;
			const last = Number.isInteger(end) ? end : start;
			for (let line = start; line <= last; line++) lines.add(line);
		}
	}
	highlightCache.set(meta, lines);
	return lines;
}

/**
 * @param {string} meta
 * @returns {string | undefined}
 */
function parseTitle(meta) {
	const match = /title=(?:"([^"]*)"|'([^']*)')/.exec(meta);
	return match ? (match[1] ?? match[2]) : undefined;
}

const copyIcon = h(
	'svg',
	{ className: ['icon', 'icon-copy'], viewBox: '0 0 16 16', ariaHidden: 'true' },
	[
		h('rect', { x: '5', y: '5', width: '9', height: '9', rx: '2' }),
		h('path', {
			d: 'M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5',
		}),
	],
);

const checkIcon = h(
	'svg',
	{ className: ['icon', 'icon-check'], viewBox: '0 0 16 16', ariaHidden: 'true' },
	[h('path', { d: 'M3 8.5l3.2 3L13 4.5' })],
);

/** @returns {import('shiki').ShikiTransformer} */
export function codeBlockTransformer() {
	return {
		name: 'web-ranch:code-block',
		line(node, line) {
			const meta = this.options.meta?.__raw ?? '';
			if (meta && parseHighlightLines(meta).has(line)) {
				this.addClassToHast(node, 'highlighted');
			}
		},
		root(root) {
			const pre = root.children.find((node) => node.type === 'element' && node.tagName === 'pre');
			if (!pre) return;

			const meta = this.options.meta?.__raw ?? '';
			const title = parseTitle(meta);
			const lang = this.options.lang === 'plaintext' ? 'text' : (this.options.lang ?? 'text');

			/** @type {ElementContent[]} */
			const headChildren = [h('span', { className: ['code-block__lang'] }, [text(lang)])];
			if (title) headChildren.push(h('span', { className: ['code-block__title'] }, [text(title)]));
			headChildren.push(
				h(
					'button',
					{ type: 'button', className: ['code-block__copy'], dataCopyCode: '', hidden: true },
					[
						h('span', { className: ['code-block__icons'] }, [copyIcon, checkIcon]),
						h('span', { className: ['code-block__copy-label'] }, [text('コピー')]),
					],
				),
			);

			root.children = [
				h('div', { className: ['code-block'], dataLanguage: lang }, [
					h('div', { className: ['code-block__head'] }, headChildren),
					/** @type {Element} */ (pre),
				]),
			];
		},
	};
}
