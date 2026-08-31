/**
 * Cache-Control for ASSETS-proxied file responses.
 * Hashed Vite /assets and self-hosted fonts are immutable; unhashed JS/CSS
 * is short-lived; brand/media is 7d. Query-string ?v= is not a content hash.
 */

const IMMUTABLE = 'public, max-age=31536000, immutable'
const DAY = 'public, max-age=86400, must-revalidate'
const WEEK = 'public, max-age=604800'

/** Vite hashed filename: /assets/index-AbCdEfGh.js */
const HASHED_ASSET = /\/assets\/[^/]+-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$/

export function cacheControlForPath(path: string): string | null {
  if (
    path.startsWith('/fonts/') ||
    path.startsWith('/assets/fonts/') ||
    path.endsWith('.woff2')
  ) {
    return IMMUTABLE
  }
  if (path.startsWith('/assets/')) {
    return HASHED_ASSET.test(path) ? IMMUTABLE : DAY
  }
  if (/^\/(brand|images|products|videos)\//.test(path)) {
    return WEEK
  }
  return null
}
