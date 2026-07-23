# Vibe Check welcome email — deliverability notes

## Goal

Moderate-richness post-quiz email that feels personal (vibe result) without looking like bulk promo.

## Rules we ship with

| Rule | Implementation |
|------|----------------|
| Relationship first | Lead with persona result; shop is secondary |
| Link budget | 2 content links: `/vibe/{id}` + one room shop |
| No Amazon URLs | Affiliate path stays on-site |
| Subject | `Your Bamboo Vibe: {Title}` — no FREE / ACT NOW / ALL CAPS / emoji spam |
| Images | One first-party avatar only; text stands alone |
| HTML | Table shell, inline CSS, system fonts |
| Plain text | `message` field sent alongside `html` |
| Escape dynamics | All persona fields HTML-escaped |
| Opt-in only | Worker sends only when `marketingOptIn !== false` |

## Cloudflare Email + GHL checklist (ops)

Primary transport is **Cloudflare Email Sending** (`hello@ibamboo.com`). GHL remains CRM; GHL mail is fallback only.

1. **Domain:** `npx wrangler email sending enable ibamboo.com` (done) + DNS for `cf-bounce` (see [cloudflare-email.md](./cloudflare-email.md)).
2. **From name:** `iBamboo` / `hello@ibamboo.com` (wrangler `vars`).
3. **SPF + DKIM** on `cf-bounce.ibamboo.com`; **DMARC** on apex.
4. **List-Unsubscribe** header set in Worker send (`https://ibamboo.com/quiz`).
5. **Physical address:** add to HTML footer or your legal pages for CAN-SPAM if not already on site.
6. After deploy, send a real opt-in test to Gmail + Outlook and check **Promotions vs Primary**.

## What we intentionally skip (rich → later nurture)

- Product grids / multi-Amazon deep links  
- Day-in-the-life essays, stats bars, full shopping lists  
- Limited-drop as a second fat button (can be email #2)  
- Scene images + logo + avatar stacks  

## Content source

`worker/vibeEmailContent.ts` — email-safe subset of site vibes (duplicated on purpose so the Worker stays self-contained).
