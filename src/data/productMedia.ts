/**
 * Optional rich media attached to specific products by slug or ASIN.
 * Kept separate from weekly BSR generation so imports do not wipe videos.
 */
import type { Product } from './types'

type MediaOverlay = Pick<
  Product,
  'featureVideo' | 'featureVideoPoster' | 'featureVideoCaption'
>

/** Keyed by ASIN (preferred) or slug */
export const productMediaByAsin: Record<string, MediaOverlay> = {
  // #1 Amazon BSR bamboo cutting boards — hero lifestyle feature clip
  B0D2P1HSCV: {
    featureVideo: '/videos/royal-craft-cutting-boards.mp4',
    featureVideoPoster: '/videos/royal-craft-cutting-boards-poster.jpg',
    featureVideoCaption:
      'Morning light on solid bamboo — the prep board that earns its place on the counter.',
  },
}

export function withProductMedia(product: Product): Product {
  const byAsin = product.asin ? productMediaByAsin[product.asin] : undefined
  if (!byAsin) return product
  return { ...product, ...byAsin }
}
