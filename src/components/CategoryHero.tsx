import { Clock3 } from 'lucide-react'
import type { CategoryHeroContent } from '../data/categoryHeroes'

export function CategoryHero({
  content,
  limited,
  productCount,
}: {
  content: CategoryHeroContent
  limited?: boolean
  productCount?: number
}) {
  return (
    <section
      className="relative w-full overflow-hidden bg-charcoal"
      aria-labelledby="category-hero-title"
    >
      <img
        src={content.image}
        alt={content.alt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: content.objectPosition || 'center center' }}
        decoding="async"
        fetchPriority="high"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/40 to-charcoal/15" />
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/50 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 min-h-[10.5rem] sm:min-h-[14rem] lg:min-h-[16rem] flex flex-col justify-end pb-7 sm:pb-9 pt-14 sm:pt-16">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
            Category
          </p>
          {limited && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#b45309] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1">
              <Clock3 className="size-3" />
              This week in {content.title}
            </span>
          )}
        </div>
        <h1
          id="category-hero-title"
          className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white leading-tight max-w-2xl text-balance"
        >
          {content.title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-white/80 max-w-xl font-light leading-relaxed">
          {content.blurb}
          {typeof productCount === 'number' ? (
            <span className="text-white/55">
              {' '}
              · {productCount} {productCount === 1 ? 'piece' : 'pieces'}
            </span>
          ) : null}
        </p>
      </div>
    </section>
  )
}
