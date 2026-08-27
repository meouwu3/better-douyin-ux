import { hideElement, isHidden, observeMutations } from './dom';
import { textHasBlockedKeyword } from './keywords';

export type ChatKind = 'gift-send' | 'score-boost' | 'keyword' | 'normal';

const ITEM_SELECTOR = '.webcast-chatroom___item';

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

/** Hide grade / fansclub / consume badges sitting in front of the nickname. */
export function stripLeadingBadges(item: Element): void {
  item.querySelectorAll('.webcast-chatroom___badge').forEach((badge) => {
    hideElement(badge, 'badge');
  });

  const body = item.querySelector('.webcast-chatroom___item-wrapper > div');
  if (!body) return;

  for (const child of Array.from(body.children)) {
    const text = (child.textContent ?? '').trim();
    const looksLikeName = text.endsWith('：') || text.endsWith(':');
    const looksLikeContent =
      child.querySelector('.webcast-chatroom___content-with-emoji-text') !== null ||
      text.includes('送出了') ||
      text.includes('为主播加了');
    if (looksLikeName || looksLikeContent) break;

    const hasImg = child.querySelector('img') !== null;
    if (hasImg || text === '') hideElement(child, 'badge');
  }
}

export function processChatItem(item: Element): boolean {
  stripLeadingBadges(item);
  const kind = classifyChatItem(item);
  if (kind === 'normal') return false;
  if (!isHidden(item)) hideElement(item, kind);
  return true;
}

/** Real entry used by the content script. Returns how many items were hidden. */
export function applyChatFilters(root: ParentNode = document): number {
  let hidden = 0;
  root.querySelectorAll(ITEM_SELECTOR).forEach((item) => {
    if (processChatItem(item)) hidden += 1;
  });
  return hidden;
}

export function startChatFilter(root: ParentNode = document): () => void {
  applyChatFilters(root);
  const target =
    root instanceof Document ? (root.body ?? root.documentElement) : (root as Node);
  const observer = observeMutations(target, () => {
    applyChatFilters(root);
  });
  return () => observer.disconnect();
}
