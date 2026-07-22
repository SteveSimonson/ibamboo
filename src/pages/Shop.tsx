import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Clock3 } from 'lucide-react'
import {
  CATEGORY_OPTIONS,
  collections,
  filterProducts,
  formatExpiry,
  limitedTimeCopy,
  products,
  type Category,
} from '../data/catalog'
import { getCategoryHero } from '../data/categoryHeroes'
import {
  categoryDisplayName,
  getCollectionHero,
} from '../data/collectionHeroes'
import { ProductCard } from '../components/ProductCard'
import { CategoryHero } from '../components/CategoryHero'
import { CollectionContextRail } from '../components/CollectionContextRail'

export function Shop() {
  const [params, setParams] = useSearchParams()

  const cat = (params.get('cat') as Category | '') || ''
  const collection = params.get('collection') || ''
  const q = params.get('q') || ''
  const limited = params.get('limited') === '1'

  const filtered = useMemo(
    () => filterProducts({ cat, collection, q, limited }),
    [cat, collection, q, limited],
  )
  const drop = limitedTimeCopy()
  const until = formatExpiry(drop.expiresAt ?? undefined)
  const categoryHero = getCategoryHero(cat || null)
  const collectionHero = getCollectionHero(collection || null)
  const showCategoryHero = Boolean(cat && categoryHero)
  const showCollectionRail = Boolean(collection && collectionHero)
  /** Text intro only when neither category nor collection owns the page title */
  const showTextIntro = !showCategoryHero && !showCollectionRail
  const categoryLabel = categoryDisplayName(cat || null)
  const emptyIntersection =
    showCollectionRail && filtered.length === 0 && Boolean(cat || limited || q)

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    setParams(next, { replace: true })
  }

  const hasFilters = Boolean(cat || collection || q || limited)

  return (
    <div className="pb-28">
      {showCategoryHero && categoryHero ? (
        <CategoryHero
          content={categoryHero}
          limited={limited}
          productCount={filtered.length}
        />
      ) : null}

      {showCollectionRail && collectionHero ? (
        <CollectionContextRail
          content={collectionHero}
          productCount={filtered.length}
          limited={limited}
          categoryLabel={categoryLabel}
          compressed={showCategoryHero}
          emptyIntersection={emptyIntersection}
          onClear={() => updateParams({ collection: null })}
          onShowCollectionEverywhere={() =>
            updateParams({ cat: null, q: null })
          }
          onStayInCategory={() => updateParams({ collection: null })}
        />
      ) : null}

      <div
        className={`mx-auto max-w-7xl px-4 sm:px-6 pb-12 ${
          showCategoryHero || showCollectionRail ? 'pt-8 sm:pt-10' : 'pt-12'
        }`}
      >
        {showTextIntro && (
          <>
            <p className="label-micro mb-2">Shop</p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold">
              {limited ? 'This week’s limited options' : 'The collection'}
            </h1>
            <p className="text-ink-soft mt-3 max-w-xl text-lg font-light leading-relaxed">
              {limited
                ? 'Amazon Best Sellers edit for bamboo living. Options only available for a limited time—lists refresh weekly and ranks move.'
                : 'Kitchen, table, bath, workspace, and home—browse every piece, then buy on Amazon with secure checkout.'}
            </p>

            {limited && (
              <div className="mt-6 rounded-2xl border border-[#fdba74] bg-[#fff7ed] px-5 py-4 flex flex-wrap items-center gap-3">
                <Clock3 className="size-5 text-[#9a3412] shrink-0" />
                <div className="text-sm text-[#9a3412]">
                  <p className="font-bold uppercase tracking-wide text-[11px]">
                    {drop.headline}
                  </p>
                  <p className="mt-0.5">
                    {drop.count} options in this drop
                    {until ? ` · Rotates ${until}` : ''}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <div
          className={`mb-6 flex flex-wrap gap-3 items-center ${
            showTextIntro ? 'mt-8' : ''
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
            placeholder="Search the collection…"
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

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => updateParams({ cat: null, collection: null })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              !cat
                ? 'bg-ink text-paper'
                : 'bg-card border border-line hover:border-bamboo/40'
            }`}
          >
            All
          </button>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() =>
                updateParams({
                  cat: cat === c.id ? null : c.id,
                  // Changing category clears merch lens (design rule)
                  collection: null,
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

        <div className="mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted mb-2">
            Collection
          </p>
          <div className="flex flex-wrap gap-2">
            {collections.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  updateParams({
                    collection: collection === c.id ? null : c.id,
                  })
                }
                className={`rounded-full px-3 py-1.5 text-sm font-semibold border transition ${
                  collection === c.id
                    ? 'bg-bamboo text-white border-bamboo'
                    : 'bg-card border-line hover:border-bamboo/40'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6">
          <p className="text-sm font-semibold text-ink-soft">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
            {!hasFilters ? ` · ${products.length} in the house` : ''}
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

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-line bg-card p-14 text-center">
            <p className="font-display text-2xl font-semibold">No matches</p>
            <p className="text-ink-soft mt-2">
              {showCollectionRail && categoryLabel
                ? `No ${collectionHero?.label} pieces in ${categoryLabel}. Try clearing a filter.`
                : 'Try another category, collection, or search.'}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {showCollectionRail && cat && (
                <button
                  type="button"
                  onClick={() => updateParams({ cat: null })}
                  className="btn-secondary"
                >
                  Show {collectionHero?.label} everywhere
                </button>
              )}
              {showCollectionRail && cat && (
                <button
                  type="button"
                  onClick={() => updateParams({ collection: null })}
                  className="btn-secondary"
                >
                  Stay in {categoryLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => setParams({}, { replace: true })}
                className="btn-primary"
              >
                Show all products
              </button>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
