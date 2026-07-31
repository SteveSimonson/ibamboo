/**
 * Live flash drop from amazon-flash-catalog Worker (R2-backed JSON).
 * Falls back silently so the static BSR catalog still works offline.
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
}

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

/** Map flash DTO → iBamboo Product (limited-time shelf). */
export function flashToProduct(p: FlashProductDto): Product {
  const asin = p.asin.toUpperCase()
  const name = p.title || `Amazon ${asin}`
  const cat = asCategory(p.siteCategory)
  // Prefer API image; otherwise try common Amazon image patterns (may soft-fail).
  const images = p.image
    ? [p.image]
    : [
        `https://m.media-amazon.com/images/P/${asin}._AC_SL500_.jpg`,
        `https://images-na.ssl-images-amazon.com/images/P/${asin}.01._SCLZZZZZZZ_SX500_.jpg`,
      ]
  return {
    id: `flash-${asin}`,
    slug: slugify(name) || asin.toLowerCase(),
    name,
    tagline: 'Limited-time flash pick from this week’s Amazon drop.',
    description: `${name} — live flash catalog item. Complete your purchase on Amazon; iBamboo is an Amazon Associate.`,
    category: cat,
    collection:
      cat === 'cutting-boards'
        ? 'Boards'
        : cat === 'desk'
          ? 'Workspace'
          : cat === 'organization'
            ? 'Organize'
            : cat === 'dining'
              ? 'Tabletop'
              : cat.charAt(0).toUpperCase() + cat.slice(1),
    material: 'Bamboo',
    features: ['Flash catalog', 'Amazon Associates'],
    specs: [],
    priceHint: p.price ?? 29,
    asin,
    searchKeywords: name,
    images,
    rating: p.rating,
    reviewCount: p.reviewCount,
    hue: hueFromAsin(asin),
    limitedTime: true,
    weekOf: p.weekOf,
    bsrRank: p.bsrRank,
    bsrCategory: p.sourceCategoryId,
    bsrCategoryId: p.sourceCategoryId,
    source: p.enriched ? 'amazon-bsr' : 'amazon-search',
    badge: 'Flash',
  }
}

export function flashCatalogBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_FLASH_CATALOG_URL as string | undefined)
    ?.trim()
    .replace(/\/$/, '')
  return fromEnv || ''
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
    const key = p.asin.toUpperCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(flashToProduct(p))
  }
  return out
}
