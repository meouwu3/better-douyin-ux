import { clickElement } from './dom';

const TRIGGER_SEL = '[data-e2e="danmaku-setting-icon"], [data-e2e="gift-setting"]';

export function isSwitchOnByStructure(el: Element): boolean {
  const inner = el.firstElementChild;
  if ((inner?.classList.length ?? 0) >= 2) return true;
  if (el.classList.length >= 3) return true;
  return false;
}

export function isSwitchOn(el: HTMLElement): boolean {
  return isSwitchOnByStructure(el);
}

function collectSearchRoots(root: ParentNode): ParentNode[] {
  const roots: ParentNode[] = [];
  const seen = new Set<ParentNode>();
  const add = (node: ParentNode | null | undefined) => {
    if (!node || seen.has(node)) return;
    seen.add(node);
    roots.push(node);
  };

  if (root instanceof Document || root instanceof Element) {
    root.querySelectorAll(TRIGGER_SEL).forEach((trigger) => {
      add(trigger.nextElementSibling);
      add(trigger.parentElement);
    });
  }
  if (roots.length === 0) add(root);
  return roots;
}

function findLabeledSwitchIn(scope: ParentNode, label: string): HTMLElement | null {
  for (const node of scope.querySelectorAll('span')) {
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

export function findLabeledSwitch(root: ParentNode, label: string): HTMLElement | null {
  for (const scope of collectSearchRoots(root)) {
    const found = findLabeledSwitchIn(scope, label);
    if (found) return found;
  }
  return null;
}

export function setSwitch(el: HTMLElement, wantOn: boolean): boolean {
  if (isSwitchOn(el) === wantOn) return false;
  clickElement(el);
  return true;
}
