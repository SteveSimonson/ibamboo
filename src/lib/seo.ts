/** Site-wide SEO constants and helpers (canonical host: apex). */

export const SITE_URL = 'https://ibamboo.com'
export const SITE_NAME = 'iBamboo'
export const DEFAULT_TITLE = 'iBamboo — Bamboo living, elevated'
export const DEFAULT_DESCRIPTION =
  'Discover bamboo for kitchen, table, bath, desk, and home. Shop the weekly limited-time house edit on iBamboo; buy securely on Amazon.'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/brand/social.png`
export const TWITTER_HANDLE = '' // set if brand X account exists

export type PageSeo = {
  title: string
  description: string
  /** Path starting with / (no origin) */
  path: string
  image?: string
  /** Same-origin LCP image the Worker preloads in the raw HTML head */
  preloadImage?: string
  type?: 'website' | 'article' | 'product'
  noindex?: boolean
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function absoluteUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return SITE_URL
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl
  }
  if (pathOrUrl.startsWith('data:')) return pathOrUrl
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${SITE_URL}${path}`
}

export function pageTitle(title: string): string {
  const t = title.trim()
  if (!t) return DEFAULT_TITLE
  if (/ibamboo/i.test(t)) return t
  // Keep titles under ~60 chars when possible
  const combined = `${t} | ${SITE_NAME}`
  return combined.length > 65 ? t.slice(0, 60) : combined
}

export function clipMeta(text: string, max = 160): string {
  const s = text.replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  return `${s.slice(0, max - 1).trim()}…`
}

/** FAQPage JSON-LD for product enrichment FAQs (raw HTML + client Seo). */
export function faqPageJsonLd(
  faqs: { q: string; a: string }[],
  pagePath: string,
) {
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
    url: absoluteUrl(pagePath),
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/brand/logo-color.png'),
    description: DEFAULT_DESCRIPTION,
    sameAs: [] as string[],
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[],
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

export function itemListJsonLd(opts: {
  name: string
  path: string
  items: { name: string; path: string; position: number }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: opts.name,
    url: absoluteUrl(opts.path),
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: opts.items.length,
    itemListElement: opts.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      url: absoluteUrl(item.path),
      name: item.name,
    })),
  }
}

export function productJsonLd(opts: {
  name: string
  description: string
  path: string
  images: string[]
  price?: number
  asin?: string
  brand?: string
  rating?: number
  reviewCount?: number
  category?: string
}) {
  const images = opts.images
    .filter((u) => u && !u.startsWith('data:'))
    .map((u) => absoluteUrl(u))
    .slice(0, 8)

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: opts.name,
    description: clipMeta(opts.description, 5000),
    url: absoluteUrl(opts.path),
    image: images.length ? images : [DEFAULT_OG_IMAGE],
    brand: {
      '@type': 'Brand',
      name: opts.brand || SITE_NAME,
    },
    category: opts.category,
  }

  if (opts.asin) {
    data.sku = opts.asin
    data.gtin = undefined
  }

  if (opts.price != null && opts.price > 0) {
    data.offers = {
      '@type': 'Offer',
      url: absoluteUrl(opts.path),
      priceCurrency: 'USD',
      price: opts.price.toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Amazon' },
    }
  }

  if (opts.rating != null && opts.reviewCount != null && opts.reviewCount > 0) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: opts.rating,
      reviewCount: opts.reviewCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return data
}
