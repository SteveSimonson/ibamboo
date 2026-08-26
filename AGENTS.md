# AGENTS.md — iBamboo

Instructions for coding agents working in this repository.

## Ship gate (all repos)

Global skill **`pr-ship-gate`** (`~/.grok/skills/pr-ship-gate/SKILL.md`) applies: branch → issue (when trackable) → PR → CI → independent review → merge → deploy. Layer this on top of the Git/PR workflow below. Always leave a GitHub trail Steve can track back.

## Product

**iBamboo** is a private Amazon Associates storefront for bamboo home goods. Buy buttons go to Amazon with Associates tag **`iu0e3-20`**. Live site: [ibamboo.com](https://ibamboo.com).

## Admin control plane (POC)

**URL:** https://ibamboo.com/admin  

**Auth (preferred):** Google OAuth — only emails in `ADMIN_ALLOWED_EMAILS`.  
**Auth (fallback):** shared `ADMIN_PASSWORD` (break-glass).  
Session: HMAC cookie (`ADMIN_SESSION_SECRET` or password). Config in KV `ADMIN_KV`.

| Tab | Purpose |
|-----|---------|
| Flash catalog | Live flash status + link to Flash Catalog admin |
| Product library | Review Z9GO (z9go.com) links for site `ibamboo` |
| Conbal | Origin + site key + health probe |
| Avatars | Edit house persona avatars (KV; storefront still ships vibes.ts until wired) |
| Editor in Chief | System prompt, demeanor, audience, language, guardrails, targeting categories |

### Google OAuth setup

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → create **OAuth 2.0 Client ID** (Web application).
2. Authorized redirect URIs:
   - `https://ibamboo.com/api/admin/auth/google/callback`
   - `https://ibamboo.tech-bf6.workers.dev/api/admin/auth/google/callback` (optional)
3. Secrets:

```bash
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put ADMIN_ALLOWED_EMAILS   # e.g. you@gmail.com,ops@example.com
npx wrangler secret put ADMIN_SESSION_SECRET  # recommended
# optional break-glass:
npx wrangler secret put ADMIN_PASSWORD
```

API: `/api/admin/*` (see `worker/admin.ts`). OAuth start: `GET /api/admin/auth/google`.  
Activity log: `GET /api/admin/audit` (auth required) — logins, denials, logouts, config saves in KV `audit_log` (ring buffer, last 500).  

**Google allowlist:** after Google returns a verified email, the Worker checks it against `ADMIN_ALLOWED_EMAILS` (comma-separated, case-insensitive). Not on the list → access denied + audit entry.  

Not a public merch CMS yet.

## Git / PR workflow

- Do **not** push feature work straight to `main` for non-trivial changes.
- Use a feature branch, open a PR to `main`, then:
  1. **Adversarial code review** — spawn one or more review subagents on the PR
     diff whose explicit job is to find bugs, regressions, security issues, and
     missing affiliate tags (see "Review focus areas"). Adversarial mindset:
     assume the change is broken until proven otherwise; verify claims against
     the actual code, not the PR description.
  2. **Resolve** every finding the reviewer marks as a **bug** and have the
     reviewer re-check it; the reviewer's severity call stands unless the
     human overrides.
  3. **Verify** — `/check-work` (build, lint, correctness) and CI green.
  4. **Merge** (squash, matching repo convention) only when review has **no
     open bugs** and verify is **PASS**.
- Per the owner's standing instruction (2026-07-26): the agent **may merge and
  deploy** its own PRs only — but only after the adversarial-review loop above
  has run and passed. Skipping the review loop forfeits merge/deploy authority.
- Never commit secrets: `.env`, credential CSVs, Creators API secrets, tokens.

## Build & quality gates

```bash
npm ci          # clean install (CI)
npm run lint    # oxlint src
npm run build   # tsc -b && vite build
```

All three must pass before merge. Prefer `npm ci` in CI; `npm install` is fine locally.

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

- Deploy only after merge to `main` per the Git/PR workflow above (or when the human explicitly requests a deploy from a branch).
- `npm run deploy` = build + `wrangler deploy`.
- Custom domain is configured in `wrangler.jsonc`; do not casually change worker/domain names.


## Buyer-intent guides (`/guides`)

Money-keyword bamboo home jobs (board care, prep, bath humidity, swaps, picnic, entry, desk, hosting, dinnerware, utensils).

- **Data:** `src/data/buyerGuides.ts`
- **Pages:** `BuyerGuides.tsx` hub, `BuyerGuide.tsx` listicle
- **SEO:** `buyerGuidesHubSeo` / `buyerGuideSeo` + route-meta + sitemap
- **Skill:** `~/.grok/skills/affiliate-buyer-guides`
- Calm natural living voice; separate from `/gifts`

## Gift guides (SEO listicles)

Avatar-locked bamboo gift guides at `/gifts` and `/gifts/:slug`.

- **Skill:** `~/.grok/skills/affiliate-gifting-seo` (`/affiliate-gifting-seo`)
- **Data:** `src/data/giftGuides.ts` — catalog-backed `productEntries` only
- **Pages:** `Gifts.tsx` hub, `GiftGuide.tsx` listicle
- **SEO:** ItemList + FAQPage via `giftsHubSeo` / `giftGuideSeo`; sitemap + routeMeta
- **Heroes:** reuse brand category / vibe / flatlay art (`heroImage` paths) until dedicated `/brand/gifts/` assets exist
- **Voice:** calm natural living; prefer role (host, couple, new home) over forced gender
- **Rules:** original prose; `giftWhy` ≠ PDP paste; footer disclosure only; no Conbal unless integrated

Wave-1 slugs: `housewarming-gifts`, `gifts-for-the-host`, `kitchen-gifts`, `eco-friendly-gifts`, `christmas-home-gifts`.

## Product page enrichment

PDPs should be **destinations** (judgment + depth), not thin Amazon hops.

- **Rules:** `docs/PRODUCT-ENRICHMENT-RULES.md` (network standard; iBamboo voice = calm natural living)
- **Data:** `src/data/productEnrichments.ts` via `getProductEnrichment(slug)`
- **UI:** `src/components/ProductEnrichment.tsx` on `Product.tsx` (after specs / why; before similar)
- **SEO:** `productSeo(product, enrichment?)` appends FAQPage JSON-LD; `scripts/route-meta.ts` must call it **with** enrichment so raw HTML has FAQ schema
- **AEO crawler body:** `productSeo` / `buyerGuidesHubSeo` / `buyerGuideSeo` attach `crawler`; Worker injects `<article id="aeo-main">` immediately before `#root` (`html.js` clip/sr-only, never `display:none`)
- **Non-negotiable:** original prose only (research → synthesize). No Associate-tag chrome on-page; tag only in buy `href`
- **Coverage:** every ASIN SKU should have enrichment **or** a tracked GitHub issue for backlog
- Research helper (optional): copy skill script → `scripts/research-product-enrichment.mjs` + TinyFish key

## Review focus areas

When reviewing PRs, prioritize:

1. Broken build / type errors / lint failures
2. Affiliate tag missing or wrong
3. Catalog regressions (empty categories, missing images, bad ASINs)
4. Secrets or `.env` leakage
5. Unrelated drive-by refactors
6. Enrichment originality (no pasted Amazon/competitor copy); FAQPage in routeMeta for enriched PDPs

Nits on style are optional; bugs block merge.

## Federated product library (Z9GO)

iBamboo is a **consumer** of the network product library at **https://z9go.com** (Z9GO). Z9GO is source of truth for **curated** active SKUs / URL health. BSR weekly stays fenced (`src/data/products.bsr.generated.ts` is not a default inbound or write-back path).

```bash
export Z9GO_LIBRARY_URL=https://z9go.com   # optional; this is the default
export Z9GO_LIBRARY_TOKEN=…               # ADMIN_API_TOKEN on Z9GO

# Cadence
npm run library:sync:curated   # write-back curated products.ts → Z9GO
# then Z9GO health cron/run (fetch_status ok/partial/blocked)
npm run library:pull:dry       # report keep/hide/inbound; no sidecar write
npm run library:pull           # overwrite src/data/z9go-gate.json (enabled)
```

- Client: `scripts/lib/kyasi-library.mjs` (`listSiteCatalog` / `listSiteCatalogAll`)
- Write-back: `scripts/sync-from-library.mjs` — default `PRODUCT_FILES=src/data/products.ts` (override via env). `imagesMode: replace`; no library→catalog image pull.
- Pull: `scripts/pull-from-library.mjs` — gated catalog sidecar `src/data/z9go-gate.json`. Does **not** rewrite `products.ts`. v1 inbound ASINs are listed only.
- Shop gate: `src/data/z9goGate.ts` + `catalog.ts`. Missing / `enabled: false` = fail-open. Checked-in default is disabled empty ASINs. BSR / `limitedTime` skip the gate.
- Docs: `docs/KYASI-LIBRARY.md`
- Associate tag stays in site config / buy URLs only — never in library payloads.
