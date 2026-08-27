import { textHasBlockedKeyword } from './keywords';

function wrapProtoFill(proto: {
  fillText: (text: string, x: number, y: number, maxWidth?: number) => void;
  strokeText: (text: string, x: number, y: number, maxWidth?: number) => void;
}): void {
  const fill = proto.fillText;
  const stroke = proto.strokeText;
  proto.fillText = function (text, x, y, maxWidth) {
    if (textHasBlockedKeyword(text)) return;
    return fill.call(this, text, x, y, maxWidth);
  };
  proto.strokeText = function (text, x, y, maxWidth) {
    if (textHasBlockedKeyword(text)) return;
    return stroke.call(this, text, x, y, maxWidth);
  };
}

/** Flatten CanvasDanmakuPlugin barrage `{ content: [{ type:'text', text }, { content: [...] }] }`. */
export function collectBarrageText(node: unknown): string {
  if (node == null) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(collectBarrageText).join('');
  if (typeof node !== 'object') return '';
  const rec = node as { text?: unknown; content?: unknown };
  const parts: string[] = [];
  if (typeof rec.text === 'string') parts.push(rec.text);
  if (rec.content !== undefined) parts.push(collectBarrageText(rec.content));
  return parts.join('');
}

export function shouldDropBarrage(params: unknown): boolean {
  if (!params || typeof params !== 'object') return false;
  return textHasBlockedKeyword(collectBarrageText((params as { content?: unknown }).content));
}

/** Return undefined to drop the worker message entirely. */
export function filterWorkerMessage(message: unknown): unknown {
  if (!message || typeof message !== 'object') return message;
  const msg = message as { method?: string; params?: unknown };
  if (msg.method === 'addBarrage' && shouldDropBarrage(msg.params)) return undefined;
  if (msg.method === 'addBarrages' && Array.isArray(msg.params)) {
    return { ...msg, params: msg.params.filter((item) => !shouldDropBarrage(item)) };
  }
  if (msg.method === 'createInstance' && msg.params && typeof msg.params === 'object') {
    const params = msg.params as { barrages?: unknown[] };
    if (Array.isArray(params.barrages)) {
      return {
        ...msg,
        params: { ...params, barrages: params.barrages.filter((item) => !shouldDropBarrage(item)) },
      };
    }
  }
  return message;
}

function installWorkerPostMessageFilter(): void {
  if (typeof Worker === 'undefined') return;
  const original = Worker.prototype.postMessage;
  Worker.prototype.postMessage = function patchedPostMessage(
    this: Worker,
    message: unknown,
    options?: StructuredSerializeOptions | Transferable[],
  ) {
    const next = filterWorkerMessage(message);
    if (next === undefined) return;
    if (options === undefined) return original.call(this, next);
    return original.call(this, next, options as StructuredSerializeOptions);
  };
}

/** Danmaku paints in a Worker OffscreenCanvas; filter addBarrage before it is posted. */
export function installDanmakuCanvasFilter(): void {
  wrapProtoFill(CanvasRenderingContext2D.prototype);
  if (typeof OffscreenCanvasRenderingContext2D !== 'undefined') {
    wrapProtoFill(OffscreenCanvasRenderingContext2D.prototype);
  }
  installWorkerPostMessageFilter();
}
