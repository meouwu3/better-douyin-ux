import { afterEach, describe, expect, it } from 'vitest';
import { ensureAiEntryClosed, findAiEntrySwitch, isAiEntrySwitchOn } from '../utils/ai-entry';
import { AI_ENTRY_SWITCH_OFF_HTML, AI_ENTRY_SWITCH_ON_HTML, mount } from './fixtures';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('ensureAiEntryClosed', () => {
  it('clicks the captured Semi switch when it is on', () => {
    const root = mount(AI_ENTRY_SWITCH_ON_HTML);
    const sw = findAiEntrySwitch(root);
    expect(sw && isAiEntrySwitchOn(sw)).toBe(true);
    let clicks = 0;
    sw?.addEventListener('click', () => {
      clicks += 1;
    });
    expect(ensureAiEntryClosed(root)).toBe(true);
    expect(clicks).toBe(1);
  });

  it('is a no-op when the switch is already off', () => {
    const root = mount(AI_ENTRY_SWITCH_OFF_HTML);
    const sw = findAiEntrySwitch(root);
    expect(sw && isAiEntrySwitchOn(sw)).toBe(false);
    let clicks = 0;
    root.addEventListener('click', () => {
      clicks += 1;
    });
    expect(ensureAiEntryClosed(root)).toBe(false);
    expect(clicks).toBe(0);
  });

  it('is a no-op when the settings modal is not open', () => {
    document.body.innerHTML = '<div class="ai-douyin-entry"></div>';
    expect(ensureAiEntryClosed(document)).toBe(false);
  });
});
