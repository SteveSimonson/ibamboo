/**
 * Email-safe vibe copy for the post-quiz welcome message.
 * Kept moderate for deliverability (see ghlWelcomeEmail notes in index.ts).
 * Mirror of key fields from src/data/vibes.ts — intentional duplication so the
 * Worker stays a single entry without bundling the SPA data graph.
 */

export type VibeEmailProfile = {
  id: string
  title: string
  tagline: string
  story: string
  catchphrase: string
  traits: string[]
  avatarName: string
  avatarQuote: string
  /** Absolute HTTPS image on first-party domain */
  avatarImageUrl: string
  /** Primary shop room for secondary CTA */
  shopPath: string
  shopLabel: string
}

const BASE = 'https://ibamboo.com'

export const VIBE_EMAIL: Record<string, VibeEmailProfile> = {
  craft: {
    id: 'craft',
    title: 'Countertop Craftsperson',
    tagline: 'Boards, utensils, and the heart of the house.',
    story:
      'You cook like you mean it. Bamboo that earns a permanent spot by the stove — knife-kind boards, warm tools, meal-prep ready.',
    catchphrase: 'Built for the burners.',
    traits: [
      'Decisive prep energy',
      'Loves a solid board under the wrist',
      'Allergic to flimsy tools',
    ],
    avatarName: 'Maya',
    avatarQuote:
      'If it does not earn a spot next to the stove, it does not come home with me.',
    avatarImageUrl: `${BASE}/brand/vibes/craft-avatar.jpg`,
    shopPath: '/shop?cat=kitchen',
    shopLabel: 'Browse kitchen bamboo',
  },
  ritual: {
    id: 'ritual',
    title: 'Bath Ritualist',
    tagline: 'Soft fiber, quiet counters, spa at home.',
    story:
      'Your reset button lives in the bath. Bamboo that feels like a slow exhale — trays, holders, and a calmer counter.',
    catchphrase: 'Reset is a material choice.',
    traits: [
      'Slow-morning loyalist',
      'Texture-first shopper',
      'Quiet luxury instinct',
    ],
    avatarName: 'Elena',
    avatarQuote:
      'The five minutes before the day starts are the only ones that fully belong to me.',
    avatarImageUrl: `${BASE}/brand/vibes/ritual-avatar.jpg`,
    shopPath: '/shop?cat=bath',
    shopLabel: 'Browse bath bamboo',
  },
  focus: {
    id: 'focus',
    title: 'Focus Nest Builder',
    tagline: 'Desk calm and drawer order.',
    story:
      'Clarity is a material choice. Risers, organizers, and clean lines that keep your workday grounded.',
    catchphrase: 'Clear surface. Clear mind.',
    traits: [
      'Systems thinker',
      'Hates visual noise',
      'Buys once, keeps forever',
    ],
    avatarName: 'Jordan',
    avatarQuote:
      'If my desk is noisy, my thinking is noisy. Bamboo keeps the surface honest.',
    avatarImageUrl: `${BASE}/brand/vibes/focus-avatar.jpg`,
    shopPath: '/shop?cat=desk',
    shopLabel: 'Browse workspace bamboo',
  },
  host: {
    id: 'host',
    title: 'Tabletop Host',
    tagline: 'Serving boards, patio plates, shared plates.',
    story:
      'You set the mood for other people. Bamboo that hosts well — generous boards, warm grain, easy sharing.',
    catchphrase: 'The table is the invitation.',
    traits: [
      'Born host energy',
      'Loves a long board of shared plates',
      'Guests leave happier than they arrived',
    ],
    avatarName: 'Sofia',
    avatarQuote:
      'People relax when the board is already full. The table does half my hosting for me.',
    avatarImageUrl: `${BASE}/brand/vibes/host-avatar.jpg`,
    shopPath: '/shop?cat=dining',
    shopLabel: 'Browse tabletop bamboo',
  },
  nest: {
    id: 'nest',
    title: 'Little Nest Starter',
    tagline: 'Gentle mealtime for tiny humans.',
    story:
      'First bites deserve soft edges. Bamboo plates, spoons, and trays scaled for little hands — calm enough for everyday.',
    catchphrase: 'Small hands. Kind materials.',
    traits: [
      'Protective caretaker energy',
      'Chooses gentle forms first',
      'Loves a calm mealtime ritual',
    ],
    avatarName: 'Priya',
    avatarQuote:
      'If mealtime feels gentle, the whole morning softens. That is the real product.',
    avatarImageUrl: `${BASE}/brand/vibes/nest-avatar.jpg`,
    shopPath: '/shop?cat=baby',
    shopLabel: 'Browse little-ones bamboo',
  },
  patio: {
    id: 'patio',
    title: 'Patio Naturalist',
    tagline: 'Open air, warm grain, evenings that start outside.',
    story:
      'Fresh air is your main room. Bamboo that lives on the deck — trays, outdoor serve, garden-side tools that still look intentional.',
    catchphrase: 'The evening starts outside.',
    traits: [
      'Open-air loyalist',
      'Golden-hour planner',
      'Trays over TV trays',
    ],
    avatarName: 'Marcus',
    avatarQuote:
      'If the tray is outside, the night has already started. Fresh air does half the hosting.',
    avatarImageUrl: `${BASE}/brand/vibes/patio-avatar.jpg`,
    shopPath: '/shop?cat=outdoor',
    shopLabel: 'Browse outdoor bamboo',
  },
}

export function isKnownVibeId(id: string | undefined): boolean {
  return Boolean(id && id in VIBE_EMAIL)
}

export function getVibeEmailProfile(
  personaId: string | undefined,
  personaLabel?: string,
): VibeEmailProfile {
  if (personaId && VIBE_EMAIL[personaId]) return VIBE_EMAIL[personaId]
  const label = String(personaLabel || '').trim()
  return {
    id: personaId && /^[a-z0-9-]+$/i.test(personaId) ? personaId : 'explorer',
    title: label || 'Bamboo explorer',
    tagline: 'Warm grain for everyday living.',
    story:
      'Thanks for taking the Bamboo Vibe Check. Your full house energy is ready when you are.',
    catchphrase: 'Bamboo living, elevated.',
    traits: ['Curious about natural materials', 'Values pieces that last'],
    avatarName: 'iBamboo',
    avatarQuote: 'Discover on iBamboo. Buy on Amazon when you are ready.',
    avatarImageUrl: `${BASE}/brand/vibes/craft-avatar.jpg`,
    shopPath: '/shop',
    shopLabel: 'Browse the collection',
  }
}

/** Light UTM set — one campaign, no fingerprint soup */
export function utm(path: string, content: string) {
  const url = new URL(path.startsWith('http') ? path : `${BASE}${path}`)
  url.searchParams.set('utm_source', 'email')
  url.searchParams.set('utm_medium', 'ghl')
  url.searchParams.set('utm_campaign', 'vibe_welcome')
  url.searchParams.set('utm_content', content)
  return url.toString()
}
