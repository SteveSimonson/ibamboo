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
  productGalleryThumbs,
  productImageChain,
} from '../data/catalog'
import { getCategoryHero } from '../data/categoryHeroes'
import type { Category, Product } from '../data/types'
import type { VibeProfile } from '../data/vibes'
import { isQuietPlaceholder } from './productImages'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  absoluteUrl,
  breadcrumbJsonLd,
  clipMeta,
  pageTitle,
  productJsonLd,
  type PageSeo,
} from './seo'

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

export function productSeo(p: Product): PageSeo {
  const productPath = `/product/${p.slug}`
  // SL1000: og/schema images should be high-res (PDP-grade), not card thumbs
  const thumbs = productGalleryThumbs(p, 1000)
  const mainChain = productImageChain(p, 1000)
  const ogImage =
    thumbs[0] ||
    mainChain.find((u) => !isQuietPlaceholder(u) && !u.startsWith('data:')) ||
    '/brand/social.png'

  return {
    title: p.name,
    description: clipMeta(
      `${p.tagline} ${p.description} Bamboo ${categoryLabel(p.category).toLowerCase()} on iBamboo — buy on Amazon.`,
    ),
    path: productPath,
    image: ogImage,
    type: 'product',
    jsonLd: [
      productJsonLd({
        name: p.name,
        description: p.description || p.tagline,
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
    ],
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

export function quizSeo(): PageSeo {
  return {
    title: 'Bamboo Vibe Check — find your house energy',
    description:
      'Take the 60-second Bamboo Vibe Check. Match with a bamboo lifestyle persona—craft, ritual, focus, host, or nest—then shop rooms that fit.',
    path: '/quiz',
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
  }
}
