import type { Category } from './types'
import { PERSONAS, type Persona } from './quiz'

export type VibeStat = { label: string; value: number; max?: number }

export type VibeAvatar = {
  name: string
  role: string
  ageBand: string
  hometown: string
  quote: string
  /** Portrait path under /public */
  image: string
  alt: string
}

export type VibeScene = {
  image: string
  alt: string
  caption: string
}

export type VibeProfile = Persona & {
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
  /** Real person energy — lifestyle avatar */
  avatar: VibeAvatar
  /** Lived-in room scene for the hero */
  scene: VibeScene
  /** Concrete day moments that ground the persona */
  dayInTheLife: string[]
  /** Material / product truths, not fluff */
  materialTruths: string[]
  /** How this vibe shows up at home */
  signatureSetup: string
  /** What they buy most often */
  shoppingList: string[]
  /** Friendly peer vibes they often blend with */
  blendsWith: string[]
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
        detail:
          'Knife-kind bamboo surfaces that give blades a better landing pad than glass or cheap plastic.',
      },
      {
        name: 'Heat of the Moment',
        detail:
          'Spoons, spatulas, and tools that live by the stove without warping or screaming “gadget.”',
      },
      {
        name: 'Meal-Prep Aura',
        detail:
          'Everything within reach when dinner is non-negotiable—boards, utensils, grab-and-go flow.',
      },
    ],
    benefits: [
      'Warm grain that elevates everyday cooking',
      'Pieces that earn permanent counter real estate',
      'Natural material you can feel in the hand',
      'Pairs with this week’s limited kitchen drop',
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
    avatar: {
      name: 'Maya',
      role: 'Home cook · Weeknight lead',
      ageBand: 'Mid-30s',
      hometown: 'Portland kitchen island',
      quote:
        'If it doesn’t earn a spot next to the stove, it doesn’t come home with me.',
      image: '/brand/vibes/craft-avatar.jpg',
      alt: 'Maya at her kitchen island with a bamboo cutting board and fresh herbs',
    },
    scene: {
      image: '/brand/vibes/craft-scene.jpg',
      alt: 'Bamboo cutting board with chopped vegetables beside a steaming pan',
      caption: 'Tuesday 6:40 p.m. — board out, onions already going.',
    },
    dayInTheLife: [
      'Morning coffee, then a quick board wipe before the day starts',
      'Weeknight: one solid board for veg + protein, no plastic shuffle',
      'Sunday: meal-prep stack—boards, spoons, containers in arm’s reach',
      'Guests? Same tools, just more confident plating',
    ],
    materialTruths: [
      'Bamboo is dense and knife-friendlier than glass or marble boards',
      'Warm grain reads “chef’s kitchen” without a remodel',
      'Well-made boards and utensils last seasons of real cooking',
      'Natural material pairs with cast iron, stainless, and linen',
    ],
    signatureSetup:
      'One thick board center stage, utensil crock by the burner, herbs within a half-turn.',
    shoppingList: [
      'XL bamboo cutting board',
      'Wooden spoon & spatula set',
      'Board stand or storage rack',
      'Serving board that doubles as prep',
    ],
    blendsWith: ['host', 'nest'],
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
        detail:
          'Bamboo trays and holders that soften vanity clutter into a deliberate spa moment.',
      },
      {
        name: 'Exhale Mode',
        detail:
          'Objects that make the pause feel intentional—not another pile of plastic bottles.',
      },
      {
        name: 'Soft Armor',
        detail:
          'Warm wood against cool tile: a tactile reset after screens and fluorescent days.',
      },
    ],
    benefits: [
      'Spa energy without a remodel',
      'Warm wood against cool porcelain',
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
    avatar: {
      name: 'Elena',
      role: 'Bath ritualist · Quiet reset',
      ageBand: 'Early 30s',
      hometown: 'Morning light bathroom',
      quote:
        'The five minutes before the day starts are the only ones that fully belong to me.',
      image: '/brand/vibes/ritual-avatar.jpg',
      alt: 'Elena in a waffle robe by a bamboo bath tray with candle and towels',
    },
    scene: {
      image: '/brand/vibes/ritual-scene.jpg',
      alt: 'Marble vanity with bamboo tray, candle, towels, and soft steam',
      caption: '6:12 a.m. — tray set, steam up, phone still in the other room.',
    },
    dayInTheLife: [
      'Phone stays outside the bath zone when possible',
      'Tray holds the non-negotiables: towel, candle, one good cleanser',
      'Evening rinse is a full reset, not a rush-through',
      'Weekend: longer soak, same tray, zero plastic clutter on the rim',
    ],
    materialTruths: [
      'Bamboo trays handle humidity better than soft woods when cared for',
      'Warm grain softens cold tile and chrome without feeling sterile',
      'A single tray corrals bottles so the vanity looks intentional',
      'Spa cues (steam, scent, wood) beat more square footage',
    ],
    signatureSetup:
      'Slatted bamboo tray on the vanity: candle, folded towel, one botanical stem.',
    shoppingList: [
      'Bamboo bath / vanity tray',
      'Toothbrush or soap holders',
      'Towel ladder or shelf accents',
      'Small organizers for the counter',
    ],
    blendsWith: ['focus', 'nest'],
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
        detail:
          'Risers and stands that lift the laptop to a better angle—less neck ache, more deep work.',
      },
      {
        name: 'Drawer Zen',
        detail:
          'Organizers that turn cable chaos and pen piles into quiet compartments.',
      },
      {
        name: 'Focus Field',
        detail:
          'Warm bamboo next to screens grounds the desk without plastic clutter.',
      },
    ],
    benefits: [
      'A workspace that feels intentional',
      'Less friction starting deep work',
      'Natural texture next to glass and metal',
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
    avatar: {
      name: 'Jordan',
      role: 'Deep-work desk · Systems first',
      ageBand: 'Early 40s',
      hometown: 'Quiet corner office at home',
      quote:
        'If my desk is noisy, my thinking is noisy. Bamboo keeps the surface honest.',
      image: '/brand/vibes/focus-avatar.jpg',
      alt: 'Jordan at a clean desk with a laptop on a bamboo riser',
    },
    scene: {
      image: '/brand/vibes/focus-scene.jpg',
      alt: 'Minimal desk with bamboo laptop stand, organizer tray, and coffee',
      caption: '9:05 a.m. — riser set, inbox closed, one mug, zero clutter.',
    },
    dayInTheLife: [
      'Clear the deck before the first meeting',
      'Laptop on a riser; notebook and pen in one tray',
      'Cables and chargers live in a drawer organizer, not on the surface',
      'End of day: wipe, reset, leave tomorrow a clean launchpad',
    ],
    materialTruths: [
      'A laptop riser improves posture more than another motivational sticker',
      'Bamboo organizers hide visual noise without looking sterile',
      'Warm wood next to screens reduces the “office basement” feel',
      'Buy once: good desk pieces outlast gadget cycles',
    ],
    signatureSetup:
      'Laptop on bamboo riser, one tray for tools, plant for life, nothing else.',
    shoppingList: [
      'Bamboo laptop / monitor stand',
      'Desktop organizer tray',
      'Drawer dividers',
      'Cable-friendly caddy',
    ],
    blendsWith: ['ritual', 'craft'],
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
        detail:
          'Long serving surfaces that steal the middle of the table and start the conversation.',
      },
      {
        name: 'Patio Glow',
        detail:
          'Pieces that move from dining room to deck without looking like camping gear.',
      },
      {
        name: 'Share Mode',
        detail:
          'Generous forms that make family-style and grazing boards feel effortless.',
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
    avatar: {
      name: 'Sofia',
      role: 'Tabletop host · Night starter',
      ageBand: 'Late 30s',
      hometown: 'Candlelit dining room',
      quote:
        'People relax when the board is already full. The table does half my hosting for me.',
      image: '/brand/vibes/host-avatar.jpg',
      alt: 'Sofia arranging a long bamboo charcuterie board for guests',
    },
    scene: {
      image: '/brand/vibes/host-scene.jpg',
      alt: 'Long bamboo serving board with cheese, fruit, bread, wine, and candles',
      caption: 'Friday 7:15 p.m. — board down, candles lit, doorbell any second.',
    },
    dayInTheLife: [
      'Board out first—food before people walk in',
      'One long graze + simple plates beats a dozen tiny dishes',
      'Same board works for brunch, wine night, or patio sunset',
      'Cleanup is easy: wipe grain, fold linen, done',
    ],
    materialTruths: [
      'A long bamboo board is a centerpiece and a serving system',
      'Warm wood photographs and feels better under candlelight than plastic trays',
      'Outdoor-capable pieces earn their keep across seasons',
      'Guests touch the board—material quality shows',
    ],
    signatureSetup:
      'Linen runner, long bamboo board down the middle, candles, two carafes, no fuss.',
    shoppingList: [
      'Extra-long serving / charcuterie board',
      'Salad servers',
      'Outdoor-friendly plates or trays',
      'Secondary small boards for cheese corners',
    ],
    blendsWith: ['craft', 'patio'],
  },
  patio: {
    ...PERSONAS.patio,
    typeLabel: 'Outdoor · Open Air',
    rarity: 'Golden Hour Edition',
    emoji: '🌿',
    flavor:
      'The evening starts when the tray hits the outdoor table. You don’t wait for a special occasion—you treat the patio like a room.',
    catchphrase: 'The evening starts outside.',
    traits: [
      'Open-air loyalist',
      'Golden-hour planner',
      'Trays over TV trays',
      'Garden-adjacent energy',
    ],
    powers: [
      {
        name: 'Deck Presence',
        detail:
          'Outdoor trays and servers that look intentional on teak, stone, or grass.',
      },
      {
        name: 'Fresh Air Field',
        detail:
          'Pieces that move from kitchen to patio without looking like camping gear.',
      },
      {
        name: 'Sunset Mode',
        detail:
          'Warm grain that photographs and feels better than plastic under string lights.',
      },
    ],
    benefits: [
      'Open-air evenings that feel designed, not improvised',
      'Bamboo that works deck-side and table-side',
      'Less plastic in the outdoor kit',
      'A natural through-line from kitchen to patio',
    ],
    stats: [
      { label: 'Craft', value: 55 },
      { label: 'Calm', value: 70 },
      { label: 'Host', value: 80 },
      { label: 'Order', value: 40 },
    ],
    gradient: 'from-[#3d5c28] via-[#5a7a3a] to-[#8fad5c]',
    cardBg: 'from-[#f3f7ec] via-[#e8f0dc] to-[#d4e5b8]',
    shopHint: 'Outdoor trays, patio serve, and garden-side bamboo.',
    avatar: {
      name: 'Marcus',
      role: 'Patio naturalist · Golden hour',
      ageBand: 'Mid-30s',
      hometown: 'Deck at dusk',
      quote:
        'If the tray is outside, the night has already started. Fresh air does half the hosting.',
      image: '/brand/vibes/patio-avatar.jpg',
      alt: 'Marcus on a wooden deck at golden hour with a bamboo outdoor serving tray',
    },
    scene: {
      image: '/brand/vibes/patio-scene.jpg',
      alt: 'Bamboo tray with drinks on an outdoor table at golden hour',
      caption: '6:48 p.m. — tray out, string lights on, no one inside yet.',
    },
    dayInTheLife: [
      'Coffee outside first when weather allows',
      'Weeknight: tray + simple plates on the deck, not the couch',
      'Weekend: open-air snacks before anyone asks what’s for dinner',
      'Season change: same bamboo kit moves from patio to garden table',
    ],
    materialTruths: [
      'Outdoor-ready bamboo still looks intentional under string lights',
      'Trays beat armloads of kitchen plastic for deck service',
      'Warm grain photographs better than disposable outdoorware',
      'Pieces that work inside and outside get used twice as often',
    ],
    signatureSetup:
      'Bamboo tray center stage, outdoor table wiped, plants nearby, drinks already poured.',
    shoppingList: [
      'Outdoor bamboo serving tray',
      'Patio-friendly plates or servers',
      'Garden-side tools with warm grain',
      'Lightweight boards for open-air snacks',
    ],
    blendsWith: ['host', 'craft'],
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
        detail:
          'Shapes scaled for first spoons and tiny plates—less fight, more joy at the table.',
      },
      {
        name: 'Nest Shield',
        detail:
          'Natural materials for the most sensitive routines, when plastic piles start to feel wrong.',
      },
      {
        name: 'Joy Bite',
        detail:
          'Warm wood that makes everyday meals feel special for little humans (and tired adults).',
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
    avatar: {
      name: 'Priya',
      role: 'Little nest starter · Mealtime calm',
      ageBand: 'Early 30s',
      hometown: 'Sunlit family kitchen',
      quote:
        'If mealtime feels gentle, the whole morning softens. That’s the real product.',
      image: '/brand/vibes/nest-avatar.jpg',
      alt: 'Priya setting a small bamboo plate and spoon for a gentle mealtime',
    },
    scene: {
      image: '/brand/vibes/nest-scene.jpg',
      alt: 'Small bamboo plate with soft foods, spoon, sippy cup, and napkin in morning light',
      caption: '8:20 a.m. — plate ready, spoon waiting, no plastic mountain.',
    },
    dayInTheLife: [
      'Plate + spoon set before little hands hit the chair',
      'Soft foods on warm wood—less “cafeteria plastic,” more home',
      'Same gentle kit for snacks, not a drawer of disposable nonsense',
      'Gift season: nest starters get thoughtful bamboo, not more plastic',
    ],
    materialTruths: [
      'Small bamboo plates and spoons feel kinder than hard plastic stacks',
      'Natural grain is calm to look at during messy meals',
      'Pieces that look good enough for adult tables get used more',
      'Thoughtful materials signal care—even when the floor is covered in crumbs',
    ],
    signatureSetup:
      'Small bamboo plate, soft spoon, cloth napkin, sippy within reach—low drama table.',
    shoppingList: [
      'Child-scale bamboo plate set',
      'Soft-edge bamboo spoons',
      'Small serving board for family snacks',
      'Gentle kitchen helpers for prep',
    ],
    blendsWith: ['craft', 'ritual'],
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

/** Primary vibe most associated with a shop room (for category CTAs). */
export const CATEGORY_PRIMARY_VIBE: Partial<Record<Category, string>> = {
  kitchen: 'craft',
  'cutting-boards': 'craft',
  dining: 'host',
  outdoor: 'patio',
  bath: 'ritual',
  desk: 'focus',
  organization: 'focus',
  baby: 'nest',
}

export function vibeForCategory(
  cat: string | null | undefined,
): VibeProfile | undefined {
  if (!cat) return undefined
  const id = CATEGORY_PRIMARY_VIBE[cat as Category]
  return id ? getVibe(id) : undefined
}
