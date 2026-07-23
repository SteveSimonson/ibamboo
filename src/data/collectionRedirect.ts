import type { Category } from './types'

/**
 * Map legacy merch "collection" query values → room category.
 * Used only for URL redirects after dual-filter removal (P0).
 */
const COLLECTION_TO_CAT: Record<string, Category> = {
  kitchen: 'kitchen',
  boards: 'cutting-boards',
  'boards-serving': 'cutting-boards',
  tabletop: 'dining',
  dining: 'dining',
  bath: 'bath',
  'bath-body': 'bath',
  organize: 'organization',
  organization: 'organization',
  workspace: 'desk',
  desk: 'desk',
  outdoor: 'outdoor',
  garden: 'outdoor',
  'little-ones': 'baby',
  baby: 'baby',
  entertaining: 'dining',
  'tea-ritual': 'kitchen',
  'grill-party': 'outdoor',
  'grill-&-party': 'outdoor',
  home: 'organization',
  bedding: 'bath',
}

export function resolveCollectionToCategory(
  collectionId: string | null | undefined,
): Category | null {
  if (!collectionId) return null
  const key = collectionId.toLowerCase().replace(/\s+/g, '-')
  return COLLECTION_TO_CAT[key] ?? null
}
