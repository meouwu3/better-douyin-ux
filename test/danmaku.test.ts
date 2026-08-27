import { describe, expect, it } from 'vitest';
import {
  collectBarrageText,
  filterWorkerMessage,
  shouldDropBarrage,
} from '../utils/danmaku-canvas';

const chatBarrage = {
  content: [
    { type: 'text', text: '路人甲:  ' },
    { type: 'text', text: '伯哥加油' },
  ],
  id: '1',
};

describe('collectBarrageText', () => {
  it('flattens CanvasDanmakuPlugin chat content', () => {
    expect(collectBarrageText(chatBarrage.content)).toBe('路人甲:  伯哥加油');
  });

  it('walks nested block content', () => {
    expect(
      collectBarrageText({
        type: 'block',
        content: [{ type: 'text', text: '点点关注' }, { type: 'image', src: 'x' }],
      }),
    ).toBe('点点关注');
  });
});

describe('shouldDropBarrage', () => {
  it('drops 伯哥 and 点点关注, keeps unrelated chat', () => {
    expect(shouldDropBarrage(chatBarrage)).toBe(true);
    expect(shouldDropBarrage({ content: [{ type: 'text', text: '点点关注+苹果' }] })).toBe(true);
    expect(shouldDropBarrage({ content: [{ type: 'text', text: '姐姐怎么保持身材' }] })).toBe(false);
  });
});

describe('filterWorkerMessage', () => {
  it('drops addBarrage for blocked keywords', () => {
    expect(filterWorkerMessage({ method: 'addBarrage', params: chatBarrage, _uniqueId: 'a' })).toBeUndefined();
  });

  it('passes through addBarrage for normal chat', () => {
    const msg = { method: 'addBarrage', params: { content: [{ type: 'text', text: '支持小好' }] } };
    expect(filterWorkerMessage(msg)).toEqual(msg);
  });

  it('filters addBarrages arrays', () => {
    const next = filterWorkerMessage({
      method: 'addBarrages',
      params: [chatBarrage, { content: [{ type: 'text', text: '你好' }] }],
    }) as { params: unknown[] };
    expect(next.params).toHaveLength(1);
  });
});
