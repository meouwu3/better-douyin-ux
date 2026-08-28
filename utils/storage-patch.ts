export const AI_ENTRY_CLOSE_KEY = 'aiEntryClose';
/** Douyin stores "1" when 头像上方【AI抖音】入口 is closed, "0" when shown. */
export const AI_ENTRY_CLOSED_VALUE = '1';

export function rewriteDanmakuConfig(raw: string | null): string {
  let cfg: Record<string, unknown> = {};
  if (raw) {
    try {
      cfg = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      cfg = {};
    }
  }
  cfg.giftOn = false;
  cfg.packageOn = false;
  return JSON.stringify(cfg);
}

export function rewriteAiEntryClose(_raw: string | null): string {
  return AI_ENTRY_CLOSED_VALUE;
}

export function rewriteGiftPackageSetting(raw: string | null): string | null {
  if (raw == null) return raw;
  try {
    const obj = JSON.parse(raw) as Record<string, { giftOn?: boolean; packageOn?: boolean }>;
    if (!obj || typeof obj !== 'object') return raw;
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (value && typeof value === 'object') {
        value.giftOn = false;
        value.packageOn = false;
      }
    }
    return JSON.stringify(obj);
  } catch {
    return raw;
  }
}

function patchedValue(key: string, value: string): string {
  if (key === 'danmakuConfig') return rewriteDanmakuConfig(value);
  if (key === 'DanmaSetting_GiftAndPackage') {
    return rewriteGiftPackageSetting(value) ?? value;
  }
  if (key === AI_ENTRY_CLOSE_KEY) return rewriteAiEntryClose(value);
  return value;
}

/** MAIN-world only: wrap Storage so Douyin cannot persist gift-danmaku or the AI entry back on. */
export function installStoragePatch(): void {
  try {
    const current = localStorage.getItem('danmakuConfig');
    localStorage.setItem('danmakuConfig', rewriteDanmakuConfig(current));
    const giftPkg = localStorage.getItem('DanmaSetting_GiftAndPackage');
    const rewritten = rewriteGiftPackageSetting(giftPkg);
    if (rewritten != null) localStorage.setItem('DanmaSetting_GiftAndPackage', rewritten);
    localStorage.setItem(AI_ENTRY_CLOSE_KEY, AI_ENTRY_CLOSED_VALUE);
  } catch {
    // private mode / disabled storage
  }

  const original = Storage.prototype.setItem;
  Storage.prototype.setItem = function patchedSetItem(key: string, value: string) {
    return original.call(this, key, patchedValue(key, String(value)));
  };
}
