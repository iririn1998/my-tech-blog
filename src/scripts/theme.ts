/**
 * ライト / ダークテーマの切り替え。
 *
 * - 初期テーマは BaseLayout の head 内インラインスクリプトが描画前に決める。
 * - 切り替え時は View Transitions API で、押したボタンを中心に新しいテーマを円形に広げる。
 * - 未対応ブラウザやモーション軽減設定では即時に切り替える。
 */

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const root = document.documentElement;

function getTheme(): Theme {
	return root.dataset.theme === 'dark' ? 'dark' : 'light';
}

function getStoredTheme(): Theme | undefined {
	try {
		const value = localStorage.getItem(STORAGE_KEY);
		return value === 'light' || value === 'dark' ? value : undefined;
	} catch {
		return undefined;
	}
}

function storeTheme(theme: Theme): void {
	try {
		localStorage.setItem(STORAGE_KEY, theme);
	} catch {
		// プライベートブラウズなどで保存できなくても、表示の切り替えは続ける
	}
}

function updateButtons(): void {
	const label = getTheme() === 'dark' ? 'ライトテーマに切り替え' : 'ダークテーマに切り替え';
	for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
		button.setAttribute('aria-label', label);
	}
}

function applyTheme(theme: Theme): void {
	root.dataset.theme = theme;
	updateButtons();
}

function toggleTheme(button: HTMLElement): void {
	const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
	storeTheme(next);

	const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (typeof document.startViewTransition !== 'function' || reduceMotion) {
		applyTheme(next);
		return;
	}

	const rect = button.getBoundingClientRect();
	const x = rect.left + rect.width / 2;
	const y = rect.top + rect.height / 2;
	const radius = Math.hypot(
		Math.max(x, window.innerWidth - x),
		Math.max(y, window.innerHeight - y),
	);
	root.style.setProperty('--reveal-x', `${x}px`);
	root.style.setProperty('--reveal-y', `${y}px`);
	root.style.setProperty('--reveal-r', `${radius}px`);
	root.classList.add('is-theme-switching');

	const transition = document.startViewTransition(() => applyTheme(next));
	transition.finished.finally(() => root.classList.remove('is-theme-switching'));
}

export function initThemeToggle(): void {
	updateButtons();

	for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
		button.addEventListener('click', () => toggleTheme(button));
	}

	// テーマを選んでいない場合は OS の設定変更に追従する
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
		if (!getStoredTheme()) applyTheme(event.matches ? 'dark' : 'light');
	});
}
