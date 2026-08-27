import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('icons', () => {
  for (const size of [16, 32, 48, 96, 128] as const) {
    it(`includes public/icon/${size}.png`, () => {
      expect(existsSync(`public/icon/${size}.png`)).toBe(true);
    });
  }
});
