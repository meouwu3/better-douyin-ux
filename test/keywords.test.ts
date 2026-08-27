import { describe, expect, it } from 'vitest';
import { BLOCKED_KEYWORDS, textHasBlockedKeyword } from '../utils/keywords';

describe('textHasBlockedKeyword', () => {
  it('ships 伯哥 and 点点关注 as builtin keywords', () => {
    expect(BLOCKED_KEYWORDS).toContain('伯哥');
    expect(BLOCKED_KEYWORDS).toContain('点点关注');
  });

  it('matches 伯哥 inside danmaku-style strings and ignores 伯格', () => {
    expect(textHasBlockedKeyword('路人甲：伯哥加油')).toBe(true);
    expect(textHasBlockedKeyword('不瘦15斤不改名：伯格')).toBe(false);
  });

  it('matches 点点关注', () => {
    expect(textHasBlockedKeyword('路人丙：点点关注+苹果17')).toBe(true);
  });
});
