/**
 * Per-route SEO descriptors — single source of truth shared by the React
 * pages (client hydration via <Seo>) and the build-time route-meta generator
 * (scripts/route-meta.ts) that feeds the Worker's raw-HTML head injection.
 * Pure and isomorphic: no DOM access.
 */

import {
  CATEGORY_LABELS,
  categoryLabel,
  filterProducts,
  getProduct,
  productGalleryThumbs,
  productImageChain,
} from '../data/catalog'
import { getCategoryHero } from '../data/categoryHeroes'
import { giftGuides } from '../data/giftGuides'
import { buyerGuides } from '../data/buyerGuides'
import type {
  Category,
  BuyerGuide,
  GiftGuide,
  Product,
  ProductEnrichment,
} from '../data/types'
import type { VibeProfile } from '../data/vibes'
import { isQuietPlaceholder } from './productImages'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  absoluteUrl,
  breadcrumbJsonLd,
  clipMeta,
  faqPageJsonLd,
  itemListJsonLd,
  pageTitle,
  productJsonLd,
  type CrawlerBody,
  type PageSeo,
} from './seo'

export const AFFILIATE_DISCLOSURE =
  'As an Amazon Associate, iBamboo may earn from qualifying purchases.'

function collapseWs(s: string): string {
  return s.replace(/\s+/g, ' ').trim()
}

/** Keep crawler judgment in the 2–6 paragraph / ~400-word band. */
export function takeCrawlerParagraphs(
  parts: string[],
  maxWords = 400,
  maxParagraphs = 6,
): string[] {
  const out: string[] = []
  let used = 0
  for (const raw of parts) {
    const text = collapseWs(raw)
    if (!text) continue
    if (out.length >= maxParagraphs || used >= maxWords) break
    const words = text.split(' ')
    if (used + words.length <= maxWords) {
      out.push(text)
      used += words.length
      continue
    }
    const remain = maxWords - used
    if (remain >= 20) {
      out.push(`${words.slice(0, remain).join(' ')}…`)
    }
    break
  }
  return out
}

function productCrawler(p: Product, enrichment?: ProductEnrichment): CrawlerBody {
  if (enrichment) {
    return {
      h1: p.name,
      paragraphs: takeCrawlerParagraphs([
        enrichment.reviewSnapshot.verdict,
        ...enrichment.blog.sections.slice(0, 3).map((s) => s.body),
      ]),
      faq: enrichment.faq.map(({ q, a }) => ({ q, a })),
      disclosure: AFFILIATE_DISCLOSURE,
    }
  }
  return {
    h1: p.name,
    paragraphs: [p.tagline, p.description]
      .map((s) => (s ? collapseWs(s) : ''))
      .filter(Boolean),
    faq: [],
    disclosure: AFFILIATE_DISCLOSURE,
  }
}

function guideCrawler(g: BuyerGuide): CrawlerBody {
  return {
    h1: g.title,
    paragraphs: takeCrawlerParagraphs([
      g.dek,
      g.intro,
      ...g.sections.map((s) => s.body),
    ]),
    faq: g.faq.map(({ q, a }) => ({ q, a })),
    disclosure: AFFILIATE_DISCLOSURE,
  }
}

export function homeSeo(): PageSeo {
  return {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    path: '/',
    image: '/brand/hero.webp',
    preloadImage: '/brand/hero.webp',
  }
}

export function shopSeo(opts: {
  cat?: string
  limited?: boolean
  q?: string
}): PageSeo {
  const rawCat = opts.cat || ''
  const cat = rawCat && rawCat in CATEGORY_LABELS ? (rawCat as Category) : ''
  const limited = opts.limited === true
  const q = opts.q || ''
  const categoryHero = getCategoryHero(cat || null)
  const count = filterProducts({ cat, q, limited }).length

  const path = cat
    ? `/shop?cat=${cat}${limited ? '&limited=1' : ''}`
    : limited
      ? '/shop?limited=1'
      : q
        ? `/shop?q=${encodeURIComponent(q)}`
        : '/shop'

  const title = cat
    ? `${CATEGORY_LABELS[cat]} bamboo`
    : limited
      ? 'This week’s limited bamboo options'
      : 'Shop bamboo for every room'

  const description =
    cat && categoryHero
      ? clipMeta(
          `${categoryHero.blurb} Browse ${count} bamboo ${CATEGORY_LABELS[cat].toLowerCase()} picks on iBamboo; buy on Amazon.`,
        )
      : limited
        ? 'Amazon Best Sellers bamboo edit for kitchen, table, bath, and desk. Limited-time options that refresh weekly—discover on iBamboo, buy on Amazon.'
        : 'Shop bamboo kitchen tools, cutting boards, tabletop, bath, desk, and home. Discover the collection on iBamboo; complete purchase on Amazon.'

  const crumbs = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
  ]
  if (cat) {
    crumbs.push({
      name: CATEGORY_LABELS[cat],
      path: `/shop?cat=${cat}`,
    })
  } else if (limited) {
    crumbs.push({ name: 'This week', path: '/shop?limited=1' })
  }

  return {
    title,
    description,
    path,
    image: categoryHero?.image || '/brand/social.png',
    preloadImage: cat && categoryHero ? categoryHero.image : undefined,
    jsonLd: breadcrumbJsonLd(crumbs),
  }
}

export function productSeo(
  p: Product,
  enrichment?: ProductEnrichment,
): PageSeo {
  const productPath = `/product/${p.slug}`
  // SL1000: og/schema images should be high-res (PDP-grade), not card thumbs
  const thumbs = productGalleryThumbs(p, 1000)
  const mainChain = productImageChain(p, 1000)
  const ogImage =
    thumbs[0] ||
    mainChain.find((u) => !isQuietPlaceholder(u) && !u.startsWith('data:')) ||
    '/brand/social.png'

  const descBase = enrichment
    ? `${p.tagline} ${enrichment.reviewSnapshot.verdict}`
    : `${p.tagline} ${p.description} Bamboo ${categoryLabel(p.category).toLowerCase()} on iBamboo — buy on Amazon.`

  const jsonLd: Record<string, unknown>[] = [
    productJsonLd({
      name: p.name,
      description: enrichment
        ? `${p.description} ${enrichment.reviewSnapshot.verdict}`
        : p.description || p.tagline,
      path: productPath,
      images: (thumbs.length ? thumbs : mainChain).filter(
        (u) => !isQuietPlaceholder(u),
      ),
      price: p.priceHint,
      asin: p.asin,
      brand: p.brand,
      rating: p.rating,
      reviewCount: p.reviewCount,
      category: categoryLabel(p.category),
    }),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Shop', path: '/shop' },
      {
        name: categoryLabel(p.category),
        path: `/shop?cat=${p.category}`,
      },
      { name: p.name, path: productPath },
    ]),
  ]

  if (enrichment?.faq?.length) {
    const faqLd = faqPageJsonLd(enrichment.faq, productPath)
    if (faqLd) jsonLd.push(faqLd)
  }

  return {
    title: p.name,
    description: clipMeta(descBase.replace(/\s+/g, ' ')),
    path: productPath,
    image: ogImage,
    type: 'product',
    jsonLd,
    crawler: productCrawler(p, enrichment),
  }
}

export function vibeSeo(vibe: VibeProfile): PageSeo {
  const path = `/vibe/${vibe.id}`
  return {
    title: `${vibe.title} — bamboo vibe card`,
    description: clipMeta(
      `${vibe.tagline} ${vibe.story} Meet ${vibe.avatar.name} and shop rooms that match the ${vibe.title} lifestyle on iBamboo.`,
    ),
    path,
    image: vibe.avatar.image,
    preloadImage: vibe.scene.image,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: vibe.title,
        description: vibe.tagline,
        url: absoluteUrl(path),
      },
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Vibe check', path: '/quiz' },
        { name: vibe.title, path },
      ]),
    ],
  }
}

export function whySeo(): PageSeo {
  return {
    title: 'Our story — bamboo for the whole house',
    description:
      'iBamboo is a destination for natural bamboo living—kitchen, table, bath, and desk. We curate the collection; Amazon handles fulfillment you already trust.',
    path: '/why',
    image: '/brand/landing-forest.webp',
    preloadImage: '/brand/landing-forest.webp',
    type: 'article',
  }
}

const ABOUT_DESCRIPTION =
  'iBamboo is a bamboo living storefront. Each week we curate Amazon Best Sellers drops for kitchen, table, bath, desk, and home.'

export function aboutSeo(): PageSeo {
  const path = '/about'
  return {
    title: 'About iBamboo',
    description: ABOUT_DESCRIPTION,
    path,
    type: 'article',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'About', path },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'About iBamboo',
        description: ABOUT_DESCRIPTION,
        url: absoluteUrl(path),
      },
    ],
    crawler: {
      h1: 'About iBamboo',
      paragraphs: takeCrawlerParagraphs([
        'iBamboo is a bamboo living storefront. We gather kitchen, table, bath, desk, and home pieces so you can browse a calmer house language in one place, then continue to Amazon when you are ready to buy.',
        'Each week we refresh a limited-time house edit from Amazon Best Sellers lists, kept to bamboo living. Rankings rotate. The shop stays current without becoming a warehouse catalog.',
        'We are an Amazon Associates editorial site. We do not warehouse, sell, or ship the products featured here. Checkout, shipping, taxes, and returns belong to Amazon or the listed seller.',
        'iBamboo is operated by SYMO, LLC, Sheridan, Wyoming, USA.',
      ]),
      faq: [],
      disclosure: AFFILIATE_DISCLOSURE,
    },
  }
}

export function quizSeo(): PageSeo {
  return {
    title: 'Bamboo Vibe Check — find your house energy',
    description:
      'Take the 60-second Bamboo Vibe Check. Match with a bamboo lifestyle persona—craft, ritual, focus, host, or nest—then shop rooms that fit.',
    path: '/quiz',
  }
}

export function giftsHubSeo(): PageSeo {
  return {
    title: 'Bamboo gift guides',
    description: clipMeta(
      `Housewarming, host, kitchen, eco, and Christmas home gifts — ${giftGuides.length} curated iBamboo guides. Chosen here; buy on Amazon.`,
    ),
    path: '/gifts',
    image: '/brand/soho-collection.webp',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Gifts', path: '/gifts' },
      ]),
      itemListJsonLd({
        name: 'iBamboo bamboo gift guides',
        path: '/gifts',
        items: giftGuides.map((g, i) => ({
          name: g.title,
          path: `/gifts/${g.slug}`,
          position: i + 1,
        })),
      }),
    ],
  }
}

export function giftGuideSeo(g: GiftGuide): PageSeo {
  const path = `/gifts/${g.slug}`
  const products = g.productEntries
    .map((e) => getProduct(e.productSlug))
    .filter(Boolean) as Product[]

  const jsonLd: Record<string, unknown>[] = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Gifts', path: '/gifts' },
      { name: g.title, path },
    ]),
    itemListJsonLd({
      name: g.title,
      path,
      items: products.map((p, i) => ({
        name: p.name,
        path: `/product/${p.slug}`,
        position: g.productEntries[i]?.rank ?? i + 1,
      })),
    }),
  ]

  if (g.faq.length) {
    const faqLd = faqPageJsonLd(g.faq, path)
    if (faqLd) jsonLd.push(faqLd)
  }

  return {
    title: g.title,
    description: clipMeta(
      `${g.dek} ${g.productEntries.length} bamboo picks on iBamboo. Updated ${g.updatedAt.slice(0, 4)}.`,
    ),
    path,
    type: 'article',
    image: g.heroImage || products[0]?.images?.[0] || '/brand/social.png',
    jsonLd,
  }
}


export function buyerGuidesHubSeo(): PageSeo {
  const title = 'Buyer guides — boards, bath, desk, table'
  const description = clipMeta(
    `${buyerGuides.length} high-intent iBamboo guides: cutting board care, prep boards, humid baths, kitchen swaps, picnic gear, entry trays, desks, hosting, dinnerware, utensils. Catalog-backed.`,
  )
  return {
    title,
    description,
    path: '/guides',
    image: '/brand/social.png',
    jsonLd: [
      breadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Guides', path: '/guides' },
      ]),
      itemListJsonLd({
        name: 'iBamboo buyer guides',
        path: '/guides',
        items: buyerGuides.map((g, i) => ({
          name: g.title,
          path: `/guides/${g.slug}`,
          position: i + 1,
        })),
      }),
    ],
    crawler: {
      h1: title,
      paragraphs: [description],
      faq: [],
      disclosure: AFFILIATE_DISCLOSURE,
    },
  }
}

export function buyerGuideSeo(g: BuyerGuide): PageSeo {
  const path = `/guides/${g.slug}`
  const products = g.productEntries
    .map((e) => getProduct(e.productSlug))
    .filter(Boolean) as Product[]

  const jsonLd: Record<string, unknown>[] = [
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Guides', path: '/guides' },
      { name: g.title, path },
    ]),
    itemListJsonLd({
      name: g.title,
      path,
      items: products.map((p, i) => ({
        name: p.name,
        path: `/product/${p.slug}`,
        position: g.productEntries[i]?.rank ?? i + 1,
      })),
    }),
  ]

  if (g.faq.length) {
    const faqLd = faqPageJsonLd(g.faq, path)
    if (faqLd) jsonLd.push(faqLd)
  }

  return {
    title: g.title,
    description: clipMeta(
      `${g.dek} ${g.productEntries.length} bamboo picks on iBamboo. Updated ${g.updatedAt.slice(0, 4)}.`,
    ),
    path,
    type: 'article',
    image: g.heroImage || products[0]?.images?.[0] || '/brand/social.png',
    jsonLd,
    crawler: guideCrawler(g),
  }
}

/** Rendered head values for one route (pageTitle/clipMeta applied, absolute URLs). */
export type RouteMeta = {
  title: string
  description: string
  canonical: string
  robots: string
  ogType: 'website' | 'product'
  jsonLd: Record<string, unknown>[] | null
  /** Same-origin LCP image the Worker preloads; absent when the route has none */
  preloadImage?: string
  crawler?: CrawlerBody
}

/**
 * Final head values exactly as src/components/Seo.tsx computes them at runtime.
 * Used by the route-meta generator; og:image is handled separately (sitewide).
 */
export function finalizeRouteMeta(seo: PageSeo): RouteMeta {
  const jsonLd = seo.jsonLd
    ? Array.isArray(seo.jsonLd)
      ? seo.jsonLd
      : [seo.jsonLd]
    : null
  return {
    title: pageTitle(seo.title || DEFAULT_TITLE),
    description: clipMeta(seo.description || DEFAULT_DESCRIPTION),
    canonical: absoluteUrl(seo.path || '/'),
    robots: seo.noindex ? 'noindex,nofollow' : 'index,follow',
    ogType: seo.type === 'product' ? 'product' : 'website',
    jsonLd,
    // undefined keys drop out of routeMeta.json on JSON.stringify
    preloadImage: seo.preloadImage,
    ...(seo.crawler ? { crawler: seo.crawler } : {}),
  }
}
