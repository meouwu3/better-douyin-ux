import { afterEach, describe, expect, it } from 'vitest';
import { applyAddedNodes, applyChatFilters, classifyChatItem } from '../utils/chat';
import { HIDE_ATTR } from '../utils/dom';
import {
  GIFT_SEND_HTML,
  KEYWORD_COMMENT_HTML,
  LOOKALIKE_COMMENT_HTML,
  NORMAL_COMMENT_HTML,
  SCORE_BOOST_HTML,
  TYPED_SONGCHU_HTML,
  mount,
} from './fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('classifyChatItem', () => {
  it('detects gift-send rows by 送出了 + gift image + combo', () => {
    expect(classifyChatItem(mount(GIFT_SEND_HTML))).toBe('gift-send');
  });

  it('detects score-boost room messages', () => {
    expect(classifyChatItem(mount(SCORE_BOOST_HTML))).toBe('score-boost');
  });

  it('detects hardcoded keyword 伯哥', () => {
    expect(classifyChatItem(mount(KEYWORD_COMMENT_HTML))).toBe('keyword');
  });

  it('keeps lookalike 伯格 comments', () => {
    expect(classifyChatItem(mount(LOOKALIKE_COMMENT_HTML))).toBe('normal');
  });

  it('does not treat typed 送出了 in a normal bubble as a gift', () => {
    expect(classifyChatItem(mount(TYPED_SONGCHU_HTML))).toBe('normal');
  });
});

describe('applyChatFilters', () => {
  it('hides gift / score / keyword rows once and leaves nickname badges to CSS', () => {
    const list = document.createElement('div');
    list.innerHTML =
      GIFT_SEND_HTML +
      SCORE_BOOST_HTML +
      NORMAL_COMMENT_HTML +
      KEYWORD_COMMENT_HTML +
      LOOKALIKE_COMMENT_HTML +
      TYPED_SONGCHU_HTML;
    document.body.append(list);

    expect(applyChatFilters(list)).toBe(3);
    expect(applyChatFilters(list)).toBe(0);

    const items = [...list.querySelectorAll('.webcast-chatroom___item')];
    expect(items[0]?.getAttribute(HIDE_ATTR)).toBe('gift-send');
    expect(items[1]?.getAttribute(HIDE_ATTR)).toBe('score-boost');
    expect(items[2]?.hasAttribute(HIDE_ATTR)).toBe(false);
    expect(items[3]?.getAttribute(HIDE_ATTR)).toBe('keyword');
    expect(items[4]?.hasAttribute(HIDE_ATTR)).toBe(false);
    expect(items[5]?.hasAttribute(HIDE_ATTR)).toBe(false);

    const normal = items[2];
    const badgeWrap = normal?.querySelector('.webcast-chatroom___item-wrapper > div > span:first-child');
    expect(badgeWrap?.hasAttribute(HIDE_ATTR)).toBe(false);
    expect(normal?.querySelector('.v8LY0gZF')?.textContent).toContain('山坤');
    expect(normal?.querySelector('.webcast-chatroom___content-with-emoji-text')?.textContent).toBe(
      '大结局啊哈哈哈哈',
    );
  });

  it('only processes added chat nodes instead of rescanning the whole list', () => {
    const list = document.createElement('div');
    list.innerHTML = NORMAL_COMMENT_HTML;
    document.body.append(list);
    expect(applyChatFilters(list)).toBe(0);

    const gift = document.createElement('div');
    gift.innerHTML = GIFT_SEND_HTML.trim();
    const node = gift.firstElementChild;
    expect(node).toBeTruthy();
    list.append(node!);
    expect(applyAddedNodes([node!])).toBe(1);
    expect(node?.getAttribute(HIDE_ATTR)).toBe('gift-send');
    expect(applyAddedNodes([node!])).toBe(0);
  });
});
