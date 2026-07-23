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

## GHL / domain checklist (ops)

1. **SPF + DKIM + DMARC** on the GHL sending domain (location email settings).
2. **From name:** `iBamboo` (not “Deals” / “Shop now”).
3. **Physical address** must appear in the GHL email footer (CAN-SPAM). Confirm location address is set so GHL injects it.
4. **List-Unsubscribe** header / unsub link — confirm GHL injects automatically.
5. After deploy, send a real opt-in test to Gmail + Outlook and check **Promotions vs Primary**.

## What we intentionally skip (rich → later nurture)

- Product grids / multi-Amazon deep links  
- Day-in-the-life essays, stats bars, full shopping lists  
- Limited-drop as a second fat button (can be email #2)  
- Scene images + logo + avatar stacks  

## Content source

`worker/vibeEmailContent.ts` — email-safe subset of site vibes (duplicated on purpose so the Worker stays self-contained).
