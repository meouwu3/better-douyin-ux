import { dispatchHover, sleep } from './dom';
import { findLabeledSwitch, isSwitchOn, setSwitch } from './switches';

const DANMAKU_TRIGGER = '[data-e2e="danmaku-setting-icon"]';
const GIFT_TRIGGER = '[data-e2e="gift-setting"]';
const APPLYING_ATTR = 'data-bdux-applying';

const RETRY_MS = [500, 1000, 2000, 4000, 8000];
const RECHECK_MS = 30_000;
const MAX_HOVER_ROUNDS = 8;

type ToggleSpec = {
  label: string;
  wantOn: boolean;
  trigger: string;
};

const TOGGLES: readonly ToggleSpec[] = [
  { label: '送礼信息', wantOn: false, trigger: DANMAKU_TRIGGER },
  { label: '福袋口令', wantOn: false, trigger: DANMAKU_TRIGGER },
  { label: '屏蔽礼物特效', wantOn: true, trigger: GIFT_TRIGGER },
];

export type EnsureLiveSettingsOptions = {
  /** When false, never hover-open the two setting flyouts. */
  allowHover?: boolean;
};

function setApplying(on: boolean): void {
  if (typeof document === 'undefined') return;
  if (on) document.documentElement.setAttribute(APPLYING_ATTR, '1');
  else document.documentElement.removeAttribute(APPLYING_ATTR);
}

function concealPanel(trigger: Element): void {
  const pop = trigger.nextElementSibling;
  if (!(pop instanceof HTMLElement)) return;
  pop.style.setProperty('opacity', '0', 'important');
  pop.style.setProperty('pointer-events', 'none', 'important');
}

async function openTrigger(selector: string): Promise<Element | null> {
  const trigger = document.querySelector(selector);
  if (!trigger) return null;
  concealPanel(trigger);
  dispatchHover(trigger, true);
  await sleep(450);
  concealPanel(trigger);
  return trigger;
}

async function closeTrigger(trigger: Element | null): Promise<void> {
  if (!trigger) return;
  concealPanel(trigger);
  dispatchHover(trigger, false);
  await sleep(120);
}

export function toggleMatches(el: HTMLElement, wantOn: boolean): boolean {
  return isSwitchOn(el) === wantOn;
}

export function confirmedToggleLabels(root: ParentNode): string[] {
  const labels: string[] = [];
  for (const spec of TOGGLES) {
    const sw = findLabeledSwitch(root, spec.label);
    if (sw && toggleMatches(sw, spec.wantOn)) labels.push(spec.label);
  }
  return labels;
}

export async function ensureLiveSettings(
  root: ParentNode = document,
  options: EnsureLiveSettingsOptions = {},
): Promise<{ clicked: string[]; confirmed: string[] }> {
  const allowHover = options.allowHover ?? true;
  const clicked: string[] = [];
  const missingByTrigger = new Map<string, ToggleSpec[]>();

  for (const spec of TOGGLES) {
    const sw = findLabeledSwitch(root, spec.label);
    if (sw) {
      if (setSwitch(sw, spec.wantOn)) clicked.push(spec.label);
      continue;
    }
    const list = missingByTrigger.get(spec.trigger) ?? [];
    list.push(spec);
    missingByTrigger.set(spec.trigger, list);
  }

  if (!allowHover || missingByTrigger.size === 0) {
    return { clicked, confirmed: confirmedToggleLabels(root) };
  }

  setApplying(true);
  const confirmed = new Set(confirmedToggleLabels(root));
  try {
    for (const [selector, specs] of missingByTrigger) {
      const trigger = await openTrigger(selector);
      try {
        for (const spec of specs) {
          const sw = findLabeledSwitch(document, spec.label);
          if (!sw) continue;
          if (setSwitch(sw, spec.wantOn)) clicked.push(spec.label);
        }
        await sleep(200);
        for (const label of confirmedToggleLabels(document)) confirmed.add(label);
      } finally {
        await closeTrigger(trigger);
      }
    }
  } finally {
    setApplying(false);
  }

  return { clicked, confirmed: [...confirmed] };
}

export function startLiveSettings(): () => void {
  let stopped = false;
  let settled = false;
  let hoverRounds = 0;
  let inflight = false;
  let timer: number | null = null;

  const clearTimer = () => {
    if (timer == null) return;
    window.clearTimeout(timer);
    timer = null;
  };

  const schedule = (ms: number) => {
    if (stopped) return;
    clearTimer();
    timer = window.setTimeout(() => {
      void tick();
    }, ms);
  };

  const tick = async () => {
    if (stopped || inflight) return;
    inflight = true;
    try {
      if (settled) {
        await ensureLiveSettings(document, { allowHover: false });
        schedule(RECHECK_MS);
        return;
      }

      const { clicked, confirmed } = await ensureLiveSettings(document, { allowHover: true });
      const seen = new Set([...confirmed, ...clicked]);
      if (seen.size === TOGGLES.length) {
        settled = true;
        hoverRounds = 0;
        schedule(RECHECK_MS);
        return;
      }

      hoverRounds += 1;
      if (hoverRounds >= MAX_HOVER_ROUNDS) {
        settled = true;
        schedule(RECHECK_MS);
        return;
      }
      const delay = RETRY_MS[Math.min(hoverRounds, RETRY_MS.length - 1)] ?? 8000;
      schedule(delay);
    } finally {
      inflight = false;
    }
  };

  void tick();

  let debounce: number | null = null;
  const observer = new MutationObserver(() => {
    if (stopped || settled) return;
    if (debounce != null) return;
    debounce = window.setTimeout(() => {
      debounce = null;
      if (!settled) void tick();
    }, 800);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  return () => {
    stopped = true;
    clearTimer();
    if (debounce != null) window.clearTimeout(debounce);
    observer.disconnect();
    setApplying(false);
  };
}
