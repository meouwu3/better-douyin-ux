import { afterEach, describe, expect, it } from 'vitest';
import {
  applyAddedNodes,
  applyChatFilters,
  classifyChatItem,
  HIDE_ATTR,
  processChatItem,
} from '../utils/chat';
import {
  FOLLOW_KEYWORD_HTML,
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

  it('detects hardcoded keyword 点点关注', () => {
    expect(classifyChatItem(mount(FOLLOW_KEYWORD_HTML))).toBe('keyword');
  });

  it('keeps lookalike 伯格 comments', () => {
    expect(classifyChatItem(mount(LOOKALIKE_COMMENT_HTML))).toBe('normal');
  });

  it('does not treat typed 送出了 in a normal bubble as a gift', () => {
    expect(classifyChatItem(mount(TYPED_SONGCHU_HTML))).toBe('normal');
  });
});

describe('applyChatFilters', () => {
  it('only JS-marks keyword rows; gifts and score-boost stay unmarked for CSS', () => {
    const list = document.createElement('div');
    list.className = 'webcast-chatroom___list';
    list.innerHTML =
      GIFT_SEND_HTML +
      SCORE_BOOST_HTML +
      NORMAL_COMMENT_HTML +
      KEYWORD_COMMENT_HTML +
      FOLLOW_KEYWORD_HTML +
      LOOKALIKE_COMMENT_HTML +
      TYPED_SONGCHU_HTML;
    document.body.append(list);

    expect(applyChatFilters(list)).toBe(2);
    expect(applyChatFilters(list)).toBe(0);

    const items = [...list.querySelectorAll('.webcast-chatroom___item')];
    expect(items[0]?.hasAttribute(HIDE_ATTR)).toBe(false);
    expect(items[1]?.hasAttribute(HIDE_ATTR)).toBe(false);
    expect(items[2]?.hasAttribute(HIDE_ATTR)).toBe(false);
    expect(items[3]?.getAttribute(HIDE_ATTR)).toBe('keyword');
    expect(items[4]?.getAttribute(HIDE_ATTR)).toBe('keyword');
    expect(items[5]?.hasAttribute(HIDE_ATTR)).toBe(false);
    expect(items[6]?.hasAttribute(HIDE_ATTR)).toBe(false);

    expect(items[0]?.querySelector('img[src*="~tplv-obj.png"]')).toBeTruthy();
    expect(items[1]?.querySelector('.webcast-chatroom__room-message')).toBeTruthy();
  });

  it('clears a stale keyword marker when a virtual-list row is reused', () => {
    const item = mount(KEYWORD_COMMENT_HTML);
    expect(processChatItem(item)).toBe(true);
    expect(item.getAttribute(HIDE_ATTR)).toBe('keyword');

    const body = item.querySelector('.webcast-chatroom___content-with-emoji-text');
    expect(body).toBeTruthy();
    body!.textContent = '加油';
    expect(processChatItem(item)).toBe(false);
    expect(item.hasAttribute(HIDE_ATTR)).toBe(false);
  });

  it('marks a newly added keyword node and is idle on the second pass', () => {
    const list = document.createElement('div');
    list.innerHTML = NORMAL_COMMENT_HTML;
    document.body.append(list);
    expect(applyChatFilters(list)).toBe(0);

    const wrap = document.createElement('div');
    wrap.innerHTML = FOLLOW_KEYWORD_HTML.trim();
    const node = wrap.firstElementChild;
    expect(node).toBeTruthy();
    list.append(node!);
    expect(applyAddedNodes([node!])).toBe(1);
    expect(node?.getAttribute(HIDE_ATTR)).toBe('keyword');
    expect(applyAddedNodes([node!])).toBe(0);
  });
});
