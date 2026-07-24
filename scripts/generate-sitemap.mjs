#!/usr/bin/env node
/**
 * Build public/sitemap.xml from known routes + product/vibe IDs in source.
 * Run: node scripts/generate-sitemap.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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

function extractSlugs(filePath) {
  try {
    const src = readFileSync(filePath, 'utf8')
    const slugs = new Set()
    // Matches slug: 'x' | slug: "x" | "slug": "x"
    for (const m of src.matchAll(
      /["']?slug["']?\s*:\s*["']([a-z0-9][a-z0-9-]*)["']/gi,
    )) {
      slugs.add(m[1])
    }
    return [...slugs]
  } catch {
    return []
  }
}

const productSlugs = [
  ...extractSlugs(join(ROOT, 'src/data/products.bsr.generated.ts')),
  ...extractSlugs(join(ROOT, 'src/data/products.ts')),
]
// Prefer unique, skip fill- pads
const products = [...new Set(productSlugs)].filter(
  (s) => !s.startsWith('fill-'),
)

/** @type {{ loc: string, changefreq: string, priority: string }[]} */
const urls = [
  { loc: '/', changefreq: 'daily', priority: '1.0' },
  { loc: '/shop', changefreq: 'daily', priority: '0.95' },
  { loc: '/shop?limited=1', changefreq: 'daily', priority: '0.9' },
  { loc: '/quiz', changefreq: 'weekly', priority: '0.85' },
  { loc: '/why', changefreq: 'monthly', priority: '0.7' },
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
  `Wrote ${out} (${urls.length} URLs: ${products.length} products, ${vibes.length} vibes, ${categories.length} categories)`,
)
