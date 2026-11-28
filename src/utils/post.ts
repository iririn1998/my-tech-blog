/** 1分あたりに読める和文の文字数の目安 */
const CHARS_PER_MINUTE = 500;

/**
 * Markdown 本文から読了目安（分）を概算する。
 * コードブロック・画像・URL・記号は数えず、空白を除いた文字数を基準にする。
 */
export function getReadingMinutes(markdown: string | undefined): number {
	if (!markdown) return 1;
	const text = markdown
		.replace(/```[\s\S]*?```/g, '')
		.replace(/!\[[^\]]*\]\([^)]*\)/g, '')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[#>*_`|~-]/g, '')
		.replace(/\s+/g, '');
	return Math.max(1, Math.round(text.length / CHARS_PER_MINUTE));
}

/**
 * 記事タイトルに付ける view-transition-name。
 * 一覧のタイトルと記事ページの見出しに同じ名前を付け、遷移時に変形させる。
 */
export function getTitleTransitionName(postId: string): string {
	return `post-title-${postId.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
}
