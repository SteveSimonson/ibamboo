import type { ConbalSize } from '../components/ConbalBalloon'
import type {
  BalloonBudget,
  BalloonLayout,
  BalloonPlan,
  BalloonRole,
  EditorialType,
} from './balloonPlan'

export type ContentBalloonPayload = {
  assignment_id?: string
  budget?: BalloonBudget
  content?: {
    body: string
    headline: string
  }
  css?: string
  editorial_type?: EditorialType
  html?: string
  layout?: BalloonLayout
  role?: BalloonRole
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
      (!item.content && typeof item.html !== 'string') ||
      (item.size !== undefined && item.size !== slot.size) ||
      !item.slug ||
      knownSlugs.has(item.slug) ||
      !item.editorial_type ||
      (item.role !== undefined && item.role !== slot.role) ||
      (item.budget !== undefined && item.budget !== slot.budget) ||
      (item.layout !== undefined && item.layout !== (slot.layout || 'inline')) ||
      !slot.editorialTypes.includes(item.editorial_type) ||
      (item.content && (
        typeof item.content.headline !== 'string' ||
        typeof item.content.body !== 'string' ||
        !item.content.headline.trim() ||
        !item.content.body.trim() ||
        item.content.headline.length > (slot.budget === 'compact-v1' ? 48 : 72) ||
        item.content.body.length > (slot.budget === 'compact-v1' ? 110 : 180)
      ))
    ) return []
    knownSlugs.add(item.slug)
    return [[slot.anchor, item]]
  })) as ContentBalloonDeck
}
