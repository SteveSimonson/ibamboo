# Product page enrichment rules (network)

Reusable rule set for **Amazon-affiliate catalog PDPs** (Kyasi, Adazo, iBamboo, Mr Cuts, SurgiSyn, Chrome Cave, …). Goal: every product page is a **destination** for searchers—not a thin affiliate hop.

**Agent skill (full deploy playbook for other repos):**  
`~/.grok/skills/product-page-enrichment/SKILL.md` — slash `/product-page-enrichment`

## Thesis

Discover and decide **here**. Buy **on Amazon**. We own judgment, synthesis, and structure. Amazon owns inventory, price, shipping, and checkout.

## Non-negotiables

1. **Original prose only.** Never copy Amazon bullets, competitor reviews, or RTINGS/Wirecutter text. Research → synthesize → write in house voice.
2. **Honest caveats.** Always include `skipIf` / caveats. Trust compounds conversion.
3. **Footer affiliate disclosure only.** No Associate-tag UI, ASIN badges, or “we earn commission” banners mid-page. Keep Buy on Amazon CTAs.
4. **Tag stays on links** (`tag=…` in href only). Never print the tracking ID on-page.
5. **Ratings are approximate.** Star ratings and review counts from public consensus / listing snapshots; label “approx.” and tell shoppers to confirm on Amazon.
6. **No medical / safety guarantees** on care/medical catalogs. Editorial, not clinical.
7. **Sources optional, never paywalled dumps.** May list “research notes” (site names) without pasting full articles.
8. **Enrichment is optional at render.** Missing enrichment → page still works with core catalog fields.

## Content blocks (priority order)

| Block | Required | Purpose | SEO / engagement |
|-------|----------|---------|------------------|
| **Review snapshot** | Yes | Verdict + love themes + caveats | Answer “is it good?” above the fold-ish |
| **Best for / Skip if** | Yes | Fit filter in 2 lists | Reduces bounce, builds trust |
| **Item blog** (long-form) | Yes | 3–5 original sections | Ranking depth, dwell time |
| **FAQ** | Yes (≥4) | Buyer objections | FAQPage JSON-LD |
| **Setup / first-week tips** | Prefer | Post-click utility | Engagement, return visits |
| **Compared on this site** | Prefer | Links to sibling SKUs | Internal links, kit completion |
| **Specs table** | Core catalog | Confirm details | Product schema |
| **Buy on Amazon** | Core | Conversion | Multiple CTAs, sticky mobile |

### Review snapshot schema

```ts
reviewSnapshot: {
  verdict: string            // 1–2 sentences, house voice
  love: string[]             // 3–5 buyer/expert themes (paraphrased)
  caveats: string[]          // 2–4 honest caveats
  bestFor: string[]          // 2–4 personas / use cases
  skipIf: string[]           // 2–4 “not for you if…”
  ratingNote?: string        // e.g. “~4.6 from tens of thousands of Amazon ratings”
}
```

### Item blog schema

```ts
blog: {
  title: string              // H2-worthy, search-aware, not clickbait spam
  dek: string                // 1-line deck under title
  sections: {
    heading: string
    body: string             // 80–180 words, paragraphs OK (use \n\n)
  }[]                        // 3–5 sections
}
```

**Blog section pattern (default):**

1. Who this is really for  
2. What it does better (or differently) than the obvious alternatives  
3. Living with it (comfort, battery, app, quirks)  
4. Trade-offs / what we checked before listing  
5. Optional: care, setup, or “when to wait for a deal”

### FAQ rules

- ≥4, ≤8 questions.
- Answers 40–90 words, plain language.
- At least one FAQ about **price variance / Amazon listing**, one about **who should skip**, one about **fit vs a sibling** when catalog has a peer.
- No keyword-stuffed Qs. Natural questions real shoppers ask.

## Voice by brand (swap per site)

| Site | Voice |
|------|--------|
| **Kyasi** | Don Draper × premium tech: short, confident, no fluff. Desire first. |
| **Adazo** | Warm Riviera / beauty editorial. Sensory, never clinical hype. |
| **iBamboo** | Calm natural living. Material truth over gadget hype. |
| **Mr Cuts** | Groomed, fit, sharp. Male lifestyle without bro-speak. |
| **SurgiSyn** | Calm caregiver. Clarity over cleverness. Not medical advice. |
| **Chrome Cave** | Gamer den competence. Spec-smart, not toxic. |

## Research pipeline (TinyFish)

Free path preferred:

1. **`search`** (3 queries per SKU):  
   - `{name} review pros cons worth buying`  
   - `{name} RTINGS Wirecutter CNET review` (or category peers)  
   - `{name} amazon customer reviews common complaints praise`
2. **`fetch_content`** top 4–8 editorial URLs (prefer RTINGS, Wirecutter, CNET, Verge, PCMag, SoundGuys, etc.).  
   Amazon PDP often bot-blocks—optional, never required.
3. **Synthesize** into schema. Cite mental sources; do not paste.
4. **Store** as static data (`productEnrichments.ts` or JSON) keyed by `productId` / `slug`.
5. **Refresh** when listing changes, major model revision, or quarterly content pass.

Metered automation (`run_web_automation`) only when interaction is required (e.g. expand review facets). Prefer search + fetch.

## Quality bar (ship checklist)

- [ ] Every SKU with an ASIN has enrichment **or** explicit `todo` backlog issue  
- [ ] Verdict does not repeat tagline verbatim  
- [ ] Caveats exist and are specific (not “price may vary” only)  
- [ ] Blog ≥3 sections (prefer 4–5); flagship SKUs ≥250 words body, accessories ≥120  
- [ ] FAQ ≥4 with FAQPage JSON-LD  
- [ ] Internal links to 1–2 similar products where catalog allows  
- [ ] No Associate tag / ASIN chrome in UI  
- [ ] Buy on Amazon still primary CTA  
- [ ] Build + SEO verify pass after content ship  

## What not to do

- Thin pages: title + Amazon button + scraped bullets  
- Fake “Verified Purchase” quotes  
- Invented lab measurements  
- Medical claims, cure language, absolute safety guarantees  
- Stuffing brand + model into every sentence  
- Duplicating the same blog across similar SKUs with only the name swapped  

## Porting to another site

1. Copy enrichment types + `getEnrichment(slug)` helper.  
2. Copy Product page sections (or shared component package).  
3. Swap voice table + category FAQ seeds.  
4. Run TinyFish research batch for that catalog.  
5. Author enrichment file; ship via PR gate.

## Success metrics (post-ship)

- Organic landings on `/product/*` (impressions + CTR)  
- Dwell time / scroll depth on PDPs  
- Amazon click rate **after** scroll past blog (intent quality)  
- FAQ expand events (if instrumented)
