# iBamboo ↔ Z9GO library

iBamboo consumes the federated product library at **https://z9go.com**. Z9GO is source of truth for **curated** active SKUs and URL health. BSR weekly is fenced.

## Env

```bash
export Z9GO_LIBRARY_URL=https://z9go.com   # optional; default
export Z9GO_LIBRARY_TOKEN=…               # ADMIN_API_TOKEN from Z9GO
# optional:
export SITE_ID=ibamboo
export Z9GO_UNKNOWN_POLICY=include        # ramp; `exclude` after health is trusted
export PRODUCT_FILES=src/data/products.ts # write-back override (comma-separated)
```

`KYASI_LIBRARY_TOKEN` / `KYASI_LIBRARY_URL` still work as aliases.

## Cadence

```bash
npm run library:sync:curated   # write-back curated catalog → Z9GO
# Z9GO health cron/run (ok / partial / blocked)
npm run library:pull:dry       # report only
npm run library:pull           # write src/data/z9go-gate.json
```

Commit an enabled gate in a later cadence PR after reviewing `tmp/library-pull-report.json` (gitignored). The checked-in sidecar stays `"enabled": false` with `"asins": []` so imports exist without shrinking production.

## Commands

| Script | What it does |
|--------|----------------|
| `library:sync:dry` | Write-back dry-run (default file: curated `products.ts`) |
| `library:sync` | Write-back house metadata + local images (`imagesMode: replace`) |
| `library:sync:curated` | Same as sync with `PRODUCT_FILES=src/data/products.ts` |
| `library:pull:dry` | GET gated catalog, report keep/hide/inbound, no sidecar write |
| `library:pull` | Same + overwrite `src/data/z9go-gate.json` (`enabled: true`) |

`--unknown=exclude` overrides `Z9GO_UNKNOWN_POLICY` (default `include`).

## Behavior

### Write-back (`library:sync`)

1. **GET** each catalog ASIN from the library (hit/miss).
2. **Write-back** house name, brand, category, slug, and **this product's** images with `imagesMode: replace`.
3. **Does not** pull library images into the TS catalog (avoids seed pollution).
4. Default path is **curated only**. Do not send BSR weekly through Z9GO.

### Pull (`library:pull`)

1. **GET** `/api/library/sites/ibamboo/catalog` (paginate `limit`/`offset` until a short page or `offset >= total`).
2. Compare gated ASINs to local `src/data/products.ts`. Report `keep` / `hide` / `inbound`.
3. **Does not** add inbound ASINs to `products.ts` (v1 lists only). Does **not** rewrite `products.ts`.
4. Writes `tmp/library-pull-report.json` always. Writes the sidecar unless `--dry-run`.
5. Associate tags are never stored in library payloads or the sidecar.

### Shop gate

- Sidecar: `src/data/z9go-gate.json`. Helper: `src/data/z9goGate.ts` (`productPassesZ9goGate`).
- Missing or `enabled !== true` → fail-open (do not empty the shop).
- Curated rows with an ASIN must be in `asins` (case-insensitive) when enabled.
- `limitedTime` and `source` `amazon-bsr` / `amazon-search` skip the gate.
- Applied to `shopProducts`, `getProduct` (including flash-pool fallback), sitemap, and route-meta. Hidden curated SKUs 404 like unknown slugs.

## Files

| Path | Role |
|------|------|
| `scripts/lib/kyasi-library.mjs` | HTTP client (`listSiteCatalog`, write-back) |
| `scripts/sync-from-library.mjs` | Write-back loop |
| `scripts/pull-from-library.mjs` | Gated catalog pull |
| `src/data/z9go-gate.json` | Sidecar (checked-in disabled; pull overwrites locally) |
| `src/data/z9goGate.ts` | Pure gate helper |
| `tmp/library-sync-report.json` | Last write-back report |
| `tmp/library-pull-report.json` | Last pull report |
