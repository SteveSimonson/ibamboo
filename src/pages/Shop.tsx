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
import { ProductGridBalloonCard } from '../components/ProductGridBalloonCard'
import { useAdaptiveContentBalloons } from '../hooks/useAdaptiveContentBalloons'
import { useViewportTier } from '../hooks/useViewportTier'
import {
  FACT_EDITORIAL_TYPES,
  deriveBalloonPlan,
} from '../lib/balloonPlan'
import { Seo } from '../components/Seo'
import { shopSeo } from '../lib/seoData'
import { useFlashCatalog } from '../hooks/useFlashCatalog'
import { shopGridInsertions } from '../lib/shopBalloonGrid'

export function Shop() {
  const [params, setParams] = useSearchParams()
  const flash = useFlashCatalog('ibamboo')
  const { tier: viewportTier, ready: viewportReady } = useViewportTier()
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
  const drop = limitedTimeCopy(pool, {
    weekOf: flash.weekOf,
    generatedAt: flash.generatedAt,
  })
  const until = formatExpiry(drop.expiresAt ?? undefined)
  const categoryHero = getCategoryHero(cat || null)
  const showCategoryHero = Boolean(cat && categoryHero)
  const gridInsertions = useMemo(
    () => shopGridInsertions(filtered.length),
    [filtered.length],
  )
  const gridPlacementByIndex = useMemo(
    () => new Map(gridInsertions.map(item => [item.afterIndex, item.anchor])),
    [gridInsertions],
  )
  const balloonPlan = useMemo(
    () =>
      deriveBalloonPlan({
        routeKey: `shop:${cat || 'all'}:${limited ? 'limited' : 'standard'}:${filtered.length}`,
        tier: viewportTier,
        narrativeSections: showCategoryHero ? 2 : 1,
        featureGroups: cat ? 2 : 1,
        itemCount: filtered.length,
        candidates: [
          ...gridInsertions.map((item) => ({
            anchor: item.anchor,
            ariaLabel: 'Bamboo fact among products',
            budget: 'compact-v1' as const,
            layout: 'product-card' as const,
            role: 'grid-tile' as const,
            section: `product-grid-${item.anchor}`,
            size: 'responsive' as const,
            topics: [cat || 'home', item.topic],
            editorialTypes: FACT_EDITORIAL_TYPES,
          })),
        ],
      }),
    [cat, filtered.length, gridInsertions, limited, showCategoryHero, viewportTier],
  )
  const balloonDeck = useAdaptiveContentBalloons(balloonPlan, viewportReady && !flash.loading, viewportTier)

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
                ? 'Assortment from the live flash catalog control plane — filters and schedule managed there; refresh anytime without a site redeploy.'
                : 'Browse by room of the house, then buy on Amazon with secure checkout. Assortment is driven by the flash catalog.'}
            </p>

            <div className="mt-6 rounded-2xl border border-line bg-card px-5 py-4 flex flex-wrap items-center gap-3">
              <Clock3 className="size-5 text-bamboo shrink-0" />
              <div className="text-sm text-ink-soft">
                <p className="font-bold uppercase tracking-wide text-[11px] text-ink">
                  {flash.source === 'flash'
                    ? 'Live assortment'
                    : 'Emergency static catalog'}
                  {flash.loading ? ' · updating…' : ''}
                </p>
                <p className="mt-0.5">
                  {pool.length} products
                  {drop.weekOf ? ` · week of ${drop.weekOf}` : ''}
                  {until ? ` · rotates ${until}` : ''}
                  {flash.error && flash.source === 'static'
                    ? ` · ${flash.error}`
                    : ''}
                </p>
              </div>
            </div>
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
          <div className="grid items-stretch sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.flatMap((p, index) => {
              const placement = gridPlacementByIndex.get(index)
              return [
                <ProductCard key={p.id} product={p} listName={cat ? `shop_${cat}` : limited ? 'shop_limited' : 'shop_all'} />,
                placement &&
                balloonDeck[placement] ? (
                  <ProductGridBalloonCard
                    key={`${p.id}-${placement}`}
                    plan={balloonPlan}
                    deck={balloonDeck}
                    anchor={placement}
                  />
                ) : null,
              ]
            })}
          </div>
        )}

        {/* Second touch after browsing — stronger CTA */}
        {cat ? (
          <CategoryVibeCheck category={cat as Category} placement="end" />
        ) : null}
      </div>
    </div>
  )
}
