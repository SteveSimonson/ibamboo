import { collections, CATEGORY_LABELS } from './catalog'
import type { Category } from './types'

export type CollectionHeroContent = {
  id: string
  label: string
  blurb: string
  /** Soft default room — not enforced in filter */
  relatedCategory?: Category
}

const RELATED: Record<string, Category> = {
  kitchen: 'kitchen',
  boards: 'cutting-boards',
  tabletop: 'dining',
  bath: 'bath',
  organize: 'organization',
  workspace: 'desk',
  outdoor: 'outdoor',
  'little-ones': 'baby',
  entertaining: 'dining',
  'tea-ritual': 'kitchen',
  'grill-party': 'outdoor',
  'grill-&-party': 'outdoor',
  garden: 'outdoor',
}

export function getCollectionHero(
  collectionId: string | null | undefined,
): CollectionHeroContent | null {
  if (!collectionId) return null
  const id = collectionId.toLowerCase()
  const found = collections.find((c) => c.id === id)
  if (!found) return null
  return {
    id: found.id,
    label: found.label,
    blurb: found.blurb,
    relatedCategory: RELATED[found.id],
  }
}

export function categoryDisplayName(cat: string | null | undefined): string | null {
  if (!cat || !(cat in CATEGORY_LABELS)) return null
  return CATEGORY_LABELS[cat as Category]
}
