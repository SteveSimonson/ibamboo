# AGENTS.md — iBamboo

Instructions for coding agents working in this repository.

## Product

**iBamboo** is a private Amazon Associates storefront for bamboo home goods. Buy buttons go to Amazon with Associates tag **`iu0e3-20`**. Live site: [ibamboo.com](https://ibamboo.com).

## Git / PR workflow

- Do **not** push feature work straight to `main` for non-trivial changes.
- Use a feature branch, open a PR to `main`, then:
  1. **Code review** — `/review --pr <n>` (or equivalent reviewer agent)
  2. **Verify** — `/check-work` (build, lint, correctness)
  3. **Merge** only when review has **no open bugs** and verify is **PASS**
- Agents **recommend** merge; do not auto-merge unless the human explicitly asks.
- Never commit secrets: `.env`, credential CSVs, Creators API secrets, tokens.

## Build & quality gates

```bash
npm ci          # clean install (CI)
npm run lint    # oxlint src
npm run build   # tsc -b && vite build
```

All three must pass before recommending merge. Prefer `npm ci` in CI; `npm install` is fine locally.

## Stack

- Vite + React 19 + TypeScript + Tailwind v4
- Cloudflare Workers static assets (`wrangler deploy`)
- Affiliate links: `src/lib/amazon.ts` + `VITE_AMAZON_ASSOCIATE_TAG` (default tag `iu0e3-20`)

## Catalog rules

- Weekly **limited-time** merchandising is driven by BSR import + quota fill:
  - `npm run import:bsr` → `scripts/bsr/import-bsr.mjs` then `fill-quota.mjs`
  - Generated data: `src/data/products.bsr.generated.ts`, `src/data/bsr-snapshot.json`
- Target **≥20 items per category** for limited-time shelves when filling.
- **Affiliate tag** must remain `iu0e3-20` (or the configured env tag); never strip tags from product links.
- **Images (short-term):** use real Amazon list CDN URLs (`images-na.ssl-images-amazon.com` / `media-amazon.com/images/I/…`). Prefer list-page images over the broken `images/P/{ASIN}` pattern. Brand art under `/public/brand/` is the last fallback.
- **Creators API:** OAuth works; GetItems may return `AssociateNotEligible` until ~10 qualifying sales / 30 days. See `GROK-HANDOFF.md`. Do not commit credentials. When eligible, prefer Creators enrichment over HTML scrape.

## Deploy

- Deploy only after merge to `main` (or when the human explicitly requests a deploy from a branch).
- `npm run deploy` = build + `wrangler deploy`.
- Custom domain is configured in `wrangler.jsonc`; do not casually change worker/domain names.

## Review focus areas

When reviewing PRs, prioritize:

1. Broken build / type errors / lint failures
2. Affiliate tag missing or wrong
3. Catalog regressions (empty categories, missing images, bad ASINs)
4. Secrets or `.env` leakage
5. Unrelated drive-by refactors

Nits on style are optional; bugs block merge recommendation.
