/**
 * 記事ページの振る舞い。
 *
 * - 読了率: --read-progress (0〜1) を <html> に設定し、読了バー・目次・目次ボタンのリングが参照する。
 * - 目次: 読んでいる見出しを判定して、マーカー位置・読了チェック・残り時間を更新する。
 * - ヘッダー: 記事タイトルを読み過ぎたら [data-scrolled] を付け、ナビゲーションを記事タイトルに入れ替える。
 * - 見出しアンカー: h2 / h3 に「#」リンクを付け、クリックでリンクをコピーする。
 * - コードブロック: コピーボタンを有効にする。
 * - 狭い画面の目次シート (<dialog>) の開閉。
 */
import { showToast } from './toast';

const pad = (n: number): string => String(n).padStart(2, '0');

function addHeadingAnchors(article: HTMLElement): void {
	for (const heading of article.querySelectorAll<HTMLHeadingElement>('h2[id], h3[id]')) {
		const label = heading.textContent?.trim() ?? '';
		const anchor = document.createElement('a');
		anchor.className = 'heading-anchor';
		anchor.href = `#${encodeURIComponent(heading.id)}`;
		anchor.setAttribute('aria-label', `「${label}」へのリンクをコピー`);
		anchor.textContent = '#';
		anchor.addEventListener('click', () => {
			// 画面のスクロールと URL の更新はリンクの既定動作に任せ、URL だけコピーする
			const url = new URL(anchor.getAttribute('href') ?? '', window.location.href).href;
			navigator.clipboard
				?.writeText(url)
				.then(() => showToast('リンクをコピーしました'))
				.catch(() => {});
		});
		heading.append(anchor);
	}
}

function enableCodeCopy(article: HTMLElement): void {
	if (!navigator.clipboard) return;

	for (const button of article.querySelectorAll<HTMLButtonElement>('[data-copy-code]')) {
		const label = button.querySelector('.code-block__copy-label');
		let resetTimer: number | undefined;
		button.hidden = false;
		button.addEventListener('click', () => {
			const code = button.closest('.code-block')?.querySelector('pre code');
			if (!code) return;
			navigator.clipboard
				.writeText(code.textContent ?? '')
				.then(() => {
					button.dataset.copied = '';
					if (label) label.textContent = 'コピー済み';
					showToast('コードをコピーしました');
					window.clearTimeout(resetTimer);
					resetTimer = window.setTimeout(() => {
						delete button.dataset.copied;
						if (label) label.textContent = 'コピー';
					}, 2000);
				})
				.catch(() => showToast('コピーできませんでした'));
		});
	}
}

function trackReading(article: HTMLElement): void {
	const root = document.documentElement;
	const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
	const lists = [...document.querySelectorAll<HTMLElement>('[data-toc-list]')];
	const slugs = [...new Set(links.map((link) => link.dataset.tocLink ?? ''))];
	const headings = slugs
		.map((slug) => document.getElementById(slug))
		.filter((heading): heading is HTMLElement => heading !== null);
	const percentLabels = document.querySelectorAll<HTMLElement>('[data-toc-percent]');
	const restLabels = document.querySelectorAll<HTMLElement>('[data-toc-rest]');
	const positionLabels = document.querySelectorAll<HTMLElement>('[data-toc-position]');
	const minutes = Number(article.dataset.readingMinutes ?? 0);
	const header = document.querySelector<HTMLElement>('[data-site-header]');

	let activeIndex = -2;
	let lastPercent = -1;
	let frame = 0;

	const updateMarkers = (): void => {
		for (const list of lists) {
			const current = list.querySelector<HTMLElement>('[data-state="current"]');
			if (current && current.offsetHeight > 0) {
				list.style.setProperty('--marker-y', `${current.offsetTop}px`);
				list.style.setProperty('--marker-h', `${current.offsetHeight}px`);
				list.dataset.hasCurrent = '';
			} else {
				delete list.dataset.hasCurrent;
			}
		}
	};

	const setActive = (index: number): void => {
		activeIndex = index;
		for (const link of links) {
			const i = slugs.indexOf(link.dataset.tocLink ?? '');
			if (i < index) link.dataset.state = 'read';
			else if (i === index) link.dataset.state = 'current';
			else delete link.dataset.state;
			if (i === index) link.setAttribute('aria-current', 'location');
			else link.removeAttribute('aria-current');
		}
		for (const label of positionLabels) {
			label.textContent = `${pad(Math.max(index, 0) + 1)} / ${pad(slugs.length)}`;
		}
		updateMarkers();
	};

	const update = (): void => {
		frame = 0;
		const headerOffset =
			header && getComputedStyle(header).position === 'sticky' ? header.offsetHeight : 0;
		const rect = article.getBoundingClientRect();
		const start = rect.top + window.scrollY - headerOffset;
		const end = rect.bottom + window.scrollY - window.innerHeight;
		const progress =
			end > start ? Math.min(1, Math.max(0, (window.scrollY - start) / (end - start))) : 1;
		root.style.setProperty('--read-progress', progress.toFixed(4));

		const percent = Math.round(progress * 100);
		if (percent !== lastPercent) {
			lastPercent = percent;
			for (const label of percentLabels) label.textContent = `${percent}%`;
			const rest =
				progress >= 0.99
					? '読了しました'
					: `残り 約${Math.max(1, Math.ceil(minutes * (1 - progress)))}分`;
			for (const label of restLabels) label.textContent = rest;
		}

		const threshold = headerOffset + window.innerHeight * 0.25;
		let index = -1;
		headings.forEach((heading, i) => {
			if (heading.getBoundingClientRect().top <= threshold) index = i;
		});
		if (index !== activeIndex) setActive(index);
	};

	const requestUpdate = (): void => {
		if (!frame) frame = window.requestAnimationFrame(update);
	};

	window.addEventListener('scroll', requestUpdate, { passive: true });
	window.addEventListener('resize', () => {
		requestUpdate();
		updateMarkers();
	});
	update();

	initTocSheet(updateMarkers);
}

function initTocSheet(onOpen: () => void): void {
	const sheet = document.querySelector<HTMLDialogElement>('[data-toc-sheet]');
	const openButton = document.querySelector<HTMLButtonElement>('[data-toc-open]');
	if (!sheet || !openButton) return;

	openButton.addEventListener('click', () => {
		sheet.showModal();
		onOpen();
	});
	sheet.querySelector('[data-toc-close]')?.addEventListener('click', () => sheet.close());
	// シートの外側（背景）をクリックしたら閉じる
	sheet.addEventListener('click', (event) => {
		if (event.target === sheet) sheet.close();
	});
	for (const link of sheet.querySelectorAll('[data-toc-link]')) {
		link.addEventListener('click', () => sheet.close());
	}
}

function watchTitle(): void {
	const title = document.querySelector<HTMLElement>('[data-article-title]');
	const header = document.querySelector<HTMLElement>('[data-site-header]');
	if (!title || !header) return;

	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting && entry.boundingClientRect.top < 0) header.dataset.scrolled = '';
			else delete header.dataset.scrolled;
		},
		{ rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
	);
	observer.observe(title);
}

function watchArticleEnd(): void {
	const done = document.querySelector<HTMLElement>('[data-read-done]');
	if (!done) return;

	const observer = new IntersectionObserver(
		([entry]) => {
			if (entry.isIntersecting) {
				done.dataset.state = 'done';
				observer.disconnect();
			}
		},
		{ threshold: 0.6 },
	);
	observer.observe(done);
}

export function initArticle(): void {
	const article = document.querySelector<HTMLElement>('[data-article-body]');
	if (!article) return;

	addHeadingAnchors(article);
	enableCodeCopy(article);
	trackReading(article);
	watchTitle();
	watchArticleEnd();
}
