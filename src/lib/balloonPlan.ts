import type { ConbalSize } from '../components/ConbalBalloon'
import type { ViewportTier } from '../hooks/useViewportTier'

export type EditorialType =
  | 'did_you_know'
  | 'fun_fact'
  | 'care_tip'
  | 'design_note'
  | 'material_myth'
  | 'nature_note'
  | 'culture_craft'

export const ALL_EDITORIAL_TYPES: readonly EditorialType[] = [
  'did_you_know',
  'fun_fact',
  'care_tip',
  'design_note',
  'material_myth',
  'nature_note',
  'culture_craft',
]

export type BalloonSlot = {
  anchor: string
  ariaLabel: string
  editorialTypes: readonly EditorialType[]
  minHeight?: number
  size: ConbalSize
  topics: string[]
}

export type TieredCreative = {
  compact: ConbalSize
  tablet?: ConbalSize
  desktop?: ConbalSize
  wide?: ConbalSize
}

export type BalloonPlanInput = {
  candidates: BalloonSlot[]
  featureGroups?: number
  interactiveSteps?: number
  itemCount?: number
  mediaBlocks?: number
  narrativeSections?: number
  routeKey: string
  tier?: ViewportTier
}

export type BalloonPlan = {
  routeKey: string
  signature: string
  slots: BalloonSlot[]
}

const MIN_BALLOONS = 3
const MAX_BALLOONS = 8
const MAX_BALLOONS_BY_TIER: Record<ViewportTier, number> = {
  compact: 4,
  tablet: 6,
  desktop: MAX_BALLOONS,
  wide: MAX_BALLOONS,
}

/** Resolve the creative requested at a breakpoint, inheriting smaller tiers. */
export function sizeForTier(tier: ViewportTier, creative: TieredCreative): ConbalSize {
  if (tier === 'wide') return creative.wide || creative.desktop || creative.tablet || creative.compact
  if (tier === 'desktop') return creative.desktop || creative.tablet || creative.compact
  if (tier === 'tablet') return creative.tablet || creative.compact
  return creative.compact
}

/** Keep existing scalar slots compatible while allowing page plans to resolve a creative. */
export function withTieredSize(slot: BalloonSlot, tier: ViewportTier, creative?: TieredCreative): BalloonSlot {
  return creative ? { ...slot, size: sizeForTier(tier, creative) } : slot
}

/**
 * Select a small, evenly distributed editorial deck from semantic page units.
 * The page supplies its safe anchors: this deliberately does not inspect the
 * DOM, where interactive controls and commerce actions would be indistinct.
 */
export function deriveBalloonPlan(input: BalloonPlanInput): BalloonPlan {
  const tier = input.tier || 'compact'
  const density =
    (input.narrativeSections || 0) * 2 +
    (input.featureGroups || 0) +
    Math.ceil((input.itemCount || 0) / 6) +
    (input.mediaBlocks || 0) +
    Math.floor((input.interactiveSteps || 0) / 2)
  const requested = Math.max(
    MIN_BALLOONS,
    Math.min(MAX_BALLOONS_BY_TIER[tier], 2 + Math.floor(density / 3)),
  )
  const count = Math.min(requested, input.candidates.length)
  // iBamboo's editorial bands are deliberately general. A broad type request
  // prevents a narrowly labelled anchor from starving a healthy content pool.
  const slots = evenlyDistributed(input.candidates, count).map((slot) => ({
    ...slot,
    editorialTypes: ALL_EDITORIAL_TYPES,
  }))
  const signature = JSON.stringify({
    routeKey: input.routeKey,
    tier,
    slots: slots.map(({ anchor, size, topics, editorialTypes }) => ({
      anchor,
      size,
      topics,
      editorialTypes,
    })),
  })

  return { routeKey: input.routeKey, signature, slots }
}

function evenlyDistributed<T>(items: T[], count: number): T[] {
  if (count >= items.length) return items
  if (count <= 1) return items.slice(0, count)
  const indexes = new Set<number>()
  for (let index = 0; index < count; index += 1) {
    indexes.add(Math.round((index * (items.length - 1)) / (count - 1)))
  }
  // Rounding can collide only with pathological inputs; retain page order.
  for (let index = 0; indexes.size < count && index < items.length; index += 1) {
    indexes.add(index)
  }
  return [...indexes].sort((a, b) => a - b).map((index) => items[index])
}

export function hasBalloonAnchor(plan: BalloonPlan, anchor: string) {
  return plan.slots.some((slot) => slot.anchor === anchor)
}
