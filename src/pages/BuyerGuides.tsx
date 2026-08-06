import { Link } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'
import { CATEGORY_LABELS } from '../data/catalog'
import { buyerGuides } from '../data/buyerGuides'
import { Seo } from '../components/Seo'
import { buyerGuidesHubSeo } from '../lib/seoData'

export function BuyerGuidesHubPage() {
  return (
    <div className="pb-24">
      <Seo {...buyerGuidesHubSeo()} />
      <section className="relative border-b border-line bg-paper-2 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/brand/categories/kitchen.webp"
            alt=""
            className="w-full h-full object-cover opacity-40"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/92 to-paper/55" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="label-micro mb-3 inline-flex items-center gap-1.5 text-bamboo">
            <Compass className="size-3.5" /> Buyer guides
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold max-w-2xl text-balance leading-[1.05]">
            Jobs for a calmer home
          </h1>
          <p className="mt-4 text-lg text-ink-soft max-w-xl font-light leading-relaxed">
            High-intent bamboo guides — board care, first prep surface, humid
            baths, kitchen swaps, picnic kits, entry trays, desks, hosting,
            dinnerware, utensil sets. Catalog-backed. Bought on Amazon.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {buyerGuides.map((g) => (
              <Link
                key={g.slug}
                to={`/guides/${g.slug}`}
                className="rounded-full border border-line bg-card/80 backdrop-blur px-3.5 py-1.5 text-xs font-semibold text-ink-soft hover:border-bamboo/40 hover:text-bamboo transition"
              >
                {g.primaryQuery}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="mb-8">
          <p className="label-micro mb-1">Field guides</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            {buyerGuides.length} buyer jobs
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {buyerGuides.map((g, i) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="group rounded-2xl border border-line bg-card overflow-hidden flex flex-col hover:border-bamboo/35 transition shadow-[0_4px_24px_-16px_rgba(0,0,0,0.12)]"
            >
              <div className="aspect-[16/10] bg-paper-2 border-b border-line relative overflow-hidden">
                {g.heroImage ? (
                  <img
                    src={g.heroImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-paper/80 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-[0.16em] text-bamboo bg-paper/80 px-2 py-1 rounded">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bamboo">
                  {CATEGORY_LABELS[g.category] || g.category}
                  {g.readMinutes ? ` · ${g.readMinutes} min` : ''}
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold group-hover:text-bamboo transition leading-snug">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm text-ink-soft line-clamp-3 flex-1 leading-relaxed">
                  {g.dek}
                </p>
                <p className="mt-3 text-[11px] text-muted">
                  {g.productEntries.length} picks ·{' '}
                  <span className="inline-flex items-center gap-1 group-hover:text-bamboo">
                    Read <ArrowRight className="size-3" />
                  </span>
                </p>
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-12 text-sm text-muted max-w-2xl">
          Gift listicles live under{' '}
          <Link to="/gifts" className="text-bamboo font-semibold hover:underline">
            /gifts
          </Link>
          . These pages are for the job search — care, prep, bath humidity,
          swaps, picnic, entry, desk, hosting, table, utensils.
        </p>
      </div>
    </div>
  )
}
