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

export const FACT_EDITORIAL_TYPES = [
  'did_you_know', 'fun_fact', 'nature_note', 'culture_craft', 'material_myth',
] as const satisfies readonly EditorialType[]
export const DESIGN_EDITORIAL_TYPES = [
  'design_note', 'fun_fact', 'culture_craft', 'nature_note', 'did_you_know',
] as const satisfies readonly EditorialType[]
export const MATERIAL_EDITORIAL_TYPES = [
  'material_myth', 'did_you_know', 'nature_note', 'fun_fact', 'design_note',
] as const satisfies readonly EditorialType[]
export const CARE_EDITORIAL_TYPES = [
  'care_tip', 'did_you_know', 'nature_note', 'material_myth', 'fun_fact',
] as const satisfies readonly EditorialType[]
export const CRAFT_EDITORIAL_TYPES = [
  'culture_craft', 'design_note', 'did_you_know', 'fun_fact', 'nature_note',
] as const satisfies readonly EditorialType[]

/** Compact routes share the responsive factual pool to retain a full reload buffer. */
export function editorialTypesForTier(
  _tier: ViewportTier,
  specialized: readonly EditorialType[],
): readonly EditorialType[] {
  return specialized
}

export type BalloonRole =
  | 'inline-note'
  | 'section-break'
  | 'grid-tile'
  | 'aside-note'

export type BalloonBudget = 'compact-v1' | 'standard-v1'

export type BalloonSlot = {
  anchor: string
  ariaLabel: string
  budget: BalloonBudget
  editorialTypes: readonly EditorialType[]
  layout?: BalloonLayout
  priority?: number
  role: BalloonRole
  section: string
  size: ConbalSize
  topics: string[]
}

export type BalloonCandidate = Omit<BalloonSlot, 'budget' | 'role' | 'section'> & {
  budget?: BalloonBudget
  role?: BalloonRole
  section?: string
}

export type BalloonLayout =
  | 'inline'
  | 'panel'
  | 'product-card'
  | 'banner'
  | 'rail'
  | 'fixed'

export type TieredCreative = {
  compact: ConbalSize
  tablet?: ConbalSize
  desktop?: ConbalSize
  wide?: ConbalSize
}

export type BalloonPlanInput = {
  candidates: BalloonCandidate[]
  featureGroups?: number
  interactiveSteps?: number
  itemCount?: number
  mediaBlocks?: number
  narrativeSections?: number
  maxPlacements?: number
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
  const compatibleCandidates = uniqueSemanticSections(
    input.candidates.map(normalizeCandidate).filter(isLayoutCompatible),
  )
  const density =
    (input.narrativeSections || 0) * 2 +
    (input.featureGroups || 0) +
    Math.ceil((input.itemCount || 0) / 6) +
    (input.mediaBlocks || 0) +
    Math.floor((input.interactiveSteps || 0) / 2)
  const requested = Math.min(
    input.maxPlacements ?? MAX_BALLOONS,
    Math.max(MIN_BALLOONS, 2 + Math.floor(density / 3)),
  )
  const count = Math.min(requested, compatibleCandidates.length)
  const slots = evenlyDistributed(compatibleCandidates, count)
  const signature = JSON.stringify({
    routeKey: input.routeKey,
    slots: slots.map(({ anchor, budget, layout = 'inline', role, section, size, topics, editorialTypes }) => ({
      anchor,
      budget,
      layout,
      role,
      section,
      size,
      topics,
      editorialTypes,
    })),
  })

  return { routeKey: input.routeKey, signature, slots }
}

/** Fluid host layouts fail closed instead of centering a fixed ad-size canvas. */
export function isLayoutCompatible(candidate: BalloonCandidate) {
  const slot = normalizeCandidate(candidate)
  const layout = slot.layout || 'inline'
  if (slot.role === 'grid-tile' && layout !== 'product-card') return false
  if (slot.role !== 'grid-tile' && layout === 'product-card') return false
  if (['inline', 'panel', 'product-card'].includes(layout)) {
    return slot.size === 'responsive'
  }
  if (layout === 'banner') {
    return ['responsive', '728x90', '320x100'].includes(slot.size)
  }
  if (layout === 'rail') {
    return ['responsive', '160x600'].includes(slot.size)
  }
  return true
}

function normalizeCandidate(candidate: BalloonCandidate): BalloonSlot {
  const layout = candidate.layout || 'inline'
  const role = candidate.role || (layout === 'product-card'
    ? 'grid-tile'
    : layout === 'panel'
      ? 'section-break'
      : 'inline-note')
  return {
    ...candidate,
    budget: candidate.budget || (role === 'grid-tile' || role === 'aside-note' ? 'compact-v1' : 'standard-v1'),
    role,
    section: candidate.section || candidate.anchor,
  }
}

/** A page may expose multiple candidate anchors, but only one can own a section. */
function uniqueSemanticSections(items: BalloonSlot[]) {
  const sections = new Set<string>()
  return items.filter((item) => {
    if (sections.has(item.section)) return false
    sections.add(item.section)
    return true
  })
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
