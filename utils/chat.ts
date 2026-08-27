import { hideElement, observeMutations } from './dom';
import { textHasBlockedKeyword } from './keywords';

export type ChatKind = 'gift-send' | 'score-boost' | 'keyword' | 'normal';

export const ITEM_SELECTOR = '.webcast-chatroom___item';
export const DONE_ATTR = 'data-bdux-done';

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

export function processChatItem(item: Element): boolean {
  if (item.getAttribute(DONE_ATTR) === '1') return false;
  item.setAttribute(DONE_ATTR, '1');
  const kind = classifyChatItem(item);
  if (kind === 'normal') return false;
  hideElement(item, kind);
  return true;
}

function scan(root: ParentNode): number {
  let hidden = 0;
  root.querySelectorAll(`${ITEM_SELECTOR}:not([${DONE_ATTR}])`).forEach((item) => {
    if (processChatItem(item)) hidden += 1;
  });
  return hidden;
}

/** Real entry used by the content script. Returns how many items were newly hidden. */
export function applyChatFilters(root: ParentNode = document): number {
  if (root instanceof Element && root.matches(ITEM_SELECTOR)) {
    return processChatItem(root) ? 1 : 0;
  }
  return scan(root);
}

export function applyAddedNodes(nodes: NodeList | Node[]): number {
  let hidden = 0;
  for (const node of nodes) {
    if (!(node instanceof Element)) continue;
    if (node.matches(ITEM_SELECTOR)) {
      if (processChatItem(node)) hidden += 1;
      continue;
    }
    hidden += scan(node);
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

  const bind = (target: Node) => {
    observer?.disconnect();
    if (target instanceof Element || target instanceof Document) applyChatFilters(target);
    observer = observeMutations(
      target,
      (records) => {
        if (stopped) return;
        for (const record of records) {
          applyAddedNodes(record.addedNodes);
        }
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
    observer?.disconnect();
  };
}
