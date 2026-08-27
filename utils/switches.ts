import { clickElement } from './dom';

const DOUYIN_PINK = { r: 254, g: 44, b: 85 };

function parseRgb(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) };
}

/** Pink track / extra inner class / 3-class outer node = ON. */
export function isSwitchOn(el: HTMLElement): boolean {
  if (typeof getComputedStyle === 'function') {
    const rgb = parseRgb(getComputedStyle(el).backgroundColor);
    if (rgb && rgb.r > 200 && rgb.g < 90 && rgb.b > 40) return true;
    if (rgb && Math.abs(rgb.r - DOUYIN_PINK.r) < 8 && Math.abs(rgb.g - DOUYIN_PINK.g) < 8) {
      return true;
    }
  }
  return isSwitchOnByStructure(el);
}

export function isSwitchOnByStructure(el: Element): boolean {
  const inner = el.firstElementChild;
  if ((inner?.classList.length ?? 0) >= 2) return true;
  if (el.classList.length >= 3) return true;
  return false;
}

export function findLabeledSwitch(root: ParentNode, label: string): HTMLElement | null {
  const candidates = root.querySelectorAll('span, div');
  for (const node of candidates) {
    if ((node.textContent ?? '').trim() !== label) continue;
    const hasDirectText = [...node.childNodes].some(
      (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim() === label,
    );
    if (!hasDirectText) continue;

    const row = node.parentElement;
    if (!row) continue;

    const e2eHost = row.querySelector('[data-e2e$="-switch"], [data-e2e*="switch"]');
    const fromE2e = e2eHost?.querySelector(':scope > div') ?? e2eHost?.querySelector('div');
    if (fromE2e instanceof HTMLElement) return fromE2e;

    const switchEl = [...row.querySelectorAll('div')].find((candidate) => {
      if (candidate.childElementCount !== 1) return false;
      const knob = candidate.firstElementChild;
      return knob instanceof HTMLElement && knob.childElementCount === 0;
    });
    if (switchEl instanceof HTMLElement) return switchEl;
  }
  return null;
}

export function setSwitch(el: HTMLElement, wantOn: boolean): boolean {
  if (isSwitchOn(el) === wantOn) return false;
  clickElement(el);
  return true;
}
