/**
 * iBamboo catalog — curated house + weekly Amazon BSR limited drop.
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

/** Merged storefront catalog: limited BSR drop first, then curated (deduped by ASIN). */
export const products: Product[] = mergeCatalog(bsrProducts, curated)

function mergeCatalog(bsr: Product[], base: Product[]): Product[] {
  const seenAsin = new Set<string>()
  const seenSlug = new Set<string>()
  const out: Product[] = []

  for (const p of [...bsr, ...base]) {
    if (p.asin) {
      if (seenAsin.has(p.asin)) continue
      seenAsin.add(p.asin)
    }
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
    products.map((p) => [
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
  count: products.filter(
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

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

/** Best display image: Amazon CDN first, then ASIN attempts, then quiet monogram. */
export function primaryImage(p: Product): string | undefined {
  return primaryDisplayImage(p)
}

/** Full gallery chain for PDP / onError fallbacks (no busy brand flatlays). */
export function productImageChain(p: Product): string[] {
  return resolveProductImages(p)
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

export function filterProducts(opts: {
  cat?: string
  collection?: string
  q?: string
  limited?: boolean
  bsr?: boolean
}) {
  let list = products.slice()
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

export function limitedProducts(): Product[] {
  return products.filter((p) => p.limitedTime)
}

export function bsrLeaders(limit = 12): Product[] {
  return products
    .filter((p) => p.limitedTime && p.bsrRank != null)
    .sort((a, b) => (a.bsrRank ?? 999) - (b.bsrRank ?? 999))
    .slice(0, limit)
}

/** Same category + collection first, then same category. */
export function similarProducts(product: Product, limit = 4): Product[] {
  const rest = products.filter((p) => p.id !== product.id)
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

export function youMayAlsoLike(product: Product, limit = 4): Product[] {
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

  const scored = products
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

export function limitedTimeCopy() {
  return {
    headline: bsrMarketing.headline,
    subhead: bsrMarketing.subhead,
    weekOf: bsrWeekOf || null,
    expiresAt: bsrExpiresAt || null,
    count: limitedProducts().length,
  }
}

export function formatExpiry(iso?: string) {
  if (!iso) return null
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso))
  } catch {
    return null
  }
}
