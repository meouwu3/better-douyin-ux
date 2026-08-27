import { textHasBlockedKeyword } from './keywords';

type TextFn = (text: string | number, ...args: unknown[]) => unknown;

function wrap(original: TextFn): TextFn {
  return function patched(this: CanvasRenderingContext2D, text: string | number, ...args: unknown[]) {
    if (typeof text === 'string' && textHasBlockedKeyword(text)) return;
    return original.call(this, text, ...args);
  };
}

/** Danmaku is a <canvas>; skip fill/stroke of blocked keywords. */
export function installDanmakuCanvasFilter(): void {
  const proto = CanvasRenderingContext2D.prototype;
  proto.fillText = wrap(proto.fillText as TextFn) as typeof proto.fillText;
  proto.strokeText = wrap(proto.strokeText as TextFn) as typeof proto.strokeText;
}
