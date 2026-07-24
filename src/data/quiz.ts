import type { Category } from './types'

const ALL_CATEGORIES: Category[] = [
  'kitchen',
  'cutting-boards',
  'dining',
  'bath',
  'organization',
  'desk',
  'outdoor',
  'baby',
]

export type QuizOption = {
  id: string
  label: string
  emoji: string
  blurb: string
  /** Category scores */
  scores: Partial<Record<Category, number>>
  personaBoost?: string
}

export type QuizQuestion = {
  id: string
  prompt: string
  sub?: string
  options: QuizOption[]
}

export type Persona = {
  id: string
  title: string
  tagline: string
  story: string
  categories: Category[]
  accent: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'room',
    prompt: 'Where should bamboo show up first?',
    sub: 'Pick the room that makes you grin.',
    options: [
      {
        id: 'kitchen',
        label: 'The kitchen',
        emoji: '🍳',
        blurb: 'Chop, stir, serve — warm tools at arm’s reach.',
        scores: { kitchen: 3, 'cutting-boards': 2, dining: 1 },
        personaBoost: 'craft',
      },
      {
        id: 'bath',
        label: 'The bath',
        emoji: '🛁',
        blurb: 'Soft fiber, quiet counters, spa energy.',
        scores: { bath: 4 },
        personaBoost: 'ritual',
      },
      {
        id: 'desk',
        label: 'The desk',
        emoji: '💻',
        blurb: 'Calm focus, tidy cables, elevated workday.',
        scores: { desk: 4, organization: 1 },
        personaBoost: 'focus',
      },
      {
        id: 'whole-home',
        label: 'Everywhere',
        emoji: '🌿',
        blurb: 'A full-house bamboo through-line.',
        scores: {
          kitchen: 1,
          bath: 1,
          desk: 1,
          organization: 2,
          outdoor: 1,
        },
        personaBoost: 'host',
      },
    ],
  },
  {
    id: 'weekend',
    prompt: 'Ideal weekend energy?',
    sub: 'No wrong answers — only vibes.',
    options: [
      {
        id: 'host',
        label: 'Hosting friends',
        emoji: '🥂',
        blurb: 'Boards, platters, and table moments.',
        scores: { dining: 3, 'cutting-boards': 2, outdoor: 1 },
        personaBoost: 'host',
      },
      {
        id: 'ritual',
        label: 'Slow self-care',
        emoji: '🕯️',
        blurb: 'Bath trays, soft towels, unhurried mornings.',
        scores: { bath: 3 },
        personaBoost: 'ritual',
      },
      {
        id: 'focus',
        label: 'Deep work',
        emoji: '📓',
        blurb: 'Clean desk, clear mind.',
        scores: { desk: 3, organization: 2 },
        personaBoost: 'focus',
      },
      {
        id: 'outdoors',
        label: 'Outside time',
        emoji: '☀️',
        blurb: 'Patio plates, garden tools, open air.',
        scores: { outdoor: 4, dining: 1 },
        personaBoost: 'patio',
      },
    ],
  },
  {
    id: 'texture',
    prompt: 'Which texture pulls you in?',
    sub: 'Imagine running your hand over it.',
    options: [
      {
        id: 'grain',
        label: 'Solid grain boards',
        emoji: '🪵',
        blurb: 'Knife-friendly surfaces with natural weight.',
        scores: { 'cutting-boards': 4, kitchen: 1 },
        personaBoost: 'craft',
      },
      {
        id: 'soft',
        label: 'Soft bamboo fiber',
        emoji: '☁️',
        blurb: 'Sheets, towels, skin-kind textiles.',
        scores: { bath: 3 },
        personaBoost: 'ritual',
      },
      {
        id: 'tools',
        label: 'Utensils & tools',
        emoji: '🥄',
        blurb: 'Spoons, tongs, everyday cookware allies.',
        scores: { kitchen: 4 },
        personaBoost: 'craft',
      },
      {
        id: 'storage',
        label: 'Smart storage',
        emoji: '📦',
        blurb: 'Drawers, shelves, calm order.',
        scores: { organization: 4, desk: 1 },
        personaBoost: 'focus',
      },
    ],
  },
  {
    id: 'who',
    prompt: 'Who is this shopping for?',
    sub: 'We’ll bias the recs a little.',
    options: [
      {
        id: 'me',
        label: 'Just me',
        emoji: '✨',
        blurb: 'Treat-yourself bamboo upgrades.',
        scores: { kitchen: 1, bath: 1, desk: 1 },
      },
      {
        id: 'home',
        label: 'Our home',
        emoji: '🏠',
        blurb: 'Shared spaces, shared style.',
        scores: { organization: 2, dining: 2, kitchen: 1 },
        personaBoost: 'host',
      },
      {
        id: 'gift',
        label: 'A gift',
        emoji: '🎁',
        blurb: 'Beautiful, useful, easy to love.',
        scores: { kitchen: 1, 'cutting-boards': 2, bath: 1 },
      },
      {
        id: 'little',
        label: 'Little ones',
        emoji: '👶',
        blurb: 'Gentle first plates and mealtime gear.',
        scores: { baby: 5 },
        personaBoost: 'nest',
      },
    ],
  },
  {
    id: 'word',
    prompt: 'One word for your bamboo era?',
    sub: 'Last step before your vibe reveal.',
    options: [
      {
        id: 'crafted',
        label: 'Crafted',
        emoji: '🛠️',
        blurb: 'Solid, intentional pieces.',
        scores: { 'cutting-boards': 2, kitchen: 2 },
        personaBoost: 'craft',
      },
      {
        id: 'calm',
        label: 'Calm',
        emoji: '🍃',
        blurb: 'Soft edges, soft light.',
        scores: { bath: 2, desk: 1 },
        personaBoost: 'ritual',
      },
      {
        id: 'ordered',
        label: 'Ordered',
        emoji: '📐',
        blurb: 'Everything has a place.',
        scores: { organization: 3, desk: 2 },
        personaBoost: 'focus',
      },
      {
        id: 'playful',
        label: 'Playful',
        emoji: '🎉',
        blurb: 'Hosting energy, easy joy.',
        scores: { dining: 3, outdoor: 1, 'cutting-boards': 1 },
        personaBoost: 'host',
      },
      {
        id: 'open-air',
        label: 'Open-air',
        emoji: '🌿',
        blurb: 'Fresh air is the main room.',
        scores: { outdoor: 4, dining: 1 },
        personaBoost: 'patio',
      },
    ],
  },
]

export const PERSONAS: Record<string, Persona> = {
  craft: {
    id: 'craft',
    title: 'Countertop Craftsperson',
    tagline: 'Boards, utensils, and the heart of the house.',
    story:
      'You cook like you mean it. Bamboo that earns a permanent spot by the stove — knife-kind boards, warm tools, meal-prep ready.',
    categories: ['cutting-boards', 'kitchen', 'dining'],
    accent: '#3f6b35',
  },
  ritual: {
    id: 'ritual',
    title: 'Bath Ritualist',
    tagline: 'Soft fiber, quiet counters, spa at home.',
    story:
      'Your reset button lives in the bath. Bamboo that feels like a slow exhale — trays, holders, and skin-kind textiles.',
    categories: ['bath'],
    accent: '#1e5a52',
  },
  focus: {
    id: 'focus',
    title: 'Focus Nest Builder',
    tagline: 'Desk calm + drawer order.',
    story:
      'Clarity is a material choice. Risers, organizers, and clean lines that keep your workday grounded.',
    categories: ['desk', 'organization'],
    accent: '#4a5568',
  },
  host: {
    id: 'host',
    title: 'Tabletop Host',
    tagline: 'Serving boards, shared plates, candlelight.',
    story:
      'You set the mood for other people. Bamboo that hosts well — charcuterie energy, generous serving, the table as invitation.',
    categories: ['dining', 'cutting-boards', 'kitchen'],
    accent: '#b45309',
  },
  nest: {
    id: 'nest',
    title: 'Little Nest Starter',
    tagline: 'Gentle mealtime for tiny humans.',
    story:
      'First bites deserve soft edges. Bamboo plates, spoons, and trays scaled for little hands.',
    categories: ['baby', 'kitchen'],
    accent: '#7a9e5a',
  },
  patio: {
    id: 'patio',
    title: 'Patio Naturalist',
    tagline: 'Open air, warm grain, evenings that start outside.',
    story:
      'Fresh air is your main room. Bamboo that lives on the deck — trays, outdoor serve, garden-side tools that still look intentional.',
    categories: ['outdoor', 'dining', 'kitchen'],
    accent: '#5a7a3a',
  },
}

/** One curated pick slot: role name + why-line for a persona. */
export type QuizPickSlot = {
  role: string
  categories: Category[]
  why: string
}

/**
 * Named pick roles per persona — variety over six near-identical boards.
 * Used by buildQuizPicks to diversify category + story.
 */
export const PERSONA_PICK_SLOTS: Record<string, QuizPickSlot[]> = {
  host: [
    {
      role: 'Hosting board',
      categories: ['cutting-boards', 'dining'],
      why: 'Generous surface for share plates and graze boards.',
    },
    {
      role: 'Tabletop moment',
      categories: ['dining'],
      why: 'Looks good left out between courses.',
    },
    {
      role: 'Kitchen ally',
      categories: ['kitchen'],
      why: 'Warm tools for prepping the spread.',
    },
    {
      role: 'Gift-ready set',
      categories: ['cutting-boards', 'kitchen'],
      why: 'Beautiful, useful, easy to love as a host gift.',
    },
    {
      role: 'Utensil upgrade',
      categories: ['kitchen'],
      why: 'Everyday host energy at the stove.',
    },
  ],
  craft: [
    {
      role: 'Everyday prep',
      categories: ['cutting-boards'],
      why: 'Knife-kind surface that earns a permanent stove-side spot.',
    },
    {
      role: 'Utensil upgrade',
      categories: ['kitchen'],
      why: 'Tools that feel intentional in the hand.',
    },
    {
      role: 'Serving piece',
      categories: ['dining', 'cutting-boards'],
      why: 'Board energy from prep to plate.',
    },
    {
      role: 'Counter staple',
      categories: ['kitchen'],
      why: 'Warm grain that belongs on the counter, not in a drawer.',
    },
    {
      role: 'Gift-ready craft',
      categories: ['cutting-boards', 'kitchen'],
      why: 'Solid piece for the cook who cares about tools.',
    },
  ],
  ritual: [
    {
      role: 'Bath tray',
      categories: ['bath'],
      why: 'Spa energy for unhurried soaks.',
    },
    {
      role: 'Counter calm',
      categories: ['bath'],
      why: 'Quiet storage that softens the morning rush.',
    },
    {
      role: 'Skin-kind textile',
      categories: ['bath'],
      why: 'Soft bamboo fiber for the reset ritual.',
    },
    {
      role: 'Holder upgrade',
      categories: ['bath', 'organization'],
      why: 'Everything has a calm place by the sink.',
    },
    {
      role: 'Gift-ready ritual',
      categories: ['bath'],
      why: 'Easy to love for anyone who treasures slow evenings.',
    },
  ],
  focus: [
    {
      role: 'Desk calm',
      categories: ['desk'],
      why: 'Clean lines that keep the workday grounded.',
    },
    {
      role: 'Drawer order',
      categories: ['organization'],
      why: 'Everything has a place — no more desk chaos.',
    },
    {
      role: 'Cable tidy',
      categories: ['desk', 'organization'],
      why: 'Elevated workday without the tangle.',
    },
    {
      role: 'Shelf riser',
      categories: ['desk', 'organization'],
      why: 'Lift and separate so focus stays clear.',
    },
    {
      role: 'Gift-ready nest',
      categories: ['desk', 'organization'],
      why: 'Clarity as a material choice for someone you care about.',
    },
  ],
  nest: [
    {
      role: 'First plates',
      categories: ['baby'],
      why: 'Soft edges scaled for little hands.',
    },
    {
      role: 'Mealtime gear',
      categories: ['baby', 'kitchen'],
      why: 'Gentle spoons and trays for first bites.',
    },
    {
      role: 'Parent ally',
      categories: ['kitchen', 'baby'],
      why: 'Warm prep tools that survive the toddler years.',
    },
    {
      role: 'Table starter',
      categories: ['dining', 'baby'],
      why: 'Shared table moments, tiny-human edition.',
    },
    {
      role: 'Gift-ready nest',
      categories: ['baby'],
      why: 'Beautiful, useful, easy to love for new parents.',
    },
  ],
  patio: [
    {
      role: 'Outdoor serve',
      categories: ['outdoor', 'dining'],
      why: 'Deck-ready trays that still look intentional.',
    },
    {
      role: 'Garden-side tool',
      categories: ['outdoor', 'kitchen'],
      why: 'Warm grain for evenings that start outside.',
    },
    {
      role: 'Patio platter',
      categories: ['dining', 'outdoor'],
      why: 'Share plates under open sky.',
    },
    {
      role: 'Open-air upgrade',
      categories: ['outdoor'],
      why: 'Fresh air is the main room — equip it well.',
    },
    {
      role: 'Gift-ready patio',
      categories: ['outdoor', 'dining'],
      why: 'Easy joy for the friend who lives outside.',
    },
  ],
}

/** A product pick with persona-tied role + why line for the result grid. */
export type QuizPick = {
  product: import('./types').Product
  role: string
  why: string
}

export type QuizScoreResult = {
  persona: Persona
  categoryScores: Record<string, number>
  topCategories: Category[]
  interestTags: string[]
  /** Short labels of chosen answers, in question order (for “You chose: …”). */
  answerLabels: string[]
  /** One-line recap: "Kitchen · Hosting · … → Tabletop Host" */
  answerSummary: string
}

export function scoreQuiz(answers: Record<string, string>): QuizScoreResult {
  const categoryScores: Record<string, number> = {}
  const personaVotes: Record<string, number> = {}
  const answerLabels: string[] = []

  for (const q of QUIZ_QUESTIONS) {
    const opt = q.options.find((o) => o.id === answers[q.id])
    if (!opt) continue
    answerLabels.push(opt.label)
    for (const [cat, n] of Object.entries(opt.scores)) {
      categoryScores[cat] = (categoryScores[cat] || 0) + (n || 0)
    }
    if (opt.personaBoost) {
      personaVotes[opt.personaBoost] =
        (personaVotes[opt.personaBoost] || 0) + 1
    }
  }

  let personaId = 'craft'
  let best = -1
  for (const [id, n] of Object.entries(personaVotes)) {
    if (n > best) {
      best = n
      personaId = id
    }
  }
  // Tie-break with category leader
  if (best <= 0) {
    const topCat = Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0]
    if (topCat?.[0] === 'bath') personaId = 'ritual'
    else if (topCat?.[0] === 'desk' || topCat?.[0] === 'organization')
      personaId = 'focus'
    else if (topCat?.[0] === 'baby') personaId = 'nest'
    else if (topCat?.[0] === 'outdoor') personaId = 'patio'
    else if (topCat?.[0] === 'dining') personaId = 'host'
  }

  const persona = PERSONAS[personaId] || PERSONAS.craft
  const topCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([c]) => c as Category)
    .filter((c) => ALL_CATEGORIES.includes(c))
    .slice(0, 3)

  const interestTags = [
    ...new Set([
      ...persona.categories.map((c) => `interest:${c}`),
      ...topCategories.map((c) => `interest:${c}`),
    ]),
  ].slice(0, 6)

  const answerSummary =
    answerLabels.length > 0
      ? `${answerLabels.join(' · ')} → ${persona.title}`
      : persona.title

  return {
    persona,
    categoryScores,
    topCategories,
    interestTags,
    answerLabels,
    answerSummary,
  }
}

/**
 * Curate 3–5 named, category-diverse picks for a persona.
 * Prefers limited-time + Amazon images; avoids stacking near-identical SKUs.
 */
export function buildQuizPicks(
  products: import('./types').Product[],
  personaId: string,
  topCategories: Category[],
  limit = 5,
): QuizPick[] {
  const slots =
    PERSONA_PICK_SLOTS[personaId] ||
    PERSONA_PICK_SLOTS.craft
  const preferredCats = [
    ...new Set([
      ...slots.flatMap((s) => s.categories),
      ...topCategories,
    ]),
  ]

  const pool = products.filter(
    (p) =>
      p.images?.length &&
      (preferredCats.includes(p.category) ||
        topCategories.includes(p.category)),
  )

  const usedIds = new Set<string>()
  const usedCats = new Map<Category, number>()
  const picks: QuizPick[] = []

  function scoreCandidate(
    p: import('./types').Product,
    slot: QuizPickSlot,
    requireSlotCat: boolean,
  ): number {
    const inSlot = slot.categories.includes(p.category)
    if (requireSlotCat && !inSlot) return -999
    let s = 0
    if (inSlot) s += 10
    else if (topCategories.includes(p.category)) s += 4
    if (p.limitedTime) s += 3
    if (p.badge) s += 1
    if (p.bsrRank != null && p.bsrRank <= 50) s += 2
    // Penalize repeating the same category too often
    const catCount = usedCats.get(p.category) || 0
    s -= catCount * 6
    // Slight prefer higher rating
    if (p.rating) s += Math.min(p.rating, 5) * 0.3
    return s
  }

  for (const slot of slots) {
    if (picks.length >= limit) break
    // Prefer a product that matches the slot’s categories when any remain
    const hasInSlot = pool.some(
      (p) => !usedIds.has(p.id) && slot.categories.includes(p.category),
    )
    const candidates = pool
      .filter((p) => !usedIds.has(p.id))
      .map((p) => ({ p, score: scoreCandidate(p, slot, hasInSlot) }))
      .filter((c) => c.score > -20)
      .sort((a, b) => b.score - a.score)

    const best = candidates[0]?.p
    if (!best) continue
    usedIds.add(best.id)
    usedCats.set(best.category, (usedCats.get(best.category) || 0) + 1)
    picks.push({ product: best, role: slot.role, why: slot.why })
  }

  // Fill if slots undershot (thin catalog for a persona)
  if (picks.length < Math.min(3, limit)) {
    const fallback = pool
      .filter((p) => !usedIds.has(p.id))
      .sort((a, b) => {
        const la = a.limitedTime ? 1 : 0
        const lb = b.limitedTime ? 1 : 0
        return lb - la
      })
    for (const p of fallback) {
      if (picks.length >= limit) break
      usedIds.add(p.id)
      picks.push({
        product: p,
        role: 'Vibe pick',
        why: p.tagline || 'Picked for your bamboo persona.',
      })
    }
  }

  return picks
}

export function shopLinkForCategories(cats: Category[]): string {
  if (cats[0]) return `/shop?cat=${cats[0]}`
  return '/shop?limited=1'
}
