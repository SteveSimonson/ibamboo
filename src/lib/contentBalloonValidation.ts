import type { ConbalSize } from '../components/ConbalBalloon'
import type { BalloonLayout, BalloonPlan, EditorialType } from './balloonPlan'

export type ContentBalloonPayload = {
  css?: string
  editorial_type?: EditorialType
  html: string
  layout?: BalloonLayout
  size?: ConbalSize
  slug?: string
}

export type ContentBalloonDeck = Record<string, ContentBalloonPayload>

/** Fail closed on partial, duplicate, mismatched, or malformed public payloads. */
export function validatedContentBalloonDeck(
  plan: BalloonPlan,
  received: unknown,
): ContentBalloonDeck {
  if (!received || typeof received !== 'object' || Array.isArray(received)) return {}
  const source = received as ContentBalloonDeck
  const knownSlugs = new Set<string>()
  return Object.fromEntries(plan.slots.flatMap((slot) => {
    const item = source[slot.anchor]
    if (
      !item ||
      typeof item.html !== 'string' ||
      item.size !== slot.size ||
      !item.slug ||
      knownSlugs.has(item.slug) ||
      !item.editorial_type ||
      (item.layout !== undefined && item.layout !== (slot.layout || 'inline')) ||
      !slot.editorialTypes.includes(item.editorial_type)
    ) return []
    knownSlugs.add(item.slug)
    return [[slot.anchor, item]]
  })) as ContentBalloonDeck
}
