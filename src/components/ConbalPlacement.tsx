import {
  ConbalBalloon,
  type ConbalSize,
} from './ConbalBalloon'

type ConbalPlacementName =
  | 'home-field-note'
  | 'home-culture'
  | 'shop-field-note'
  | 'product-field-note'
  | 'why-field-note'
  | 'vibe-field-note'

type ConbalPlacementConfig = {
  ariaLabel: string
  className?: string
  minHeight?: number
  size: ConbalSize
  slug: string
}

const CONBAL_PLACEMENTS: Record<ConbalPlacementName, ConbalPlacementConfig> = {
  'home-field-note': {
    ariaLabel: 'Bamboo field note',
    className: 'mx-auto',
    minHeight: 126,
    size: 'responsive',
    slug: 'bamboo-is-a-grass',
  },
  'home-culture': {
    ariaLabel: 'Bamboo weaving field note',
    className: 'mx-auto max-w-full',
    size: '300x250',
    slug: 'bamboo-weaving-heritage',
  },
  'shop-field-note': {
    ariaLabel: 'Bamboo growth field note',
    className: 'mx-auto',
    minHeight: 126,
    size: 'responsive',
    slug: 'running-bamboo-rhizomes',
  },
  'product-field-note': {
    ariaLabel: 'Bamboo rhizome field note',
    className: 'mx-auto max-w-full',
    size: '320x100',
    slug: 'bamboo-rhizomes',
  },
  'why-field-note': {
    ariaLabel: 'Bamboo flowering field note',
    className: 'mx-auto',
    minHeight: 126,
    size: 'responsive',
    slug: 'bamboo-gregarious-flowering',
  },
  'vibe-field-note': {
    ariaLabel: 'Bamboo growth record field note',
    className: 'mx-auto max-w-full',
    size: '300x250',
    slug: 'bamboo-growth-record',
  },
}

type ConbalPlacementProps = {
  className?: string
  placement: ConbalPlacementName
}

/**
 * Stable iBamboo placement names keep route code independent from Conbal slugs.
 * Editors can change the balloon assigned to a placement in this one map.
 */
export function ConbalPlacement({
  className = '',
  placement,
}: ConbalPlacementProps) {
  const config = CONBAL_PLACEMENTS[placement]

  return (
    <ConbalBalloon
      {...config}
      className={`${config.className || ''} ${className}`.trim()}
    />
  )
}
