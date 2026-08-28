import { describe, expect, it } from 'vitest';
import { rewriteAiEntryClose, rewriteDanmakuConfig, rewriteGiftPackageSetting } from '../utils/storage-patch';

describe('rewriteDanmakuConfig', () => {
  it('forces giftOn/packageOn off on the captured live.douyin.com value', () => {
    const raw = '{"opacity":60,"area":1,"fontSize":0,"speed":1,"giftOn":true,"packageOn":true}';
    expect(JSON.parse(rewriteDanmakuConfig(raw))).toEqual({
      opacity: 60,
      area: 1,
      fontSize: 0,
      speed: 1,
      giftOn: false,
      packageOn: false,
    });
  });
});

describe('rewriteGiftPackageSetting', () => {
  it('rewrites the per-room capture without dropping expiry', () => {
    const raw =
      '{"7677562067382060590_7678718636433541924":{"expired":1787930842947,"giftOn":true,"packageOn":true}}';
    const parsed = JSON.parse(rewriteGiftPackageSetting(raw) ?? '{}') as Record<
      string,
      { expired: number; giftOn: boolean; packageOn: boolean }
    >;
    const room = parsed['7677562067382060590_7678718636433541924'];
    expect(room?.expired).toBe(1787930842947);
    expect(room?.giftOn).toBe(false);
    expect(room?.packageOn).toBe(false);
  });
});

describe('rewriteAiEntryClose', () => {
  it('always writes 1 (入口关闭), including when Douyin tries 0', () => {
    expect(rewriteAiEntryClose('0')).toBe('1');
    expect(rewriteAiEntryClose('1')).toBe('1');
    expect(rewriteAiEntryClose(null)).toBe('1');
  });
});

