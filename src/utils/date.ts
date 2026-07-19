const pad = (n: number): string => String(n).padStart(2, '0');

/** 2026.07.18 形式 (記事ヘッダー用) */
export function formatFullDate(date: Date): string {
	return `${date.getUTCFullYear()}.${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}`;
}

/** 07.18 形式 (タグ別一覧用) */
export function formatShortDate(date: Date): string {
	return `${pad(date.getUTCMonth() + 1)}.${pad(date.getUTCDate())}`;
}

/** 2026-07-18 形式 (time 要素の datetime 属性用) */
export function formatIsoDate(date: Date): string {
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}
