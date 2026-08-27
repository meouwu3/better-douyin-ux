export function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

export function isDouyinHost(hostname: string): boolean {
  return hostname === 'douyin.com' || hostname.endsWith('.douyin.com');
}

/** live.douyin.com rooms and www.douyin.com/.../live/... (including follow/live). */
export function isLiveUrl(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed || !isDouyinHost(parsed.hostname)) return false;
  if (parsed.hostname === 'live.douyin.com' || parsed.hostname.endsWith('.live.douyin.com')) {
    return true;
  }
  return /\/live(?:\/|$)/.test(parsed.pathname);
}

/** Any douyin page that is not a live room — feed, video, user, etc. */
export function isVideoUrl(url: string): boolean {
  const parsed = parseUrl(url);
  if (!parsed || !isDouyinHost(parsed.hostname)) return false;
  return !isLiveUrl(url);
}
