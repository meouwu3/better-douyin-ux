import '../assets/content.css';
import { startChatFilter } from '../utils/chat';
import { startLiveSettings } from '../utils/live-settings';
import { startQualityWatcher } from '../utils/quality';
import { isLiveUrl, isVideoUrl } from '../utils/routes';

export default defineContentScript({
  matches: ['*://*.douyin.com/*'],
  runAt: 'document_idle',
  main(ctx) {
    let stopLive: (() => void) | null = null;
    let stopVideo: (() => void) | null = null;
    let liveHref: string | null = null;

    const boot = () => {
      const href = location.href;
      if (isLiveUrl(href)) {
        stopVideo?.();
        stopVideo = null;
        if (liveHref !== href) {
          stopLive?.();
          stopLive = null;
          liveHref = href;
        }
        if (!stopLive) {
          const stopSettings = startLiveSettings();
          const stopChat = startChatFilter();
          stopLive = () => {
            stopSettings();
            stopChat();
          };
        }
        return;
      }
      liveHref = null;
      stopLive?.();
      stopLive = null;
      if (isVideoUrl(href)) {
        if (!stopVideo) stopVideo = startQualityWatcher();
      } else {
        stopVideo?.();
        stopVideo = null;
      }
    };

    boot();
    ctx.addEventListener(window, 'wxt:locationchange', () => boot());
  },
});
