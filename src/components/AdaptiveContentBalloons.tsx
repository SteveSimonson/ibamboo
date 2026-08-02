import { Leaf, Lightbulb, Sparkles } from 'lucide-react'
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

type AdaptiveContentBalloonProps = {
  anchor: string
  className?: string
  deck: ContentBalloonDeck
  plan: BalloonPlan
}

/**
 * Host-native rendering is the safety boundary: Conbal selects the fact while
 * iBamboo owns markup, typography, spacing, breakpoints, and accessibility.
 */
export function AdaptiveContentBalloon({
  anchor,
  className = '',
  deck,
  plan,
}: AdaptiveContentBalloonProps) {
  const slot = useMemo(
    () => plan.slots.find((candidate) => candidate.anchor === anchor),
    [anchor, plan.slots],
  )
  const item = deck[anchor]
  const copy = useMemo(() => item ? contentBalloonCopy(item) : null, [item])
  if (!slot || !item || !item.editorial_type || !copy) return null

  const label = LABELS[item.editorial_type]
  const shared = {
    'data-balloon-anchor': anchor,
    'data-balloon-budget': slot.budget,
    'data-balloon-role': slot.role,
    'data-balloon-section': slot.section,
    'data-content-balloon': item.slug,
    'data-editorial-type': item.editorial_type,
  }

  if (slot.role === 'section-break') {
    return (
      <section
        {...shared}
        aria-label={slot.ariaLabel}
        className={`content-balloon overflow-hidden rounded-2xl border border-bamboo/20 bg-[linear-gradient(118deg,#f6f2e8_0%,#f6f2e8_66%,#e4edd9_66%,#e4edd9_100%)] ${className}`.trim()}
      >
        <div className="grid gap-5 px-5 py-6 sm:grid-cols-[minmax(13rem,0.8fr)_minmax(16rem,1.2fr)] sm:items-center sm:px-8">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-bamboo">
              <Sparkles aria-hidden="true" className="size-3.5" /> {label}
            </p>
            <h3 className="font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              {copy.headline}
            </h3>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft sm:text-base">
            {copy.body}
          </p>
        </div>
      </section>
    )
  }

  if (slot.role === 'aside-note') {
    return (
      <section
        {...shared}
        aria-label={slot.ariaLabel}
        className={`content-balloon rounded-2xl border border-line bg-card p-5 shadow-[0_16px_40px_-34px_rgba(18,26,18,0.45)] sm:p-6 ${className}`.trim()}
      >
        <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-bamboo">
          <Leaf aria-hidden="true" className="size-3.5" /> {label}
        </p>
        <h3 className="font-display text-xl font-semibold leading-tight text-ink">
          {copy.headline}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{copy.body}</p>
      </section>
    )
  }

  return (
    <section
      {...shared}
      aria-label={slot.ariaLabel}
      className={`content-balloon border-y border-bamboo/20 bg-bamboo/[0.045] px-1 py-5 sm:px-5 sm:py-6 ${className}`.trim()}
    >
      <div className="grid gap-3 sm:grid-cols-[minmax(12rem,0.7fr)_minmax(16rem,1.3fr)] sm:items-center sm:gap-8">
        <div>
          <p className="mb-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-bamboo">
            <Lightbulb aria-hidden="true" className="size-3.5" /> {label}
          </p>
          <h3 className="font-display text-xl font-semibold leading-tight text-ink sm:text-2xl">
            {copy.headline}
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-ink-soft">{copy.body}</p>
      </div>
    </section>
  )
}
