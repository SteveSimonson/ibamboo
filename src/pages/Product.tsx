import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Clock3,
  ExternalLink,
  Package,
  Shield,
  Truck,
} from 'lucide-react'
import {
  categoryLabel,
  formatExpiry,
  formatMoney,
  getProduct,
  similarProducts,
  youMayAlsoLike,
} from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import { StarRating } from '../components/StarRating'
import { affiliateUrl, AMAZON_ASSOCIATE_TAG } from '../lib/amazon'

export function ProductPage() {
  const { slug } = useParams()
  const product = slug ? getProduct(slug) : undefined
  const [activeImg, setActiveImg] = useState(0)

  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-semibold">Not found</h1>
        <Link to="/shop" className="text-bamboo font-semibold mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    )
  }

  const shopUrl = affiliateUrl({
    asin: product.asin,
    searchKeywords: product.searchKeywords,
    name: product.name,
  })
  const similar = similarProducts(product, 4)
  const alsoLike = youMayAlsoLike(product, 4)
  const images = product.images.length ? product.images : []
  const main = images[activeImg] ?? images[0]
  const until = formatExpiry(product.expiresAt)

  return (
    <div className="pb-28">
      {/* Breadcrumb */}
      <div className="border-b border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-muted">
          <Link to="/" className="hover:text-bamboo">
            Home
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-bamboo">
            Shop
          </Link>
          <span>/</span>
          <Link
            to={`/shop?cat=${product.category}`}
            className="hover:text-bamboo"
          >
            {categoryLabel(product.category)}
          </Link>
          <span>/</span>
          <span className="text-ink-soft truncate max-w-[12rem] sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <Link
          to="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-bamboo mb-8"
        >
          <ArrowLeft className="size-4" /> Back to shop
        </Link>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Gallery */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-cream border border-line shadow-sm">
              {main ? (
                <img
                  key={main}
                  src={main}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-contain p-6 sm:p-10"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              {product.badge && (
                <span className="absolute top-4 left-4 rounded-full bg-moss text-paper text-xs font-semibold uppercase tracking-wider px-3 py-1.5">
                  {product.badge}
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`relative shrink-0 size-20 sm:size-24 rounded-xl overflow-hidden border-2 transition bg-cream ${
                      i === activeImg
                        ? 'border-bamboo'
                        : 'border-transparent hover:border-line'
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Buy box */}
          <div className="lg:col-span-5 space-y-6">
            {product.limitedTime && (
              <div className="rounded-2xl border border-[#fdba74] bg-[#fff7ed] px-4 py-3 flex gap-3">
                <Clock3 className="size-5 text-[#9a3412] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-[#9a3412]">
                    Options only available for a limited time
                  </p>
                  <p className="text-sm text-[#9a3412]/90 mt-0.5">
                    Part of this week’s Amazon Best Sellers edit
                    {product.bsrRank != null && product.bsrCategory
                      ? ` · #${product.bsrRank} in ${product.bsrCategory}`
                      : ''}
                    {until ? ` · Rotates ${until}` : ''}. Rankings move—shop while
                    it’s on the list.
                  </p>
                </div>
              </div>
            )}
            <div>
              <p className="label-micro mb-2">
                {product.collection} · {categoryLabel(product.category)}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
                {product.name}
              </h1>
              {product.brand && (
                <p className="text-sm text-muted mt-2">
                  By <span className="font-semibold text-ink-soft">{product.brand}</span>
                </p>
              )}
              <div className="mt-3">
                <StarRating
                  rating={product.rating}
                  count={product.reviewCount}
                  size="md"
                />
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="price text-3xl">{formatMoney(product.priceHint)}</span>
              {product.listPrice != null &&
                product.listPrice > product.priceHint && (
                  <span className="text-muted line-through tabular-nums">
                    {formatMoney(product.listPrice)}
                  </span>
                )}
              <span className="text-xs text-muted">on Amazon · varies</span>
            </div>

            <p className="text-ink-soft leading-relaxed">{product.tagline}</p>
            <p className="text-sm text-ink-soft/90 leading-relaxed">
              {product.description}
            </p>

            <ul className="space-y-2.5 py-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="size-4 text-bamboo shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 pt-1">
              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-amazon !w-full !py-4 text-base"
              >
                Buy on Amazon <ExternalLink className="size-4" />
              </a>
              <p className="text-[11px] text-muted text-center leading-relaxed">
                You&apos;ll complete checkout on Amazon.com. Associate tag{' '}
                <code className="font-mono text-ink-soft">{AMAZON_ASSOCIATE_TAG}</code>
                {product.asin ? (
                  <>
                    {' '}
                    · ASIN <code className="font-mono">{product.asin}</code>
                  </>
                ) : null}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, t: 'Amazon shipping' },
                { icon: Package, t: 'Prime eligible*' },
                { icon: Shield, t: 'Secure checkout' },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-xl border border-line bg-card p-3 text-center"
                >
                  <x.icon className="size-4 text-bamboo mx-auto mb-1.5" />
                  <p className="text-[10px] font-semibold text-ink-soft leading-snug">
                    {x.t}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted">
              *Prime eligibility depends on the seller listing on Amazon.
            </p>
          </div>
        </div>

        {/* Specs */}
        <section className="mt-16 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-semibold mb-5">
              Product details
            </h2>
            <div className="rounded-2xl border border-line overflow-hidden bg-card">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr
                      key={s.label}
                      className={i % 2 === 0 ? 'bg-paper/60' : 'bg-card'}
                    >
                      <th className="text-left font-semibold text-ink-soft px-5 py-3.5 w-[40%] border-b border-line/60">
                        {s.label}
                      </th>
                      <td className="px-5 py-3.5 text-ink border-b border-line/60">
                        {s.value}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-paper/60">
                    <th className="text-left font-semibold text-ink-soft px-5 py-3.5">
                      Material note
                    </th>
                    <td className="px-5 py-3.5 text-ink-soft">
                      {product.material}. Always confirm the live Amazon listing
                      for current specifications.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="lg:col-span-5">
            <h2 className="font-display text-2xl font-semibold mb-5">
              Why this piece
            </h2>
            <div className="rounded-2xl border border-line bg-card p-6 space-y-4">
              <p className="text-sm text-ink-soft leading-relaxed">
                Every iBamboo product is selected for material quality, daily
                usability, and a finish that belongs in a considered home. We
                show you the details here—then you buy where fulfillment is
                fast and familiar: Amazon.
              </p>
              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-primary !w-full"
              >
                Continue to Amazon <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Similar */}
        {similar.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="label-micro mb-1">Similar items</p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                  More like this
                </h2>
              </div>
              <Link
                to={`/shop?cat=${product.category}`}
                className="text-sm font-semibold text-bamboo"
              >
                View category
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </section>
        )}

        {/* You may also like */}
        {alsoLike.length > 0 && (
          <section className="mt-20 pt-16 border-t border-line">
            <div className="mb-8">
              <p className="label-micro mb-1">Complete the house</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                You may also like
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {alsoLike.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
