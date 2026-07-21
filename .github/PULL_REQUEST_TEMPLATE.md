## Summary

<!-- What changed and why (2–5 bullets). -->

-

## Type of change

- [ ] Catalog / BSR / limited-time drops
- [ ] UI / storefront
- [ ] Scripts / importer / Creators API
- [ ] Infra / CI / docs
- [ ] Other

## Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Affiliate tag still applied (`iu0e3-20` or env)
- [ ] No secrets (`.env`, credentials) in the diff
- [ ] If catalog changed: categories still look complete; images are real CDN URLs where possible

## Deploy

- [ ] No deploy needed
- [ ] Deploy to production after merge (`npm run deploy`)

## Agent gate

- [ ] `/review --pr` (or code review agent) — no open **bugs**
- [ ] `/check-work` (or testing agent) — **PASS**
- [ ] Merge recommended only when both are green
