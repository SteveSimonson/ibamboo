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
