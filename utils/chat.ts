import { observeMutations } from './dom';
import { textHasBlockedKeyword } from './keywords';

export type ChatKind = 'gift-send' | 'score-boost' | 'keyword' | 'normal';

export const ITEM_SELECTOR = '.webcast-chatroom___item';
export const HIDE_ATTR = 'data-bdux-hide';

function compactText(el: Element): string {
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Gift rows put an <img> immediately after「送出了」and usually a ×N combo. */
export function isGiftSendComment(item: Element): boolean {
  if (/送出了\s*(<[^>]+>\s*)*<img/i.test(item.innerHTML)) return true;
  const text = compactText(item);
  if (text.includes('送出了') && /[×xX]\s*\d+/.test(text)) return true;
  if (
    text.includes('送出了') &&
    !item.querySelector('.webcast-chatroom___content-with-emoji-text')
  ) {
    return true;
  }
  return false;
}

/** Room-system line:「{name} 为主播加了 {n}分」. */
export function isScoreBoostComment(item: Element): boolean {
  const text = compactText(item);
  if (item.querySelector('.webcast-chatroom__room-message') && text.includes('为主播加了')) {
    return true;
  }
  return /为主播加了\s*\d+\s*分/.test(text);
}

export function classifyChatItem(item: Element): ChatKind {
  if (isGiftSendComment(item)) return 'gift-send';
  if (isScoreBoostComment(item)) return 'score-boost';
  if (textHasBlockedKeyword(compactText(item))) return 'keyword';
  return 'normal';
}

function isBottomTicker(item: Element): boolean {
  return (
    item.classList.contains('webcast-chatroom___bottom_message') ||
    item.closest('.webcast-chatroom___bottom-message') != null
  );
}

/**
 * Keywords cannot be expressed in CSS. Toggle a marker from *current* text so
 * virtual-list recycling cannot leave a stale hide on a reused row.
 * Gifts / score-boost are CSS-only.
 */
export function processChatItem(item: Element): boolean {
  if (isBottomTicker(item)) return false;
  const shouldHide = textHasBlockedKeyword(compactText(item));
  const hidden = item.getAttribute(HIDE_ATTR) === 'keyword';
  if (shouldHide === hidden) return false;
  if (shouldHide) {
    item.setAttribute(HIDE_ATTR, 'keyword');
    return true;
  }
  item.removeAttribute(HIDE_ATTR);
  return false;
}

function scan(root: ParentNode): number {
  let hidden = 0;
  root.querySelectorAll(ITEM_SELECTOR).forEach((item) => {
    if (processChatItem(item)) hidden += 1;
  });
  return hidden;
}

function itemsAffectedBy(node: Node): Element[] {
  if (node instanceof Text) {
    const item = node.parentElement?.closest(ITEM_SELECTOR);
    return item ? [item] : [];
  }
  if (!(node instanceof Element)) return [];
  if (node.matches(ITEM_SELECTOR)) return [node];
  const ancestor = node.closest(ITEM_SELECTOR);
  if (ancestor) return [ancestor];
  return [...node.querySelectorAll(ITEM_SELECTOR)];
}

/** Real entry used by the content script. Returns how many items newly gained the keyword marker. */
export function applyChatFilters(root: ParentNode = document): number {
  if (root instanceof Element && root.matches(ITEM_SELECTOR)) {
    return processChatItem(root) ? 1 : 0;
  }
  return scan(root);
}

export function applyAddedNodes(nodes: NodeList | Node[]): number {
  const seen = new Set<Element>();
  let hidden = 0;
  for (const node of nodes) {
    for (const item of itemsAffectedBy(node)) {
      if (seen.has(item)) continue;
      seen.add(item);
      if (processChatItem(item)) hidden += 1;
    }
  }
  return hidden;
}

function chatObserveTarget(root: ParentNode): Node {
  if (root instanceof Document || root instanceof Element) {
    return (
      root.querySelector('.webcast-chatroom___list') ??
      root.querySelector('.webcast-chatroom') ??
      (root instanceof Document ? (root.body ?? root.documentElement) : root)
    );
  }
  return root as Node;
}

export function startChatFilter(root: ParentNode = document): () => void {
  let observer: MutationObserver | null = null;
  let stopped = false;
  let raf = 0;
  const pending: Node[] = [];

  const flush = () => {
    raf = 0;
    if (stopped) return;
    applyAddedNodes(pending.splice(0));
  };

  const bind = (target: Node) => {
    observer?.disconnect();
    if (target instanceof Element || target instanceof Document) applyChatFilters(target);
    observer = observeMutations(
      target,
      (records) => {
        if (stopped) return;
        for (const record of records) {
          for (const node of record.addedNodes) pending.push(node);
          if (record.target instanceof Node) pending.push(record.target);
        }
        if (!raf) raf = requestAnimationFrame(flush);
        if (
          target instanceof Document ||
          (target instanceof Element && !target.classList.contains('webcast-chatroom___list'))
        ) {
          const list =
            (target instanceof Document || target instanceof Element
              ? target.querySelector('.webcast-chatroom___list')
              : null) ?? null;
          if (list && list !== target) bind(list);
        }
      },
      { childList: true, subtree: true },
    );
  };

  bind(chatObserveTarget(root));
  return () => {
    stopped = true;
    if (raf) cancelAnimationFrame(raf);
    observer?.disconnect();
  };
}
