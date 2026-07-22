import { Clock3, X } from 'lucide-react'
import type { CollectionHeroContent } from '../data/collectionHeroes'

export function CollectionContextRail({
  content,
  productCount,
  limited,
  categoryLabel,
  compressed,
  emptyIntersection,
  onClear,
  onShowCollectionEverywhere,
  onStayInCategory,
}: {
  content: CollectionHeroContent
  productCount: number
  limited?: boolean
  /** When category filter is also active */
  categoryLabel?: string | null
  /** Under category hero = compressed H2; alone = elevated H1 */
  compressed: boolean
  emptyIntersection?: boolean
  onClear: () => void
  onShowCollectionEverywhere?: () => void
  onStayInCategory?: () => void
}) {
  const TitleTag = compressed ? 'h2' : 'h1'
  const titleId = 'collection-rail-title'

  return (
    <section
      className={`border-b border-line ${
        compressed
          ? 'bg-paper-2/90'
          : 'bg-gradient-to-r from-paper-2 via-paper to-cream'
      }`}
      aria-labelledby={titleId}
    >
      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 ${
          compressed
            ? 'py-3 sm:py-3.5 min-h-[3.25rem]'
            : 'py-6 sm:py-8 min-h-[5.5rem] sm:min-h-[6.5rem]'
        } flex flex-col justify-center gap-2`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-bamboo">
                Collection
              </p>
              {limited && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#b45309] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  <Clock3 className="size-3" />
                  This week
                </span>
              )}
              {categoryLabel && (
                <span className="inline-flex items-center rounded-full border border-line bg-card text-[10px] font-semibold uppercase tracking-wider text-ink-soft px-2 py-0.5">
                  In {categoryLabel}
                </span>
              )}
            </div>

            <TitleTag
              id={titleId}
              className={`font-display font-semibold text-ink leading-tight ${
                compressed
                  ? 'text-xl sm:text-2xl'
                  : 'text-2xl sm:text-3xl lg:text-4xl'
              }`}
            >
              {content.label}
            </TitleTag>

            {!compressed && (
              <p className="mt-1.5 text-sm sm:text-base text-ink-soft font-light leading-relaxed max-w-2xl">
                {content.blurb}
                <span className="text-muted">
                  {' '}
                  · {productCount}{' '}
                  {productCount === 1 ? 'piece' : 'pieces'}
                </span>
              </p>
            )}

            {compressed && (
              <p className="mt-0.5 text-xs sm:text-sm text-ink-soft line-clamp-1">
                <span className="hidden sm:inline">{content.blurb} · </span>
                {productCount} {productCount === 1 ? 'piece' : 'pieces'}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClear}
            className="shrink-0 inline-flex items-center gap-1 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-bamboo/40 hover:text-bamboo transition"
            aria-label={`Clear collection filter ${content.label}`}
          >
            <X className="size-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {emptyIntersection && (
          <div className="rounded-xl border border-[#fdba74] bg-[#fff7ed] px-3 py-2.5 text-sm text-[#9a3412]">
            <p className="font-semibold">
              No {content.label} pieces
              {categoryLabel ? ` in ${categoryLabel}` : ''}.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {onShowCollectionEverywhere && (
                <button
                  type="button"
                  onClick={onShowCollectionEverywhere}
                  className="rounded-full bg-[#9a3412] text-white px-3 py-1 text-xs font-semibold"
                >
                  Show {content.label} everywhere
                </button>
              )}
              {onStayInCategory && categoryLabel && (
                <button
                  type="button"
                  onClick={onStayInCategory}
                  className="rounded-full border border-[#fdba74] bg-white px-3 py-1 text-xs font-semibold text-[#9a3412]"
                >
                  Stay in {categoryLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
