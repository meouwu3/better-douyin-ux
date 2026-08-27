import { afterEach, describe, expect, it } from 'vitest';
import { ensureLiveSettings } from '../utils/live-settings';
import { findLabeledSwitch, isSwitchOnByStructure } from '../utils/switches';
import { LIVE_TOGGLES_HTML, mount } from './fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ensureLiveSettings', () => {
  it('turns off 送礼信息 / 福袋口令 and turns on 屏蔽礼物特效 using captured switch markup', async () => {
    const root = mount(LIVE_TOGGLES_HTML);
    const clicked: string[] = [];
    root.querySelectorAll('.dNuSIvAp').forEach((el) => {
      el.addEventListener('click', () => {
        const label = el.parentElement?.previousElementSibling?.textContent?.trim() ?? '';
        clicked.push(label);
      });
    });

    const { clicked: applied } = await ensureLiveSettings(root);
    expect(applied.sort()).toEqual(['屏蔽礼物特效', '福袋口令', '送礼信息'].sort());
    expect(clicked.sort()).toEqual(['屏蔽礼物特效', '福袋口令', '送礼信息'].sort());
  });

  it('is a no-op when switches already match the desired state', async () => {
    const root = mount(LIVE_TOGGLES_HTML);
    const gift = findLabeledSwitch(root, '送礼信息');
    const bag = findLabeledSwitch(root, '福袋口令');
    const effect = findLabeledSwitch(root, '屏蔽礼物特效');
    gift?.classList.remove('SpsbqNUm');
    gift?.firstElementChild?.classList.remove('gDrxzyfK');
    bag?.classList.remove('SpsbqNUm');
    bag?.firstElementChild?.classList.remove('gDrxzyfK');
    effect?.classList.add('SpsbqNUm');
    effect?.firstElementChild?.classList.add('gDrxzyfK');

    expect(gift && isSwitchOnByStructure(gift)).toBe(false);
    expect(effect && isSwitchOnByStructure(effect)).toBe(true);

    let clicks = 0;
    root.addEventListener('click', () => {
      clicks += 1;
    });
    expect(await ensureLiveSettings(root)).toEqual({
      clicked: [],
      confirmed: ['送礼信息', '福袋口令', '屏蔽礼物特效'],
    });
    expect(clicks).toBe(0);
  });

  it('does not hover-open panels when allowHover is false and switches are absent', async () => {
    document.body.innerHTML = '<div data-e2e="danmaku-setting-icon"></div><div data-e2e="gift-setting"></div>';
    const icon = document.querySelector('[data-e2e="danmaku-setting-icon"]');
    let hovered = 0;
    icon?.addEventListener('mouseenter', () => {
      hovered += 1;
    });
    expect(await ensureLiveSettings(document, { allowHover: false })).toEqual({
      clicked: [],
      confirmed: [],
    });
    expect(hovered).toBe(0);
  });
});
