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

- [ ] Adversarial review subagent(s) run on the diff — bugs resolved & re-checked by the reviewer
- [ ] `/check-work` (or testing agent) — **PASS**; CI green
- [ ] Squash-merge permitted only when all of the above are green
