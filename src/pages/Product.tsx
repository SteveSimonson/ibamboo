import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  Clock3,
  ExternalLink,
  Package,
  Play,
  Shield,
  Truck,
} from 'lucide-react'
import {
  categoryLabel,
  formatExpiry,
  formatMoney,
  getProduct,
  productGalleryThumbs,
  productImageChain,
  similarProducts,
  youMayAlsoLike,
} from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import { StarRating } from '../components/StarRating'
import { Seo } from '../components/Seo'
import { affiliateUrl, AMAZON_ASSOCIATE_TAG } from '../lib/amazon'
import { trackAmazonClick, trackViewItem } from '../lib/analytics'
import { isQuietPlaceholder } from '../lib/productImages'
import {
  breadcrumbJsonLd,
  clipMeta,
  productJsonLd,
} from '../lib/seo'

export function ProductPage() {
  const { slug } = useParams()
  const product = slug ? getProduct(slug) : undefined
  /** Main viewer walks full fallback chain; thumbs only use known-good listing photos */
  const [mainSrc, setMainSrc] = useState<string>('')
  const [chainIdx, setChainIdx] = useState(0)
  const [failedThumbs, setFailedThumbs] = useState<Set<string>>(() => new Set())

  const productId = product?.id
  const productName = product?.name
  const productCategory = product?.category
  const productPrice = product?.priceHint
  const productAsin = product?.asin
  const productLimited = product?.limitedTime

  const mainChain = product ? productImageChain(product) : []
  const thumbs = product
    ? productGalleryThumbs(product).filter((u) => !failedThumbs.has(u))
    : []

  useEffect(() => {
    if (!productId || !productName || !productCategory) return
    trackViewItem({
      id: productId,
      name: productName,
      category: productCategory,
      price: productPrice,
      asin: productAsin,
      limitedTime: productLimited,
    })
  }, [
    productId,
    productName,
    productCategory,
    productPrice,
    productAsin,
    productLimited,
  ])

  // Reset gallery when product changes
  useEffect(() => {
    if (!productId) return
    const p = getProduct(slug || '')
    if (!p) return
    const chain = productImageChain(p)
    setMainSrc(chain[0] || '')
    setChainIdx(0)
    setFailedThumbs(new Set())
  }, [productId, slug])

  if (!product) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <Seo
          title="Product not found"
          description="This product is no longer on the iBamboo house edit."
          path={`/product/${slug || ''}`}
          noindex
        />
        <h1 className="font-display text-3xl font-semibold">Not found</h1>
        <Link to="/shop" className="text-bamboo font-semibold mt-4 inline-block">
          Back to shop
        </Link>
      </div>
    )
  }

  // Local alias so nested handlers keep the narrowed product type
  const p = product
  const shopUrl = affiliateUrl({
    asin: p.asin,
    searchKeywords: p.searchKeywords,
    name: p.name,
  })
  const similar = similarProducts(p, 4)
  const alsoLike = youMayAlsoLike(p, 4)
  const main = mainSrc || mainChain[0] || ''
  const until = formatExpiry(p.expiresAt)
  const productPath = `/product/${p.slug}`
  const ogImage =
    thumbs[0] ||
    mainChain.find((u) => !isQuietPlaceholder(u) && !u.startsWith('data:')) ||
    '/brand/social.png'

  function onAmazonClick(location: string) {
    trackAmazonClick({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.priceHint,
      asin: p.asin,
      location,
    })
  }

  return (
    <div className="pb-28">
      <Seo
        title={p.name}
        description={clipMeta(
          `${p.tagline} ${p.description} Bamboo ${categoryLabel(p.category).toLowerCase()} on iBamboo — buy on Amazon.`,
        )}
        path={productPath}
        image={ogImage}
        type="product"
        jsonLd={[
          productJsonLd({
            name: p.name,
            description: p.description || p.tagline,
            path: productPath,
            images: (thumbs.length ? thumbs : mainChain).filter(
              (u) => !isQuietPlaceholder(u),
            ),
            price: p.priceHint,
            asin: p.asin,
            brand: p.brand,
            rating: p.rating,
            reviewCount: p.reviewCount,
            category: categoryLabel(p.category),
          }),
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Shop', path: '/shop' },
            {
              name: categoryLabel(p.category),
              path: `/shop?cat=${p.category}`,
            },
            { name: p.name, path: productPath },
          ]),
        ]}
      />
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
            <div className="relative rounded-2xl overflow-hidden aspect-square product-well border border-line shadow-[0_2px_16px_-10px_rgba(18,26,18,0.10)]">
              {main ? (
                <img
                  key={main}
                  src={main}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full ${
                    isQuietPlaceholder(main)
                      ? 'object-cover'
                      : 'object-contain product-well p-6 sm:p-10'
                  }`}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    // Walk ASIN attempts / monogram; do not leave blank tiles
                    const nextIdx = chainIdx + 1
                    const next = mainChain[nextIdx]
                    if (next) {
                      setChainIdx(nextIdx)
                      setMainSrc(next)
                    }
                  }}
                />
              ) : null}
              {product.badge && (
                <span className="absolute top-4 left-4 rounded-full bg-moss text-white text-xs font-semibold uppercase tracking-wider px-3 py-1.5">
                  {product.badge}
                </span>
              )}
            </div>
            {/* Only reliable listing photos — never empty ASIN-guess boxes */}
            {thumbs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {thumbs.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      setMainSrc(src)
                      const idx = mainChain.indexOf(src)
                      setChainIdx(idx >= 0 ? idx : 0)
                    }}
                    className={`relative shrink-0 size-20 sm:size-24 rounded-xl overflow-hidden border-2 transition product-well ${
                      main === src
                        ? 'border-bamboo'
                        : 'border-line hover:border-bamboo/30'
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      className="absolute inset-0 w-full h-full object-contain product-well p-1.5"
                      referrerPolicy="no-referrer"
                      onError={() => {
                        setFailedThumbs((prev) => new Set(prev).add(src))
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {product.featureVideo && (
              <div className="mt-2 rounded-2xl overflow-hidden border border-line bg-ink shadow-sm">
                <div className="relative aspect-square sm:aspect-[4/3] bg-ink">
                  <video
                    className="absolute inset-0 w-full h-full object-cover"
                    src={product.featureVideo}
                    poster={product.featureVideoPoster}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    controls
                    aria-label={`Feature film: ${product.name}`}
                  />
                  <div className="pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 text-ink text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow">
                    <Play className="size-3 fill-ink" /> Feature film
                  </div>
                </div>
                {product.featureVideoCaption && (
                  <p className="px-4 py-3 text-sm text-paper/90 leading-relaxed border-t border-white/10">
                    {product.featureVideoCaption}
                  </p>
                )}
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
                    {product.source === 'amazon-bsr'
                      ? 'Part of this week’s Amazon Best Sellers edit'
                      : product.source === 'curated'
                        ? 'Part of this week’s iBamboo house edit'
                        : 'Part of this week’s limited-time bamboo edit'}
                    {product.source === 'amazon-bsr' &&
                    product.bsrRank != null &&
                    product.bsrCategory
                      ? ` · #${product.bsrRank} in ${product.bsrCategory}`
                      : ''}
                    {until ? ` · Rotates ${until}` : ''}.
                    {product.source === 'amazon-bsr'
                      ? ' Rankings move—shop while it’s on the list.'
                      : ' Options rotate weekly—shop while this placement is live.'}
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
                onClick={() => onAmazonClick('product_page_primary')}
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
                      key={`${s.label}-${i}`}
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
                onClick={() => onAmazonClick('product_page_secondary')}
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
                <ProductCard
                  key={p.id}
                  product={p}
                  compact
                  listName="product_similar"
                />
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
                <ProductCard
                  key={p.id}
                  product={p}
                  compact
                  listName="product_also_like"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
