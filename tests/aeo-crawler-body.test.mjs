import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { build } from 'esbuild'

import { renderShell } from '../worker/renderShell.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const tmpDir = join(ROOT, 'node_modules/.tmp')
mkdirSync(tmpDir, { recursive: true })
const bundlePath = join(tmpDir, 'aeo-crawler-seo.bundle.mjs')

const PRODUCT_SLUG =
  'astercook-deep-carbonized-bamboo-cutting-boards-for-kitchen-with-wood-storage-st'

const bundled = await build({
  stdin: {
    contents: `
export { getProduct, products } from './src/data/catalog.ts'
export { getProductEnrichment } from './src/data/productEnrichments.ts'
export { buyerGuides } from './src/data/buyerGuides.ts'
export {
  AFFILIATE_DISCLOSURE,
  aboutSeo,
  buyerGuideSeo,
  buyerGuidesHubSeo,
  finalizeRouteMeta,
  homeSeo,
  productSeo,
} from './src/lib/seoData.ts'
`,
    resolveDir: ROOT,
    sourcefile: 'aeo-crawler-seo-entry.ts',
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
  logLevel: 'silent',
  define: {
    'import.meta.env.VITE_AMAZON_ASSOCIATE_TAG': '""',
    'import.meta.env.VITE_GA_MEASUREMENT_ID': '""',
  },
})
writeFileSync(bundlePath, bundled.outputFiles[0].text)
const {
  AFFILIATE_DISCLOSURE,
  aboutSeo,
  buyerGuideSeo,
  buyerGuidesHubSeo,
  buyerGuides,
  finalizeRouteMeta,
  getProduct,
  getProductEnrichment,
  homeSeo,
  productSeo,
  products,
} = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`)

const SHELL = `<!doctype html>
<html lang="en">
  <head>
    <meta name="description" content="d" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://ibamboo.com/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://ibamboo.com/" />
    <meta property="og:title" content="x" />
    <meta property="og:description" content="d" />
    <meta property="og:image" content="https://ibamboo.com/brand/social.png" />
    <meta name="twitter:title" content="x" />
    <meta name="twitter:description" content="d" />
    <meta name="twitter:image" content="https://ibamboo.com/brand/social.png" />
    <title>iBamboo</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

const OG = 'https://ibamboo.com/brand/social.png'

test('enriched product routeMeta keeps crawler h1, FAQ, and disclosure', () => {
  const p = getProduct(PRODUCT_SLUG)
  assert.ok(p)
  const enrichment = getProductEnrichment(p.slug)
  assert.ok(enrichment)
  const meta = finalizeRouteMeta(productSeo(p, enrichment))
  assert.equal(meta.crawler?.h1, p.name)
  assert.ok(meta.crawler?.faq.some((item) => item.q === enrichment.faq[0].q))
  assert.equal(meta.crawler?.disclosure, AFFILIATE_DISCLOSURE)
  const words = meta.crawler.paragraphs.join(' ').split(/\s+/).length
  assert.ok(words >= 80, `expected substantial judgment, got ${words} words`)
  assert.ok(words <= 400, `expected ~400 word cap, got ${words} words`)
  assert.ok(meta.crawler.paragraphs.length >= 2)
  assert.ok(meta.crawler.paragraphs.length <= 6)
})

test('renderShell injects crawler article before #root for a product', () => {
  const p = getProduct(PRODUCT_SLUG)
  const enrichment = getProductEnrichment(p.slug)
  const meta = finalizeRouteMeta(productSeo(p, enrichment))
  const html = renderShell(SHELL, meta, OG)

  assert.match(html, /<article id="aeo-main">/)
  assert.ok(html.includes(`<h1>${p.name}</h1>`))
  assert.ok(html.includes(enrichment.faq[0].q))
  assert.ok(html.includes(AFFILIATE_DISCLOSURE))
  assert.ok(html.includes("document.documentElement.classList.add('js')"))
  assert.ok(html.includes('html.js #aeo-main'))
  assert.equal(html.includes('display:none'), false)

  const articleAt = html.indexOf('<article id="aeo-main">')
  const rootAt = html.indexOf('<div id="root"')
  assert.ok(articleAt > 0 && rootAt > articleAt)

  assert.equal(
    html.includes('iu0e3-20'),
    false,
    'Associate tag must not appear in visible crawler HTML',
  )
})

test('about routeMeta is indexable with AboutPage JSON-LD and crawler body', () => {
  const meta = finalizeRouteMeta(aboutSeo())
  assert.equal(meta.canonical, 'https://ibamboo.com/about')
  assert.equal(meta.robots, 'index,follow')
  assert.equal(meta.crawler?.h1, 'About iBamboo')
  assert.ok(
    meta.crawler?.paragraphs.some((p) => p.includes('Best Sellers')),
  )
  assert.equal(meta.crawler?.disclosure, AFFILIATE_DISCLOSURE)
  assert.ok(
    meta.jsonLd?.some((block) => block['@type'] === 'AboutPage'),
  )
  const html = renderShell(SHELL, meta, OG)
  assert.match(html, /<article id="aeo-main">/)
  assert.match(html, /About iBamboo/)
  assert.equal(html.includes('iu0e3-20'), false)
})

test('renderShell skips crawler article on routes without crawler meta', () => {
  const meta = finalizeRouteMeta(homeSeo())
  assert.equal(meta.crawler, undefined)
  const html = renderShell(SHELL, meta, OG)
  assert.equal(html.includes('id="aeo-main"'), false)
  assert.equal(html.includes("classList.add('js')"), false)
})

test('buyer guide and hub populate crawler from existing copy', () => {
  const g = buyerGuides[0]
  const guideMeta = finalizeRouteMeta(buyerGuideSeo(g))
  assert.equal(guideMeta.crawler?.h1, g.title)
  assert.ok(
    guideMeta.crawler?.paragraphs.some((p) => p.includes(g.dek.slice(0, 40))),
  )
  assert.ok(guideMeta.crawler?.faq.some((item) => item.q === g.faq[0].q))

  const hub = finalizeRouteMeta(buyerGuidesHubSeo())
  assert.equal(hub.crawler?.h1, 'Buyer guides — boards, bath, desk, table')
  assert.equal(hub.crawler?.faq.length, 0)
  assert.ok(hub.crawler?.paragraphs[0])
})

test('product without enrichment uses tagline/description only', () => {
  const p = products.find((item) => !getProductEnrichment(item.slug))
  assert.ok(p)
  const meta = finalizeRouteMeta(productSeo(p, undefined))
  assert.equal(meta.crawler?.h1, p.name)
  assert.equal(meta.crawler?.faq.length, 0)
  assert.ok(meta.crawler?.paragraphs.includes(p.tagline))
  assert.ok(
    meta.crawler?.paragraphs.some((para) =>
      para.includes(p.description.slice(0, 20)),
    ),
  )
})
