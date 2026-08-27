import { clickElement, dispatchHover } from './dom';

const SKIP_LABEL = /智能|自动/;
const LOCKED_LABEL = /登录|开通|会员/;

export function qualityScore(label: string): number {
  const text = label.replace(/\s+/g, '');
  if (!text) return -1;
  if (SKIP_LABEL.test(text)) return -1;
  if (LOCKED_LABEL.test(text)) return -2;
  if (text.includes('8K')) return 8000;
  if (text.includes('4K')) return 4000;
  if (text.includes('2K')) return 2000;
  if (text.includes('蓝光')) return 1440;
  if (text.includes('原画')) return 1200;
  const pixels = text.match(/(\d{3,4})P/i);
  if (pixels?.[1]) return Number(pixels[1]);
  if (text.includes('超清')) return 720;
  if (text.includes('高清')) return 540;
  if (text.includes('标清')) return 360;
  return 0;
}

export function pickHighestQuality<T>(options: ReadonlyArray<{ label: string; item: T }>): T | null {
  let best: { score: number; item: T } | null = null;
  for (const option of options) {
    const score = qualityScore(option.label);
    if (score < 0) continue;
    if (!best || score > best.score) best = { score, item: option.item };
  }
  return best?.item ?? null;
}

function qualityScope(root: ParentNode): ParentNode {
  if (root instanceof Document || root instanceof Element) {
    return root.querySelector('[data-e2e="feed-active-video"]') ?? root;
  }
  return root;
}

function collectOptions(gear: Element): Array<{ label: string; item: HTMLElement }> {
  const options: Array<{ label: string; item: HTMLElement }> = [];
  for (const item of gear.querySelectorAll('.virtual > .item')) {
    if (!(item instanceof HTMLElement)) continue;
    const label = (item.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!label) continue;
    options.push({ label, item });
  }
  return options;
}

/**
 * Click the highest unlocked clarity on the active xgplayer.
 * Returns true when a click was issued.
 */
export function applyHighestQuality(root: ParentNode = document): boolean {
  const scope = qualityScope(root);
  const already = scope.querySelector('.xgplayer-playclarity-setting .virtual > .item.selected');
  const alreadyLabel = (already?.textContent ?? '').replace(/\s+/g, ' ').trim();
  if (already && qualityScore(alreadyLabel) >= 1080) return false;

  const gears = scope.querySelectorAll(
    '.xgplayer-playclarity-setting .gear, .gear.isSmoothSwitchClarityLogin',
  );
  if (gears.length === 0) return false;

  let clicked = false;
  gears.forEach((gear) => {
    const options = collectOptions(gear);
    if (options.length === 0) return;
    const target = pickHighestQuality(options);
    if (!target) return;
    if (target.classList.contains('selected')) return;

    const currentBtn = gear.querySelector('.btn');
    const currentLabel = (currentBtn?.textContent ?? '').replace(/\s+/g, ' ').trim();
    const targetLabel = (target.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (currentLabel && currentLabel === targetLabel) return;

    gear.classList.add('bdux-clarity-open');
    if (currentBtn instanceof HTMLElement) dispatchHover(currentBtn, true);
    clickElement(target);
    if (currentBtn instanceof HTMLElement) dispatchHover(currentBtn, false);
    window.setTimeout(() => {
      gear.classList.remove('bdux-clarity-open');
    }, 400);
    clicked = true;
  });
  return clicked;
}

export function startQualityWatcher(root: ParentNode = document): () => void {
  const tick = () => {
    applyHighestQuality(root);
  };
  tick();
  const id = window.setInterval(tick, 2500);
  return () => {
    window.clearInterval(id);
  };
}
