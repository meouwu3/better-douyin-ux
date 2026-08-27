import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import {
  BOTTOM_TICKER_HTML,
  GIFT_BAR_HTML,
  GIFT_SEND_HTML,
  JOIN_TOAST_HTML,
  SCORE_BOOST_HTML,
  mount,
} from './fixtures';

const css = readFileSync('assets/content.css', 'utf8');

afterEach(() => {
  document.body.innerHTML = '';
});

describe('nickname badge CSS', () => {
  it('targets the sticky ticker (点赞了 / 来了) leading imgs', () => {
    expect(css).toContain('.webcast-chatroom___bottom-message');
    const ticker = mount(BOTTOM_TICKER_HTML);
    const wrap = ticker.querySelector(
      '.webcast-chatroom___bottom-message > .webcast-chatroom___item > div > span:first-child',
    );
    expect(wrap?.querySelector('img[src*="new_user_grade_level"]')).toBeTruthy();
    expect(wrap?.querySelector('img[src*="recent_consume_badge"]')).toBeTruthy();
    expect(ticker.textContent).toContain('困到想睡觉');
    expect(ticker.textContent).toContain('为主播点赞了');
  });

  it('targets the 加入了直播间 toast chip before the name', () => {
    expect(css).toContain("div[style*='fansclub_effect'] > img");
    expect(css).toContain("div[style*='fansclub_effect_icon']");
    const toast = mount(JOIN_TOAST_HTML);
    expect(toast.matches("div[style*='fansclub_effect']")).toBe(true);
    expect(toast.querySelector("img[src*='fansclub_effect_badge']")).toBeTruthy();
    expect(toast.textContent).toContain('汇乐石材');
    expect(toast.textContent).toContain('加入了直播间');
  });

  it('targets the bottom gift bar and recharge slot', () => {
    expect(css).toContain('#BottomLayout');
    expect(css).toContain("[data-e2e='gifts-container']");
    expect(css).toContain("[data-e2e='recharge-btn']");
    const bar = mount(GIFT_BAR_HTML);
    expect(bar.id).toBe('BottomLayout');
    expect(bar.querySelector('[data-e2e="gifts-container"]')?.textContent).toContain('人气票');
    expect(bar.querySelector('[data-e2e="recharge-btn"]')?.textContent).toBe('充值');
  });

  it('hides gift-send and score-boost rows with content-based CSS, not JS markers', () => {
    expect(css).toContain("img[src*='~tplv-obj.png']");
    expect(css).toContain('.webcast-chatroom__room-message');
    expect(css).toContain('visibility: hidden');
    const gift = mount(GIFT_SEND_HTML);
    const score = mount(SCORE_BOOST_HTML);
    expect(gift.querySelector('img[src*="~tplv-obj.png"]')).toBeTruthy();
    expect(score.querySelector('.webcast-chatroom__room-message')).toBeTruthy();
  });
});
