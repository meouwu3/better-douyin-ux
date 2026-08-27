export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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
  callback: (records: MutationRecord[]) => void,
  options?: MutationObserverInit,
): MutationObserver {
  const observer = new MutationObserver(callback);
  observer.observe(root, options ?? { childList: true, subtree: true });
  return observer;
}
