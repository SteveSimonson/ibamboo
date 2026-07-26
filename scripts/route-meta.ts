/**
 * Build-time route table for the Worker (raw-HTML SEO head injection + the
 * known-route list used for 404 handling). Bundled with esbuild and executed
 * by scripts/generate-sitemap.mjs — never shipped to the browser.
 *
 * All copy comes from src/lib/seoData.ts so the Worker cannot drift from what
 * the React app sets after hydration. og:image stays sitewide per scope.
 */
import { CATEGORY_OPTIONS, products } from '../src/data/catalog'
import { VIBE_LIST } from '../src/data/vibes'
import {
  DEFAULT_OG_IMAGE,
  organizationJsonLd,
  websiteJsonLd,
} from '../src/lib/seo'
import {
  finalizeRouteMeta,
  homeSeo,
  productSeo,
  quizSeo,
  shopSeo,
  vibeSeo,
  whySeo,
  type RouteMeta,
} from '../src/lib/seoData'

export type RouteMetaFile = {
  generatedAt: string
  ogImage: string
  globalJsonLd: Record<string, unknown>[]
  routes: Record<string, RouteMeta>
}

export function buildRouteMeta(): RouteMetaFile {
  const routes: Record<string, RouteMeta> = {}

  routes['/'] = finalizeRouteMeta(homeSeo())
  routes['/shop'] = finalizeRouteMeta(shopSeo({}))
  routes['/shop?limited=1'] = finalizeRouteMeta(shopSeo({ limited: true }))
  for (const c of CATEGORY_OPTIONS) {
    routes[`/shop?cat=${c.id}`] = finalizeRouteMeta(shopSeo({ cat: c.id }))
    routes[`/shop?cat=${c.id}&limited=1`] = finalizeRouteMeta(
      shopSeo({ cat: c.id, limited: true }),
    )
  }
  routes['/quiz'] = finalizeRouteMeta(quizSeo())
  routes['/why'] = finalizeRouteMeta(whySeo())

  for (const vibe of VIBE_LIST) {
    routes[`/vibe/${vibe.id}`] = finalizeRouteMeta(vibeSeo(vibe))
  }

  for (const p of products) {
    routes[`/product/${p.slug}`] = finalizeRouteMeta(productSeo(p))
  }

  return {
    generatedAt: new Date().toISOString().slice(0, 10),
    ogImage: DEFAULT_OG_IMAGE,
    globalJsonLd: [organizationJsonLd(), websiteJsonLd()],
    routes,
  }
}
