# Amazon BSR importer (weekly)

Pulls Amazon **Best Sellers Rank** Top ~100 lists for home-adjacent categories, enriches ASINs, keeps bamboo-related household goods, and regenerates the **limited-time** catalog drop.

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
- Requires network access to amazon.com; occasional blocks → re-run later.
- Associate tag from `VITE_AMAZON_ASSOCIATE_TAG` or default `iu0e3-20`.
