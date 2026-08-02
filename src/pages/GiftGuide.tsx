import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronDown,
  Clock3,
  ExternalLink,
  Gift,
} from 'lucide-react'
import { formatMoney, getProduct } from '../data/catalog'
import {
  BUDGET_LABELS,
  getGiftGuide,
  giftGuides,
} from '../data/giftGuides'
import { ProductCard } from '../components/ProductCard'
import { Seo } from '../components/Seo'
import { affiliateUrl } from '../lib/amazon'
import { trackAmazonClick } from '../lib/analytics'
import { giftGuideSeo } from '../lib/seoData'

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((para, i) => (
        <p
          key={i}
          className="text-sm sm:text-base text-ink-soft leading-relaxed mb-3 last:mb-0"
        >
          {para}
        </p>
      ))}
    </>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-ink leading-snug">{q}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted mt-0.5 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <p className="pb-4 text-sm text-ink-soft leading-relaxed -mt-1 pr-8">
          {a}
        </p>
      ) : null}
    </div>
  )
}

export function GiftGuidePage() {
  const { slug } = useParams()
  const guide = slug ? getGiftGuide(slug) : undefined

  if (!guide) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Seo
          title="Gift guide not found"
          description="This gift guide is not on iBamboo."
          path={`/gifts/${slug || ''}`}
          noindex
        />
        <h1 className="font-display text-3xl font-semibold">Not found</h1>
        <Link
          to="/gifts"
          className="text-bamboo font-semibold mt-4 inline-block"
        >
          Back to gifts
        </Link>
      </div>
    )
  }

  const entries = guide.productEntries
    .map((e) => {
      const product = getProduct(e.productSlug)
      return product ? { entry: e, product } : null
    })
    .filter(Boolean) as {
    entry: (typeof guide.productEntries)[0]
    product: NonNullable<ReturnType<typeof getProduct>>
  }[]

  const related = giftGuides.filter((g) => g.slug !== guide.slug).slice(0, 3)

  const updated = new Date(guide.updatedAt + 'T12:00:00').toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric' },
  )

  return (
    <div className="pb-24">
      <Seo {...giftGuideSeo(guide)} />

      <div className="border-b border-line bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="hover:text-bamboo">
            Home
          </Link>
          <span>/</span>
          <Link to="/gifts" className="hover:text-bamboo">
            Gifts
          </Link>
          <span>/</span>
          <span className="text-ink-soft truncate max-w-[14rem] sm:max-w-none">
            {guide.title}
          </span>
        </div>
      </div>

      {guide.heroImage ? (
        <div className="relative h-[min(40vh,26rem)] overflow-hidden bg-moss">
          <img
            src={guide.heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-moss/40 to-moss/25" />
        </div>
      ) : null}

      <article
        className={`mx-auto max-w-3xl px-4 sm:px-6 py-10 ${guide.heroImage ? 'relative -mt-14' : ''}`}
      >
        <Link
          to="/gifts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-bamboo mb-8"
        >
          <ArrowLeft className="size-4" /> All gift guides
        </Link>

        <p className="label-micro mb-3 inline-flex items-center gap-1.5">
          <Gift className="size-3.5 text-bamboo" /> Gift guide
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.08] text-balance">
          {guide.title}
        </h1>
        <p className="mt-4 text-lg text-ink-soft font-light leading-relaxed">
          {guide.dek}
        </p>
        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-4" />
            {guide.readMinutes ?? 6} min read
          </span>
          <span>·</span>
          <span>Updated {updated}</span>
          <span>·</span>
          <span>{entries.length} picks</span>
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          {guide.budgetBands.map((b) => (
            <span
              key={b}
              className="rounded-full border border-line bg-card px-3 py-1 text-[11px] font-semibold text-ink-soft"
            >
              {BUDGET_LABELS[b] || b}
            </span>
          ))}
        </div>

        <div className="mt-10 border-t border-line pt-10">
          <Paragraphs text={guide.intro} />
        </div>

        <section className="mt-14" aria-labelledby="gift-list-heading">
          <h2
            id="gift-list-heading"
            className="font-display text-2xl sm:text-3xl font-semibold mb-8"
          >
            The list
          </h2>
          <ol className="space-y-10">
            {entries.map(({ entry, product }, i) => {
              const shopUrl = affiliateUrl({
                asin: product.asin,
                searchKeywords: product.searchKeywords,
                name: product.name,
              })
              return (
                <li
                  key={product.id}
                  className="rounded-2xl border border-line bg-card overflow-hidden"
                >
                  <div className="grid sm:grid-cols-12 gap-0">
                    <div className="sm:col-span-4 border-b sm:border-b-0 sm:border-r border-line">
                      <ProductCard
                        product={product}
                        listName={`gift_${guide.slug}`}
                        compact
                      />
                    </div>
                    <div className="sm:col-span-8 p-5 sm:p-6 flex flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bamboo">
                            #{entry.rank ?? i + 1}
                            {entry.badge ? ` · ${entry.badge}` : ''}
                            {entry.priceBand
                              ? ` · ${BUDGET_LABELS[entry.priceBand] || entry.priceBand}`
                              : ''}
                          </p>
                          <h3 className="mt-1.5 font-display text-xl font-semibold">
                            <Link
                              to={`/product/${product.slug}`}
                              className="hover:text-bamboo transition"
                            >
                              {product.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-muted">
                            ~{formatMoney(product.priceHint)} on Amazon · varies
                          </p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-ink-soft leading-relaxed flex-1">
                        {entry.giftWhy}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          to={`/product/${product.slug}`}
                          className="btn-secondary !py-2.5 !px-4 !text-xs"
                        >
                          Why we list it
                        </Link>
                        <a
                          href={shopUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="btn-amazon !py-2.5 !px-4 !text-xs"
                          onClick={() =>
                            trackAmazonClick({
                              id: product.id,
                              name: product.name,
                              category: product.category,
                              price: product.priceHint,
                              asin: product.asin,
                              location: `gift_guide_${guide.slug}`,
                            })
                          }
                        >
                          Buy on Amazon <ExternalLink className="size-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        {guide.sections.map((sec) => (
          <section key={sec.heading} className="mt-14">
            <h2 className="font-display text-2xl font-semibold mb-4">
              {sec.heading}
            </h2>
            <Paragraphs text={sec.body} />
          </section>
        ))}

        {guide.faq.length > 0 && (
          <section className="mt-14" aria-labelledby="gift-faq-heading">
            <h2
              id="gift-faq-heading"
              className="font-display text-2xl font-semibold mb-5"
            >
              Questions before you buy
            </h2>
            <div className="rounded-2xl border border-line bg-card px-5 sm:px-6">
              {guide.faq.map((f) => (
                <FaqItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </section>
        )}
      </article>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-8 border-t border-line pt-16">
          <p className="label-micro mb-2">More gift edits</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-6">
            Related guides
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {related.map((g) => (
              <Link
                key={g.slug}
                to={`/gifts/${g.slug}`}
                className="rounded-2xl border border-line bg-card p-5 hover:border-bamboo/35 transition"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bamboo">
                  {g.primaryQuery}
                </p>
                <p className="mt-2 font-display text-lg font-semibold">
                  {g.title}
                </p>
                <p className="mt-1.5 text-sm text-ink-soft line-clamp-2">
                  {g.dek}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
