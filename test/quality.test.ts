import { afterEach, describe, expect, it } from 'vitest';
import { applyHighestQuality, pickHighestQuality, qualityScore } from '../utils/quality';
import { QUALITY_MENU_HTML, mount } from './fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('qualityScore', () => {
  it('ranks captured feed labels with 智能 at the bottom', () => {
    const ranked = ['智能', '标清 540P', '高清 720P', '高清 1080P']
      .map((label) => ({ label, score: qualityScore(label) }))
      .sort((a, b) => b.score - a.score)
      .map((row) => row.label);
    expect(ranked[0]).toBe('高清 1080P');
    expect(qualityScore('智能')).toBeLessThan(0);
  });
});

describe('pickHighestQuality', () => {
  it('skips 智能 and locked 4K, then takes 1080P', () => {
    const picked = pickHighestQuality([
      { label: '超清 4K 登录后可看', item: '4k' },
      { label: '高清 1080P', item: '1080' },
      { label: '高清 720P', item: '720' },
      { label: '智能', item: 'auto' },
    ]);
    expect(picked).toBe('1080');
  });
});

describe('applyHighestQuality', () => {
  it('clicks 高清 1080P on the captured xgplayer menu currently set to 智能', () => {
    const root = mount(QUALITY_MENU_HTML);
    const clicked: string[] = [];
    root.querySelectorAll('.item').forEach((item) => {
      item.addEventListener('click', () => {
        clicked.push((item.textContent ?? '').replace(/\s+/g, ' ').trim());
      });
    });

    expect(applyHighestQuality(root)).toBe(true);
    expect(clicked).toEqual(['高清 1080P']);
  });

  it('does not click when the highest option is already selected', () => {
    const root = mount(QUALITY_MENU_HTML);
    root.querySelector('.item.selected')?.classList.remove('selected');
    root.querySelector('.item')?.classList.add('selected');
    const btn = root.querySelector('.btn');
    if (btn) btn.textContent = '高清 1080P';

    let clicks = 0;
    root.addEventListener('click', () => {
      clicks += 1;
    });
    expect(applyHighestQuality(root)).toBe(false);
    expect(clicks).toBe(0);
  });
});
