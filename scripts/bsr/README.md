# Amazon BSR importer (weekly)

Pulls Amazon **Best Sellers Rank** Top ~100 lists for home-adjacent categories, enriches ASINs, keeps bamboo-related household goods, and regenerates the **limited-time** catalog drop.

Best Sellers and search result pages are used only to discover this week's ASINs and ranks. Product details (title, images, features, offers, and browse-node sales ranks) are enriched through the official Amazon Creators API; Amazon product-detail HTML is not fetched by the active import path.

## Creators API setup

Create a local `.env` from `.env.example` and provide:

```dotenv
VITE_AMAZON_ASSOCIATE_TAG=your-tag-20
AMAZON_CREATORS_CREDENTIAL_ID=your-credential-id
AMAZON_CREATORS_CREDENTIAL_SECRET=your-credential-secret
AMAZON_CREATORS_CREDENTIAL_VERSION=3.1
AMAZON_CREATORS_PARTNER_TAG=your-tag-20
AMAZON_CREATORS_MARKETPLACE=www.amazon.com
```

The credential ID and secret are server-side importer values. Never prefix them with `VITE_`, commit `.env`, or expose them to browser code. Access tokens are cached in memory until shortly before their one-hour expiry. GetItems requests are batched in groups of ten and retry transient rate-limit/server errors with backoff.

Amazon may return `AssociateNotEligible` while a new credential is reviewed or when the Associates account does not meet the required qualifying-sales threshold. In that specific case, the importer reports the block and temporarily falls back to the existing product-detail enrichment. The fallback is bypassed automatically as soon as GetItems succeeds.

## Commands

```bash
# Import only (writes generated catalog)
npm run import:bsr

# Cap how many ASINs to enrich (default 120)
BSR_ENRICH_CAP=80 npm run import:bsr

# Full weekly refresh → import + build + Cloudflare deploy
npm run refresh:weekly
```

## Outputs

| File | Purpose |
|------|---------|
| `src/data/products.bsr.generated.ts` | Typed products for the storefront |
| `src/data/bsr-snapshot.json` | JSON snapshot + marketing copy |
| `data/bsr/raw/snapshot-*.json` | Archive of each run |

## Schedule (weekly)

**Suggested:** Monday 9:00 AM local (or your market timezone).

### macOS `launchd` / cron example

```cron
0 9 * * 1 cd /path/to/ibamboo && npm run refresh:weekly >> /tmp/ibamboo-bsr.log 2>&1
```

### Manual marketing cadence

1. `npm run refresh:weekly`
2. Confirm https://ibamboo.com shows new **Limited time** strip
3. Optional: social post — “This week’s Amazon Best Sellers · options only available for a limited time”

## Categories

Edit `scripts/bsr/categories.json` to enable/disable BSR nodes and supplemental bamboo searches.

## Notes

- There is no Amazon “Best Sellers in Bamboo” node — we use **home leaf categories** + bamboo filters.
- Lists move weekly; product BSR ranks change. That is intentional for the limited-time message.
- Requires network access to Amazon Best Sellers/search pages and `creatorsapi.amazon`.
- Associate tag comes from `AMAZON_CREATORS_PARTNER_TAG`, then `VITE_AMAZON_ASSOCIATE_TAG`.
