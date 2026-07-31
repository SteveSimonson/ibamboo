import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock3 } from 'lucide-react'
import {
  bsrLeaders,
  CATEGORY_OPTIONS,
  formatExpiry,
  limitedProducts,
  limitedTimeCopy,
  shopProducts,
} from '../data/catalog'
import { HEROES } from '../data/categoryHeroes'
import { VIBE_LIST, vibePath } from '../data/vibes'
import { ProductCard } from '../components/ProductCard'
import { Seo } from '../components/Seo'
import { homeSeo } from '../lib/seoData'
import { useFlashCatalog } from '../hooks/useFlashCatalog'

export function Home() {
  const flash = useFlashCatalog('ibamboo')
  const pool = flash.products
  const limited = limitedTimeCopy(pool)
  const weekLeaders = bsrLeaders(8, pool)
  const limitedAll = limitedProducts(pool)
  const until = formatExpiry(limited.expiresAt ?? undefined)

  const featured = useMemo(() => {
    const base = pool.length ? pool : shopProducts
    return [...base.filter((p) => p.badge), ...base]
      .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
      .slice(0, 8)
  }, [pool])

  const newArrivals = useMemo(() => {
    const base = pool.length ? pool : shopProducts
    return base.slice().reverse().slice(0, 4)
  }, [pool])

  return (
    <>
      <Seo {...homeSeo()} />
      {/* Hero — photoreal lifestyle, not illustration */}
      <section className="relative min-h-[min(92vh,52rem)] flex items-end overflow-hidden bg-charcoal">
        <img
          src="/brand/hero.webp"
          alt="Sunlit modern kitchen with bamboo boards and utensils overlooking a bamboo garden"
          className="absolute inset-0 w-full h-full object-cover object-[center_40%]"
          fetchPriority="high"
          decoding="async"
        />
        {/* Soft editorial wash: readable type without crushing the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/35 to-charcoal/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/55 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-14 sm:pb-20 pt-28 sm:pt-36">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/12 backdrop-blur-md text-white border border-white/20 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] mb-6">
              <Clock3 className="size-3.5 text-gold" />
              Limited-time house edit
            </p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-[4.25rem] font-semibold text-white leading-[1.05] text-balance drop-shadow-[0_2px_24px_rgba(0,0,0,0.35)]">
              Living designed in bamboo.
            </h1>
            <p className="mt-5 text-lg sm:text-xl text-white/85 max-w-lg leading-relaxed font-light">
              A calmer kitchen, table, bath, and workspace—curated weekly from
              Amazon Best Sellers. Discover here. Buy on Amazon.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop?limited=1"
                className="btn-primary !bg-white !text-moss hover:!bg-cream !shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)]"
              >
                Shop this week’s drop <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 backdrop-blur-sm px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/18 transition"
              >
                Take the vibe check
              </Link>
            </div>
            {until && (
              <p className="mt-6 text-sm text-white/60">
                Edit refreshes {until}
                {limited.count > 0
                  ? ` · ${limited.count} limited options live`
                  : ''}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Limited-time BSR strip */}
      {weekLeaders.length > 0 && (
        <section className="border-b border-line bg-[#fff7ed]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9a3412] mb-2">
                  {limited.headline}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink">
                  This week’s Amazon Best Sellers
                </h2>
                <p className="text-ink-soft mt-2 max-w-xl font-light">
                  Ranked placements from Amazon’s public Best Sellers lists—curated
                  for bamboo living. Lists rotate weekly.
                </p>
              </div>
              <Link
                to="/shop?limited=1"
                className="text-sm font-semibold text-[#9a3412] inline-flex items-center gap-1"
              >
                View all {limitedAll.length || ''} <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {weekLeaders.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  listName="home_week_leaders"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category strip */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex gap-2 overflow-x-auto">
          {CATEGORY_OPTIONS.map((c) => (
            <Link
              key={c.id}
              to={`/shop?cat=${c.id}`}
              className="shrink-0 rounded-full border border-line px-4 py-2 text-xs font-semibold text-ink-soft hover:border-bamboo hover:text-bamboo transition"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="label-micro mb-2">Featured</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">
              Essentials of the house
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-semibold text-bamboo inline-flex items-center gap-1 shrink-0"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} listName="home_featured" />
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="bg-moss text-paper">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[560px]">
            <img
              src="/brand/products-flatlay.webp"
              alt="iBamboo kitchenware collection"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-8 sm:px-14 py-16 space-y-5">
            <p className="label-micro !text-gold">Craft</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
              Material with presence.
            </h2>
            <p className="text-paper/75 leading-relaxed text-lg font-light max-w-md">
              Bamboo grows with uncommon speed and strength. We bring it into
              the objects you touch every day—spoons, boards, trays, and desk
              tools—finished for real kitchens and real lives.
            </p>
            <Link
              to="/shop?cat=kitchen"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-leaf transition w-fit"
            >
              Explore kitchen <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="label-micro mb-2">Just in</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold">
              New arrivals
            </h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} listName="home_new_arrivals" />
          ))}
        </div>
      </section>

      {/* Rooms */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <p className="label-micro mb-2">Rooms</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-10">
            Shop by room
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORY_OPTIONS.map((c) => {
              const hero = HEROES[c.id]
              const count = shopProducts.filter((p) => p.category === c.id).length
              return (
                <Link
                  key={c.id}
                  to={`/shop?cat=${c.id}`}
                  className="group rounded-2xl border border-line p-7 hover:border-bamboo/40 hover:shadow-lg transition bg-paper"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                    {count} pieces
                  </p>
                  <h3 className="font-display text-2xl font-semibold mt-2 group-hover:text-bamboo transition">
                    {c.label}
                  </h3>
                  <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                    {hero?.blurb ?? 'Bamboo for the house.'}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-bamboo">
                    Browse <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vibes strip — CMO: soft discovery under shop-by-room */}
      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="label-micro mb-2">Vibes</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold">
                Find your house energy
              </h2>
              <p className="mt-2 text-ink-soft max-w-lg font-light">
                Six lifestyle personas—crafted like collector cards. Not sure?
                Take the check.
              </p>
            </div>
            <Link
              to="/quiz"
              className="text-sm font-semibold text-bamboo inline-flex items-center gap-1 shrink-0"
            >
              Take the vibe check <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {VIBE_LIST.map((v) => (
              <Link
                key={v.id}
                to={vibePath(v.id)}
                className="group overflow-hidden rounded-2xl border border-line bg-card hover:border-bamboo/40 hover:shadow-md transition"
              >
                <div className="aspect-[4/3] overflow-hidden bg-paper-2">
                  <img
                    src={v.avatar.image}
                    alt=""
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3.5">
                  <p className="font-display text-lg font-semibold leading-snug group-hover:text-bamboo transition">
                    {v.title}
                  </p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {v.avatar.name}
                  </p>
                  <p className="mt-1 text-xs text-muted line-clamp-2">
                    {v.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SOHO / lifestyle */}
      <section className="relative overflow-hidden">
        <img
          src="/brand/soho-collection.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-charcoal/70" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 py-24 text-center text-white">
          <p className="label-micro !text-gold mb-3">Lifestyle</p>
          <h2 className="font-display text-3xl sm:text-5xl font-semibold leading-tight">
            From the forest to the table.
          </h2>
          <p className="mt-4 text-white/75 font-light text-lg max-w-lg mx-auto leading-relaxed">
            A full house of bamboo—discover, compare, and buy on Amazon with
            iBamboo as your guide.
          </p>
          <Link to="/shop" className="btn-primary mt-8 !bg-white !text-moss hover:!bg-cream">
            Enter the shop <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
