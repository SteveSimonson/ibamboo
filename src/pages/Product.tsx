import { useEffect, useMemo, useState } from 'react'
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
import { ProductGridBalloonCard } from '../components/ProductGridBalloonCard'
import { AdaptiveContentBalloon } from '../components/AdaptiveContentBalloons'
import { useAdaptiveContentBalloons } from '../hooks/useAdaptiveContentBalloons'
import { useViewportTier } from '../hooks/useViewportTier'
import {
  CARE_EDITORIAL_TYPES,
  FACT_EDITORIAL_TYPES,
  MATERIAL_EDITORIAL_TYPES,
  deriveBalloonPlan,
  editorialTypesForTier,
} from '../lib/balloonPlan'
import { StarRating } from '../components/StarRating'
import { Seo } from '../components/Seo'
import { affiliateUrl } from '../lib/amazon'
import { trackAmazonClick, trackViewItem } from '../lib/analytics'
import { isQuietPlaceholder } from '../lib/productImages'
import { productSeo } from '../lib/seoData'
import { useFlashCatalog } from '../hooks/useFlashCatalog'
import { getProductEnrichment } from '../data/productEnrichments'
import { ProductEnrichmentSections } from '../components/ProductEnrichment'

export function ProductPage() {
  const { slug } = useParams()
  const flash = useFlashCatalog('ibamboo')
  const { tier: viewportTier, ready: viewportReady } = useViewportTier()
  const product = useMemo(
    () => (slug ? getProduct(slug, flash.products) : undefined),
    [slug, flash.products],
  )
  const enrichment = useMemo(
    () => (product ? getProductEnrichment(product.slug) : undefined),
    [product],
  )
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
  // SL1000: the main viewer renders up to ~686px CSS (retina headroom); thumb
  // clicks load the same URL into the viewer, so the strip shares the size.
  const mainChain = product ? productImageChain(product, 1000) : []
  const thumbs = product
    ? productGalleryThumbs(product, 1000).filter((u) => !failedThumbs.has(u))
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

  // Reset gallery when product changes (include flash pool)
  useEffect(() => {
    if (!product) return
    const chain = productImageChain(product, 1000)
    setMainSrc(chain[0] || '')
    setChainIdx(0)
    setFailedThumbs(new Set())
  }, [product])

  const balloonPlan = useMemo(
    () =>
      deriveBalloonPlan({
        routeKey: `product:${slug || 'unknown'}`,
        tier: viewportTier,
        narrativeSections: product ? 3 : 0,
        featureGroups: product ? 2 : 0,
        itemCount: product ? 8 : 0,
        mediaBlocks: product?.featureVideo ? 1 : 0,
        maxPlacements: 3,
        candidates: [
          ...(enrichment ? [
            { anchor: 'product-review-note', ariaLabel: 'Bamboo product fact', budget: 'standard-v1' as const, layout: 'inline' as const, priority: 90, role: 'inline-note' as const, section: 'review', size: 'responsive' as const, topics: [product?.category || 'home', 'product-research'], editorialTypes: FACT_EDITORIAL_TYPES },
            { anchor: 'product-guide-note', ariaLabel: 'Bamboo care tip', budget: 'standard-v1' as const, layout: 'panel' as const, priority: 80, role: 'section-break' as const, section: 'field-guide', size: 'responsive' as const, topics: [product?.category || 'home', 'care', 'bamboo-basics'], editorialTypes: editorialTypesForTier(viewportTier, CARE_EDITORIAL_TYPES) },
          ] : [
            { anchor: 'product-spec-note', ariaLabel: 'Bamboo material fact', budget: 'standard-v1' as const, layout: 'inline' as const, priority: 90, role: 'inline-note' as const, section: 'product-details', size: 'responsive' as const, topics: [product?.category || 'home', 'bamboo-basics'], editorialTypes: editorialTypesForTier(viewportTier, MATERIAL_EDITORIAL_TYPES) },
            { anchor: 'product-guide-note', ariaLabel: 'Bamboo care tip', budget: 'standard-v1' as const, layout: 'panel' as const, priority: 80, role: 'aside-note' as const, section: 'practical-guide', size: 'responsive' as const, topics: [product?.category || 'home', 'care', 'bamboo-basics'], editorialTypes: editorialTypesForTier(viewportTier, CARE_EDITORIAL_TYPES) },
          ]),
          { anchor: 'product-related-card', ariaLabel: 'Bamboo fact among related products', budget: 'compact-v1' as const, layout: 'product-card' as const, priority: 70, role: 'grid-tile' as const, section: 'related-products', size: 'responsive' as const, topics: [product?.category || 'home', 'product-research'], editorialTypes: FACT_EDITORIAL_TYPES },
        ],
      }),
    [enrichment, product, slug, viewportTier],
  )
  const balloonDeck = useAdaptiveContentBalloons(balloonPlan, viewportReady && !flash.loading, viewportTier)

  if (!product) {
    if (flash.loading) {
      return (
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Seo
            title="Loading product"
            description="Loading the house edit."
            path={`/product/${slug || ''}`}
            noindex
          />
          <p className="text-ink-soft font-medium">Loading product…</p>
        </div>
      )
    }
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
      <Seo {...productSeo(p, enrichment)} />
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

        <div className="grid items-start gap-8 xl:grid-cols-12 xl:gap-10">
          {/* Gallery */}
          <div className="rounded-3xl border border-line bg-card p-3 shadow-[0_20px_60px_-52px_rgba(18,26,18,0.55)] xl:col-span-7" data-product-surface="media">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-line product-well shadow-[0_2px_16px_-10px_rgba(18,26,18,0.10)] lg:aspect-[16/10] xl:aspect-square">
              {main ? (
                <img
                  key={main}
                  src={main}
                  alt={product.name}
                  className={`absolute inset-0 w-full h-full ${
                    isQuietPlaceholder(main)
                      ? 'object-cover'
                      : 'object-contain product-well p-6 pb-24 sm:p-10 sm:pb-28'
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
              {/* Reliable listing photos stay inside the media stage instead of
                  creating an unpredictable second row below it. */}
              {thumbs.length > 1 && (
                <div className="absolute inset-x-3 bottom-3 flex gap-2 overflow-x-auto rounded-2xl border border-line/80 bg-card/95 p-2 shadow-lg backdrop-blur sm:inset-x-auto sm:left-4 sm:bottom-4 sm:max-w-[calc(100%-2rem)]">
                {thumbs.map((src) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => {
                      setMainSrc(src)
                      const idx = mainChain.indexOf(src)
                      setChainIdx(idx >= 0 ? idx : 0)
                    }}
                    className={`relative size-14 shrink-0 overflow-hidden rounded-xl border-2 bg-card transition sm:size-16 lg:size-20 ${
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
            </div>
          </div>

          {/* Buy box */}
          <div className="space-y-4 rounded-3xl border border-line bg-card p-6 shadow-[0_20px_60px_-52px_rgba(18,26,18,0.55)] sm:p-8 xl:col-span-5" data-balloon-zone="commerce" data-product-surface="purchase">
            {product.limitedTime && (
              <div className="flex items-center gap-2 rounded-full border border-[#fdba74] bg-[#fff7ed] px-3 py-2 text-xs font-semibold text-[#9a3412]">
                <Clock3 className="size-4 shrink-0" />
                <span>
                  Limited-time edit
                  {product.source === 'amazon-bsr' && product.bsrRank != null && product.bsrCategory
                    ? ` · #${product.bsrRank} in ${product.bsrCategory}`
                    : ''}
                  {until ? ` · Rotates ${until}` : ''}
                </span>
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

        <section className="mt-12" aria-labelledby="product-details-heading">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="label-micro mb-1">Before you choose</p>
              <h2 id="product-details-heading" className="font-display text-2xl font-semibold sm:text-3xl">
                Product details
              </h2>
            </div>
            <p className="hidden max-w-md text-right text-xs leading-relaxed text-muted sm:block">
              Listing details can change. Confirm dimensions, care, and availability on Amazon.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-line bg-card">
            <table className="w-full text-sm">
              <tbody>
                {product.specs.map((spec, index) => (
                  <tr key={`${spec.label}-${index}`} className={index % 2 === 0 ? 'bg-paper/60' : 'bg-card'}>
                    <th className="w-[40%] border-b border-line/60 px-5 py-3.5 text-left font-semibold text-ink-soft">
                      {spec.label}
                    </th>
                    <td className="border-b border-line/60 px-5 py-3.5 text-ink">{spec.value}</td>
                  </tr>
                ))}
                <tr className="bg-paper/60">
                  <th className="px-5 py-3.5 text-left font-semibold text-ink-soft">Material note</th>
                  <td className="px-5 py-3.5 text-ink-soft">
                    {product.material}. Always confirm the live Amazon listing for current specifications.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {!enrichment && balloonDeck['product-spec-note'] ? (
            <div className="mt-7">
              <AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="product-spec-note" />
            </div>
          ) : null}
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-12" aria-labelledby="product-rationale-heading">
          <div className="rounded-3xl border border-line bg-card p-6 sm:p-8 lg:col-span-8">
            <p className="label-micro mb-1">What earns its place</p>
            <h2 id="product-rationale-heading" className="font-display text-2xl font-semibold sm:text-3xl">
              Why this piece is in the edit
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink-soft sm:text-base">
              {product.description}
            </p>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 rounded-2xl bg-paper/70 p-4 text-sm leading-relaxed text-ink-soft">
                  <Check className="mt-0.5 size-4 shrink-0 text-bamboo" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside className="flex flex-col justify-between rounded-3xl bg-moss p-6 text-white sm:p-8 lg:col-span-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-leaf">The live-listing rule</p>
              <h3 className="mt-2 font-display text-2xl font-semibold">Verify the version you are buying</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                Sellers can update dimensions, bundles, finishes, and care instructions. Treat the Amazon listing as the final specification.
              </p>
            </div>
            <a
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-moss"
              onClick={() => onAmazonClick('product_page_rationale')}
            >
              Check the live listing <ExternalLink className="size-4" />
            </a>
          </aside>
        </section>

        {product.featureVideo && (
          <section className="mt-14" aria-label="Product feature film">
            <div className="overflow-hidden rounded-3xl border border-line bg-ink shadow-sm">
              <div className="relative aspect-video bg-ink">
                <video
                  className="absolute inset-0 size-full object-cover"
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
                <div className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow">
                  <Play className="size-3 fill-ink" /> Feature film
                </div>
              </div>
              {product.featureVideoCaption && (
                <p className="border-t border-white/10 px-5 py-4 text-sm leading-relaxed text-paper/90">
                  {product.featureVideoCaption}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Destination content: review snapshot, field notes, tips, FAQ */}
        {enrichment ? (
          <div className="mt-4">
            <ProductEnrichmentSections
              enrichment={enrichment}
              reviewNote={
                balloonDeck['product-review-note'] ? (
                  <AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="product-review-note" />
                ) : null
              }
              guideNote={
                balloonDeck['product-guide-note'] ? (
                  <AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="product-guide-note" />
                ) : null
              }
            />
            <div className="mt-10 flex justify-center">
              <a
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="btn-primary"
                onClick={() => onAmazonClick('product_page_after_enrichment')}
              >
                Buy on Amazon <ExternalLink className="size-4" />
              </a>
            </div>
          </div>
        ) : (
          <section className="mt-16 grid gap-6 lg:grid-cols-12 lg:items-stretch" aria-labelledby="practical-guide-heading">
            <div className="rounded-3xl bg-moss p-7 text-white sm:p-9 lg:col-span-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-leaf">A useful checkout pause</p>
              <h2 id="practical-guide-heading" className="mt-2 font-display text-3xl font-semibold">
                Three things worth checking
              </h2>
              <div className="mt-7 grid gap-5 sm:grid-cols-3">
                {[
                  ['Fit', `Check the listed dimensions against the space where this ${categoryLabel(product.category).toLowerCase()} piece will live.`],
                  ['Finish', `Use the live listing to confirm the exact ${product.material.toLowerCase()} construction and care instructions.`],
                  ['Routine', 'Choose for the way you will actually clean, store, and use it—not for the product photo alone.'],
                ].map(([label, copy], index) => (
                  <div key={label} className="border-t border-white/20 pt-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-gold">0{index + 1} · {label}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/80">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
            {balloonDeck['product-guide-note'] ? (
              <AdaptiveContentBalloon className="h-full lg:col-span-5" plan={balloonPlan} deck={balloonDeck} anchor="product-guide-note" />
            ) : null}
          </section>
        )}

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
              {similar.map((related, index) =>
                index === Math.min(2, similar.length - 1) && balloonDeck['product-related-card'] ? (
                  <ProductGridBalloonCard
                    key="product-related-card"
                    plan={balloonPlan}
                    deck={balloonDeck}
                    anchor="product-related-card"
                  />
                ) : (
                  <ProductCard
                    key={related.id}
                    product={related}
                    compact
                    listName="product_similar"
                  />
                ),
              )}
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
              {alsoLike.map((related, index) =>
                similar.length === 0 && index === Math.min(2, alsoLike.length - 1) && balloonDeck['product-related-card'] ? (
                  <ProductGridBalloonCard
                    key="product-related-card"
                    plan={balloonPlan}
                    deck={balloonDeck}
                    anchor="product-related-card"
                  />
                ) : (
                  <ProductCard
                    key={related.id}
                    product={related}
                    compact
                    listName="product_also_like"
                  />
                ),
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
