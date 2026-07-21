/**
 * Amazon Associates helpers for iBamboo.
 * Tracking ID: set VITE_AMAZON_ASSOCIATE_TAG or defaults to iu0e3-20.
 */

export const AMAZON_ASSOCIATE_TAG =
  import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'iu0e3-20'

/** Product detail page with Associates tag. */
export function amazonProductUrl(asin: string, extras?: Record<string, string>) {
  const url = new URL(`https://www.amazon.com/dp/${asin}`)
  url.searchParams.set('tag', AMAZON_ASSOCIATE_TAG)
  if (extras) {
    for (const [k, v] of Object.entries(extras)) {
      url.searchParams.set(k, v)
    }
  }
  return url.toString()
}

/** Keyword search with Associates tag. */
export function amazonSearchUrl(keywords: string) {
  const url = new URL('https://www.amazon.com/s')
  url.searchParams.set('k', keywords)
  url.searchParams.set('tag', AMAZON_ASSOCIATE_TAG)
  return url.toString()
}

/** Prefer ASIN product URL; fall back to search. */
export function affiliateUrl(opts: {
  asin?: string
  searchKeywords?: string
  name: string
}) {
  if (opts.asin) return amazonProductUrl(opts.asin)
  return amazonSearchUrl(opts.searchKeywords || `bamboo ${opts.name}`)
}

/**
 * Amazon product image by ASIN (Associates-friendly CDN pattern).
 * May 404 for delisted ASINs — callers should provide gallery fallbacks.
 */
export function amazonAsinImage(asin: string, size: 200 | 500 | 1000 = 500) {
  return `https://m.media-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX${size}_.jpg`
}
