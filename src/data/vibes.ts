import type { Category } from './types'
import { PERSONAS, type Persona } from './quiz'

export type VibeStat = { label: string; value: number; max?: number }

export type VibeProfile = Persona & {
  /** Short type chip, Pokémon-style */
  typeLabel: string
  rarity: string
  emoji: string
  flavor: string
  traits: string[]
  powers: { name: string; detail: string }[]
  benefits: string[]
  catchphrase: string
  stats: VibeStat[]
  gradient: string
  cardBg: string
  shopHint: string
}

export const VIBES: Record<string, VibeProfile> = {
  craft: {
    ...PERSONAS.craft,
    typeLabel: 'Culinary · Grain',
    rarity: 'House Classic',
    emoji: '🪵',
    flavor:
      'When the knife hits the board, the whole kitchen exhales. You don’t “decorate” the counter—you outfit it.',
    catchphrase: 'Built for the burners.',
    traits: [
      'Decisive prep energy',
      'Loves a solid board under the wrist',
      'Allergic to flimsy tools',
      'Weeknight hero, weekend host',
    ],
    powers: [
      {
        name: 'Edge Respect',
        detail: 'Knife-kind surfaces that keep your blades happier longer.',
      },
      {
        name: 'Heat of the Moment',
        detail: 'Utensils that can live by the stove without drama.',
      },
      {
        name: 'Meal-Prep Aura',
        detail: 'Everything within reach when dinner is non-negotiable.',
      },
    ],
    benefits: [
      'Warm grain that elevates everyday cooking',
      'Pieces that earn permanent counter real estate',
      'Natural material story you can feel in the hand',
      'Pairs perfectly with this week’s limited drop',
    ],
    stats: [
      { label: 'Craft', value: 95 },
      { label: 'Calm', value: 55 },
      { label: 'Host', value: 70 },
      { label: 'Order', value: 60 },
    ],
    gradient: 'from-[#2c4f25] via-[#3f6b35] to-[#7a9e5a]',
    cardBg: 'from-[#f6f3eb] via-[#ebe6d9] to-[#dce8d4]',
    shopHint: 'Load up boards, spoons, and kitchen essentials.',
  },
  ritual: {
    ...PERSONAS.ritual,
    typeLabel: 'Spa · Soft Fiber',
    rarity: 'Serenity Rare',
    emoji: '🕯️',
    flavor:
      'You treat the bath like a small temple. Steam, soft light, and surfaces that don’t shout.',
    catchphrase: 'Reset is a material choice.',
    traits: [
      'Slow-morning loyalist',
      'Texture-first shopper',
      'Quiet luxury instinct',
      'Plant-forward bath shelf',
    ],
    powers: [
      {
        name: 'Steam Sanctuary',
        detail: 'Bamboo that softens the vanity and bath counter.',
      },
      {
        name: 'Exhale Mode',
        detail: 'Ritual objects that make the pause feel intentional.',
      },
      {
        name: 'Soft Armor',
        detail: 'Skin-kind textiles and gentle holders for daily care.',
      },
    ],
    benefits: [
      'Spa energy without a remodel',
      'Warm wood against cool tile and porcelain',
      'A calmer start and end to the day',
      'Gifts that feel personal, not generic',
    ],
    stats: [
      { label: 'Craft', value: 45 },
      { label: 'Calm', value: 98 },
      { label: 'Host', value: 40 },
      { label: 'Order', value: 65 },
    ],
    gradient: 'from-[#0f3d3a] via-[#1e5a52] to-[#4a9b8c]',
    cardBg: 'from-[#eef6f4] via-[#e4f0ed] to-[#d5e8e4]',
    shopHint: 'Bath trays, holders, and soft-touch bamboo.',
  },
  focus: {
    ...PERSONAS.focus,
    typeLabel: 'Clarity · Order',
    rarity: 'Focus Elite',
    emoji: '📐',
    flavor:
      'Your desk is a landing pad, not a junk drawer with Wi‑Fi. Grain, height, and order = deep work.',
    catchphrase: 'Clear surface. Clear mind.',
    traits: [
      'Systems thinker',
      'Hates visual noise',
      'Morning ritual: clear the deck',
      'Buys once, keeps forever',
    ],
    powers: [
      {
        name: 'Signal Boost',
        detail: 'Risers and stands that lift the work to a better angle.',
      },
      {
        name: 'Drawer Zen',
        detail: 'Organizers that turn chaos into quiet compartments.',
      },
      {
        name: 'Focus Field',
        detail: 'Warm materials that ground you without plastic clutter.',
      },
    ],
    benefits: [
      'A workspace that feels intentional',
      'Less friction starting deep work',
      'Natural texture next to screens',
      'Order that still looks human',
    ],
    stats: [
      { label: 'Craft', value: 50 },
      { label: 'Calm', value: 75 },
      { label: 'Host', value: 35 },
      { label: 'Order', value: 96 },
    ],
    gradient: 'from-[#2d3748] via-[#4a5568] to-[#718096]',
    cardBg: 'from-[#f0f2f5] via-[#e8ebef] to-[#dde3ea]',
    shopHint: 'Desk stands, caddies, and calm organizers.',
  },
  host: {
    ...PERSONAS.host,
    typeLabel: 'Gather · Serve',
    rarity: 'Social Legend',
    emoji: '🥂',
    flavor:
      'You set the table like a love language. Boards, bowls, patio light—the night starts before the first pour.',
    catchphrase: 'The table is the invitation.',
    traits: [
      'Born host energy',
      'Loves a long board of shared plates',
      'Outdoor optional, vibe mandatory',
      'Guests leave happier than they arrived',
    ],
    powers: [
      {
        name: 'Board Presence',
        detail: 'Serving surfaces that steal the middle of the table.',
      },
      {
        name: 'Patio Glow',
        detail: 'Outdoor-ready pieces for open-air evenings.',
      },
      {
        name: 'Share Mode',
        detail: 'Generous forms that make family-style easy.',
      },
    ],
    benefits: [
      'Hosting that looks effortless',
      'Warm wood against candlelight and linen',
      'Works indoors and al fresco',
      'Conversation-starting centerpieces',
    ],
    stats: [
      { label: 'Craft', value: 65 },
      { label: 'Calm', value: 50 },
      { label: 'Host', value: 97 },
      { label: 'Order', value: 45 },
    ],
    gradient: 'from-[#7c2d12] via-[#b45309] to-[#d97706]',
    cardBg: 'from-[#fff7ed] via-[#ffedd5] to-[#fed7aa]',
    shopHint: 'Serving boards, tabletop, and outdoor gather gear.',
  },
  nest: {
    ...PERSONAS.nest,
    typeLabel: 'Gentle · First Meals',
    rarity: 'Tender Edition',
    emoji: '🪺',
    flavor:
      'Tiny humans, soft edges, no harsh plastics if you can help it. Mealtime should feel safe and a little magical.',
    catchphrase: 'Small hands. Kind materials.',
    traits: [
      'Protective caretaker energy',
      'Chooses gentle forms first',
      'Loves a calm mealtime ritual',
      'Gifts that feel thoughtful',
    ],
    powers: [
      {
        name: 'Soft Edge',
        detail: 'Shapes scaled for first spoons and tiny plates.',
      },
      {
        name: 'Nest Shield',
        detail: 'Natural materials for the most sensitive routines.',
      },
      {
        name: 'Joy Bite',
        detail: 'Warm wood that makes everyday meals feel special.',
      },
    ],
    benefits: [
      'Mealtime gear that feels kind',
      'Beautiful enough for the adult table too',
      'A calmer first-foods era',
      'Memorable gifts for new nests',
    ],
    stats: [
      { label: 'Craft', value: 40 },
      { label: 'Calm', value: 85 },
      { label: 'Host', value: 55 },
      { label: 'Order', value: 50 },
    ],
    gradient: 'from-[#3f6b35] via-[#7a9e5a] to-[#a3c585]',
    cardBg: 'from-[#f4f7ef] via-[#e8f0dc] to-[#d9e8c8]',
    shopHint: 'Little plates, spoons, and gentle kitchen helpers.',
  },
}

export const VIBE_LIST = Object.values(VIBES)

export function getVibe(id: string | undefined): VibeProfile | undefined {
  if (!id) return undefined
  return VIBES[id]
}

export function vibePath(id: string) {
  return `/vibe/${id}`
}

export const VIBE_STORAGE_KEY = 'ibamboo-vibe-id'

export function readStoredVibeId(): string | null {
  try {
    return localStorage.getItem(VIBE_STORAGE_KEY)
  } catch {
    return null
  }
}

export function writeStoredVibeId(id: string) {
  try {
    localStorage.setItem(VIBE_STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
}

export function roomLinks(categories: Category[]) {
  return categories.map((c) => ({ cat: c }))
}
