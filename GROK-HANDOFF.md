# Grok handoff: Amazon Creators API status

Last checked: 2026-07-21

## Completed

- Created the Amazon Creators API application `iBamboo` (`iu0e3-20.ibamboo`) under Associates Store ID `iu0e3-20`.
- Generated a North America v3.1 credential.
- Stored the credential ID and one-time secret only in the local, gitignored `.env`.
- Confirmed the v3.1 Login with Amazon client-credentials token request succeeds.
- Added `scripts/bsr/creators-client.mjs` with token caching, GetItems batching (10 ASINs), retry/backoff, and product mapping.
- Updated the weekly importer to prefer official Creators API enrichment while keeping the limited-time weekly-drop behavior intact.

## Current roadblock

The OAuth token succeeds, but the first catalog request for an existing iBamboo ASIN returns:

```text
HTTP 403
reason: AssociateNotEligible
message: Your account does not currently meet the eligibility requirements.
type: AccessDeniedException
```

Amazon's Creators API page says PA API catalog access requires at least 10 qualifying sales during the past 30 days. It may also take up to 48 hours after credential creation for eligibility review, but the Associates account did not appear to have the required recent sales volume when tested.

## Behavior until eligibility is granted

- The importer attempts Creators GetItems first.
- Only when Amazon returns `AssociateNotEligible`, it reports the block and temporarily uses product-page enrichment (when available).
- **Short-term images:** BSR/search list cards supply real `images-na.ssl-images-amazon.com` / `media-amazon.com/images/I/…` URLs (not the broken `images/P/{ASIN}` pattern). Brand art under `/public/brand/` is the final fallback.
- Other Creators API errors still fail visibly instead of silently falling back.
- Once GetItems succeeds, the fallback is bypassed automatically; no integration rewrite should be necessary.

## What to test next

After the account reaches Amazon's qualifying-sales requirement (and after any review window):

1. Run `npm run import:bsr`.
2. Confirm there is no `AssociateNotEligible` warning.
3. Confirm GetItems returns real titles, images, offers/prices, and browse-node sales ranks.
4. Run `npm run build`.
5. Deploy only after reviewing the regenerated weekly catalog.

Do not commit `.env`, credential CSV files, access tokens, or the Creators credential secret.
