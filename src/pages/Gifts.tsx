import { Link } from 'react-router-dom'
import { ArrowRight, Gift } from 'lucide-react'
import {
  BUDGET_LABELS,
  RECIPIENT_LABELS,
  giftGuides,
} from '../data/giftGuides'
import { Seo } from '../components/Seo'
import { giftsHubSeo } from '../lib/seoData'

export function GiftsHubPage() {
  return (
    <div className="pb-24">
      <Seo {...giftsHubSeo()} />
      <section className="relative border-b border-line bg-moss overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/brand/soho-collection.webp"
            alt=""
            className="w-full h-full object-cover opacity-45"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-moss via-moss/90 to-moss/50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="label-micro mb-3 inline-flex items-center gap-1.5 !text-gold">
            <Gift className="size-3.5" /> Gift edit
          </p>
          <h1 className="font-display text-4xl sm:text-6xl font-semibold max-w-2xl text-balance leading-[1.05] text-paper">
            Gifts with a place in the house
          </h1>
          <p className="mt-4 text-lg text-paper/75 max-w-xl font-light leading-relaxed">
            Bamboo listicles locked to the iBamboo shelf — housewarming, hosts,
            kitchen, everyday eco swaps, and Christmas home picks. Chosen here.
            Bought on Amazon.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {giftGuides.map((g) => (
              <Link
                key={g.slug}
                to={`/gifts/${g.slug}`}
                className="rounded-full border border-white/25 bg-white/10 backdrop-blur px-3.5 py-1.5 text-xs font-semibold text-paper/90 hover:border-gold/50 hover:text-gold transition"
              >
                {g.primaryQuery}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="label-micro mb-1">Wave one</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold">
              Start with the occasion
            </h2>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {giftGuides.map((g) => {
            const recipients = g.recipientIds
              .map((id) => RECIPIENT_LABELS[id] || id)
              .filter(Boolean)
              .slice(0, 2)
            const budgets = g.budgetBands
              .map((b) => BUDGET_LABELS[b])
              .filter(Boolean)
              .slice(0, 2)
            return (
              <Link
                key={g.slug}
                to={`/gifts/${g.slug}`}
                className="group rounded-2xl border border-line bg-card overflow-hidden flex flex-col hover:border-bamboo/35 transition shadow-[0_4px_24px_-16px_rgba(18,26,18,0.12)]"
              >
                <div className="aspect-[16/10] bg-moss border-b border-line relative overflow-hidden">
                  {g.heroImage ? (
                    <img
                      src={g.heroImage}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-moss/70 via-transparent to-transparent" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-bamboo">
                    {recipients.join(' · ') || 'Gift guide'}
                    {g.readMinutes ? ` · ${g.readMinutes} min` : ''}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-semibold group-hover:text-bamboo transition leading-snug">
                    {g.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-soft line-clamp-3 flex-1 leading-relaxed">
                    {g.dek}
                  </p>
                  {budgets.length > 0 && (
                    <p className="mt-3 text-[11px] text-muted">
                      {budgets.join(' · ')} · {g.productEntries.length} picks
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-bamboo">
                    Open guide <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
