import { ArrowDownRight, Leaf } from 'lucide-react'
import type { BalloonPlan } from '../lib/balloonPlan'
import type { ContentBalloonDeck } from '../hooks/useAdaptiveContentBalloons'

type ProductGridBalloonCardProps = {
  anchor: string
  deck: ContentBalloonDeck
  plan: BalloonPlan
}

/**
 * A responsive Conbal fact presented as an ordinary commerce-grid tile.
 * Fixed-size creatives are rejected here because they cannot safely fit every
 * one-, two-, three-, and four-column product grid.
 */
export function ProductGridBalloonCard({
  anchor,
  deck,
  plan,
}: ProductGridBalloonCardProps) {
  const slot = plan.slots.find((candidate) => candidate.anchor === anchor)
  const item = deck[anchor]

  if (
    !slot ||
    slot.size !== 'responsive' ||
    !item ||
    !item.editorial_type
  ) {
    return null
  }

  return (
    <aside
      aria-label={slot.ariaLabel}
      className="card-soft product-grid-balloon-card flex h-full flex-col overflow-hidden"
      data-content-balloon={item.slug}
      data-editorial-type={item.editorial_type}
      data-layout="product-card"
      data-size={slot.size}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-moss px-4 py-3 text-white">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-leaf">
          Bamboo field note
        </span>
        <Leaf aria-hidden="true" className="size-4 text-gold" />
      </div>
      <div
        className="product-grid-balloon-card__creative"
        dangerouslySetInnerHTML={{
          __html: `<style>${item.css || ''}</style>${item.html}`,
        }}
      />
      <div className="flex items-center justify-between gap-3 border-t border-line/70 bg-card px-4 py-3.5 text-xs font-semibold text-bamboo">
        <span>A useful pause between the finds</span>
        <ArrowDownRight aria-hidden="true" className="size-4 shrink-0" />
      </div>
    </aside>
  )
}
