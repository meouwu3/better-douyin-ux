import { describe, expect, it } from 'vitest';
import { isLiveUrl, isVideoUrl } from '../utils/routes';

describe('isLiveUrl', () => {
  it('matches live.douyin.com room links', () => {
    expect(isLiveUrl('https://live.douyin.com/921169302662')).toBe(true);
  });

  it('matches www.douyin.com follow/live links', () => {
    expect(
      isLiveUrl('https://www.douyin.com/follow/live/921169302662?anchor_id=111620236679'),
    ).toBe(true);
  });

  it('rejects the video feed', () => {
    expect(isLiveUrl('https://www.douyin.com/?recommend=1')).toBe(false);
    expect(isVideoUrl('https://www.douyin.com/?recommend=1')).toBe(true);
  });

  it('rejects unrelated hosts', () => {
    expect(isLiveUrl('https://www.tiktok.com/live/1')).toBe(false);
    expect(isVideoUrl('https://www.tiktok.com/@x')).toBe(false);
  });
});
