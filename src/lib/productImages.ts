/**
 * Product image resolution: prefer real Amazon photos, never recycle the same
 * busy brand lifestyle fillers as the primary merchandising image.
 */

import { amazonAsinImage } from './amazon'
import type { Category, Product } from '../data/types'

const BUSY_BRAND_PATHS = [
  '/brand/products-flatlay.webp',
  '/brand/products-hero.webp',
  '/brand/soho-collection.webp',
  '/brand/landing-forest.webp',
  '/brand/hero.png',
  '/brand/hero.webp',
  '/brand/hero-dining.jpg',
  '/brand/social.png',
]

/** Cool, low-saturation hues for monogram placeholders (match new surface system). */
const CATEGORY_HUE: Record<string, number> = {
  kitchen: 110,
  'cutting-boards': 95,
  dining: 85,
  bath: 165,
  organization: 140,
  desk: 150,
  outdoor: 125,
  baby: 100,
}

export function isAmazonCdnImage(url: string | undefined | null): boolean {
  if (!url) return false
  return (
    /media-amazon\.com\/images\//i.test(url) ||
    /ssl-images-amazon\.com\/images\//i.test(url)
  )
}

/**
 * Reliable listing photos only (`/images/I/…`).
 * Excludes flaky ASIN `P/{ASIN}` guesses that often 404 as blank white tiles.
 */
export function isReliableAmazonImage(url: string | undefined | null): boolean {
  if (!url || !isAmazonCdnImage(url)) return false
  if (/\/images\/P\/[A-Z0-9]{10}/i.test(url)) return false
  return /\/images\/I\//i.test(url)
}

export function isBusyBrandFallback(url: string | undefined | null): boolean {
  if (!url) return false
  const path = url.split('?')[0]
  return BUSY_BRAND_PATHS.some((b) => path === b || path.endsWith(b))
}

export function isStockPhotoUrl(url: string | undefined | null): boolean {
  if (!url) return false
  return /images\.unsplash\.com|picsum\.photos|placehold\.co|via\.placeholder/i.test(
    url,
  )
}

/** Stable hash for placeholder color variation */
function hashSeed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

/**
 * Quiet, unique monogram card — not a busy product flatlay.
 * Used only after Amazon image attempts fail.
 */
export function quietPlaceholderUrl(product: {
  id: string
  name: string
  category?: string
  asin?: string
}): string {
  const seed = hashSeed(product.asin || product.id || product.name)
  const baseHue = CATEGORY_HUE[product.category || ''] ?? 110
  const hue = (baseHue + (seed % 16) - 8 + 360) % 360
  // Near-white cool fields — never warm tan
  const sat = 8 + (seed % 6)
  const light = 94 + (seed % 4)
  const accent = `hsl(${hue}, ${sat + 18}%, 38%)`
  const bg = `hsl(${hue}, ${sat}%, ${light}%)`
  const bg2 = `hsl(${(hue + 12) % 360}, ${Math.max(4, sat - 2)}%, ${light - 3}%)`
  const initial = (product.name.trim().charAt(0) || 'B').toUpperCase()
  const label = product.asin
    ? 'Photo unavailable'
    : 'Search Amazon'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g)"/>
  <circle cx="400" cy="420" r="120" fill="none" stroke="${accent}" stroke-width="3" opacity="0.35"/>
  <text x="400" y="450" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="120" fill="${accent}" opacity="0.85">${initial}</text>
  <text x="400" y="620" text-anchor="middle" font-family="system-ui,sans-serif" font-size="28" fill="${accent}" opacity="0.55" letter-spacing="4">${label.toUpperCase()}</text>
  <text x="400" y="900" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="${accent}" opacity="0.4">iBamboo</text>
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * Best-effort Amazon CDN candidates for an ASIN (no Creators API).
 * Prefer /images/I/ from scrape; these P/ patterns are last-resort attempts.
 */
export function amazonImageCandidates(
  asin: string,
  size: 500 | 1000 = 500,
): string[] {
  const a = asin.toUpperCase()
  return [
    amazonAsinImage(a, size),
    `https://m.media-amazon.com/images/P/${a}.01._SCLZZZZZZZ_SX${size}_.jpg`,
    `https://images-na.ssl-images-amazon.com/images/P/${a}.01.LZZZZZZZ.jpg`,
    `https://m.media-amazon.com/images/P/${a}.01.LZZZZZZZ.jpg`,
  ]
}

function upgradeAmazonThumb(url: string): string {
  return url
    .replace(/^http:\/\//i, 'https://')
    .replace(/\._AC_UL\d+(?:_SR\d+,\d+)?(?:_QL\d+)?_\./i, '._AC_SL1000_.')
    .replace(/\._AC_UL[^.]+\./i, '._AC_SL1000_.')
    .replace(/\._AC_UX\d+_.*?\./i, '._AC_SL1000_.')
    .replace(/\._AC_UY\d+_.*?\./i, '._AC_SL1000_.')
    .replace(/\._SX\d+_\./i, '._SL1000_.')
    .replace(/\._SY\d+_\./i, '._SL1000_.')
    .replace(/\._US\d+_\./i, '._SL1000_.')
    .replace(/\._SS\d+_\./i, '._SL1000_.')
}

/**
 * Ordered gallery for display / onError chain:
 * 1) Real Amazon CDN images from catalog
 * 2) ASIN-based Amazon URL attempts (if ASIN known)
 * 3) Quiet unique monogram placeholder — never busy brand flatlays
 */
export function resolveProductImages(product: Product): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  const push = (url: string | undefined | null) => {
    if (!url) return
    let u = url.trim()
    if (!u) return
    if (isBusyBrandFallback(u) || isStockPhotoUrl(u)) return
    if (isAmazonCdnImage(u)) u = upgradeAmazonThumb(u)
    if (seen.has(u)) return
    seen.add(u)
    out.push(u)
  }

  for (const img of product.images || []) {
    if (isAmazonCdnImage(img)) push(img)
  }

  // Non-Amazon, non-busy extras (e.g. local brand product photography later)
  for (const img of product.images || []) {
    if (
      !isAmazonCdnImage(img) &&
      !isBusyBrandFallback(img) &&
      !isStockPhotoUrl(img) &&
      !String(img).startsWith('data:')
    ) {
      push(img)
    }
  }

  if (product.asin) {
    for (const c of amazonImageCandidates(product.asin, 500)) push(c)
  }

  push(quietPlaceholderUrl(product))
  return out
}

export function primaryDisplayImage(product: Product): string {
  return resolveProductImages(product)[0]
}

/**
 * Gallery thumbnails: only known-good catalog photos (Amazon /images/I/).
 * Never ASIN P/ guesses, never placeholders, never busy brand art.
 * Hide the strip entirely when this returns 0–1 items.
 */
export function galleryThumbImages(product: Product): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const img of product.images || []) {
    if (!isReliableAmazonImage(img)) continue
    const u = upgradeAmazonThumb(img.trim())
    if (!u || seen.has(u)) continue
    seen.add(u)
    out.push(u)
  }
  return out
}

export function isQuietPlaceholder(url: string | undefined | null): boolean {
  return Boolean(url?.startsWith('data:image/svg+xml'))
}

export function categoryQuietHue(cat: Category | string | undefined): number {
  return CATEGORY_HUE[cat || ''] ?? 100
}
