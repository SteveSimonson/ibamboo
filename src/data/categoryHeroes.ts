import type { Category } from './types'
import { CATEGORY_LABELS } from './catalog'

export type CategoryHeroContent = {
  title: string
  blurb: string
  /** Public path under /brand/categories/ */
  image: string
  /** CSS object-position for crop */
  objectPosition?: string
  alt: string
}

/** Lifestyle heroes for every shop category (photo + copy). */
export const HEROES: Record<Category, CategoryHeroContent> = {
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
  dining: {
    title: 'Tabletop',
    blurb: 'Serving pieces for shared plates and unhurried meals.',
    image: '/brand/categories/dining.jpg',
    objectPosition: 'center 45%',
    alt: 'Bamboo plates and bowls set on a dining table',
  },
  bath: {
    title: 'Bath & body',
    blurb: 'Soft rituals for the vanity and bath—quiet, plant-forward.',
    image: '/brand/categories/bath.jpg',
    objectPosition: 'center 40%',
    alt: 'Bamboo bath accessories on a stone vanity',
  },
  organization: {
    title: 'Organization',
    blurb: 'Drawers, shelves, and calm order for the whole house.',
    image: '/brand/categories/organization.jpg',
    objectPosition: 'center 40%',
    alt: 'Bamboo organizers and storage trays on open shelves',
  },
  desk: {
    title: 'Workspace',
    blurb: 'Desk tools with a calmer grain—focus without the plastic.',
    image: '/brand/categories/desk.jpg',
    objectPosition: 'center 40%',
    alt: 'Bamboo laptop stand and desk organizer on an oak workspace',
  },
  outdoor: {
    title: 'Outdoor',
    blurb: 'Patio-ready bamboo for open-air living.',
    image: '/brand/categories/outdoor.jpg',
    objectPosition: 'center 45%',
    alt: 'Bamboo outdoor tray and accents on a wooden deck',
  },
  baby: {
    title: 'Little ones',
    blurb: 'Gentle mealtime gear scaled for tiny hands.',
    image: '/brand/categories/baby.jpg',
    objectPosition: 'center 45%',
    alt: 'Small bamboo plates and utensils for little ones',
  },
}

export function getCategoryHero(
  cat: string | null | undefined,
): CategoryHeroContent | null {
  if (!cat || !(cat in CATEGORY_LABELS)) return null
  return HEROES[cat as Category]
}

/** Header nav items that map to categories (for active state). */
export const HEADER_CATEGORY_NAV: {
  to: string
  label: string
  cat: Category
}[] = [
  { to: '/shop?cat=kitchen', label: 'Kitchen', cat: 'kitchen' },
  {
    to: '/shop?cat=cutting-boards',
    label: 'Boards',
    cat: 'cutting-boards',
  },
  { to: '/shop?cat=desk', label: 'Workspace', cat: 'desk' },
  { to: '/shop?cat=bath', label: 'Bath', cat: 'bath' },
]
