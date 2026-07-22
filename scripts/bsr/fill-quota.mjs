#!/usr/bin/env node
/**
 * Pad limited-time catalog to ≥20 products per iBamboo category.
 * Uses latest raw BSR snapshot + house-edit fillers (brand images + Amazon search keywords).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')
const QUOTA = Number(process.env.CATEGORY_QUOTA || 20)

const brandImgs = {
  kitchen: ['/brand/products-flatlay.png', '/brand/products-hero.png'],
  'cutting-boards': ['/brand/products-flatlay.png', '/brand/soho-collection.png'],
  dining: ['/brand/soho-collection.png', '/brand/products-hero.png'],
  bath: ['/brand/landing-forest.png', '/brand/products-flatlay.png'],
  organization: ['/brand/products-hero.png', '/brand/soho-collection.png'],
  desk: ['/brand/products-hero.png', '/brand/soho-collection.png'],
  outdoor: ['/brand/landing-forest.png', '/brand/hero.png'],
  baby: ['/brand/products-flatlay.png', '/brand/soho-collection.png'],
}

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

const fillers = {
  kitchen: [
    ['Bamboo Spoon Rest', 'Keeps counters clean mid-cook.'],
    ['Bamboo Rolling Pin', 'Even pressure for pastry days.'],
    ['Bamboo Knife Block Insert', 'Drawer-friendly blade storage.'],
    ['Bamboo Tea Scoop Set', 'Matcha and loose-leaf measure.'],
    ['Bamboo Honey Dipper Pair', 'Grooves that hold every drop.'],
    ['Bamboo Pasta Server', 'Deep tines for long noodles.'],
    ['Bamboo Salad Servers', 'Matched spoon and fork.'],
    ['Bamboo Skewer Set', 'Party-ready natural skewers.'],
    ['Bamboo Spreader Knives', 'Butter and soft cheese.'],
    ['Bamboo Mortar Mini', 'Crush herbs at the board.'],
    ['Bamboo Ladle', 'Deep bowl for soups.'],
    ['Bamboo Tongs', 'Serve without scratch.'],
    ['Bamboo Wok Turner', 'Angled for deep pans.'],
    ['Bamboo Ice Cream Scoop', 'Warm wood for soft scoops.'],
  ],
  dining: [
    ['Bamboo Dinner Plate Set', 'Warm grain for everyday meals.'],
    ['Bamboo Bowl Quartet', 'Soups, grains, and sides.'],
    ['Bamboo Cup Set', 'Light cups for water and tea.'],
    ['Bamboo Coaster Caddy', 'Protect tables in style.'],
    ['Bamboo Placemat Set', 'Woven look, easy clean.'],
    ['Bamboo Napkin Rings', 'Soft set for the table.'],
    ['Bamboo Condiment Dishes', 'Salt, soy, and dips.'],
    ['Bamboo Serving Fork Spoon', 'Hosting pair for sides.'],
    ['Bamboo Salad Bowl XL', 'Family-size centerpiece.'],
    ['Bamboo Butter Dish', 'Covered countertop classic.'],
    ['Bamboo Egg Cups', 'Soft-boiled, upright.'],
    ['Bamboo Trivet Pair', 'Hot pots, safe counters.'],
    ['Bamboo Flatware Handles', 'Warm grips, precise tips.'],
    ['Bamboo Ramen Bowl Kit', 'Deep bowl and chopsticks.'],
    ['Bamboo Picnic Plates', 'Reusable stack for parks.'],
    ['Bamboo Dinner Plate Duo', 'Everyday plates with warm grain.'],
    ['Bamboo Dessert Plate Set', 'Small plates for sweets.'],
    ['Bamboo Serving Platter', 'Long board for shared plates.'],
  ],
  bath: [
    ['Bamboo Toothbrush Family Pack', 'Soft bristles, plant handle.'],
    ['Bamboo Soap Dish Slatted', 'Bars dry between showers.'],
    ['Bamboo Bath Tray', 'Books and candles over the tub.'],
    ['Bamboo Toothbrush Stand', 'Slots for the household.'],
    ['Bamboo Cotton Swab Jar', 'Zero plastic stems.'],
    ['Bamboo Hairbrush Paddle', 'Smooth pins, soft finish.'],
    ['Bamboo Bath Brush', 'Long handle dry brush.'],
    ['Bamboo Sheet Set Cool', 'Viscose-from-bamboo sleep.'],
    ['Bamboo Towel Bundle', 'Quick-dry bath textiles.'],
    ['Bamboo Washcloth Set', 'Soft fiber for face and hands.'],
    ['Bamboo Bath Mat', 'Warm underfoot texture.'],
    ['Bamboo Razor Handle', 'Reusable safety handle.'],
    ['Bamboo Corner Caddy', 'Bottles ordered and draining.'],
  ],
  organization: [
    ['Bamboo Expandable Drawer Tray', 'Utensils that finally fit.'],
    ['Bamboo Desk Drawer Dividers', 'Pens and cables sorted.'],
    ['Bamboo Lidded Storage Boxes', 'Stackable closet calm.'],
    ['Bamboo Bread Box Rolltop', 'Loaves stay fresher.'],
    ['Bamboo Spice Ladder', 'Jars at a glance.'],
    ['Bamboo Paper Towel Stand', 'Weighted freestanding base.'],
    ['Bamboo Cable Box', 'Hide the power strip.'],
    ['Bamboo Key Tray', 'Drop zone by the door.'],
    ['Bamboo Remote Caddy', 'Living-room order.'],
    ['Bamboo Jewelry Box', 'Tiers for rings and chains.'],
    ['Bamboo Closet Dividers', 'Sweater stacks upright.'],
  ],
  desk: [
    ['Bamboo Monitor Riser', 'Height plus shelf storage.'],
    ['Bamboo Laptop Stand', 'Breathable work angle.'],
    ['Bamboo Desk Caddy', 'Pens, notes, clips.'],
    ['Bamboo Phone Dock', 'Video-call ready angle.'],
    ['Bamboo Tablet Stand', 'Recipes and sketching.'],
    ['Bamboo Headphone Stand', 'Park cans cleanly.'],
    ['Bamboo Wrist Rest', 'Support that matches the desk.'],
    ['Bamboo Pen Cup', 'Simple writing cylinder.'],
  ],
  outdoor: [
    ['Bamboo Wind Chime Classic', 'Soft porch tones.'],
    ['Bamboo Plant Labels Pack', 'Mark herbs without plastic.'],
    ['Bamboo Picnic Cutlery Roll', 'Fork knife spoon to-go.'],
    ['Bamboo Garden Torch Stakes', 'Open-air evening light.'],
    ['Bamboo Bird Feeder', 'Natural backyard perch.'],
    ['Bamboo Outdoor Tray', 'Patio snacks and drinks.'],
    ['Bamboo Folding Side Table', 'Balcony coffee, packs flat.'],
    ['Bamboo Garden Trellis', 'Climbing herbs and vines.'],
    ['Bamboo Planter Box', 'Deck-ready planting.'],
    ['Bamboo Outdoor Salad Servers', 'Serve al fresco.'],
    ['Bamboo Stake Bundle', 'Support for young plants.'],
    ['Bamboo Lantern Frame', 'Candle evenings outside.'],
    ['Bamboo Hose Guide', 'Keep garden paths tidy.'],
    ['Bamboo Compost Scoop', 'Yard work, natural tool.'],
    ['Bamboo Patio Coaster Set', 'Outdoor table protection.'],
    ['Bamboo Skewer Grill Pack', 'Kebab night ready.'],
    ['Bamboo Garden Dibber', 'Seed spacing made simple.'],
    ['Bamboo Outdoor Utensil Crock', 'Grill-side storage.'],
  ],
  baby: [
    ['Bamboo Suction Plate', 'Stay-put first foods.'],
    ['Bamboo Baby Spoon Trio', 'Soft edges for tiny mouths.'],
    ['Bamboo Toddler Bowl', 'Self-feeding friendly.'],
    ['Bamboo Kids Dinnerware', 'Plate, bowl, cup scaled down.'],
    ['Bamboo Baby Hairbrush', 'Gentle newborn strokes.'],
    ['Bamboo Teething Ring', 'Smooth natural feel.'],
    ['Bamboo Kids Toothbrush', 'Small head, soft bristles.'],
    ['Bamboo Snack Bowls', 'Crackers and fruit portions.'],
    ['Bamboo Baby Bib Set', 'Easy-wipe mealtime.'],
    ['Bamboo Sippy Training Cup', 'First independent sips.'],
    ['Bamboo Divided Plate', 'Separated first meals.'],
    ['Bamboo Baby Fork Spoon Set', 'Self-feed practice.'],
    ['Bamboo Kids Placemat', 'Contain the mess.'],
    ['Bamboo Toddler Cup Set', 'Sip practice without spills.'],
    ['Bamboo Kids Snack Tray', 'Portable portions.'],
    ['Bamboo Baby Food Scoop', 'From jar to bowl.'],
    ['Bamboo Divided Toddler Plate', 'Separated first meals.'],
    ['Bamboo Baby Training Cup', 'First independent sips.'],
  ],
  'cutting-boards': [
    ['Bamboo Prep Board Medium', 'Daily chopping workhorse.'],
    ['Bamboo End Grain Block', 'Knife-kind surface.'],
    ['Bamboo Charcuterie Paddle', 'Entertaining ready.'],
    ['Bamboo Lazy Susan', 'Spin sauces mid-table.'],
    ['Bamboo Bread Board', 'Crumb groove included.'],
  ],
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 70)
}

/** Upgrade Amazon list thumbs and de-dupe by /images/I/{id} stem. */
function upgradeAmazonImageUrl(url) {
  if (!url || typeof url !== 'string') return null
  let u = url.trim().replace(/&amp;/g, '&')
  if (u.startsWith('/')) return u
  if (/\/images\/G\//i.test(u) || /pixel|sprite|transparent/i.test(u)) return null
  if (
    !/media-amazon\.com\/images\//i.test(u) &&
    !/ssl-images-amazon\.com\/images\//i.test(u)
  ) {
    return null
  }
  u = u.replace(/^http:\/\//i, 'https://')
  u = u
    .replace(/\._AC_UL\d+(?:_SR\d+,\d+)?(?:_QL\d+)?_\./i, '._AC_SL1000_.')
    .replace(/\._AC_UL[^.]+\./i, '._AC_SL1000_.')
    .replace(/\._AC_UX\d+_.*?\./i, '._AC_SL1000_.')
    .replace(/\._AC_UY\d+_.*?\./i, '._AC_SL1000_.')
    .replace(/\._SX\d+_\./i, '._SL1000_.')
    .replace(/\._SY\d+_\./i, '._SL1000_.')
    .replace(/\._US\d+_\./i, '._SL1000_.')
    .replace(/\._SS\d+_\./i, '._SL1000_.')
  if (/\/images\/P\/[A-Z0-9]{10}/i.test(u)) return null
  return u
}

function normalizeProductImages(images) {
  const out = []
  const seenStems = new Set()
  for (const raw of images || []) {
    const u = upgradeAmazonImageUrl(raw) || (String(raw).startsWith('/') ? raw : null)
    if (!u) continue
    const m = String(u).match(/\/images\/I\/([^./]+)/i)
    const stem = m ? m[1].toLowerCase() : null
    if (stem) {
      if (seenStems.has(stem)) continue
      seenStems.add(stem)
    } else if (out.includes(u)) {
      continue
    }
    out.push(u)
  }
  return out
}

/** Soften misleading BSR wording on search-sourced products already in snapshot. */
function sanitizeSearchProduct(p) {
  if (p.source !== 'amazon-search') return p
  const next = { ...p }
  delete next.bsrRank
  if (Array.isArray(next.features)) {
    next.features = next.features.map((f) =>
      String(f).replace(/Amazon Best Sellers · #\d+ in /i, 'Amazon bamboo search · '),
    )
  }
  if (Array.isArray(next.specs)) {
    next.specs = next.specs.filter(
      (s) => !/best sellers rank|list position/i.test(s.label || ''),
    )
  }
  // Always rewrite search taglines — residual "#N in … · This week's list" is not a real BSR rank
  next.tagline = "This week's Amazon bamboo picks · Limited-time options"
  if (next.description) {
    next.description = String(next.description)
      .replace(
        /selected from Amazon Best Sellers/i,
        'selected from Amazon bamboo search',
      )
      .replace(
        /#\d+\s+in\s+[^·.]+(?:\s*·\s*This week's list)?/gi,
        'Limited-time options',
      )
  }
  return next
}

/**
 * Prefer the snapshot the importer just wrote (src/data/bsr-snapshot.json),
 * then the newest raw snapshot by filename timestamp — never "largest wins"
 * (that can rehydrate a stale larger dump after a thinner fresh import).
 */
function loadBestSnapshot() {
  const livePath = join(ROOT, 'src/data/bsr-snapshot.json')
  try {
    const live = JSON.parse(readFileSync(livePath, 'utf8'))
    if (live?.products?.length) {
      console.log(`Using live snapshot: src/data/bsr-snapshot.json (${live.products.length} products)`)
      return live
    }
  } catch {
    /* fall through to raw */
  }

  const dir = join(ROOT, 'data/bsr/raw')
  const files = readdirSync(dir)
    .filter((f) => f.startsWith('snapshot-') && f.endsWith('.json'))
    .sort()
    .reverse() // newest ISO timestamp name first

  for (const f of files) {
    try {
      const j = JSON.parse(readFileSync(join(dir, f), 'utf8'))
      const snap = j.snapshot || j
      const list = snap.products || []
      if (list.length > 0) {
        console.log(`Using newest raw snapshot: ${f} (${list.length} products)`)
        return snap
      }
    } catch {
      /* skip corrupt */
    }
  }
  throw new Error('No BSR snapshot found in src/data/bsr-snapshot.json or data/bsr/raw')
}

const snap = loadBestSnapshot()
// Strip prior house-edit pads so re-runs are idempotent (import:bsr chains fill-quota)
const products = structuredClone(snap.products)
  .filter((p) => p.source !== 'curated' || p.asin)
  .map((p) => sanitizeSearchProduct(p))
  .map((p) => ({
    ...p,
    images: normalizeProductImages(p.images),
  }))
const weekOf = snap.weekOf
const expiresAt = snap.expiresAt
const fetchedAt = snap.fetchedAt || new Date().toISOString()
const usedSlug = new Set(products.map((p) => p.slug))

const multiUlLeft = products.filter(
  (p) => (p.images || []).filter((u) => /_AC_UL/i.test(u)).length > 1,
).length
console.log(
  `Loaded ${products.length} Amazon-sourced products (prior house-edit pads removed; multi-UL leftovers: ${multiUlLeft})`,
)

for (const cat of Object.keys(fillers)) {
  let n = products.filter((p) => p.category === cat).length
  let i = 0
  while (n < QUOTA && i < fillers[cat].length) {
    const [name, tagline] = fillers[cat][i++]
    const slug = `fill-${slugify(name)}`
    if (usedSlug.has(slug)) continue
    // ASIN-less merchandising pads: no synthetic stars, review counts, or prices.
    // priceHint 0 → UI shows "See Amazon"; omit rating so StarRating hides.
    products.push({
      id: `fill-${cat}-${i}`,
      slug,
      name,
      tagline,
      description: `${name} — bamboo for the house. Limited-time iBamboo edit; complete purchase on Amazon.`,
      category: cat,
      collection: collectionFor[cat],
      material: 'Bamboo (confirm on Amazon listing)',
      features: [
        'Bamboo household essential',
        'Limited-time placement on iBamboo this week',
        'Buy on Amazon — availability set by Amazon',
      ],
      specs: [
        { label: 'Material', value: 'Bamboo (confirm listing)' },
        { label: 'Placement', value: 'iBamboo weekly house edit' },
      ],
      priceHint: 0,
      searchKeywords: `100% bamboo ${name}`,
      badge: 'House edit',
      images: brandImgs[cat] || brandImgs.kitchen,
      hue: 80 + i * 3,
      limitedTime: true,
      weekOf,
      expiresAt,
      // No synthetic BSR rank — PDP must not claim Best Sellers placement
      materialFamily:
        cat === 'bath' && /sheet|towel|wash/i.test(name)
          ? 'bamboo-fiber'
          : 'bamboo',
      source: 'curated',
    })
    usedSlug.add(slug)
    n++
  }
}

const by = {}
for (const p of products) by[p.category] = (by[p.category] || 0) + 1
console.log('Per-category counts:', by)
console.log('Total:', products.length)
console.log(
  'All images:',
  products.every((p) => p.images?.length > 0),
  'min:',
  Math.min(...Object.values(by)),
)

const marketing = {
  headline: 'OPTIONS ONLY AVAILABLE FOR A LIMITED TIME',
  subhead:
    "This week's bamboo house edit — Amazon Best Sellers plus fills to 20+ per category. Lists refresh weekly.",
  refreshCadence: 'weekly',
}

writeFileSync(
  join(ROOT, 'src/data/bsr-snapshot.json'),
  JSON.stringify(
    {
      weekOf,
      fetchedAt,
      expiresAt,
      associateTag: 'iu0e3-20',
      productCount: products.length,
      products,
      marketing,
      categories: by,
    },
    null,
    2,
  ),
)

writeFileSync(
  join(ROOT, 'src/data/products.bsr.generated.ts'),
  `/**
 * AUTO-GENERATED — weekly limited-time drop (≥${QUOTA} per category).
 * Week of ${weekOf} · expires ${expiresAt}
 * Run: npm run import:bsr  (or npm run fill:quota alone)
 */
import type { Product } from './types'

export const bsrWeekOf = ${JSON.stringify(weekOf)} as const
export const bsrFetchedAt = ${JSON.stringify(fetchedAt)} as const
export const bsrExpiresAt = ${JSON.stringify(expiresAt)} as const
export const bsrMarketing = ${JSON.stringify(marketing, null, 2)} as const

export const bsrProducts: Product[] = ${JSON.stringify(products, null, 2)}
`,
)

console.log('Wrote bsr-snapshot.json + products.bsr.generated.ts')
