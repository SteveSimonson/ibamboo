import type { Category } from './types'
import { CATEGORY_LABELS } from './catalog'

export type CategoryHeroContent = {
  title: string
  blurb: string
  /** Public path under /brand/categories/ or elsewhere */
  image?: string
  /** CSS object-position for crop */
  objectPosition?: string
  alt: string
}

/** P0: photo heroes for header nav categories; others use text fallback. */
const HEROES: Partial<Record<Category, CategoryHeroContent>> = {
  kitchen: {
    title: 'Kitchen',
    blurb: 'Tools for the heart of the house—warm grain, daily use.',
    image: '/brand/categories/kitchen.jpg',
    objectPosition: 'center 45%',
    alt: 'Bamboo kitchen utensils and board on a sunlit counter',
  },
  'cutting-boards': {
    title: 'Boards & serving',
    blurb: 'Prep and present on surfaces that earn their keep.',
    image: '/brand/categories/cutting-boards.jpg',
    objectPosition: 'center 50%',
    alt: 'Bamboo cutting and serving boards on a warm wood table',
  },
  desk: {
    title: 'Workspace',
    blurb: 'Desk tools with a calmer grain—focus without the plastic.',
    image: '/brand/categories/desk.jpg',
    objectPosition: 'center 40%',
    alt: 'Bamboo laptop stand and desk organizer on an oak workspace',
  },
  bath: {
    title: 'Bath & body',
    blurb: 'Soft rituals for the vanity and bath—quiet, plant-forward.',
    image: '/brand/categories/bath.jpg',
    objectPosition: 'center 40%',
    alt: 'Bamboo bath accessories on a stone vanity',
  },
  dining: {
    title: 'Tabletop',
    blurb: 'Serving pieces for shared plates and unhurried meals.',
    alt: 'Tabletop bamboo collection',
  },
  organization: {
    title: 'Organization',
    blurb: 'Drawers, shelves, and calm order for the whole house.',
    alt: 'Bamboo organization',
  },
  outdoor: {
    title: 'Outdoor',
    blurb: 'Patio-ready bamboo for open-air living.',
    alt: 'Outdoor bamboo pieces',
  },
  baby: {
    title: 'Little ones',
    blurb: 'Gentle mealtime gear scaled for tiny hands.',
    alt: 'Bamboo for little ones',
  },
}

export function getCategoryHero(
  cat: string | null | undefined,
): CategoryHeroContent | null {
  if (!cat || !(cat in CATEGORY_LABELS)) return null
  const key = cat as Category
  const base = HEROES[key]
  if (base) return base
  return {
    title: CATEGORY_LABELS[key],
    blurb: 'Bamboo for the house—discover, then buy on Amazon.',
    alt: CATEGORY_LABELS[key],
  }
}

/** Header nav items that map to categories (for active state). */
export const HEADER_CATEGORY_NAV: { to: string; label: string; cat: Category }[] =
  [
    { to: '/shop?cat=kitchen', label: 'Kitchen', cat: 'kitchen' },
    {
      to: '/shop?cat=cutting-boards',
      label: 'Boards',
      cat: 'cutting-boards',
    },
    { to: '/shop?cat=desk', label: 'Workspace', cat: 'desk' },
    { to: '/shop?cat=bath', label: 'Bath', cat: 'bath' },
  ]
