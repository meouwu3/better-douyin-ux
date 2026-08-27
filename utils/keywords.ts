/**
 * Hardcoded comment / danmaku blocklist.
 * Add entries here — there is no in-browser settings UI.
 */
export const BLOCKED_KEYWORDS: readonly string[] = ['伯哥', '点点关注'];

export function textHasBlockedKeyword(text: string): boolean {
  if (!text) return false;
  return BLOCKED_KEYWORDS.some((keyword) => text.includes(keyword));
}
