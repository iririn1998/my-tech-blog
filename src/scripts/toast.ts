/**
 * 画面下部に短いメッセージを表示する。
 * 表示先は BaseLayout の [data-toast-region]（aria-live="polite"）。
 */

const VISIBLE_MS = 1800;
const EXIT_MS = 200;

let hideTimer: number | undefined;
let removeTimer: number | undefined;

const CHECK_ICON =
	'<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 8.5l3.2 3L13 4.5" /></svg>';

export function showToast(message: string): void {
	const region = document.querySelector<HTMLElement>('[data-toast-region]');
	if (!region) return;

	window.clearTimeout(hideTimer);
	window.clearTimeout(removeTimer);

	const toast = document.createElement('div');
	toast.className = 'toast';
	toast.innerHTML = CHECK_ICON;
	toast.append(document.createTextNode(message));
	region.replaceChildren(toast);

	hideTimer = window.setTimeout(() => {
		toast.dataset.state = 'out';
		removeTimer = window.setTimeout(() => toast.remove(), EXIT_MS);
	}, VISIBLE_MS);
}
