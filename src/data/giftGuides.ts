/**
 * iBamboo gift guides — avatar-locked bamboo home listicles.
 * Catalog-backed only. Original prose. Calm natural living voice.
 * Prefer role (host / couple / new home) over forced gender.
 */
import type { GiftGuide, GiftOccasionId, GiftRecipientId } from './types'

const U = '2026-08-02'
const P = '2026-08-02'

const AMAZON_FAQ = {
  q: 'Will it arrive in time, and can they return it?',
  a: 'Shipping speed and Prime eligibility depend on the live Amazon listing and seller. Returns follow Amazon’s policies for that order. iBamboo shows typical street prices; always confirm delivery dates and return windows on Amazon before you buy.',
}

export const giftGuides: GiftGuide[] = [
  {
    slug: 'housewarming-gifts',
    title: 'Housewarming Gifts in Bamboo',
    dek: 'Boards, trays, plates, and kitchen tools that make a new place feel inhabited — not staged.',
    primaryQuery: 'housewarming gifts bamboo',
    recipientIds: ['new-home', 'couple', 'friend'],
    occasionIds: ['housewarming', 'wedding', 'just-because'],
    budgetBands: ['under-50', '50-150'],
    heroImage: '/brand/categories/dining.webp',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    intro:
      'A housewarming gift should survive the first dinner, not decorate the entry for a week. Bamboo earns its keep: warm under the hand, honest grain, light enough to use every day. This list stays on the iBamboo shelf — prep boards, serving pieces, plates, and utensils that say the kitchen is open.',
    productEntries: [
      {
        productSlug: 'grand-prep-board',
        rank: 1,
        priceBand: 'under-50',
        badge: 'Anchor gift',
        giftWhy:
          'The board that makes a bare counter feel like a kitchen. Generous surface for chopping and plating; the kind of object new homeowners actually reach for on week one. Safe when you know they cook even a little.',
      },
      {
        productSlug: 'nesting-board-set',
        rank: 2,
        priceBand: 'under-50',
        giftWhy:
          'Three sizes that stack cleanly — ideal when cabinet space is still a question. Feels considered without requiring a huge footprint. Pair with a note about oiling once a month.',
      },
      {
        productSlug: 'dinner-plate-set-of-four',
        rank: 3,
        priceBand: 'under-50',
        badge: 'Table-ready',
        giftWhy:
          'Four plates that set a first real meal without mismatched thrift finds. Bamboo fiber reads calm and modern; confirm care notes on the listing if their dishwasher habits are aggressive.',
      },
      {
        productSlug: 'artisan-cooking-utensil-set',
        rank: 4,
        priceBand: 'under-50',
        badge: 'Everyday yes',
        giftWhy:
          'The practical core of a house gift: spoons and spatulas that live in a crock, not a drawer of regret. Low risk, high use. Perfect when the budget is tight but the intent is warm.',
      },
      {
        productSlug: 'handled-serving-tray',
        rank: 5,
        priceBand: 'under-50',
        giftWhy:
          'Coffee to the couch, cheese to the patio, mail off the counter. A tray is hospitality hardware. Choose this when they already own a board and need carry energy.',
      },
      {
        productSlug: 'woven-placemat-set',
        rank: 6,
        priceBand: 'under-50',
        giftWhy:
          'Soft structure for a table that is still learning its rhythm. Texture without fuss. Works as a standalone under-$25 gift or as a pair with plates.',
      },
      {
        productSlug: 'entry-key-tray',
        rank: 7,
        priceBand: 'under-50',
        giftWhy:
          'The “home has a place for things” gift. Small, useful, and hard to get wrong. Ideal stocking-stuffer tier next to a bigger board.',
      },
      {
        productSlug: 'coaster-set-with-caddy',
        rank: 8,
        priceBand: 'under-50',
        giftWhy:
          'Protects the first real table without plastic coasters. Complete with a caddy so it does not scatter. Quiet gift that still feels finished.',
      },
    ],
    sections: [
      {
        heading: 'Who this list is for',
        body: 'People walking into a new address — renters and owners — who will cook, host once, or simply want fewer plastic objects on the counter. Skip if they asked for pure art or already stocked a full kitchen from a registry.',
      },
      {
        heading: 'How to choose in sixty seconds',
        body: 'They cook → board + utensils. They host → tray or placemats. Bare bones everything → plate set or the utensil set first. Budget under $25? Key tray, coasters, or the utensil set alone still lands as intentional.',
      },
    ],
    faq: [
      AMAZON_FAQ,
      {
        q: 'Is bamboo a good housewarming material?',
        a: 'Yes when the gift is something they will touch daily — boards, utensils, trays. Bamboo reads natural without looking temporary. Avoid novelty bamboo gadgets; stick to kitchen and table workhorses.',
      },
      {
        q: 'What if they already have a cutting board?',
        a: 'Shift to serving (tray, lazy susan on the host guide), a plate set, or bath/eco picks. Nested boards still help when they only own one undersized board.',
      },
      {
        q: 'Why buy through iBamboo instead of searching Amazon yourself?',
        a: 'We curate a short list with house judgment and product pages that explain fit. You still check out on Amazon with normal shipping and returns. We may earn a referral commission on qualifying purchases.',
      },
    ],
  },
  {
    slug: 'gifts-for-the-host',
    title: 'Gifts for the Host',
    dek: 'Charcuterie, serving, lazy Susan energy — tools for people who set the table for others.',
    primaryQuery: 'gifts for the host',
    recipientIds: ['host', 'couple', 'friend'],
    occasionIds: ['hosting', 'christmas', 'birthday', 'just-because'],
    budgetBands: ['under-50', '50-150'],
    heroImage: '/brand/vibes/host-scene.webp',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    intro:
      'Hosts do not need another scented candle. They need surfaces and tools that make feeding people easier: a board that carries a spread, a turntable that keeps sides in reach, cheese tools that do not bend. This list is pure hosting hardware from the iBamboo catalog — calm grain, real use, no party gimmicks.',
    productEntries: [
      {
        productSlug: 'charcuterie-host-set',
        rank: 1,
        priceBand: 'under-50',
        badge: 'Thank-you gift',
        giftWhy:
          'Board plus accessories in one gesture — the gift that says you noticed they always feed the room. Self-contained for a dinner party thank-you. Confirm included tools on the live listing.',
      },
      {
        productSlug: 'charcuterie-board',
        rank: 2,
        priceBand: 'under-50',
        giftWhy:
          'When they already own knives and bowls, give them a better stage. Dual-sided utility for prep and serve. The classic host upgrade without clutter.',
      },
      {
        productSlug: 'lazy-susan-turntable',
        rank: 3,
        priceBand: 'under-50',
        badge: 'Table hero',
        giftWhy:
          'Passes sauces and sides without standing up. Feels generous on a crowded table. Best for hosts who run family-style meals or game nights with shared plates.',
      },
      {
        productSlug: 'handled-serving-tray',
        rank: 4,
        priceBand: 'under-50',
        giftWhy:
          'From kitchen island to living room in one trip. Handles matter when the tray is loaded. Pair with a bottle if you want the gift to feel complete the same night.',
      },
      {
        productSlug: 'soft-cheese-spreader-set',
        rank: 5,
        priceBand: 'under-50',
        giftWhy:
          'Small spend, high host polish. Soft cheeses stop fighting plastic knives. Excellent add-on when the main gift is a board or host set.',
      },
      {
        productSlug: 'serving-spoon-and-fork',
        rank: 6,
        priceBand: 'under-50',
        giftWhy:
          'Salad bowls and family dishes deserve dedicated servers. Quiet, useful, and hard to duplicate poorly. Safe coworker or “thanks for dinner” tier.',
      },
      {
        productSlug: 'family-salad-bowl',
        rank: 7,
        priceBand: '50-150',
        badge: 'Statement piece',
        giftWhy:
          'The center of the table when greens are the side. Larger presence; confirm they have shelf height. Splurge energy without leaving bamboo territory.',
      },
      {
        productSlug: 'condiment-dish-set',
        rank: 8,
        priceBand: 'under-50',
        giftWhy:
          'Dips, olives, finishing salts — separated instead of piled on one plate. Looks intentional for cocktail hour. Under-$20 finish for a bigger host gift.',
      },
    ],
    sections: [
      {
        heading: 'Dinner party vs everyday host',
        body: 'Dinner-party hosts light up for the charcuterie set, lazy Susan, and salad bowl. Everyday hosts — weeknight open-door energy — prefer the tray and serving utensils. When unsure, the host set or a solid board is the broadest yes.',
      },
      {
        heading: 'Skip if',
        body: 'They already run a full entertaining kit and asked for wine or experiences. They never serve food at home. They want pure décor with zero kitchen function — this list is workhorse hosting, not shelf sculpture.',
      },
    ],
    faq: [
      AMAZON_FAQ,
      {
        q: 'What is the safest thank-you gift for a host?',
        a: 'A charcuterie host set or handled tray ranks highest: useful the next time they open the door. Cheese spreaders win when budget is tight.',
      },
      {
        q: 'Should I bring food too?',
        a: 'Hardware plus something edible is classic. If you only bring one thing, choose the tool that outlasts the evening — boards and trays stay after the cheese is gone.',
      },
      {
        q: 'Is a lazy Susan too personal?',
        a: 'Only if their table is tiny or they never share plates. When they host family-style, it reads as practical care, not presumption.',
      },
    ],
  },
  {
    slug: 'kitchen-gifts',
    title: 'Kitchen Gifts in Bamboo',
    dek: 'Utensils, boards, and the knife-block insert — tools for people who actually cook.',
    primaryQuery: 'bamboo kitchen gifts',
    recipientIds: ['cook', 'couple', 'self', 'friend'],
    occasionIds: ['birthday', 'christmas', 'wedding', 'just-because'],
    budgetBands: ['under-50', '50-150'],
    heroImage: '/brand/categories/kitchen.webp',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    intro:
      'Kitchen gifts fail when they are cute. They work when they replace a warping plastic spatula or a scarred scrap of plastic board. Bamboo is kind to cookware, light in the hand, and honest about what it is. Every pick here is a real tool from the iBamboo kitchen and board shelves.',
    productEntries: [
      {
        productSlug: 'artisan-cooking-utensil-set',
        rank: 1,
        priceBand: 'under-50',
        badge: 'Starter kit',
        giftWhy:
          'The gift that retires a drawer of melted plastic. Six tools, one grain language. Highest odds of daily use for anyone with a stovetop.',
      },
      {
        productSlug: 'grand-prep-board',
        rank: 2,
        priceBand: 'under-50',
        badge: 'Prep anchor',
        giftWhy:
          'Cooks run out of board space before they run out of recipes. A generous prep board is permission to cook more. Confirm dimensions against their sink and cabinet depth.',
      },
      {
        productSlug: 'universal-knife-block-insert',
        rank: 3,
        priceBand: 'under-50',
        giftWhy:
          'When the knives are good and the storage is chaos. Bamboo insert calms a drawer or block setup without forcing a full block purchase. Only if you know their knife count roughly fits.',
      },
      {
        productSlug: 'slim-spatula-trio',
        rank: 4,
        priceBand: 'under-50',
        giftWhy:
          'Eggs, fish, nonstick pans — thin edges matter. A focused trio for cooks who already own bulkier spoons. Excellent under-$20 kitchen gift.',
      },
      {
        productSlug: 'end-grain-butcher-block',
        rank: 5,
        priceBand: 'under-50',
        giftWhy:
          'For the cook who cares about edge life. End grain is a statement of seriousness. Heavier than a thin board — skip for tiny apartments with no counter real estate.',
      },
      {
        productSlug: 'bakers-rolling-pin',
        rank: 6,
        priceBand: 'under-50',
        giftWhy:
          'Pie, pasta, cookies — one tool that outlives a holiday. Best when you have seen them bake once. Otherwise stick to utensils and boards.',
      },
      {
        productSlug: 'locking-kitchen-tongs',
        rank: 7,
        priceBand: 'under-50',
        giftWhy:
          'Grilling, pasta, salad, toast retrieval. Locking jaws travel and store cleanly. Unsexy, used weekly — the gift cooks quietly thank you for.',
      },
      {
        productSlug: 'soup-ladle',
        rank: 8,
        priceBand: 'under-50',
        giftWhy:
          'Broth, chili, punch — a proper ladle ends the era of coffee mugs as servers. Simple, complete, easy to wrap with a soup mix if you want.',
      },
    ],
    sections: [
      {
        heading: 'New cook vs seasoned cook',
        body: 'New cooks need the utensil set and a solid prep board. Seasoned cooks already own basics — lean knife insert, end-grain block, slim spatulas, or a rolling pin if they bake. Never gift a full set that duplicates what lives in their crock without checking.',
      },
      {
        heading: 'Care honesty',
        body: 'Bamboo kitchen tools want hand wash and dry time. If the recipient only runs the dishwasher, say so in the note and pick pieces they will still hand-rinse, or choose fiber dinnerware with clearer care labels on Amazon.',
      },
    ],
    faq: [
      AMAZON_FAQ,
      {
        q: 'What is the single best bamboo kitchen gift?',
        a: 'A full utensil set or a generous prep board. Both hit daily use. Add tongs or a ladle when they already own those two.',
      },
      {
        q: 'Will bamboo utensils scratch my pans?',
        a: 'Quality bamboo is gentler than metal on nonstick and enamel. Still avoid using any hard tool as a scraper on damaged coatings — technique matters more than material marketing.',
      },
      {
        q: 'Can I gift kitchen tools for a wedding?',
        a: 'Yes when the couple cooks. Frame it as “for the first real kitchen,” not as a joke. Pair board + utensils for a complete starter without registry clutter.',
      },
    ],
  },
  {
    slug: 'eco-friendly-gifts',
    title: 'Eco-Friendly Bamboo Gifts',
    dek: 'Bath and kitchen everyday swaps — real catalog pieces that replace plastic without the lecture.',
    primaryQuery: 'eco friendly bamboo gifts',
    recipientIds: ['eco-minded', 'friend', 'self', 'coworker'],
    occasionIds: ['birthday', 'christmas', 'just-because', 'housewarming'],
    budgetBands: ['under-50'],
    heroImage: '/brand/categories/bath.webp',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 5,
    intro:
      'Eco gifts fail when they are symbolic junk. They work when they replace something already in the bathroom or kitchen drawer. This list is only what iBamboo actually sells: bamboo toothbrushes, cotton swabs, soap dishes, everyday utensils, and small travel pieces. Material truth over greenwashing slogans.',
    productEntries: [
      {
        productSlug: 'soft-bristle-toothbrush-set',
        rank: 1,
        priceBand: 'under-50',
        badge: 'Daily swap',
        giftWhy:
          'The most honest eco gift: they will use it twice a day. Set format means the gift lasts past week one. Soft bristles suit most adults; check listing for firmness if they are particular.',
      },
      {
        productSlug: 'bamboo-cotton-swabs',
        rank: 2,
        priceBand: 'under-50',
        giftWhy:
          'A drawer upgrade with zero learning curve. Low cost, high “they thought about plastic” signal without a sermon. Bundle with the toothbrush set for a bath kit under $20.',
      },
      {
        productSlug: 'artisan-cooking-utensil-set',
        rank: 3,
        priceBand: 'under-50',
        badge: 'Kitchen swap',
        giftWhy:
          'Replaces a nest of plastic utensils with one coherent bamboo set. Eco story meets real cooking. The gift that lives by the stove, not in a “green” cabinet of unused gadgets.',
      },
      {
        productSlug: 'slatted-soap-dish',
        rank: 4,
        priceBand: 'under-50',
        giftWhy:
          'Lets bar soap dry instead of melting into sludge. Small bathroom object with daily presence. Pairs cleanly with the toothbrush stand for a sink vignette.',
      },
      {
        productSlug: 'toothbrush-stand',
        rank: 5,
        priceBand: 'under-50',
        giftWhy:
          'Keeps bamboo brushes upright and drying. Completes the oral-care swap so the gift feels designed, not incomplete. Skip if they already have a closed holder they love.',
      },
      {
        productSlug: 'reusable-chopstick-set',
        rank: 6,
        priceBand: 'under-50',
        giftWhy:
          'For takeout nights and noodle bowls at home. Reusable without being preachy. Good coworker or Secret Santa tier with a clear use case.',
      },
      {
        productSlug: 'safety-razor-handle',
        rank: 7,
        priceBand: 'under-50',
        giftWhy:
          'A longer game than disposable plastic razors — blades are consumable, the handle is not. Only if they are open to a slight learning curve; include a note to buy blades separately.',
      },
      {
        productSlug: 'cutlery-travel-roll',
        rank: 8,
        priceBand: 'under-50',
        giftWhy:
          'Lunch bags, picnics, desk drawers. Portable utensils that cut single-use plastic on the go. Best for commuters and outdoor days, not for homebody cooks who never leave.',
      },
    ],
    sections: [
      {
        heading: 'What “eco” means on this list',
        body: 'We mean objects made of bamboo that replace a plastic habit — not carbon-offset certificates or mystery “biodegradable” packs. Bristles, packaging, and blade systems still have end-of-life steps; read the Amazon listing for disposal notes. Honesty is part of the gift.',
      },
      {
        heading: 'How to gift without preaching',
        body: 'Lead with use (“for your sink,” “for the stove”), not virtue. Bundle bath pieces as a “quiet morning kit.” Kitchen swaps stand alone. Avoid lecture cards; the material is the message.',
      },
    ],
    faq: [
      AMAZON_FAQ,
      {
        q: 'Are bamboo toothbrushes fully compostable?',
        a: 'Handles are typically compostable or easier to recycle than full plastic brushes; nylon bristles often need removal first. Check the specific listing. Frame the gift as a better daily tool, not perfect zero-waste.',
      },
      {
        q: 'What is the best under-$15 eco gift?',
        a: 'Toothbrush set, cotton swabs, soap dish, or chopsticks. All clear, usable, and hard to misread as clutter.',
      },
      {
        q: 'Can I gift this to someone who is not “into eco”?',
        a: 'Yes if the object is simply better — a good utensil set or soap dish. Skip the safety razor and travel roll for people who dislike change; start with kitchen or soft oral care.',
      },
    ],
  },
  {
    slug: 'christmas-home-gifts',
    title: 'Christmas Home Gifts in Bamboo',
    dek: 'A seasonal mix of host and kitchen picks — gifts that earn a place after the wrapping paper is gone.',
    primaryQuery: 'christmas bamboo home gifts',
    recipientIds: ['host', 'couple', 'friend', 'cook', 'new-home'],
    occasionIds: ['christmas', 'black-friday', 'just-because'],
    budgetBands: ['under-50', '50-150'],
    heroImage: '/brand/products-flatlay.webp',
    publishedAt: P,
    updatedAt: U,
    readMinutes: 6,
    seasonal: { peakMonths: [11, 12], yearHint: 2026 },
    intro:
      'Christmas home gifts should still make sense in January. Bamboo boards, host sets, plates, and a few everyday swaps do that work: warm under winter light, useful when guests leave. This list mixes the best host and kitchen energy from the iBamboo catalog — no novelty snowflake gadgets.',
    productEntries: [
      {
        productSlug: 'charcuterie-host-set',
        rank: 1,
        priceBand: 'under-50',
        badge: 'Holiday table',
        giftWhy:
          'December entertaining is the brief. A full host set arrives ready for cheese night and leftovers day. The gift they open and use before New Year’s.',
      },
      {
        productSlug: 'grand-prep-board',
        rank: 2,
        priceBand: 'under-50',
        badge: 'Cook’s Christmas',
        giftWhy:
          'Holiday prep multiplies board demand. A large prep surface is empathy for the person cooking. Wrap with a good olive oil for finishing if you want ceremony.',
      },
      {
        productSlug: 'dinner-plate-set-of-four',
        rank: 3,
        priceBand: 'under-50',
        giftWhy:
          'Sets the Christmas table without china anxiety. Four places for a small feast; stack for guest overflow. Calm material in a season of sparkle.',
      },
      {
        productSlug: 'artisan-cooking-utensil-set',
        rank: 4,
        priceBand: 'under-50',
        giftWhy:
          'The reliable stocking-to-main-gift bridge. Everyone who cooks can use better utensils. Easy to ship, easy to love, hard to return out of politeness.',
      },
      {
        productSlug: 'lazy-susan-turntable',
        rank: 5,
        priceBand: 'under-50',
        giftWhy:
          'Family-style Christmas dinner and leftover grazing both improve when the table spins. Fun without being a toy. Best for multi-generation tables.',
      },
      {
        productSlug: 'nesting-board-set',
        rank: 6,
        priceBand: 'under-50',
        giftWhy:
          'Three boards for holiday multi-tasking — bread, veg, serving. Nested storage matters when the kitchen is already full of seasonal gear.',
      },
      {
        productSlug: 'soft-bristle-toothbrush-set',
        rank: 7,
        priceBand: 'under-50',
        badge: 'Stocking',
        giftWhy:
          'Small, useful, and on-brand for the eco-minded branch of the tree. Bundle with cotton swabs for a complete stocking. Not the headline gift — the smart filler.',
      },
      {
        productSlug: 'handled-serving-tray',
        rank: 8,
        priceBand: 'under-50',
        giftWhy:
          'Cookies to the living room, drinks to the porch lights. Trays earn their keep all December. Pair with the host set when you want a full entertaining story.',
      },
    ],
    sections: [
      {
        heading: 'Christmas 2026 timing',
        body: 'Order early if you need Prime delivery certainty — December traffic is real. This guide’s product set is evergreen; refresh the intro and seasonal badge each November rather than inventing new novelty SKUs.',
      },
      {
        heading: 'How to match the recipient',
        body: 'They host → charcuterie set, lazy Susan, tray. They cook → grand board, utensils, nesting boards. New home or couple → plates + utensils. Stocking only → toothbrush set. When the list is long, one excellent board beats three forgettable gadgets.',
      },
    ],
    faq: [
      AMAZON_FAQ,
      {
        q: 'What is the best last-minute Christmas bamboo gift?',
        a: 'Utensil set, toothbrush set, or cheese spreaders if still in stock with two-day shipping. Confirm the live delivery promise on Amazon before you promise the recipient.',
      },
      {
        q: 'Is bamboo “too everyday” for Christmas?',
        a: 'Everyday is the point. Holiday gifts that become January tools feel more generous than décor that bags for storage. Add a handwritten note; material does the rest.',
      },
      {
        q: 'Can I mix host and kitchen gifts?',
        a: 'Yes — a board plus a tray, or utensils plus a host set, tells a complete house story. Keep total pieces few so wrapping stays calm.',
      },
    ],
  },
]

const bySlug = new Map(giftGuides.map((g) => [g.slug, g]))

export function getGiftGuide(slug: string): GiftGuide | undefined {
  return bySlug.get(slug)
}

export function guidesForProduct(productSlug: string): GiftGuide[] {
  return giftGuides.filter((g) =>
    g.productEntries.some((e) => e.productSlug === productSlug),
  )
}

export function guidesForOccasion(occasion: GiftOccasionId): GiftGuide[] {
  return giftGuides.filter((g) => g.occasionIds.includes(occasion))
}

export function guidesForRecipient(recipient: GiftRecipientId): GiftGuide[] {
  return giftGuides.filter((g) => g.recipientIds.includes(recipient))
}

export function featuredGiftGuides(limit = 5): GiftGuide[] {
  const month = new Date().getMonth() + 1
  const scored = giftGuides.map((g) => {
    const seasonalBoost = g.seasonal?.peakMonths.includes(month) ? 100 : 0
    const updated = g.updatedAt || g.publishedAt
    return { g, score: seasonalBoost + (updated >= U ? 10 : 0) }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, limit).map((x) => x.g)
}

export const BUDGET_LABELS: Record<string, string> = {
  'under-50': 'Under $50',
  '50-150': '$50–150',
  '150-400': '$150–400',
  splurge: 'Splurge',
}

export const RECIPIENT_LABELS: Record<string, string> = {
  host: 'For the host',
  couple: 'For couples',
  friend: 'For a friend',
  self: 'For yourself',
  coworker: 'Coworker',
  'new-home': 'New home',
  cook: 'For cooks',
  'eco-minded': 'Eco-minded',
}
