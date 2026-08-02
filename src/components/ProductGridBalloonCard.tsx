import { ArrowDownRight, Leaf } from 'lucide-react'
import { useMemo } from 'react'
import type { BalloonPlan, EditorialType } from '../lib/balloonPlan'
import { contentBalloonCopy } from '../lib/contentBalloonContent'
import type { ContentBalloonDeck } from '../hooks/useAdaptiveContentBalloons'

const LABELS: Record<EditorialType, string> = {
  did_you_know: 'Did you know?',
  fun_fact: 'Fun fact',
  care_tip: 'Care note',
  design_note: 'Design detail',
  material_myth: 'Material check',
  nature_note: 'From the grove',
  culture_craft: 'Craft & culture',
}

type ProductGridBalloonCardProps = {
  anchor: string
  deck: ContentBalloonDeck
  plan: BalloonPlan
}

export function ProductGridBalloonCard({
  anchor,
  deck,
  plan,
}: ProductGridBalloonCardProps) {
  const slot = plan.slots.find((candidate) => candidate.anchor === anchor)
  const item = deck[anchor]
  const copy = useMemo(() => item ? contentBalloonCopy(item) : null, [item])

  if (
    !slot ||
    slot.role !== 'grid-tile' ||
    !item ||
    !item.editorial_type ||
    !copy
  ) return null

  return (
    <section
      aria-label={slot.ariaLabel}
      className="card-soft product-grid-balloon-card flex min-h-[18rem] flex-col overflow-hidden sm:min-h-0"
      data-balloon-anchor={anchor}
      data-balloon-budget={slot.budget}
      data-balloon-mobile-variant="compact-stream"
      data-balloon-role={slot.role}
      data-balloon-section={slot.section}
      data-content-balloon={item.slug}
      data-editorial-type={item.editorial_type}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-moss px-4 py-3 text-white">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-leaf">
          {LABELS[item.editorial_type]}
        </span>
        <Leaf aria-hidden="true" className="size-4 text-gold" />
      </div>
      <div className="flex flex-1 flex-col justify-center bg-[radial-gradient(circle_at_100%_0%,rgba(121,161,100,0.24),transparent_42%),linear-gradient(145deg,#f7f2e7,#eef3e8)] px-5 py-7 sm:px-6">
        <h3 className="font-display text-2xl font-semibold leading-[1.08] text-moss sm:text-3xl">
          {copy.headline}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">{copy.body}</p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line/70 bg-card px-4 py-3.5 text-xs font-semibold text-bamboo">
        <span>A useful pause between the finds</span>
        <ArrowDownRight aria-hidden="true" className="size-4 shrink-0" />
      </div>
    </section>
  )
}
