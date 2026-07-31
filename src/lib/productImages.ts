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

const SKIP_MONOGRAM_WORDS = new Set([
  'a',
  'an',
  'the',
  'and',
  'or',
  'for',
  'with',
  'set',
  'of',
  'to',
  'in',
  'on',
  'by',
  'pcs',
  'pc',
  'pack',
  'bamboo', // skip so not every card is "B"
  'wood',
  'wooden',
  'natural',
  'organic',
  'premium',
  'new',
  'best',
])

/**
 * Build a stable 2-letter monogram that varies by product
 * (not always "B" for Bamboo…).
 */
export function monogramFromProduct(product: {
  name: string
  asin?: string
  id?: string
}): string {
  const words = product.name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !SKIP_MONOGRAM_WORDS.has(w.toLowerCase()))

  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase()
  }
  if (product.asin && product.asin.length >= 2) {
    return product.asin.slice(-2).toUpperCase()
  }
  const seed = hashSeed(product.id || product.name || 'ib')
  return String.fromCharCode(65 + (seed % 26)) + String.fromCharCode(65 + ((seed >> 4) % 26))
}

/** Short unique label under monogram (ASIN tail or category word). */
function placeholderCaption(product: {
  name: string
  asin?: string
  category?: string
}): string {
  if (product.asin) return product.asin.slice(-4).toUpperCase()
  const w = product.name
    .split(/\s+/)
    .find((x) => x.length > 3 && !SKIP_MONOGRAM_WORDS.has(x.toLowerCase()))
  return (w || product.category || 'item').slice(0, 10).toUpperCase()
}

/**
 * Quiet, unique monogram card — not a busy product flatlay.
 * Used only after Amazon image attempts fail.
 * Designed so a grid of missing photos does not look identical:
 * - 2-letter monogram from title words (skips "Bamboo")
 * - ASIN-derived accent stripe + caption
 * - Hue/pattern variation from stable hash
 */
export function quietPlaceholderUrl(product: {
  id: string
  name: string
  category?: string
  asin?: string
}): string {
  const seed = hashSeed(product.asin || product.id || product.name)
  const baseHue = CATEGORY_HUE[product.category || ''] ?? 110
  const hue = (baseHue + (seed % 28) - 14 + 360) % 360
  const sat = 10 + (seed % 10)
  const light = 92 + (seed % 5)
  const accent = `hsl(${hue}, ${sat + 22}%, 36%)`
  const accent2 = `hsl(${(hue + 40) % 360}, ${sat + 12}%, 42%)`
  const bg = `hsl(${hue}, ${sat}%, ${light}%)`
  const bg2 = `hsl(${(hue + 18) % 360}, ${Math.max(5, sat - 2)}%, ${light - 4}%)`
  const mono = monogramFromProduct(product)
  const caption = placeholderCaption(product)
  // Subtle pattern choice so adjacent cards differ
  const pattern = seed % 3
  const decor =
    pattern === 0
      ? `<circle cx="400" cy="400" r="128" fill="none" stroke="${accent}" stroke-width="3" opacity="0.3"/>`
      : pattern === 1
        ? `<rect x="272" y="272" width="256" height="256" rx="28" fill="none" stroke="${accent}" stroke-width="3" opacity="0.3"/>`
        : `<polygon points="400,260 540,400 400,540 260,400" fill="none" stroke="${accent}" stroke-width="3" opacity="0.3"/>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
  <defs>
    <linearGradient id="g${seed % 997}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${bg}"/>
      <stop offset="100%" stop-color="${bg2}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="1000" fill="url(#g${seed % 997})"/>
  <rect x="0" y="0" width="800" height="10" fill="${accent2}" opacity="0.55"/>
  ${decor}
  <text x="400" y="430" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="108" fill="${accent}" opacity="0.9" letter-spacing="6">${mono}</text>
  <text x="400" y="520" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="${accent}" opacity="0.5" letter-spacing="5">NO PHOTO</text>
  <text x="400" y="580" text-anchor="middle" font-family="ui-monospace,monospace" font-size="26" fill="${accent2}" opacity="0.65" letter-spacing="3">${caption}</text>
  <text x="400" y="900" text-anchor="middle" font-family="system-ui,sans-serif" font-size="20" fill="${accent}" opacity="0.35">iBamboo</text>
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

function upgradeAmazonThumb(url: string, size: 500 | 1000 = 500): string {
  return url
    .replace(/^http:\/\//i, 'https://')
    .replace(/\._AC_UL\d+(?:_SR\d+,\d+)?(?:_QL\d+)?_\./i, `._AC_SL${size}_.`)
    .replace(/\._AC_UL[^.]+\./i, `._AC_SL${size}_.`)
    .replace(/\._AC_UX\d+_.*?\./i, `._AC_SL${size}_.`)
    .replace(/\._AC_UY\d+_.*?\./i, `._AC_SL${size}_.`)
    // Catalog URLs are already SL-form (SL1000/SL1500) — retarget those too
    .replace(/\._AC_SL\d+_\./i, `._AC_SL${size}_.`)
    .replace(/\._SX\d+_\./i, `._SL${size}_.`)
    .replace(/\._SY\d+_\./i, `._SL${size}_.`)
    .replace(/\._US\d+_\./i, `._SL${size}_.`)
    .replace(/\._SS\d+_\./i, `._SL${size}_.`)
}

/**
 * Ordered gallery for display / onError chain:
 * 1) Real Amazon CDN images from catalog
 * 2) ASIN-based Amazon URL attempts (if ASIN known)
 * 3) Quiet unique monogram placeholder — never busy brand flatlays
 * `size` is the Amazon CDN target: 500 for cards/grids, 1000 for the PDP
 * main viewer and og/schema images (rendered up to ~686px CSS).
 */
export function resolveProductImages(
  product: Product,
  size: 500 | 1000 = 500,
): string[] {
  const out: string[] = []
  const seen = new Set<string>()

  const push = (url: string | undefined | null) => {
    if (!url) return
    let u = url.trim()
    if (!u) return
    if (isBusyBrandFallback(u) || isStockPhotoUrl(u)) return
    if (isAmazonCdnImage(u)) u = upgradeAmazonThumb(u, size)
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
    for (const c of amazonImageCandidates(product.asin, size)) push(c)
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
export function galleryThumbImages(
  product: Product,
  size: 500 | 1000 = 500,
): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const img of product.images || []) {
    if (!isReliableAmazonImage(img)) continue
    const u = upgradeAmazonThumb(img.trim(), size)
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
