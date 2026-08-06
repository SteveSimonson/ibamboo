export type Category =
  | 'kitchen'
  | 'cutting-boards'
  | 'dining'
  | 'bath'
  | 'organization'
  | 'desk'
  | 'outdoor'
  | 'baby'

export interface ProductSpec {
  label: string
  value: string
}

export type MaterialFamily =
  | 'solid-bamboo'
  | 'bamboo-fiber'
  | 'bamboo'
  | 'other'

export type ProductSource =
  | 'curated'
  | 'amazon-bsr'
  | 'amazon-search'

export interface Product {
  id: string
  slug: string
  name: string
  /** Short marketing line under the title */
  tagline: string
  description: string
  category: Category
  /** Merchandising collection */
  collection: string
  brand?: string
  material: string
  features: string[]
  /** Structured specs for the PDP table */
  specs: ProductSpec[]
  /** Display price (Amazon retail varies) */
  priceHint: number
  /** Compare-at / list price for strikethrough when set */
  listPrice?: number
  asin?: string
  searchKeywords: string
  badge?: string
  /** Primary + gallery images (Amazon CDN, brand, or photography) */
  images: string[]
  /** True only when every secondary image came from an ASIN-scoped trusted API. */
  imageGalleryVerified?: boolean
  rating?: number
  reviewCount?: number
  hue: number
  /**
   * Weekly BSR drop — marketed as limited-time options.
   * Refreshed by `npm run import:bsr`.
   */
  limitedTime?: boolean
  /** ISO date (Monday) of the week this listing belongs to */
  weekOf?: string
  /** When this drop is expected to rotate */
  expiresAt?: string
  /** Rank on the Amazon Best Sellers list (1–100) when from BSR */
  bsrRank?: number
  /** Human label of BSR category, e.g. "Cutting Boards" */
  bsrCategory?: string
  bsrCategoryId?: string
  materialFamily?: MaterialFamily
  source?: ProductSource
  /** Optional lifestyle feature video (public path, e.g. /videos/foo.mp4) */
  featureVideo?: string
  /** Poster frame for the feature video */
  featureVideoPoster?: string
  /** Short line under the video */
  featureVideoCaption?: string
}

/** Long-form PDP enrichment (review snapshot, item blog, FAQ). */
export interface EnrichmentSection {
  heading: string
  body: string
}

export interface EnrichmentFaq {
  q: string
  a: string
}

export interface ProductEnrichment {
  productId: string
  slug: string
  /** ISO date of last editorial pass */
  updatedAt: string
  reviewSnapshot: {
    verdict: string
    love: string[]
    caveats: string[]
    bestFor: string[]
    skipIf: string[]
    /** e.g. “~4.6 from thousands of Amazon ratings (approx.)” */
    ratingNote?: string
  }
  blog: {
    title: string
    dek: string
    sections: EnrichmentSection[]
  }
  faq: EnrichmentFaq[]
  setupTips?: string[]
  /** Site names only — not full articles */
  researchNotes?: string[]
}

/** Gift guide listicles — avatar-locked, catalog-backed. See AGENTS.md. */
export type GiftRecipientId =
  | 'host'
  | 'couple'
  | 'friend'
  | 'self'
  | 'coworker'
  | 'new-home'
  | 'cook'
  | 'eco-minded'

export type GiftOccasionId =
  | 'christmas'
  | 'housewarming'
  | 'birthday'
  | 'wedding'
  | 'hosting'
  | 'just-because'
  | 'black-friday'

export type GiftBudgetBand = 'under-50' | '50-150' | '150-400' | 'splurge'

export interface GiftGuideProductEntry {
  productSlug: string
  rank?: number
  /** Why this works as a gift — not a PDP paste */
  giftWhy: string
  priceBand?: GiftBudgetBand
  badge?: string
}

export interface GiftGuideSection {
  heading: string
  body: string
}

export interface GiftGuideFaq {
  q: string
  a: string
}

export interface GiftGuide {
  slug: string
  title: string
  dek: string
  primaryQuery: string
  recipientIds: GiftRecipientId[]
  occasionIds: GiftOccasionId[]
  budgetBands: GiftBudgetBand[]
  productEntries: GiftGuideProductEntry[]
  intro: string
  sections: GiftGuideSection[]
  faq: GiftGuideFaq[]
  heroImage?: string
  publishedAt: string
  updatedAt: string
  seasonal?: {
    peakMonths: number[]
    yearHint?: number
  }
  readMinutes?: number
}


/** Buyer-intent job guides — money keywords, catalog-backed (not gift avatars) */
export interface BuyerGuideProductEntry {
  productSlug: string
  rank?: number
  /** Why this fits the job — original prose */
  pickWhy: string
  badge?: string
}

export interface BuyerGuideSection {
  heading: string
  body: string
}

export interface BuyerGuideFaq {
  q: string
  a: string
}

export interface BuyerGuide {
  slug: string
  title: string
  dek: string
  primaryQuery: string
  category: Category
  productEntries: BuyerGuideProductEntry[]
  intro: string
  sections: BuyerGuideSection[]
  faq: BuyerGuideFaq[]
  hardNo?: string
  heroImage?: string
  publishedAt: string
  updatedAt: string
  readMinutes?: number
}
