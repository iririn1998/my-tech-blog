/** タグ名をページ内リンクで安全に共有できる id に変換する。 */
export function getTagId(name: string): string {
	return `tag-${encodeURIComponent(name)}`;
}
