#!/usr/bin/env node
/**
 * Build public/sitemap.xml from known routes + product/vibe IDs in source.
 * Also emits worker/generated/routeMeta.json — the per-route SEO head values
 * (title/description/canonical/robots/JSON-LD) the Worker injects into the raw
 * HTML shell, doubling as the known-route list for 404 handling.
 * Run: node scripts/generate-sitemap.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://ibamboo.com'
const today = new Date().toISOString().slice(0, 10)

const categories = [
  'kitchen',
  'cutting-boards',
  'dining',
  'bath',
  'organization',
  'desk',
  'outdoor',
  'baby',
]

const vibes = ['craft', 'ritual', 'focus', 'host', 'nest', 'patio']

/**
 * Bundle scripts/route-meta.ts with esbuild (already present via vite/wrangler)
 * and run it — the catalog chain is TypeScript with extensionless imports and
 * `import.meta.env`, which plain node cannot load directly. Product URLs come
 * from shopProducts so a Z9GO-enabled gate drops hidden curated SKUs.
 */
async function buildRouteMetaBundle() {
  const { build } = await import('esbuild')
  const result = await build({
    entryPoints: [join(ROOT, 'scripts/route-meta.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    write: false,
    logLevel: 'silent',
    define: {
      // src/lib/amazon.ts reads this at module scope; irrelevant to route meta
      'import.meta.env.VITE_AMAZON_ASSOCIATE_TAG': '""',
    },
  })
  const tmpDir = join(ROOT, 'node_modules/.tmp')
  mkdirSync(tmpDir, { recursive: true })
  const bundlePath = join(tmpDir, 'route-meta.bundle.mjs')
  writeFileSync(bundlePath, result.outputFiles[0].text)
  return import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`)
}

const catalogMod = await buildRouteMetaBundle()
const products = (catalogMod.shopProducts || [])
  .map((p) => p.slug)
  .filter((s) => s && !s.startsWith('fill-'))

/** Only top-level guide slugs (avoid product slugs inside productEntries). */
function extractGiftGuideSlugs(filePath) {
  try {
    const src = readFileSync(filePath, 'utf8')
    const slugs = []
    for (const m of src.matchAll(
      /\{\s*slug:\s*['"]([a-z0-9][a-z0-9-]*)['"]\s*,\s*title:/g,
    )) {
      slugs.push(m[1])
    }
    return [...new Set(slugs)]
  } catch {
    return []
  }
}
const giftSlugs = extractGiftGuideSlugs(join(ROOT, 'src/data/giftGuides.ts'))
const buyerGuideSlugs = extractGiftGuideSlugs(
  join(ROOT, 'src/data/buyerGuides.ts'),
)

/** @type {{ loc: string, changefreq: string, priority: string }[]} */
const urls = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/shop', changefreq: 'daily', priority: '0.95' },
  { loc: '/shop?limited=1', changefreq: 'daily', priority: '0.9' },
  { loc: '/gifts', changefreq: 'weekly', priority: '0.9' },
  { loc: '/guides', changefreq: 'weekly', priority: '0.9' },
  { loc: '/quiz', changefreq: 'weekly', priority: '0.85' },
  { loc: '/why', changefreq: 'monthly', priority: '0.7' },
  { loc: '/about', changefreq: 'monthly', priority: '0.5' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
]

for (const cat of categories) {
  urls.push({
    loc: `/shop?cat=${cat}`,
    changefreq: 'daily',
    priority: '0.85',
  })
}

for (const id of vibes) {
  urls.push({
    loc: `/vibe/${id}`,
    changefreq: 'weekly',
    priority: '0.8',
  })
}

for (const slug of products) {
  urls.push({
    loc: `/product/${slug}`,
    changefreq: 'weekly',
    priority: '0.75',
  })
}

for (const slug of giftSlugs) {
  urls.push({
    loc: `/gifts/${slug}`,
    changefreq: 'monthly',
    priority: '0.85',
  })
}

for (const slug of buyerGuideSlugs) {
  urls.push({
    loc: `/guides/${slug}`,
    changefreq: 'monthly',
    priority: '0.85',
  })
}

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const body = urls
  .map(
    (u) => `  <url>
    <loc>${escapeXml(SITE + u.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

const out = join(ROOT, 'public/sitemap.xml')
writeFileSync(out, xml)
console.log(
  `Wrote ${out} (${urls.length} URLs: ${products.length} products, ${giftSlugs.length} gifts, ${buyerGuideSlugs.length} guides, ${vibes.length} vibes, ${categories.length} categories)`,
)

const routeMeta = catalogMod.buildRouteMeta()
const metaOut = join(ROOT, 'worker/generated/routeMeta.json')
mkdirSync(dirname(metaOut), { recursive: true })
writeFileSync(metaOut, JSON.stringify(routeMeta))
console.log(
  `Wrote ${metaOut} (${Object.keys(routeMeta.routes).length} routes)`,
)
