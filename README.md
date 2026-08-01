# iBamboo

**iBamboo** is a curated affiliate storefront for **100% bamboo** home goods—kitchen tools, cutting boards, desk risers, bath accents, and more. Each product links to Amazon with your Associates tag.

Modeled after the iFLOOR stack: Vite + React + TypeScript + Tailwind v4, deployable to Cloudflare Workers static assets.

## Stack

- Vite + React 19 + TypeScript + Tailwind CSS v4
- React Router
- Cloudflare Workers (`wrangler deploy`)

## Quick start

```bash
cd ibamboo
npm install
cp .env.example .env   # set your Associates tag
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Amazon Associates

1. Join [Amazon Associates](https://affiliate-program.amazon.com/).
2. Create `.env` from `.env.example`:

```bash
VITE_AMAZON_ASSOCIATE_TAG=yourstore-20
```

3. Restart `npm run dev`. All “Shop on Amazon” buttons use this tag.

Links are built in `src/lib/amazon.ts`:

- **With ASIN** → `https://www.amazon.com/dp/{ASIN}?tag=YOUR_TAG`
- **Without ASIN** → Amazon keyword search with the same tag

### Catalog notes

- `src/data/products.ts` holds **100** curated picks.
- Only some rows have ASINs; others use search affiliate links.
- **Always re-verify** that a listing still claims 100% bamboo before promoting it—Amazon inventory changes.
- Display prices are approximate hints only.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # typecheck + production build
npm run preview  # preview dist/
npm run deploy   # build + wrangler deploy
npm run lint     # oxlint
```

## Brand assets

Logos and hero art live under `public/brand/` (copied from your iBamboo Master kit).

## Conbal content balloons

iBamboo can render owner-managed editorial content from Conbal without a new
storefront build. `src/components/ConbalBalloon.tsx` uses Conbal's public
delivery endpoint directly so placements also work after React Router
navigation.

Production defaults to the public iBamboo Conbal site key `NYcKxGAVDdeF` at
`https://conbal.us`. Preview environments can override either value:

```bash
VITE_CONBAL_ORIGIN=https://conbal.us
VITE_CONBAL_SITE_KEY=NYcKxGAVDdeF
```

Route code uses named placements from `src/components/ConbalPlacement.tsx`, so
page layouts do not depend on Conbal slugs scattered throughout the app:

| Route placement | Published balloon | Format |
|---|---|---|
| Home field note | `bamboo-is-a-grass` | responsive |
| Home culture feature | `bamboo-weaving-heritage` | 300×250 |
| Shop field note | `running-bamboo-rhizomes` | responsive |
| Product field note | `bamboo-rhizomes` | 320×100 |
| Why field note | `bamboo-gregarious-flowering` | responsive |
| Vibe field note | `bamboo-growth-record` | 300×250 |

If a balloon is unavailable, unpublished, or cannot be loaded, the component
removes the empty placement. It also rejects a payload whose published size no
longer matches the layout contract. Delivery calls—not guaranteed viewport
impressions—roll up through the balloon, site, and account analytics provided
by the shared iBamboo site key.

## Project layout

```
src/
  components/   Layout, ProductCard, ScrollToTop
  data/         products, types, catalog helpers
  lib/          amazon Associates helpers
  pages/        Home, Shop, Product, Why
public/brand/   logos + marketing images
```

## Deploy

```bash
npm run deploy
```

Requires Wrangler logged in (`npx wrangler login`). Worker name: `ibamboo` (see `wrangler.jsonc`).

### Live URLs

| URL | Notes |
|-----|--------|
| https://ibamboo.com | Production custom domain |
| https://www.ibamboo.com | Production custom domain |
| https://ibamboo.tech-bf6.workers.dev | workers.dev backup |

Custom domains are configured in `wrangler.jsonc` (`routes` with `custom_domain: true`). Outlook MX/TXT records on the zone were left intact when unhooking the GHL placeholder.

## Weekly Amazon Best Sellers (BSR) drop

Marketing: **OPTIONS ONLY AVAILABLE FOR A LIMITED TIME**

```bash
# Pull Top ~100 BSR lists, filter bamboo, regenerate limited-time catalog
npm run import:bsr

# Full weekly pipeline: import → build → Cloudflare deploy
npm run refresh:weekly
```

| File | Role |
|------|------|
| `scripts/bsr/categories.json` | BSR nodes + bamboo searches |
| `scripts/bsr/import-bsr.mjs` | Importer |
| `src/data/products.bsr.generated.ts` | Generated limited-time products |
| `src/data/bsr-snapshot.json` | Snapshot + marketing copy |

Suggested cron (Mondays 9am):

```cron
0 9 * * 1 cd /path/to/ibamboo && npm run refresh:weekly >> /tmp/ibamboo-bsr.log 2>&1
```

See `scripts/bsr/README.md` for details.
