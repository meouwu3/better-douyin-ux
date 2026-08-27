import { dispatchHover, sleep } from './dom';
import { findLabeledSwitch, setSwitch } from './switches';

const restoreMap = new WeakMap<Element, () => void>();

const DANMAKU_TRIGGER = '[data-e2e="danmaku-setting-icon"]';
const GIFT_TRIGGER = '[data-e2e="gift-setting"]';

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

function concealPanel(trigger: Element): () => void {
  const pop = trigger.nextElementSibling;
  if (!(pop instanceof HTMLElement)) return () => undefined;
  const prev = pop.getAttribute('style');
  pop.style.setProperty('opacity', '0', 'important');
  pop.style.setProperty('pointer-events', 'none', 'important');
  return () => {
    if (prev == null) pop.removeAttribute('style');
    else pop.setAttribute('style', prev);
  };
}

async function openTrigger(selector: string): Promise<Element | null> {
  const trigger = document.querySelector(selector);
  if (!trigger) return null;
  const restore = concealPanel(trigger);
  restoreMap.set(trigger, restore);
  dispatchHover(trigger, true);
  await sleep(450);
  return trigger;
}

async function closeTrigger(trigger: Element | null): Promise<void> {
  if (!trigger) return;
  dispatchHover(trigger, false);
  restoreMap.get(trigger)?.();
  restoreMap.delete(trigger);
  await sleep(120);
}

export async function ensureLiveSettings(root: ParentNode = document): Promise<string[]> {
  const applied: string[] = [];
  const missingByTrigger = new Map<string, ToggleSpec[]>();

  for (const spec of TOGGLES) {
    const sw = findLabeledSwitch(root, spec.label);
    if (sw) {
      if (setSwitch(sw, spec.wantOn)) applied.push(spec.label);
      continue;
    }
    const list = missingByTrigger.get(spec.trigger) ?? [];
    list.push(spec);
    missingByTrigger.set(spec.trigger, list);
  }

  for (const [selector, specs] of missingByTrigger) {
    const trigger = await openTrigger(selector);
    try {
      for (const spec of specs) {
        const sw = findLabeledSwitch(document, spec.label);
        if (!sw) continue;
        if (setSwitch(sw, spec.wantOn)) applied.push(spec.label);
      }
    } finally {
      await closeTrigger(trigger);
    }
  }

  return applied;
}

let inflight = false;

export function startLiveSettings(): () => void {
  const run = () => {
    if (inflight) return;
    inflight = true;
    void ensureLiveSettings()
      .catch(() => undefined)
      .finally(() => {
        inflight = false;
      });
  };
  run();
  const id = window.setInterval(run, 3000);
  return () => {
    window.clearInterval(id);
  };
}
