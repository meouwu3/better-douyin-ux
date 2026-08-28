import { clickElement } from './dom';

export const AI_ENTRY_LABEL = '头像上方【AI抖音】入口状态';

const RETRY_MS = [500, 1000, 2000, 4000];
const RECHECK_MS = 30_000;

export function findAiEntrySwitch(root: ParentNode): HTMLElement | null {
  for (const node of root.querySelectorAll('span')) {
    if ((node.textContent ?? '').trim() !== AI_ENTRY_LABEL) continue;
    const hasDirectText = [...node.childNodes].some(
      (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim() === AI_ENTRY_LABEL,
    );
    if (!hasDirectText) continue;
    const sw = node.parentElement?.querySelector('.semi-switch');
    if (sw instanceof HTMLElement) return sw;
  }
  return null;
}

export function isAiEntrySwitchOn(el: HTMLElement): boolean {
  if (el.classList.contains('semi-switch-checked')) return true;
  const input = el.querySelector('[role="switch"]');
  return input?.getAttribute('aria-checked') === 'true';
}

/** Click the already-visible AI设置 switch off. Never opens the modal. */
export function ensureAiEntryClosed(root: ParentNode = document): boolean {
  const sw = findAiEntrySwitch(root);
  if (!sw || !isAiEntrySwitchOn(sw)) return false;
  clickElement(sw);
  return true;
}

export function startAiEntryCloser(): () => void {
  let stopped = false;
  let settled = false;
  let rounds = 0;
  let timer: number | null = null;

  const clearTimer = () => {
    if (timer == null) return;
    window.clearTimeout(timer);
    timer = null;
  };

  const schedule = (ms: number) => {
    if (stopped) return;
    clearTimer();
    timer = window.setTimeout(tick, ms);
  };

  const tick = () => {
    if (stopped) return;
    const sw = findAiEntrySwitch(document);
    if (sw) {
      if (isAiEntrySwitchOn(sw)) ensureAiEntryClosed();
      settled = true;
      schedule(RECHECK_MS);
      return;
    }
    if (settled || rounds >= RETRY_MS.length) {
      settled = true;
      schedule(RECHECK_MS);
      return;
    }
    schedule(RETRY_MS[rounds++] ?? 4000);
  };

  tick();
  return () => {
    stopped = true;
    clearTimer();
  };
}
