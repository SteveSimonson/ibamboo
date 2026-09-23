/**
 * iBamboo catalog helpers.
 * Static house + BSR catalog is the bulk shelf. Flash layers on top when live
 * (see useFlashCatalog merge) until Flash publish depth can own full assortment.
 */
export type { Category, Product, ProductSpec } from './types'
export { products as curatedProducts } from './products'
export {
  bsrProducts,
  bsrWeekOf,
  bsrFetchedAt,
  bsrExpiresAt,
  bsrMarketing,
} from './products.bsr.generated'

import {
  galleryThumbImages,
  isAmazonCdnImage,
  primaryDisplayImage,
  resolveProductImages,
} from '../lib/productImages'
import { products as curated } from './products'
import {
  bsrProducts,
  bsrWeekOf,
  bsrExpiresAt,
  bsrMarketing,
} from './products.bsr.generated'
import { withProductMedia } from './productMedia'
import type { Category, Product } from './types'
import z9goGateFile from './z9go-gate.json' with { type: 'json' }
import { productPassesZ9goGate, type Z9goGate } from './z9goGate'

const z9goGate = z9goGateFile as Z9goGate

/**
 * Curated SKUs with an ASIN must be in the Z9GO sidecar when it is enabled.
 * Missing / disabled gate is fail-open. BSR weekly is fenced (always passes).
 */
export function isZ9goGatedProduct(p: Product): boolean {
  return productPassesZ9goGate(p, z9goGate)
}

/**
 * Storefront-ready product: real Amazon listing (ASIN required).
 * Excludes house-edit pads (fill-*, no ASIN) that produce identical busy cards.
 */
export function isMerchandisableProduct(p: Product): boolean {
  // Must map to a real Amazon product page
  if (!p.asin || !/^[A-Z0-9]{10}$/i.test(p.asin)) return false
  // Explicit house-edit filler ids from fill-quota (never shop-ready)
  if (p.id.startsWith('fill-') || p.slug.startsWith('fill-')) return false
  return true
}

/** Prefer products that already have a real Amazon CDN photo in catalog data. */
export function hasAmazonCatalogImage(p: Product): boolean {
  return (p.images || []).some((u) => isAmazonCdnImage(u))
}

/** Merged storefront catalog: limited BSR drop first, then curated (deduped by ASIN). */
export const products: Product[] = mergeCatalog(bsrProducts, curated).map(
  presentForStorefront,
)

/** Shop/home grids — merchandisable + Z9GO gate (fail-open when disabled). */
export const shopProducts: Product[] = products.filter(
  (p) => isMerchandisableProduct(p) && isZ9goGatedProduct(p),
)

function mergeCatalog(bsr: Product[], base: Product[]): Product[] {
  const seenAsin = new Set<string>()
  const seenSlug = new Set<string>()
  const out: Product[] = []

  for (const p of [...bsr, ...base]) {
    // Shop only real Amazon listings (ASIN required). Drops house-edit pads.
    if (!isMerchandisableProduct(p)) continue
    if (seenAsin.has(p.asin!)) continue
    seenAsin.add(p.asin!)
    let slug = p.slug
    if (seenSlug.has(slug)) slug = `${slug}-${p.id}`
    seenSlug.add(slug)
    const merged = slug === p.slug ? p : { ...p, slug }
    out.push(withProductMedia(merged))
  }
  return out
}

export const CATEGORY_LABELS: Record<Category, string> = {
  kitchen: 'Kitchen',
  'cutting-boards': 'Boards & serving',
  dining: 'Tabletop',
  bath: 'Bath & body',
  organization: 'Organization',
  desk: 'Workspace',
  outdoor: 'Outdoor',
  baby: 'Little ones',
}

export const CATEGORY_OPTIONS = (
  Object.entries(CATEGORY_LABELS) as [Category, string][]
).map(([id, label]) => ({ id, label }))

export const collections = Array.from(
  new Map(
    shopProducts.map((p) => [
      p.collection.toLowerCase().replace(/\s+/g, '-'),
      {
        id: p.collection.toLowerCase().replace(/\s+/g, '-'),
        label: p.collection,
        count: 0,
      },
    ]),
  ).values(),
).map((c) => ({
  ...c,
  count: shopProducts.filter(
    (p) => p.collection.toLowerCase().replace(/\s+/g, '-') === c.id,
  ).length,
  blurb: collectionBlurb(c.label),
}))

function collectionBlurb(label: string): string {
  const map: Record<string, string> = {
    Kitchen: 'Tools for the heart of the home.',
    Boards: 'Prep and present on surfaces that earn their keep.',
    Entertaining: 'Hosting pieces with quiet confidence.',
    Tabletop: 'Plates, bowls, and place settings.',
    Bath: 'Soft rituals for the bath and vanity.',
    Bedding: 'Sheets and sleep — this week’s textile edit.',
    Organize: 'Order that looks intentional.',
    Workspace: 'Desk tools with a warmer grain.',
    Outdoor: 'Patio, garden, and open air.',
    Home: 'Larger pieces for living spaces.',
    'Little Ones': 'Gentle forms for first meals and care.',
    'Tea Ritual': 'Quiet tools for tea and matcha.',
    'Grill & Party': 'Skewers and serve-ware for gathering.',
  }
  return map[label] ?? 'Designed for modern living in bamboo.'
}

export function getProduct(
  slug: string,
  pool?: Product[],
): Product | undefined {
  if (pool?.length) {
    const hit = pool.find((p) => p.slug === slug)
    if (hit && isZ9goGatedProduct(hit)) return hit
  }
  const fallback = products.find((p) => p.slug === slug)
  if (fallback && isZ9goGatedProduct(fallback)) return fallback
  return undefined
}

/** Best display image: Amazon CDN first, then ASIN attempts, then quiet monogram. */
export function primaryImage(p: Product): string | undefined {
  return primaryDisplayImage(p)
}

/** Full gallery chain for PDP main viewer / onError fallbacks. */
export function productImageChain(
  p: Product,
  size: 500 | 1000 = 500,
): string[] {
  return resolveProductImages(p, size)
}

/** Thumbnail strip only — reliable Amazon listing photos (hide if ≤1). */
export function productGalleryThumbs(
  p: Product,
  size: 500 | 1000 = 500,
): string[] {
  return galleryThumbImages(p, size)
}

export function formatMoney(n: number) {
  if (n == null || Number.isNaN(n) || n <= 0) return 'See Amazon'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n)
}

export function categoryLabel(c: Category) {
  return CATEGORY_LABELS[c]
}

export function filterProducts(
  opts: {
    cat?: string
    collection?: string
    q?: string
    limited?: boolean
    bsr?: boolean
    /** Include ASIN-less pads (default false — prevents house-edit walls) */
    includePads?: boolean
  },
  /** Active assortment pool (prefer flash SoT). Defaults to static emergency. */
  pool?: Product[],
) {
  let list = opts.includePads
    ? (pool ?? products).slice()
    : (pool ?? shopProducts).slice()
  list = list.filter(isZ9goGatedProduct)
  if (opts.cat && opts.cat in CATEGORY_LABELS) {
    list = list.filter((p) => p.category === opts.cat)
  }
  if (opts.collection) {
    list = list.filter(
      (p) =>
        p.collection.toLowerCase().replace(/\s+/g, '-') === opts.collection ||
        p.collection === opts.collection,
    )
  }
  if (opts.limited) list = list.filter((p) => p.limitedTime)
  if (opts.bsr) {
    list = list.filter(
      (p) => p.source === 'amazon-bsr' || p.source === 'amazon-search',
    )
  }
  if (opts.q) {
    const q = opts.q.toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.bsrCategory?.toLowerCase().includes(q) ||
        p.features.some((f) => f.toLowerCase().includes(q)),
    )
  }
  return list
}

export function limitedProducts(pool: Product[] = shopProducts): Product[] {
  return pool.filter((p) => p.limitedTime)
}

export function bsrLeaders(limit = 12, pool: Product[] = shopProducts): Product[] {
  return pool
    .filter((p) => p.limitedTime && p.bsrRank != null)
    .sort((a, b) => (a.bsrRank ?? 999) - (b.bsrRank ?? 999))
    .slice(0, limit)
}

/** Same category + collection first, then same category. Pass live pool when available. */
export function similarProducts(
  product: Product,
  limit = 4,
  pool: Product[] = shopProducts,
): Product[] {
  const rest = pool.filter((p) => p.id !== product.id)
  const sameCollection = rest.filter(
    (p) =>
      p.collection === product.collection && p.category === product.category,
  )
  const sameCategory = rest.filter(
    (p) =>
      p.category === product.category &&
      !sameCollection.some((s) => s.id === p.id),
  )
  return [...sameCollection, ...sameCategory].slice(0, limit)
}

export function youMayAlsoLike(
  product: Product,
  limit = 4,
  pool: Product[] = shopProducts,
): Product[] {
  const adjacent: Record<Category, Category[]> = {
    kitchen: ['cutting-boards', 'dining', 'organization'],
    'cutting-boards': ['kitchen', 'dining', 'organization'],
    dining: ['kitchen', 'cutting-boards', 'outdoor'],
    bath: ['organization', 'baby'],
    organization: ['desk', 'kitchen', 'bath'],
    desk: ['organization', 'kitchen'],
    outdoor: ['dining', 'kitchen'],
    baby: ['bath', 'dining'],
  }

  const cats = new Set([product.category, ...(adjacent[product.category] ?? [])])
  const lo = (product.priceHint || 20) * 0.45
  const hi = (product.priceHint || 20) * 2.4

  const scored = pool
    .filter((p) => p.id !== product.id)
    .map((p) => {
      let score = 0
      if (cats.has(p.category)) score += 3
      if (p.collection === product.collection) score += 2
      if (p.priceHint >= lo && p.priceHint <= hi) score += 2
      if (p.limitedTime) score += 2
      if (p.badge) score += 1
      if ((p.rating ?? 0) >= 4.3) score += 1
      if (p.category !== product.category) score += 1
      return { p, score }
    })
    .sort((a, b) => b.score - a.score)

  const picked: Product[] = []
  const usedCats = new Set<string>()
  for (const { p } of scored) {
    if (picked.length >= limit) break
    if (usedCats.has(p.category) && picked.length < limit - 1) continue
    picked.push(p)
    usedCats.add(p.category)
  }
  for (const { p } of scored) {
    if (picked.length >= limit) break
    if (!picked.some((x) => x.id === p.id)) picked.push(p)
  }
  return picked
}

export function formatRating(n?: number) {
  if (n == null) return null
  return n.toFixed(1)
}

/** True only when the ISO timestamp is still in the future. */
export function isFreshExpiry(iso?: string | null): boolean {
  if (!iso) return false
  const t = Date.parse(iso)
  return Number.isFinite(t) && t > Date.now()
}

export function showLimitedPlacement(p: {
  limitedTime?: boolean
  expiresAt?: string | null
}): boolean {
  return Boolean(p.limitedTime && isFreshExpiry(p.expiresAt))
}

/** Mattress toppers and rayon/viscose-derived titles are not bamboo furniture. */
export function isOffFurnitureClaim(p: Product): boolean {
  const title = `${p.name} ${p.slug}`.toLowerCase()
  return (
    title.includes('mattress topper') ||
    title.includes('rayon derived from bamboo') ||
    title.includes('viscose derived from bamboo')
  )
}

export function isHomepageFeature(p: Product): boolean {
  return !isOffFurnitureClaim(p)
}

function stripStaleScarcity(text: string): string {
  return text
    .replace(/options rotate and are only available for a limited time\.?/gi, '')
    .replace(/only available for a limited time\.?/gi, '')
    .replace(/limited-time placement on ibamboo this week\.?/gi, '')
    .replace(/limited-time house edit\.?/gi, '')
    .replace(/limited-time options\.?/gi, '')
    .replace(/this week['’]s list\.?/gi, '')
    .replace(/this week['’]s amazon bamboo picks\s*·?\s*/gi, '')
    .replace(/\s*[·|]\s*[·|]\s*/g, ' · ')
    .replace(/\s*[·|]\s*$/g, '')
    .replace(/^\s*[·|]\s*/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function stripFurnitureRank(text: string): string {
  return text
    .replace(/#\d+\s+in\s+furniture/gi, '')
    .replace(/amazon best sellers\s*·\s*/gi, '')
    .replace(/list position \(this week\)/gi, 'List note')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** Drop false deadlines and furniture-rank copy. Catalog rows stay. */
export function presentForStorefront(p: Product): Product {
  const fresh = isFreshExpiry(p.expiresAt || bsrExpiresAt)
  const misranked = isOffFurnitureClaim(p)
  if (fresh && !misranked) return p

  let tagline = p.tagline || ''
  let description = p.description || ''
  let features = p.features || []
  let specs = p.specs || []
  let bsrCategory = p.bsrCategory
  let bsrRank = p.bsrRank

  if (!fresh) {
    tagline = stripStaleScarcity(tagline)
    description = stripStaleScarcity(description)
    features = features
      .map((f) => stripStaleScarcity(f))
      .filter((f) => f.length > 0)
  }
  if (misranked) {
    tagline = stripFurnitureRank(stripStaleScarcity(tagline))
    description = stripFurnitureRank(stripStaleScarcity(description))
    features = features
      .map((f) => stripFurnitureRank(stripStaleScarcity(f)))
      .filter((f) => f.length > 0 && !/furniture/i.test(f))
    specs = specs
      .map((s) => ({
        label: stripStaleScarcity(s.label),
        value: stripFurnitureRank(stripStaleScarcity(s.value)),
      }))
      .filter((s) => s.value.length > 0 && !/furniture/i.test(s.value))
    if (/furniture/i.test(bsrCategory || '')) {
      bsrCategory = undefined
      bsrRank = undefined
    }
  }
  if (!tagline) tagline = p.material || p.name

  return {
    ...p,
    tagline,
    description,
    features,
    specs,
    bsrCategory,
    bsrRank,
  }
}

export function limitedTimeCopy(
  pool: Product[] = shopProducts,
  meta?: { weekOf?: string; generatedAt?: string },
) {
  const active = isFreshExpiry(bsrExpiresAt)
  const limitedCount = limitedProducts(pool).length
  const count = active ? (limitedCount > 0 ? limitedCount : pool.length) : 0
  return {
    headline: active ? bsrMarketing.headline : 'The house edit',
    subhead: active ? bsrMarketing.subhead : '',
    weekOf: active ? meta?.weekOf || bsrWeekOf || null : null,
    expiresAt: active ? bsrExpiresAt || null : null,
    generatedAt: meta?.generatedAt || null,
    count,
    active,
  }
}

export function formatExpiry(iso?: string) {
  if (!isFreshExpiry(iso)) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso as string))
  } catch {
    return null
  }
}
