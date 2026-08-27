import { installDanmakuCanvasFilter } from '../utils/danmaku-canvas';
import { installStoragePatch } from '../utils/storage-patch';

export default defineContentScript({
  matches: ['*://*.douyin.com/*'],
  runAt: 'document_start',
  world: 'MAIN',
  main() {
    // SPA navigations to /follow/live/* reuse this document; keep hooks installed.
    installStoragePatch();
    installDanmakuCanvasFilter();
  },
});
