#!/usr/bin/env node
/**
 * iBamboo Amazon BSR importer
 * ---------------------------
 * Pulls Top ~100 from Amazon Best Sellers leaf categories + bamboo searches,
 * enriches ASINs, filters for bamboo-related household goods, and writes:
 *   - data/bsr/raw/snapshot-{timestamp}.json
 *   - src/data/bsr-snapshot.json
 *   - src/data/products.bsr.generated.ts
 *
 * Weekly refresh:
 *   npm run import:bsr
 *   npm run refresh:weekly   # import + build + deploy
 *
 * Marketing: products are tagged limitedTime / weekOf for
 * "OPTIONS ONLY AVAILABLE FOR A LIMITED TIME" merchandising.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createCreatorsClient,
  loadCreatorsEnv,
  mapCreatorsItem,
} from './creators-client.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '../..')
loadCreatorsEnv(join(ROOT, '.env'))
const TAG =
  process.env.VITE_AMAZON_ASSOCIATE_TAG ||
  process.env.AMAZON_ASSOCIATE_TAG ||
  'iu0e3-20'

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function weekOfIso(d = new Date()) {
  // ISO week start Monday
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1))
  return date.toISOString().slice(0, 10)
}

function nextRefreshIso(from = new Date()) {
  const d = new Date(from)
  const day = d.getDay() // 0 Sun
  const daysUntilMon = day === 0 ? 1 : day === 1 ? 7 : 8 - day
  d.setDate(d.getDate() + daysUntilMon)
  d.setHours(9, 0, 0, 0)
  return d.toISOString()
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
}

function unescapeHtml(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.text()
}

/** Brand / lifestyle fallbacks when Amazon list images are missing. */
const CATEGORY_FALLBACK_IMAGES = {
  kitchen: [
    '/brand/products-flatlay.png',
    '/brand/products-hero.png',
  ],
  'cutting-boards': [
    '/brand/products-flatlay.png',
    '/brand/soho-collection.png',
  ],
  dining: ['/brand/soho-collection.png', '/brand/products-hero.png'],
  bath: ['/brand/landing-forest.png', '/brand/products-flatlay.png'],
  organization: ['/brand/products-hero.png', '/brand/soho-collection.png'],
  desk: ['/brand/products-hero.png', '/brand/soho-collection.png'],
  outdoor: ['/brand/landing-forest.png', '/brand/hero.png'],
  baby: ['/brand/products-flatlay.png', '/brand/soho-collection.png'],
}

/**
 * Normalize Amazon CDN image URLs to a larger display size.
 * List cards often ship as _AC_UL300_SR300,200_ thumbs.
 */
function upgradeAmazonImageUrl(url) {
  if (!url || typeof url !== 'string') return null
  let u = url.trim().replace(/&amp;/g, '&')
  // Skip tracking pixels / sprites
  if (/\/images\/G\//i.test(u) || /pixel|sprite|transparent/i.test(u)) return null
  if (
    !/media-amazon\.com\/images\//i.test(u) &&
    !/ssl-images-amazon\.com\/images\//i.test(u)
  ) {
    return null
  }
  // Prefer https
  u = u.replace(/^http:\/\//i, 'https://')
  // Upgrade common thumbnail modifiers to a usable large size.
  // Covers _AC_UL320_SR…, bare _AC_UL320_, _AC_UL480_QL65_, UX/UY, SX/SY, etc.
  u = u
    .replace(/\._AC_UL\d+(?:_SR\d+,\d+)?(?:_QL\d+)?_\./i, '._AC_SL1000_.')
    .replace(/\._AC_UL[^.]+\./i, '._AC_SL1000_.')
    .replace(/\._AC_UX\d+_.*?\./i, '._AC_SL1000_.')
    .replace(/\._AC_UY\d+_.*?\./i, '._AC_SL1000_.')
    .replace(/\._SX\d+_\./i, '._SL1000_.')
    .replace(/\._SY\d+_\./i, '._SL1000_.')
    .replace(/\._US\d+_\./i, '._SL1000_.')
    .replace(/\._SS\d+_\./i, '._SL1000_.')
  // Avoid the unreliable images/P/{ASIN} pattern as primary
  if (/\/images\/P\/[A-Z0-9]{10}/i.test(u)) return null
  return u
}

/** Extract product photo URLs from a list-card HTML chunk. */
function extractListImages(chunk, { max = 4 } = {}) {
  const found = []
  const patterns = [
    /src="(https:\/\/[^"]+(?:media-amazon|ssl-images-amazon)\.com\/images\/I\/[^"]+)"/gi,
    /srcset="(https:\/\/[^"\s]+(?:media-amazon|ssl-images-amazon)\.com\/images\/I\/[^"\s]+)/gi,
    /data-src="(https:\/\/[^"]+(?:media-amazon|ssl-images-amazon)\.com\/images\/I\/[^"]+)"/gi,
    /(https:\/\/(?:m\.media-amazon|images-na\.ssl-images-amazon)\.com\/images\/I\/[A-Za-z0-9+%_.,\-]+)/gi,
  ]
  for (const re of patterns) {
    for (const m of chunk.matchAll(re)) {
      const upgraded = upgradeAmazonImageUrl(m[1])
      if (upgraded && !found.includes(upgraded)) found.push(upgraded)
      if (found.length >= max) return found
    }
  }
  return found
}

function imageStem(url) {
  const m = String(url).match(/\/images\/I\/([^./]+)/i)
  return m ? m[1].toLowerCase() : null
}

function resolveProductImages({ listImages, enrichedImages, category, asin }) {
  const out = []
  const seenStems = new Set()
  const push = (url) => {
    const u = upgradeAmazonImageUrl(url) || (url?.startsWith('/') ? url : null)
    if (!u) return
    const stem = imageStem(u)
    if (stem) {
      if (seenStems.has(stem)) return
      seenStems.add(stem)
    } else if (out.includes(u)) {
      return
    }
    out.push(u)
  }
  for (const u of enrichedImages || []) push(u)
  for (const u of listImages || []) push(u)
  // Brand fallbacks last
  for (const u of CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.kitchen) {
    push(u)
  }
  // Absolute last resort only if nothing else (often a blank gif — prefer brand art)
  if (out.length === 0 && asin) {
    // skip broken P/ pattern — leave brand only
  }
  return out.slice(0, 6)
}

/** Parse Amazon Best Sellers grid → { rank, asin, title?, images[] }[] */
function parseBsrPage(html, pageOffset = 0) {
  const items = []
  const starts = [...html.matchAll(/id="p13n-asin-index-(\d+)"/g)]
  for (let i = 0; i < starts.length; i++) {
    const idx = Number(starts[i][1])
    const from = starts[i].index
    const to = i + 1 < starts.length ? starts[i + 1].index : from + 8000
    const chunk = html.slice(from, to)
    const am = chunk.match(/data-asin="([A-Z0-9]{10})"/)
    if (!am) continue
    const asin = am[1]
    let title
    const tm =
      chunk.match(/p13n-sc-css-line-clamp[^"]*"[^>]*>([^<]{10,220})</) ||
      chunk.match(/_cDEzb_p13n-sc-css-line-clamp[^"]*"[^>]*>([^<]{10,220})</)
    if (tm) {
      title = unescapeHtml(tm[1].replace(/\s+/g, ' ').trim())
      if (/out of 5 stars/i.test(title)) title = undefined
    }
    let rating
    let reviewCount
    const rm = chunk.match(/([\d.]+)\s+out of 5/)
    if (rm) rating = Number(rm[1])
    const rvm = chunk.match(/([\d,]+)\s*ratings?/i)
    if (rvm) reviewCount = Number(rvm[1].replace(/,/g, ''))
    const images = extractListImages(chunk)

    items.push({
      rank: pageOffset + idx + 1,
      asin,
      title,
      rating,
      reviewCount,
      images,
    })
  }
  if (items.length === 0) {
    const asins = []
    for (const x of html.matchAll(/\/dp\/([A-Z0-9]{10})/g)) {
      if (!asins.includes(x[1]) && x[1].startsWith('B')) asins.push(x[1])
    }
    asins.slice(0, 50).forEach((asin, i) => {
      items.push({ rank: pageOffset + i + 1, asin, images: [] })
    })
  }
  return items
}

/** Parse Amazon search results → cards with asin, title?, images[] */
function parseSearchCards(html, limit = 30) {
  const cards = []
  const seen = new Set()
  const parts = html.split('data-component-type="s-search-result"')
  for (const block of parts.slice(1)) {
    const b = block.slice(0, 12000)
    const m = b.match(/data-asin="(B0[0-9A-Z]{8})"/)
    if (!m || seen.has(m[1])) continue
    seen.add(m[1])
    let title
    const tm =
      b.match(/<h2[^>]*\saria-label="([^"]{10,250})"/) ||
      b.match(/a-text-normal[^>]*>([^<]{10,200})</)
    if (tm) {
      title = unescapeHtml(tm[1].replace(/\s+/g, ' ').trim())
      if (/buying options/i.test(title)) title = undefined
    }
    let rating
    const rm = b.match(/([\d.]+)\s+out of 5/)
    if (rm) rating = Number(rm[1])
    let reviewCount
    const rvm = b.match(/aria-label="([\d,]+)\s+ratings?"/i)
    if (rvm) reviewCount = Number(rvm[1].replace(/,/g, ''))
    const images = extractListImages(b)
    cards.push({
      asin: m[1],
      title,
      rating,
      reviewCount,
      images,
    })
    if (cards.length >= limit) break
  }
  return cards
}

function isBambooRelated(title = '', features = []) {
  const t = `${title} ${features.join(' ')}`.toLowerCase()
  if (!t.includes('bamboo')) return false
  // exclude obvious non-home junk if needed
  const deny = ['ebook', 'kindle edition', 'poster only', 'sticker pack only']
  return !deny.some((d) => t.includes(d))
}

function materialFamily(title = '', material = '') {
  const t = `${title} ${material}`.toLowerCase()
  if (/viscose|rayon|fabric|sheet|towel|sock|underwear|clothing/.test(t)) {
    return 'bamboo-fiber'
  }
  if (/solid bamboo|100%\s*bamboo|bamboo wood|bamboo board|bamboo utensil/.test(t)) {
    return 'solid-bamboo'
  }
  if (t.includes('bamboo')) return 'bamboo'
  return 'other'
}

async function enrichAsin(asin) {
  const url = `https://www.amazon.com/dp/${asin}?th=1&psc=1`
  try {
    const html = await fetchText(url)
    const titleM = html.match(/id="productTitle"[^>]*>\s*([^<]+)/)
    if (!titleM) return null
    const title = unescapeHtml(titleM[1].replace(/\s+/g, ' ').trim())

    const images = []
    const landing = html.match(/data-old-hires="(https:\/\/[^"]+)"/)
    if (landing) images.push(landing[1].replace(/\\u002F/g, '/'))
    for (const m of html.matchAll(
      /"hiRes"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/g,
    )) {
      const u = m[1].replace(/\\u002F/g, '/')
      if (!images.includes(u)) images.push(u)
    }
    for (const m of html.matchAll(
      /"large"\s*:\s*"(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/g,
    )) {
      const u = m[1].replace(/\\u002F/g, '/')
      if (!images.includes(u)) images.push(u)
    }

    let price
    const priceM = html.match(/"priceAmount"\s*:\s*([0-9.]+)/)
    if (priceM) price = Number(priceM[1])

    let rating
    const ratingM = html.match(/([\d.]+)\s+out of 5/)
    if (ratingM) rating = Number(ratingM[1])

    let reviewCount
    const revM = html.match(/id="acrCustomerReviewText"[^>]*>\s*([\d,]+)/)
    if (revM) reviewCount = Number(revM[1].replace(/,/g, ''))

    let brand
    const brandM = html.match(/id="bylineInfo"[^>]*>([^<]+)/)
    if (brandM) {
      brand = unescapeHtml(brandM[1])
        .replace(/Visit the|Brand:|Store/gi, '')
        .trim()
    }

    const features = []
    const featSec = html.match(/id="feature-bullets"([\s\S]*?)<\/ul>/)
    if (featSec) {
      for (const m of featSec[1].matchAll(
        /class="a-list-item">\s*([^<]{12,220})/g,
      )) {
        const f = m[1].replace(/\s+/g, ' ').trim()
        if (f && !/click here/i.test(f)) features.push(f)
      }
    }

    const specs = []
    for (const row of html.matchAll(
      /<th[^>]*>\s*([^<]{2,40})\s*<\/th>\s*<td[^>]*>\s*(?:<[^>]*>)?\s*([^<]+)/g,
    )) {
      const label = row[1].replace(/\s+/g, ' ').trim()
      const value = row[2].replace(/\s+/g, ' ').trim()
      if (
        [
          'Material',
          'Brand',
          'Color',
          'Item Weight',
          'Product Dimensions',
          'Number of Pieces',
          'Shape',
          'Finish Type',
          'Manufacturer',
          'Item Dimensions LxWxH',
        ].includes(label)
      ) {
        specs.push({ label, value })
      }
    }

    // Nested BSR lines: #1 in Cutting Boards
    const bsrLines = []
    for (const m of html.matchAll(/#([\d,]+)\s+in\s+([^<\n(]+)/g)) {
      bsrLines.push({
        rank: Number(m[1].replace(/,/g, '')),
        category: m[2].replace(/\s+/g, ' ').trim(),
      })
    }

    const material =
      specs.find((s) => s.label.toLowerCase() === 'material')?.value ||
      (title.toLowerCase().includes('bamboo') ? 'Bamboo' : 'See listing')

    return {
      asin,
      title,
      images: images.slice(0, 6),
      price,
      rating,
      reviewCount,
      brand,
      features: features.slice(0, 6),
      specs,
      material,
      bsrLines: bsrLines.slice(0, 6),
      productUrl: `https://www.amazon.com/dp/${asin}?tag=${TAG}`,
    }
  } catch (e) {
    console.warn(`  enrich fail ${asin}: ${e.message}`)
    return null
  }
}

async function pullBsrCategory(cat) {
  const ranks = []
  const base = cat.node
    ? `https://www.amazon.com/gp/bestsellers/${cat.department}/${cat.node}`
    : `https://www.amazon.com/gp/bestsellers/${cat.department}`

  for (const pg of [1, 2]) {
    const url = `${base}?pg=${pg}`
    console.log(`  BSR ${cat.label} pg${pg}`)
    try {
      const html = await fetchText(url)
      const pageOffset = (pg - 1) * 50
      const items = parseBsrPage(html, pageOffset)
      const withTitle = items.filter((i) => i.title).length
      const withImg = items.filter((i) => i.images?.length).length
      console.log(
        `    → ${items.length} ranks (${withTitle} titles, ${withImg} with images)`,
      )
      ranks.push(...items)
    } catch (e) {
      console.warn(`    fail: ${e.message}`)
    }
    await sleep(900)
  }

  // dedupe by asin keep best rank
  const by = new Map()
  for (const r of ranks) {
    if (!by.has(r.asin) || r.rank < by.get(r.asin).rank) by.set(r.asin, r)
  }
  return [...by.values()].sort((a, b) => a.rank - b.rank).slice(0, 100)
}

/** Build product from list-page data when detail enrich fails. */
function productFromListCard(card, meta, weekOf, expiresAt) {
  const title =
    card.title ||
    meta.title ||
    (meta.source === 'bsr'
      ? `Amazon Best Seller ${card.asin || meta.asin}`
      : `Bamboo pick ${card.asin || meta.asin}`)
  if (!isBambooRelated(title, [])) return null
  const asin = card.asin || meta.asin
  const listImages = card.images || meta.images || []
  const isBsr = meta.source === 'bsr'
  return toProduct(
    {
      asin,
      title,
      images: resolveProductImages({
        listImages,
        enrichedImages: [],
        category: meta.ibambooCategory,
        asin,
      }),
      price: undefined,
      rating: card.rating ?? meta.rating,
      reviewCount: card.reviewCount ?? meta.reviewCount,
      brand: undefined,
      features: isBsr
        ? [
            `Amazon Best Sellers · #${meta.rank} in ${meta.bsrLabel}`,
            'Limited-time placement on iBamboo this week',
            'Buy on Amazon — price and stock set by Amazon',
          ]
        : [
            `Amazon bamboo search · ${meta.bsrLabel || meta.ibambooCategory}`,
            'Limited-time placement on iBamboo this week',
            'Buy on Amazon — price and stock set by Amazon',
          ],
      specs: isBsr
        ? [
            {
              label: 'Amazon Best Sellers Rank',
              value: `#${meta.rank} in ${meta.bsrLabel}`,
            },
            { label: 'Material', value: 'Bamboo (confirm on Amazon listing)' },
          ]
        : [{ label: 'Material', value: 'Bamboo (confirm on Amazon listing)' }],
      material: 'Bamboo (confirm on Amazon listing)',
      // Only real BSR ranks belong in bsrLines (search ranks are list-local)
      bsrLines: isBsr ? [{ rank: meta.rank, category: meta.bsrLabel }] : [],
      productUrl: `https://www.amazon.com/dp/${asin}?tag=${TAG}`,
    },
    meta,
    weekOf,
    expiresAt,
  )
}

async function pullSearch(query, limit, { pages = 2 } = {}) {
  const cards = []
  const seen = new Set()
  const maxPages = Math.max(1, Math.min(pages, 3))
  console.log(`  SEARCH ${query} (up to ${limit}, ${maxPages} page(s))`)
  for (let page = 1; page <= maxPages && cards.length < limit; page++) {
    const url =
      `https://www.amazon.com/s?k=${encodeURIComponent(query)}` +
      (page > 1 ? `&page=${page}` : '')
    try {
      const html = await fetchText(url)
      const pageCards = parseSearchCards(html, limit)
      for (const card of pageCards) {
        if (seen.has(card.asin)) continue
        seen.add(card.asin)
        cards.push(card)
        if (cards.length >= limit) break
      }
    } catch (e) {
      console.warn(`    page ${page} fail: ${e.message}`)
      break
    }
    await sleep(700)
  }
  const withImg = cards.filter((c) => c.images?.length).length
  console.log(`    → ${cards.length} cards (${withImg} with images)`)
  return cards.map((card, i) => ({
    rank: i + 1,
    asin: card.asin,
    title: card.title,
    rating: card.rating,
    reviewCount: card.reviewCount,
    images: card.images,
    source: 'search',
  }))
}

function toProduct(enriched, meta, weekOf, expiresAt) {
  const name = enriched.title
    .replace(/\s*[|\-–—].{0,40}$/, '')
    .slice(0, 90)
    .trim()
  const leafBsr =
    enriched.bsrLines?.find((b) =>
      /cutting board|utensil|organizer|toothbrush|sheet|towel|monitor|shelf|chime|plate/i.test(
        b.category,
      ),
    ) || enriched.bsrLines?.[0]

  const badge =
    meta.source === 'bsr' && meta.rank <= 10
      ? `#${meta.rank} Best Seller`
      : meta.source === 'bsr' && meta.rank <= 100
        ? 'Amazon BSR'
        : 'Limited drop'

  const tagline =
    meta.source === 'bsr' && leafBsr
      ? `#${leafBsr.rank} in ${leafBsr.category} · This week's list`
      : meta.source === 'bsr'
        ? `#${meta.rank} on Amazon Best Sellers · Limited-time listing`
        : 'This week’s Amazon bamboo picks · Limited-time options'

  const specs = [...(enriched.specs || [])].filter(
    (s) =>
      // Drop Best Seller rank specs when this is not a BSR-sourced item
      meta.source === 'bsr' ||
      !/best sellers rank|list position/i.test(s.label || ''),
  )
  if (meta.source === 'bsr' && leafBsr) {
    specs.unshift({
      label: 'Amazon Best Sellers Rank',
      value: `#${leafBsr.rank} in ${leafBsr.category}`,
    })
  }
  if (meta.source === 'bsr') {
    specs.unshift({
      label: 'List position (this week)',
      value: `#${meta.rank} in ${meta.bsrLabel}`,
    })
  }

  const family = materialFamily(enriched.title, enriched.material)
  const hueBase = {
    kitchen: 85,
    'cutting-boards': 40,
    dining: 25,
    bath: 170,
    organization: 95,
    desk: 55,
    outdoor: 120,
    baby: 200,
  }

  return {
    id: `bsr-${enriched.asin}`,
    slug: slugify(`${name}-${enriched.asin.slice(-6)}`),
    name: name || enriched.title.slice(0, 80),
    tagline,
    description:
      meta.source === 'bsr'
        ? `${name} — selected from Amazon Best Sellers for iBamboo’s weekly house edit. ${tagline}. Options rotate and are only available for a limited time; complete your purchase on Amazon.`
        : `${name} — selected from Amazon bamboo search for iBamboo’s weekly house edit. ${tagline}. Options rotate and are only available for a limited time; complete your purchase on Amazon.`,
    category: meta.ibambooCategory,
    collection: meta.collection,
    brand: enriched.brand || undefined,
    material: enriched.material || 'Bamboo (see Amazon listing)',
    features:
      enriched.features?.length > 0
        ? enriched.features
        : meta.source === 'bsr'
          ? [
              'Listed on Amazon Best Sellers',
              'Ships via Amazon',
              'Limited-time placement on iBamboo',
            ]
          : [
              'Found via Amazon bamboo search',
              'Ships via Amazon',
              'Limited-time placement on iBamboo',
            ],
    specs,
    priceHint:
      enriched.price != null && !Number.isNaN(enriched.price)
        ? enriched.price
        : 0,
    ...(enriched.listPrice != null &&
    !Number.isNaN(enriched.listPrice) &&
    enriched.listPrice > enriched.price
      ? { listPrice: enriched.listPrice }
      : {}),
    asin: enriched.asin,
    searchKeywords: enriched.title,
    badge,
    images: resolveProductImages({
      listImages: meta.images || [],
      enrichedImages: enriched.images || [],
      category: meta.ibambooCategory,
      asin: enriched.asin,
    }),
    ...(enriched.rating != null ? { rating: enriched.rating } : {}),
    ...(enriched.reviewCount != null
      ? { reviewCount: enriched.reviewCount }
      : {}),
    hue: (hueBase[meta.ibambooCategory] || 80) + (meta.rank % 40),
    // Limited-time merchandising — only real BSR ranks go on cards/PDP
    limitedTime: true,
    weekOf,
    expiresAt,
    ...(meta.source === 'bsr'
      ? {
          bsrRank: meta.rank,
          bsrCategory: meta.bsrLabel,
          bsrCategoryId: meta.bsrId,
        }
      : {
          bsrCategory: meta.bsrLabel,
          bsrCategoryId: meta.bsrId,
        }),
    materialFamily: family,
    source: meta.source === 'bsr' ? 'amazon-bsr' : 'amazon-search',
  }
}

async function main() {
  const config = JSON.parse(
    readFileSync(join(__dirname, 'categories.json'), 'utf8'),
  )
  const weekOf = weekOfIso()
  const fetchedAt = new Date().toISOString()
  const expiresAt = nextRefreshIso()
  const creators = createCreatorsClient()

  console.log(`\niBamboo BSR import · weekOf=${weekOf}`)
  console.log(`Next refresh target: ${expiresAt}`)
  console.log(`Associate tag: ${TAG}\n`)
  console.log(
    `Creators API: v${creators.config.credentialVersion} · ${creators.config.marketplace}\n`,
  )

  const candidates = [] // { asin, rank, source, bsrLabel, bsrId, ibambooCategory, collection }

  for (const cat of config.categories.filter((c) => c.enabled)) {
    console.log(`\n== Category: ${cat.label}`)
    const ranks = await pullBsrCategory(cat)
    for (const r of ranks) {
      candidates.push({
        asin: r.asin,
        rank: r.rank,
        title: r.title,
        rating: r.rating,
        reviewCount: r.reviewCount,
        images: r.images || [],
        source: 'bsr',
        bsrLabel: cat.label,
        bsrId: cat.id,
        ibambooCategory: cat.ibambooCategory,
        collection: cat.collection,
        bambooBias: cat.bambooBias,
      })
    }
  }

  for (const s of config.supplementalSearches.filter((x) => x.enabled)) {
    console.log(`\n== Supplemental: ${s.label}`)
    const ranks = await pullSearch(s.query, s.limit || 30, { pages: 2 })
    for (const r of ranks) {
      candidates.push({
        asin: r.asin,
        rank: r.rank,
        title: r.title,
        rating: r.rating,
        reviewCount: r.reviewCount,
        images: r.images || [],
        source: 'search',
        bsrLabel: s.label,
        bsrId: s.id,
        ibambooCategory: s.ibambooCategory,
        collection: s.collection,
        bambooBias: 'high',
      })
    }
    await sleep(500)
  }

  // Prefer best rank per ASIN (merge images from all sightings)
  const best = new Map()
  for (const c of candidates) {
    const prev = best.get(c.asin)
    if (!prev || c.rank < prev.rank) {
      best.set(c.asin, {
        ...c,
        images: [...(c.images || [])],
      })
    } else if (c.images?.length) {
      for (const img of c.images) {
        if (!prev.images.includes(img)) prev.images.push(img)
      }
      if (!prev.title && c.title) prev.title = c.title
    }
  }
  let unique = [...best.values()]
  console.log(`\nUnique ASINs: ${unique.length}`)
  console.log(
    `With list images: ${unique.filter((c) => c.images?.length).length}`,
  )

  // Fast path: list-page titles already containing "bamboo"
  const listBamboo = unique.filter(
    (c) => c.title && isBambooRelated(c.title, []),
  )
  console.log(`Bamboo titles on list pages: ${listBamboo.length}`)

  // Enrich remaining high-bias top ranks without titles / need images
  unique.sort((a, b) => {
    const bias = { high: 0, medium: 1, low: 2 }
    const aHas = a.title && isBambooRelated(a.title, []) ? 0 : 1
    const bHas = b.title && isBambooRelated(b.title, []) ? 0 : 1
    return (
      aHas - bHas ||
      (bias[a.bambooBias] ?? 2) - (bias[b.bambooBias] ?? 2) ||
      a.rank - b.rank
    )
  })

  const ENRICH_CAP = Number(process.env.BSR_ENRICH_CAP || 80)
  const products = []
  const rawEnriched = []
  const usedAsins = new Set()

  // 1) Immediate products from list titles + list images (no detail fetch required)
  for (const meta of listBamboo) {
    const p = productFromListCard(
      {
        asin: meta.asin,
        title: meta.title,
        rating: meta.rating,
        reviewCount: meta.reviewCount,
        images: meta.images || [],
      },
      meta,
      weekOf,
      expiresAt,
    )
    if (!p) continue
    products.push(p)
    usedAsins.add(meta.asin)
  }
  const listImgCount = products.filter((p) =>
    p.images?.some((u) => /media-amazon|ssl-images-amazon/i.test(u)),
  ).length
  console.log(
    `Products from BSR list titles: ${products.length} (${listImgCount} with Amazon CDN images)`,
  )

  // 2) Enrich a capped set for better images/specs (and catch bamboo not in list title)
  const toEnrich = unique
    .filter((c) => !usedAsins.has(c.asin))
    .filter(
      (c) =>
        c.bambooBias === 'high' ||
        c.source === 'search' ||
        (c.title && /bamboo/i.test(c.title)),
    )
    .slice(0, ENRICH_CAP)
  console.log(`Creators API-enriching ${toEnrich.length} (cap ${ENRICH_CAP})\n`)

  let creatorsEligible = true
  let creatorsItems = new Map()
  try {
    const creatorsResult = await creators.getItems(
      toEnrich.map((meta) => meta.asin),
    )
    creatorsItems = new Map(
      creatorsResult.items.map((item) => [item.asin, item]),
    )
    if (creatorsResult.errors.length) {
      console.warn(
        `Creators API returned ${creatorsResult.errors.length} item errors`,
      )
    }
  } catch (error) {
    if (error.body?.reason !== 'AssociateNotEligible') throw error
    creatorsEligible = false
    console.warn(
      'Creators API access is not eligible yet; temporarily using product-page enrichment.',
    )
  }

  for (let i = 0; i < toEnrich.length; i++) {
    const meta = toEnrich[i]
    process.stdout.write(
      `  [${i + 1}/${toEnrich.length}] ${meta.asin} (#${meta.rank} ${meta.bsrLabel})… `,
    )
    const apiItem = creatorsItems.get(meta.asin)
    const enriched = apiItem
      ? mapCreatorsItem(apiItem, meta)
      : creatorsEligible
        ? null
        : await enrichAsin(meta.asin)
    if (!creatorsEligible) await sleep(700)
    if (!enriched?.title) {
      if (meta.title && isBambooRelated(meta.title, [])) {
        const product = productFromListCard(meta, meta, weekOf, expiresAt)
        if (product && !usedAsins.has(meta.asin)) {
          products.push(product)
          usedAsins.add(meta.asin)
          console.log(`list-fallback ${meta.title.slice(0, 45)}`)
          continue
        }
      }
      console.log('skip')
      continue
    }

    const materialBamboo = /bamboo/i.test(enriched.material || '')
    const keep =
      isBambooRelated(enriched.title, enriched.features) ||
      materialBamboo ||
      (meta.source === 'search' && isBambooRelated(enriched.title, []))

    if (!keep) {
      console.log(`no-bamboo: ${enriched.title.slice(0, 50)}`)
      continue
    }

    // Prefer Creators images; fill gaps from list-page photos
    if ((!enriched.images || enriched.images.length === 0) && meta.images?.length) {
      enriched.images = meta.images
    } else if (meta.images?.length) {
      for (const img of meta.images) {
        if (!enriched.images.includes(img)) enriched.images.push(img)
      }
    }
    console.log(
      `OK ${enriched.title.slice(0, 50)} imgs=${(enriched.images || meta.images || []).length}`,
    )
    rawEnriched.push({ meta, enriched })
    if (!usedAsins.has(meta.asin)) {
      products.push(toProduct(enriched, meta, weekOf, expiresAt))
      usedAsins.add(meta.asin)
    } else {
      // Upgrade earlier list-only product with better enrich data
      const idx = products.findIndex((p) => p.asin === meta.asin)
      if (idx >= 0) products[idx] = toProduct(enriched, meta, weekOf, expiresAt)
    }
  }

  // 3) Optional seed from prior amazon-raw scrape
  try {
    const rawPath = join(ROOT, 'scripts/amazon-raw.json')
    if (existsSync(rawPath)) {
      const prior = JSON.parse(readFileSync(rawPath, 'utf8'))
      let seeded = 0
      for (const a of prior) {
        if (!a.asin || usedAsins.has(a.asin)) continue
        if (!a.title || !isBambooRelated(a.title, a.features || [])) continue
        const meta = {
          asin: a.asin,
          rank: 50 + seeded,
          source: 'search',
          bsrLabel: a.collection || 'Bamboo search',
          bsrId: 'prior-scrape',
          ibambooCategory: a.category || 'kitchen',
          collection: a.collection || 'Kitchen',
          images: a.images || [],
        }
        products.push(
          toProduct(
            {
              asin: a.asin,
              title: a.title,
              images: a.images || [],
              price: a.price,
              rating: a.rating,
              reviewCount: a.reviewCount,
              brand: a.brand,
              features: a.features || [],
              specs: a.specs
                ? Object.entries(a.specs).map(([label, value]) => ({
                    label,
                    value: String(value),
                  }))
                : [],
              material:
                a.specs?.Material || 'Bamboo (confirm on Amazon listing)',
              bsrLines: [],
              productUrl: `https://www.amazon.com/dp/${a.asin}?tag=${TAG}`,
            },
            meta,
            weekOf,
            expiresAt,
          ),
        )
        usedAsins.add(a.asin)
        seeded++
      }
      console.log(`Seeded ${seeded} from scripts/amazon-raw.json`)
    }
  } catch (e) {
    console.warn('prior seed skip', e.message)
  }

  // 4) Fill each iBamboo category to quota (default 20) via extra bamboo searches
  const quota = Number(
    process.env.CATEGORY_QUOTA || config.perCategoryQuota || 20,
  )
  const allCats = [
    'kitchen',
    'cutting-boards',
    'dining',
    'bath',
    'organization',
    'desk',
    'outdoor',
    'baby',
  ]
  const fillMap = config.quotaFillSearches || {}
  const collectionFor = {
    kitchen: 'Kitchen',
    'cutting-boards': 'Boards',
    dining: 'Tabletop',
    bath: 'Bath',
    organization: 'Organize',
    desk: 'Workspace',
    outdoor: 'Outdoor',
    baby: 'Little Ones',
  }

  function countByCategory(list) {
    const m = {}
    for (const p of list) m[p.category] = (m[p.category] || 0) + 1
    return m
  }

  console.log(`\n== Quota fill (target ${quota} bamboo items per category)`)
  let counts = countByCategory(products)
  console.log('  before:', counts)

  for (const cat of allCats) {
    let n = counts[cat] || 0
    if (n >= quota) {
      console.log(`  ${cat}: ${n} (ok)`)
      continue
    }
    const queries = [
      ...(fillMap[cat] || []),
      `bamboo ${cat.replace(/-/g, ' ')}`,
      `100% bamboo ${cat.replace(/-/g, ' ')}`,
    ]
    console.log(`  ${cat}: ${n}/${quota} — filling…`)
    for (const q of queries) {
      if (n >= quota) break
      const need = quota - n
      const ranks = await pullSearch(q, Math.max(need + 10, 25), { pages: 2 })
      for (const r of ranks) {
        if (n >= quota) break
        if (usedAsins.has(r.asin)) continue
        if (!r.title || !isBambooRelated(r.title, [])) continue
        const meta = {
          asin: r.asin,
          rank: 100 + n,
          title: r.title,
          rating: r.rating,
          reviewCount: r.reviewCount,
          images: r.images || [],
          source: 'search',
          bsrLabel: `Bamboo search · ${cat}`,
          bsrId: `quota-${cat}`,
          ibambooCategory: cat,
          collection: collectionFor[cat] || 'Kitchen',
          bambooBias: 'high',
        }
        const p = productFromListCard(r, meta, weekOf, expiresAt)
        if (!p) continue
        products.push(p)
        usedAsins.add(r.asin)
        n++
      }
      await sleep(600)
    }
    counts[cat] = n
    console.log(`  ${cat}: now ${n}/${quota}`)
  }

  counts = countByCategory(products)
  console.log('  after quota fill:', counts)

  // Sort: limited BSR rank first
  products.sort((a, b) => {
    if (a.source === 'amazon-bsr' && b.source !== 'amazon-bsr') return -1
    if (b.source === 'amazon-bsr' && a.source !== 'amazon-bsr') return 1
    return (a.bsrRank || 999) - (b.bsrRank || 999)
  })

  const snapshot = {
    weekOf,
    fetchedAt,
    expiresAt,
    associateTag: TAG,
    productCount: products.length,
    enrichedCount: rawEnriched.length,
    candidateCount: unique.length,
    categories: config.categories.filter((c) => c.enabled).map((c) => c.id),
    marketing: {
      headline: 'OPTIONS ONLY AVAILABLE FOR A LIMITED TIME',
      subhead:
        'This week’s Amazon Best Sellers edit. Lists refresh weekly — placements move.',
      refreshCadence: 'weekly',
    },
    products,
  }

  // Write outputs
  const rawDir = join(ROOT, 'data/bsr/raw')
  mkdirSync(rawDir, { recursive: true })
  const stamp = fetchedAt.replace(/[:.]/g, '-')
  writeFileSync(
    join(rawDir, `snapshot-${stamp}.json`),
    JSON.stringify({ snapshot, rawEnriched }, null, 2),
  )
  writeFileSync(
    join(ROOT, 'src/data/bsr-snapshot.json'),
    JSON.stringify(snapshot, null, 2),
  )

  const ts = `/**
 * AUTO-GENERATED by scripts/bsr/import-bsr.mjs — do not edit by hand.
 * Week of ${weekOf} · expires ${expiresAt}
 * Run: npm run import:bsr
 */
import type { Product } from './types'

export const bsrWeekOf = ${JSON.stringify(weekOf)} as const
export const bsrFetchedAt = ${JSON.stringify(fetchedAt)} as const
export const bsrExpiresAt = ${JSON.stringify(expiresAt)} as const
export const bsrMarketing = ${JSON.stringify(snapshot.marketing, null, 2)} as const

export const bsrProducts: Product[] = ${JSON.stringify(products, null, 2)}
`

  writeFileSync(join(ROOT, 'src/data/products.bsr.generated.ts'), ts)

  console.log(`\n✓ Wrote ${products.length} limited-time BSR products`)
  console.log(`  src/data/bsr-snapshot.json`)
  console.log(`  src/data/products.bsr.generated.ts`)
  console.log(`  data/bsr/raw/snapshot-${stamp}.json`)
  console.log(`\nNext: npm run build && npm run deploy`)
  console.log(`Weekly: npm run refresh:weekly\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
