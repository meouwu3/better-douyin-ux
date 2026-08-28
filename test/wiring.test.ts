import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('extension wiring', () => {
  it('content script starts live, chat, and quality watchers', () => {
    const source = readFileSync('entrypoints/content.ts', 'utf8');
    expect(source).toContain('startLiveSettings');
    expect(source).toContain('startChatFilter');
    expect(source).toContain('startQualityWatcher');
    expect(source).toContain('startAiEntryCloser');
    expect(source).toContain('wxt:locationchange');
  });

  it('MAIN-world inject patches storage and canvas danmaku at document_start', () => {
    const source = readFileSync('entrypoints/inject.content.ts', 'utf8');
    expect(source).toContain('installStoragePatch');
    expect(source).toContain('installDanmakuCanvasFilter');
    expect(source).toContain("world: 'MAIN'");
    expect(source).toContain("runAt: 'document_start'");
  });
});

