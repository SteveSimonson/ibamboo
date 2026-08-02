/**
 * Site assortment from amazon-flash-catalog (R2-backed JSON).
 * Flash is the assortment source of truth when healthy; static catalog is emergency fallback only.
 */
import type { Category, Product } from '../data/types'

export type FlashCatalogPayload = {
  siteId: string
  siteName: string
  generatedAt: string
  weekOf: string
  productCount: number
  associateTag: string
  marketplace: string
  products: FlashProductDto[]
}

export type FlashProductDto = {
  asin: string
  title: string
  url: string
  image?: string
  price?: number
  currency?: string
  rating?: number
  reviewCount?: number
  bsrRank?: number
  sourceCategoryId: string
  siteCategory: string
  limitedTime: boolean
  weekOf: string
  enriched: boolean
  blurb?: string
}

/** Production default — always on so deploy cannot forget the control plane. */
export const DEFAULT_FLASH_CATALOG_BASE =
  'https://amazon-flash-catalog.tech-bf6.workers.dev'

const CATEGORIES: Category[] = [
  'kitchen',
  'cutting-boards',
  'dining',
  'bath',
  'organization',
  'desk',
  'outdoor',
  'baby',
]

function asCategory(raw: string): Category {
  return (CATEGORIES as string[]).includes(raw)
    ? (raw as Category)
    : 'kitchen'
}

function slugify(s: string): string {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

function hueFromAsin(asin: string): number {
  let h = 0
  for (let i = 0; i < asin.length; i++) h = (h * 31 + asin.charCodeAt(i)) % 360
  return h
}

/** Short house name from Amazon title (never dump the full listing string). */
export function houseNameFromTitle(title: string): string {
  let t = title.trim()
  // Prefer clause before pipe / em-dash / en-dash separators common on Amazon
  t = t.split(/\s*[|–—]\s*/)[0] || t
  // Drop trailing marketing piles after comma if still huge
  if (t.length > 72) {
    const comma = t.indexOf(',')
    if (comma > 24 && comma < 72) t = t.slice(0, comma)
  }
  t = t.replace(/\s+/g, ' ').trim()
  if (t.length > 64) t = `${t.slice(0, 61).replace(/\s+\S*$/, '')}…`
  return t || title.slice(0, 48)
}

/** Skip non-bamboo / placeholder titles client-side (defense in depth). */
export function isQualityFlashTitle(title: string | undefined): boolean {
  if (!title || title.trim().length < 12) return false
  if (/^amazon product\s+[a-z0-9]{10}$/i.test(title.trim())) return false
  return /\bbamboo\b/i.test(title)
}

/**
 * Accept only well-formed Amazon list CDN paths.
 * Rejects truncated hashes (e.g. …/I/71eJfNw) that 404 in the wild.
 */
export function isUsableFlashImage(url: string | undefined): boolean {
  if (!url || !/^https:\/\//i.test(url)) return false
  if (!/\/images\/I\//i.test(url)) return false
  if (/\/images\/P\//i.test(url)) return false
  // Image id is typically 10–15+ chars before size token
  const m = url.match(/\/images\/I\/([A-Za-z0-9_+%-]+)/i)
  if (!m || m[1].length < 10) return false
  // Prefer paths that already have a size token or full filename
  if (!/\._[A-Z0-9_,+%-]+\./i.test(url) && !/\.(jpe?g|png|webp)(\?|$)/i.test(url)) {
    return false
  }
  return true
}

function collectionFor(cat: Category): string {
  switch (cat) {
    case 'cutting-boards':
      return 'Boards'
    case 'desk':
      return 'Workspace'
    case 'organization':
      return 'Organize'
    case 'dining':
      return 'Tabletop'
    case 'bath':
      return 'Bath'
    case 'baby':
      return 'Little Ones'
    case 'outdoor':
      return 'Outdoor'
    default:
      return cat.charAt(0).toUpperCase() + cat.slice(1)
  }
}

/** Map flash DTO → iBamboo Product (full assortment item). */
export function flashToProduct(p: FlashProductDto): Product {
  const asin = p.asin.toUpperCase()
  const rawTitle = (p.title || '').trim()
  const name = houseNameFromTitle(rawTitle)
  const cat = asCategory(p.siteCategory)
  const images = isUsableFlashImage(p.image) ? [p.image as string] : []
  const limited = Boolean(p.limitedTime)
  const tagline =
    p.blurb?.split('—')[0]?.trim() ||
    `Bamboo for the ${cat.replace(/-/g, ' ')} — discover on iBamboo, buy on Amazon.`
  const description =
    p.blurb ||
    `${name} — a bamboo piece curated for the ${cat.replace(/-/g, ' ')} room.`
  // Stable slug: house name + ASIN tail so title refreshes don't thrash URLs
  const baseSlug = slugify(name) || asin.toLowerCase()
  const slug = `${baseSlug}-${asin.slice(-4).toLowerCase()}`

  return {
    id: `flash-${asin}`,
    slug,
    name,
    tagline: tagline.slice(0, 140),
    description,
    category: cat,
    collection: collectionFor(cat),
    material: 'Bamboo',
    features: limited
      ? ['Bamboo focus', 'Rotating assortment']
      : ['Bamboo focus', 'Amazon fulfilled'],
    specs: [],
    priceHint: p.price && p.price > 0 ? p.price : 24,
    asin,
    searchKeywords: `${rawTitle} bamboo`,
    images,
    rating: p.rating,
    reviewCount: p.reviewCount,
    hue: hueFromAsin(asin),
    limitedTime: limited,
    weekOf: p.weekOf,
    bsrRank: p.bsrRank,
    bsrCategory: p.sourceCategoryId,
    bsrCategoryId: p.sourceCategoryId,
    source: p.enriched ? 'amazon-bsr' : 'amazon-search',
    badge: limited ? 'This week' : undefined,
  }
}

export function flashCatalogBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_FLASH_CATALOG_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, '')
  return fromEnv || DEFAULT_FLASH_CATALOG_BASE
}

export async function fetchFlashCatalog(
  siteId = 'ibamboo',
  init?: RequestInit,
): Promise<FlashCatalogPayload | null> {
  const base = flashCatalogBaseUrl()
  if (!base) return null
  try {
    const res = await fetch(`${base}/api/catalog/${encodeURIComponent(siteId)}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.headers || {}),
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as FlashCatalogPayload
    if (!data?.products || !Array.isArray(data.products)) return null
    return data
  } catch {
    return null
  }
}

export function mapFlashProducts(payload: FlashCatalogPayload | null): Product[] {
  if (!payload?.products?.length) return []
  const out: Product[] = []
  const seen = new Set<string>()
  for (const p of payload.products) {
    if (!p.asin || !/^[A-Z0-9]{10}$/i.test(p.asin)) continue
    if (!isQualityFlashTitle(p.title)) continue
    const key = p.asin.toUpperCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(flashToProduct(p))
  }
  return out
}
