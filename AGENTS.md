# AGENTS.md — iBamboo

Instructions for coding agents working in this repository.

## Product

**iBamboo** is a private Amazon Associates storefront for bamboo home goods. Buy buttons go to Amazon with Associates tag **`iu0e3-20`**. Live site: [ibamboo.com](https://ibamboo.com).

## Git / PR workflow

- Do **not** push feature work straight to `main` for non-trivial changes.
- Use a feature branch, open a PR to `main`, then:
  1. **Adversarial code review** — spawn one or more review subagents on the PR
     diff whose explicit job is to find bugs, regressions, security issues, and
     missing affiliate tags (see "Review focus areas"). Adversarial mindset:
     assume the change is broken until proven otherwise; verify claims against
     the actual code, not the PR description.
  2. **Resolve** every blocking finding and have the reviewer re-check it.
  3. **Verify** — `/check-work` (build, lint, correctness) and CI green.
  4. **Merge** (squash, matching repo convention) only when review has **no
     open bugs** and verify is **PASS**.
- Per the owner's standing instruction (2026-07-26): the agent **may merge and
  deploy** its own PRs — but only after the adversarial-review loop above has
  run and passed. Skipping the review loop forfeits merge/deploy authority.
- Never commit secrets: `.env`, credential CSVs, Creators API secrets, tokens.

## Build & quality gates

```bash
npm ci          # clean install (CI)
npm run lint    # oxlint src
npm run build   # tsc -b && vite build
```

All three must pass before recommending merge. Prefer `npm ci` in CI; `npm install` is fine locally.

`npm run sitemap` (first build step) also emits `worker/generated/routeMeta.json` —
the per-route SEO head table the Worker injects into the raw HTML shell and uses
as its known-route list for 404s. Source of truth is `src/lib/seoData.ts` (shared
with the React pages); edit SEO copy there, never in the Worker.

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
