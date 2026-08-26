# iBamboo ↔ Z9GO library

iBamboo consumes the federated product library at **https://z9go.com**.

## Commands

```bash
export Z9GO_LIBRARY_URL=https://z9go.com
export Z9GO_LIBRARY_TOKEN=…   # ADMIN_API_TOKEN from Z9GO (kyasi-net worker)

npm run library:sync:dry
npm run library:sync
```

## Behavior

1. **GET** each catalog ASIN from the library (hit/miss).
2. **Write-back** house name, brand, category, slug, and **this product's** images with `imagesMode: replace`.
3. **Does not** pull library images into the TS catalog (avoids seed pollution).

## Files

| Path | Role |
|------|------|
| `scripts/lib/kyasi-library.mjs` | HTTP client |
| `scripts/sync-from-library.mjs` | Sync loop |
| `tmp/library-sync-report.json` | Last run report |
