import { describe, expect, it } from 'vitest';
import { BLOCKED_KEYWORDS, textHasBlockedKeyword } from '../utils/keywords';

describe('textHasBlockedKeyword', () => {
  it('ships 伯哥 as a builtin keyword', () => {
    expect(BLOCKED_KEYWORDS).toContain('伯哥');
  });

  it('matches 伯哥 inside danmaku-style strings and ignores 伯格', () => {
    expect(textHasBlockedKeyword('路人甲：伯哥加油')).toBe(true);
    expect(textHasBlockedKeyword('不瘦15斤不改名：伯格')).toBe(false);
  });
});
