export const HIDE_ATTR = 'data-bdux-hide';

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function hideElement(el: Element, reason: string): void {
  el.setAttribute(HIDE_ATTR, reason);
  if (el instanceof HTMLElement) {
    el.style.setProperty('display', 'none', 'important');
  }
}

export function isHidden(el: Element): boolean {
  return el.hasAttribute(HIDE_ATTR);
}

export function dispatchHover(el: Element, entering: boolean): void {
  const types = entering
    ? (['pointerover', 'pointerenter', 'mouseover', 'mouseenter'] as const)
    : (['pointerout', 'pointerleave', 'mouseout', 'mouseleave'] as const);
  for (const type of types) {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
  }
}

export function clickElement(el: Element): void {
  if (el instanceof HTMLElement) {
    el.click();
    return;
  }
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
}

export function observeMutations(
  root: Node,
  callback: () => void,
  options?: MutationObserverInit,
): MutationObserver {
  const observer = new MutationObserver(() => {
    callback();
  });
  observer.observe(root, options ?? { childList: true, subtree: true });
  return observer;
}

export function watchUrl(onChange: (url: string) => void, intervalMs = 800): () => void {
  let last = location.href;
  const tick = () => {
    if (location.href !== last) {
      last = location.href;
      onChange(last);
    }
  };
  const id = window.setInterval(tick, intervalMs);
  window.addEventListener('popstate', tick);
  return () => {
    window.clearInterval(id);
    window.removeEventListener('popstate', tick);
  };
}
