import { useMemo, type CSSProperties } from 'react'
import type { BalloonPlan, BalloonSlot, EditorialType } from '../lib/balloonPlan'
import type { ContentBalloonDeck } from '../hooks/useAdaptiveContentBalloons'
const LABELS: Record<EditorialType, string> = {
  did_you_know: 'Did you know?',
  fun_fact: 'Fun fact',
  care_tip: 'Care tip',
  design_note: 'Design note',
  material_myth: 'Material myth',
  nature_note: 'Nature note',
  culture_craft: 'Craft & culture',
}

function slotStyle(slot: BalloonSlot): CSSProperties {
  if (slot.size === 'responsive') {
    return { minHeight: slot.minHeight, overflow: 'hidden', width: '100%' }
  }
  const [width, height] = slot.size.split('x').map(Number)
  return { height, marginInline: 'auto', maxWidth: '100%', overflow: 'hidden', width }
}

type AdaptiveContentBalloonProps = {
  anchor: string
  className?: string
  deck: ContentBalloonDeck
  plan: BalloonPlan
}

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
  if (!slot || !item || !item.editorial_type) return null

  return (
    <aside
      aria-label="Bamboo note"
      className={`content-balloon ${className}`.trim()}
      data-content-balloon={item.slug}
      data-editorial-type={item.editorial_type}
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-bamboo">
        {LABELS[item.editorial_type]}
      </p>
      <div
        style={slotStyle(slot)}
        dangerouslySetInnerHTML={{ __html: `<style>${item.css || ''}</style>${item.html}` }}
      />
    </aside>
  )
}
