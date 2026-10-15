/**
 * High-performance image URL optimizer and caching proxy helper
 * Proxies remote CDN/external images through the ultra-fast server-side cache
 * to eliminate 2-3 second remote TTFB latency and enable instant browser/service-worker caching.
 */

export function getOptimizedImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a relative path, local upload, data URL or blob
  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Already proxied
  if (trimmed.startsWith('/api/image-proxy')) {
    return trimmed;
  }

  // If it's a remote URL (such as abseed.com.bd, external CDN, etc.), proxy through local high-speed disk cache
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return `/api/image-proxy?url=${encodeURIComponent(trimmed)}`;
  }

  return trimmed;
}

/**
 * Fallback handler: If the proxied image fails for any reason,
 * extract the raw URL to allow direct fallback without breaking the UI.
 */
export function getFallbackImageUrl(currentSrc: string, fallbackDefault = ''): string {
  if (currentSrc.includes('/api/image-proxy?url=')) {
    try {
      const match = currentSrc.match(/[?&]url=([^&]+)/);
      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }
    } catch {
      // ignore
    }
  }
  return fallbackDefault;
}
