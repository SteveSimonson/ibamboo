import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Clock3, Compass, ExternalLink } from 'lucide-react'
import { CATEGORY_LABELS, formatMoney, getProduct } from '../data/catalog'
import { buyerGuides, getBuyerGuide } from '../data/buyerGuides'
import { ProductCard } from '../components/ProductCard'
import { Seo } from '../components/Seo'
import { affiliateUrl } from '../lib/amazon'
import { trackAmazonClick } from '../lib/analytics'
import { buyerGuideSeo } from '../lib/seoData'

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
        <p className="pb-4 text-sm text-ink-soft leading-relaxed -mt-1 pr-8">{a}</p>
      ) : null}
    </div>
  )
}

export function BuyerGuidePage() {
  const { slug } = useParams()
  const guide = slug ? getBuyerGuide(slug) : undefined

  if (!guide) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Seo
          title="Guide not found"
          description="This buyer guide is not on iBamboo."
          path={`/guides/${slug || ''}`}
          noindex
        />
        <h1 className="font-display text-3xl font-semibold">Not found</h1>
        <Link to="/guides" className="text-bamboo font-semibold mt-4 inline-block">
          Back to guides
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

  const related = buyerGuides.filter((g) => g.slug !== guide.slug).slice(0, 3)
  const catLabel = CATEGORY_LABELS[guide.category] || guide.category
  const updated = new Date(guide.updatedAt + 'T12:00:00').toLocaleDateString(
    'en-US',
    { month: 'long', year: 'numeric' },
  )

  return (
    <div className="pb-24">
      <Seo {...buyerGuideSeo(guide)} />

      <div className="border-b border-line bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="hover:text-bamboo">
            Home
          </Link>
          <span>/</span>
          <Link to="/guides" className="hover:text-bamboo">
            Guides
          </Link>
          <span>/</span>
          <span className="text-ink-soft truncate max-w-[14rem] sm:max-w-none">
            {guide.title}
          </span>
        </div>
      </div>

      {guide.heroImage ? (
        <div className="relative h-[min(40vh,26rem)] overflow-hidden bg-paper-2">
          <img
            src={guide.heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-paper via-paper/50 to-transparent" />
        </div>
      ) : null}

      <article
        className={`mx-auto max-w-3xl px-4 sm:px-6 py-10 ${guide.heroImage ? 'relative -mt-14' : ''}`}
      >
        <Link
          to="/guides"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-bamboo mb-8"
        >
          <ArrowLeft className="size-4" /> All buyer guides
        </Link>

        <p className="label-micro mb-3 inline-flex items-center gap-1.5">
          <Compass className="size-3.5 text-bamboo" /> {catLabel} · Buyer guide
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

        <div className="mt-10 border-t border-line pt-10">
          <Paragraphs text={guide.intro} />
        </div>

        {guide.hardNo ? (
          <div className="mt-8 rounded-xl border border-bamboo/30 bg-card px-4 py-3 text-sm text-ink-soft leading-relaxed">
            <strong className="text-bamboo">Hard no. </strong>
            {guide.hardNo.replace(/^Hard no:\s*/i, '')}
          </div>
        ) : null}

        <section className="mt-14" aria-labelledby="pick-list-heading">
          <h2
            id="pick-list-heading"
            className="font-display text-2xl sm:text-3xl font-semibold mb-8"
          >
            Starting picks
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
                        listName={`buyer_guide_${guide.slug}`}
                        compact
                      />
                    </div>
                    <div className="sm:col-span-8 p-5 sm:p-6 flex flex-col">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-bamboo">
                        #{entry.rank ?? i + 1}
                        {entry.badge ? ` · ${entry.badge}` : ''}
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
                      <p className="mt-4 text-sm text-ink-soft leading-relaxed flex-1">
                        {entry.pickWhy}
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
                              location: `buyer_guide_${guide.slug}`,
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

        <section className="mt-14 border-t border-line pt-10">
          <h2 className="font-display text-2xl font-semibold mb-2">
            Straight answers
          </h2>
          <div className="mt-4 rounded-2xl border border-line bg-card px-4 sm:px-5">
            {guide.faq.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-semibold mb-6">
              Keep reading
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((g) => (
                <Link
                  key={g.slug}
                  to={`/guides/${g.slug}`}
                  className="rounded-xl border border-line bg-card p-4 hover:border-bamboo/35 transition"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bamboo">
                    {CATEGORY_LABELS[g.category] || g.category}
                  </p>
                  <p className="mt-2 font-display font-semibold leading-snug">
                    {g.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft line-clamp-2">
                    {g.dek}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-14 text-sm text-muted">
          <Link to="/shop" className="text-bamboo font-semibold hover:underline">
            Shop the catalog
          </Link>
          {' · '}
          <Link to="/gifts" className="hover:text-bamboo">
            Gift guides
          </Link>
          {' · '}
          <Link to="/quiz" className="hover:text-bamboo">
            Vibe check
          </Link>
        </p>
      </article>
    </div>
  )
}
