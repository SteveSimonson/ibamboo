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
        personaBoost: 'host',
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
        blurb: 'Hosting, outdoors, easy joy.',
        scores: { outdoor: 2, dining: 2, baby: 1 },
        personaBoost: 'host',
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
    tagline: 'Serving boards, patio plates, shared plates.',
    story:
      'You set the mood for other people. Bamboo that hosts well — charcuterie energy, outdoor tables, generous serving.',
    categories: ['dining', 'outdoor', 'cutting-boards'],
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
}

export function scoreQuiz(answers: Record<string, string>): {
  persona: Persona
  categoryScores: Record<string, number>
  topCategories: Category[]
  interestTags: string[]
} {
  const categoryScores: Record<string, number> = {}
  const personaVotes: Record<string, number> = {}

  for (const q of QUIZ_QUESTIONS) {
    const opt = q.options.find((o) => o.id === answers[q.id])
    if (!opt) continue
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
    else if (topCat?.[0] === 'outdoor' || topCat?.[0] === 'dining')
      personaId = 'host'
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

  return { persona, categoryScores, topCategories, interestTags }
}

export function shopLinkForCategories(cats: Category[]): string {
  if (cats[0]) return `/shop?cat=${cats[0]}`
  return '/shop?limited=1'
}
