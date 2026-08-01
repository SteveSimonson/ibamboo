import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock3 } from 'lucide-react'
import { trackShopFilter } from '../lib/analytics'
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  filterProducts,
  formatExpiry,
  limitedTimeCopy,
  type Category,
} from '../data/catalog'
import { getCategoryHero } from '../data/categoryHeroes'
import { resolveCollectionToCategory } from '../data/collectionRedirect'
import { ProductCard } from '../components/ProductCard'
import { CategoryHero } from '../components/CategoryHero'
import { CategoryVibeCheck } from '../components/CategoryVibeCheck'
import { AdaptiveContentBalloon } from '../components/AdaptiveContentBalloons'
import { useAdaptiveContentBalloons } from '../hooks/useAdaptiveContentBalloons'
import { deriveBalloonPlan } from '../lib/balloonPlan'
import { Seo } from '../components/Seo'
import { shopSeo } from '../lib/seoData'
import { useFlashCatalog } from '../hooks/useFlashCatalog'

export function Shop() {
  const [params, setParams] = useSearchParams()
  const flash = useFlashCatalog('ibamboo')
  const pool = flash.products

  // Legacy ?collection= → room category (P0: single browse spine)
  useEffect(() => {
    const legacy = params.get('collection')
    if (!legacy) return
    const next = new URLSearchParams(params)
    next.delete('collection')
    const mapped = resolveCollectionToCategory(legacy)
    if (mapped && !next.get('cat')) next.set('cat', mapped)
    setParams(next, { replace: true })
  }, [params, setParams])

  const cat = (params.get('cat') as Category | '') || ''
  const q = params.get('q') || ''
  const limited = params.get('limited') === '1'

  // Track filter/search changes (debounced for typing)
  const filterKey = `${cat}|${limited ? 1 : 0}|${q}`
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      trackShopFilter({
        category: cat || undefined,
        limited,
        query: q || undefined,
      })
    }, q ? 450 : 0)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [filterKey, cat, limited, q])

  const filtered = useMemo(
    () => filterProducts({ cat, q, limited }, pool),
    [cat, q, limited, pool],
  )
  const drop = limitedTimeCopy(pool)
  const until = formatExpiry(drop.expiresAt ?? undefined)
  const categoryHero = getCategoryHero(cat || null)
  const showCategoryHero = Boolean(cat && categoryHero)
  const balloonPlan = useMemo(
    () =>
      deriveBalloonPlan({
        routeKey: `shop:${cat || 'all'}:${limited ? 'limited' : 'standard'}:${filtered.length}`,
        narrativeSections: showCategoryHero ? 2 : 1,
        featureGroups: cat ? 2 : 1,
        itemCount: filtered.length,
        candidates: [
          { anchor: 'shop-top', ariaLabel: 'Bamboo shopping fact', size: 'responsive', minHeight: 112, topics: [cat || 'home', 'product-research'], editorialTypes: ['did_you_know', 'care_tip'] },
          { anchor: 'shop-grid-20', ariaLabel: 'Bamboo design note', size: 'responsive', minHeight: 112, topics: [cat || 'home', 'design'], editorialTypes: ['design_note', 'fun_fact'] },
          { anchor: 'shop-grid-40', ariaLabel: 'Bamboo fact', size: 'responsive', minHeight: 112, topics: [cat || 'home', 'bamboo-basics'], editorialTypes: ['did_you_know', 'fun_fact'] },
          { anchor: 'shop-grid-60', ariaLabel: 'Bamboo care tip', size: 'responsive', minHeight: 112, topics: [cat || 'home', 'care'], editorialTypes: ['care_tip', 'material_myth'] },
          { anchor: 'shop-grid-80', ariaLabel: 'Bamboo fact', size: 'responsive', minHeight: 112, topics: [cat || 'home', 'sustainability'], editorialTypes: ['did_you_know', 'material_myth'] },
          { anchor: 'shop-after-grid', ariaLabel: 'Bamboo material note', size: 'responsive', minHeight: 112, topics: [cat || 'home', 'product-research'], editorialTypes: ['design_note', 'care_tip'] },
          { anchor: 'shop-end', ariaLabel: 'Bamboo fact', size: 'responsive', minHeight: 112, topics: [cat || 'home', 'lifestyle'], editorialTypes: ['fun_fact', 'did_you_know'] },
        ],
      }),
    [cat, filtered.length, limited, showCategoryHero],
  )
  const balloonDeck = useAdaptiveContentBalloons(balloonPlan, !flash.loading)

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    next.delete('collection') // never reintroduce dual filter
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  const hasFilters = Boolean(cat || q || limited)
  const contextLabel = cat
    ? CATEGORY_LABELS[cat as Category]
    : limited
      ? 'This week'
      : 'All rooms'

  return (
    <div className="pb-28">
      <Seo {...shopSeo({ cat, limited, q })} />
      {showCategoryHero && categoryHero ? (
        <CategoryHero
          content={categoryHero}
          limited={limited}
          productCount={filtered.length}
        />
      ) : null}

      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 pb-12 ${
          showCategoryHero ? 'pt-8 sm:pt-10' : 'pt-12'
        }`}
      >
        {!showCategoryHero && (
          <>
            <p className="label-micro mb-2">Shop</p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold">
              {limited ? 'This week’s limited options' : 'The collection'}
            </h1>
            <p className="text-ink-soft mt-3 max-w-xl text-lg font-light leading-relaxed">
              {limited
                ? 'Live Amazon flash edit for bamboo living. Options only available for a limited time—lists refresh on the flash catalog schedule.'
                : 'Browse by room of the house, then buy on Amazon with secure checkout.'}
            </p>

            {limited && (
              <div className="mt-6 rounded-2xl border border-[#fdba74] bg-[#fff7ed] px-5 py-4 flex flex-wrap items-center gap-3">
                <Clock3 className="size-5 text-[#9a3412] shrink-0" />
                <div className="text-sm text-[#9a3412]">
                  <p className="font-bold uppercase tracking-wide text-[11px]">
                    {drop.headline}
                    {flash.source === 'flash' ? ' · live flash' : ''}
                  </p>
                  <p className="mt-0.5">
                    {drop.count} options in this drop
                    {until ? ` · Rotates ${until}` : ''}
                    {flash.loading ? ' · updating…' : ''}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div
          className={`mb-6 flex flex-wrap gap-3 items-center ${
            showCategoryHero ? '' : 'mt-8'
          }`}
        >
          <label className="sr-only" htmlFor="search">
            Search
          </label>
          <input
            id="search"
            type="search"
            value={q}
            onChange={(e) => updateParams({ q: e.target.value || null })}
            placeholder="Search products…"
            className="w-full max-w-md rounded-2xl border border-line bg-card px-4 py-3.5 text-sm font-medium outline-none focus:border-bamboo focus:ring-2 focus:ring-bamboo/15"
          />
          <button
            type="button"
            onClick={() => updateParams({ limited: limited ? null : '1' })}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition inline-flex items-center gap-1.5 ${
              limited
                ? 'bg-[#9a3412] text-white'
                : 'bg-card border border-line hover:border-[#9a3412]/40 text-[#9a3412]'
            }`}
          >
            <Clock3 className="size-3.5" />
            Limited time only
          </button>
        </div>

        {/* Single room taxonomy */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => updateParams({ cat: null })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              !cat
                ? 'bg-ink text-paper'
                : 'bg-card border border-line hover:border-bamboo/40'
            }`}
          >
            All rooms
          </button>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                updateParams({
                  cat: cat === c.id ? null : c.id,
                })
              }
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                cat === c.id
                  ? 'bg-ink text-paper'
                  : 'bg-card border border-line hover:border-bamboo/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-sm font-semibold text-ink-soft">
            Showing: {contextLabel}
            {' · '}
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            {!hasFilters ? ` · ${pool.length} in the house` : ''}
          </p>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="text-sm font-semibold text-bamboo"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="mb-10 border-y border-line py-8">
          <AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="shop-top" />
        </div>

        {/* Room → vibe engagement (quiz / registration funnel) */}
        {cat ? (
          <CategoryVibeCheck category={cat as Category} placement="mid" />
        ) : null}

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-14 text-center">
            <p className="font-display text-2xl font-semibold">No matches</p>
            <p className="text-ink-soft mt-2">
              Try another room or clear search / limited filter.
            </p>
            <button
              type="button"
              onClick={() => setParams({}, { replace: true })}
              className="btn-primary mt-6"
            >
              Show all products
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.flatMap((p, index) => {
              const placement = [
                'shop-grid-20',
                'shop-grid-40',
                'shop-grid-60',
                'shop-grid-80',
              ][Math.floor(((index + 1) * 4) / filtered.length) - 1]
              return [
                <ProductCard key={p.id} product={p} listName={cat ? `shop_${cat}` : limited ? 'shop_limited' : 'shop_all'} />,
                placement && index < filtered.length - 1 ? (
                  <div key={`${p.id}-${placement}`} className="col-span-full border-y border-line py-7">
                    <AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor={placement} />
                  </div>
                ) : null,
              ]
            })}
          </div>
        )}

        <div className="mt-10 border-y border-line py-8"><AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="shop-after-grid" /></div>

        {/* Second touch after browsing — stronger CTA */}
        {cat ? (
          <CategoryVibeCheck category={cat as Category} placement="end" />
        ) : null}
        <div className="mt-10"><AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="shop-end" /></div>
      </div>
    </div>
  )
}
