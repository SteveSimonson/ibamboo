import { Link } from 'react-router-dom'
import { ArrowRight, Clock3 } from 'lucide-react'
import {
  bsrLeaders,
  collections,
  formatExpiry,
  limitedProducts,
  limitedTimeCopy,
  products,
} from '../data/catalog'
import { ProductCard } from '../components/ProductCard'

const featured = [
  ...products.filter((p) => p.badge),
  ...products,
]
  .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
  .slice(0, 8)

const newArrivals = products.slice().reverse().slice(0, 4)

export function Home() {
  const limited = limitedTimeCopy()
  const weekLeaders = bsrLeaders(8)
  const limitedAll = limitedProducts()
  const until = formatExpiry(limited.expiresAt ?? undefined)

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-end overflow-hidden">
        <img
          src="/brand/hero.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 w-full pb-16 sm:pb-24 pt-32">
          <p className="inline-flex items-center gap-2 rounded-full bg-[#b45309]/95 text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] mb-5">
            <Clock3 className="size-3.5" />
            Options only available for a limited time
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-semibold text-white leading-[1.05] max-w-3xl text-balance">
            Living designed in bamboo.
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-white/80 max-w-xl leading-relaxed font-light">
            Weekly Amazon Best Sellers edit for the house—kitchen, boards, bath,
            workspace, and more. Placements move. When the list refreshes, this
            week’s options may be gone.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop?limited=1"
              className="btn-primary !bg-white !text-moss hover:!bg-cream"
            >
              Shop this week’s drop <ArrowRight className="size-4" />
            </Link>
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/20 transition"
            >
              Take the vibe check
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Full collection
            </Link>
          </div>
          {until && (
            <p className="mt-5 text-sm text-white/65">
              This edit refreshes {until}
              {limited.count > 0 ? ` · ${limited.count} limited options live` : ''}
            </p>
          )}
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
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category strip */}
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex gap-2 overflow-x-auto">
          {[
            { to: '/shop?cat=kitchen', label: 'Kitchen' },
            { to: '/shop?cat=cutting-boards', label: 'Boards & serving' },
            { to: '/shop?cat=dining', label: 'Tabletop' },
            { to: '/shop?cat=bath', label: 'Bath' },
            { to: '/shop?cat=organization', label: 'Organization' },
            { to: '/shop?cat=desk', label: 'Workspace' },
            { to: '/shop?cat=outdoor', label: 'Outdoor' },
            { to: '/shop?cat=baby', label: 'Little ones' },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
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
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Editorial split */}
      <section className="bg-moss text-paper">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2">
          <div className="relative min-h-[420px] lg:min-h-[560px]">
            <img
              src="/brand/products-flatlay.png"
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
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Collections */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <p className="label-micro mb-2">Collections</p>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mb-10">
            Shop by room
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/shop?collection=${c.id}`}
                className="group rounded-2xl border border-line p-7 hover:border-bamboo/40 hover:shadow-lg transition bg-paper"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                  {c.count} pieces
                </p>
                <h3 className="font-display text-2xl font-semibold mt-2 group-hover:text-bamboo transition">
                  {c.label}
                </h3>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                  {c.blurb}
                </p>
                <span className="inline-flex items-center gap-1 mt-5 text-sm font-semibold text-bamboo">
                  Browse <ArrowRight className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SOHO / lifestyle */}
      <section className="relative overflow-hidden">
        <img
          src="/brand/soho-collection.png"
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
