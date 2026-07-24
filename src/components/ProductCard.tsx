import { Link } from 'react-router-dom'
import { Clock3, ExternalLink } from 'lucide-react'
import {
  type Product,
  categoryLabel,
  formatMoney,
  primaryImage,
  productImageChain,
} from '../data/catalog'
import { affiliateUrl } from '../lib/amazon'
import { trackAmazonClick, trackSelectItem } from '../lib/analytics'
import { isQuietPlaceholder } from '../lib/productImages'
import { StarRating } from './StarRating'

export function ProductCard({
  product,
  compact = false,
  listName = 'catalog',
  pickLabel,
  whyLine,
}: {
  product: Product
  compact?: boolean
  /** GA item list name (e.g. shop grid, quiz picks, vibe loadout) */
  listName?: string
  /** Named quiz role, e.g. "Hosting board" */
  pickLabel?: string
  /** Persona-tied “why this product” line under the title */
  whyLine?: string
}) {
  const shopUrl = affiliateUrl({
    asin: product.asin,
    searchKeywords: product.searchKeywords,
    name: product.name,
  })
  const chain = productImageChain(product)
  const img = primaryImage(product) || chain[0]

  return (
    <article className="card-soft group flex flex-col overflow-hidden">
      <Link
        to={`/product/${product.slug}`}
        className="flex flex-col flex-1 min-h-0"
        onClick={() =>
          trackSelectItem({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.priceHint,
            listName,
          })
        }
      >
        {/* Pure white well — Amazon studio white must not sit on warm cream */}
        <div className="relative aspect-[4/5] product-well overflow-hidden border-b border-line/70">
          {img ? (
            <img
              src={img}
              alt={product.name}
              className={`absolute inset-0 w-full h-full transition duration-700 ease-out group-hover:scale-[1.03] ${
                isQuietPlaceholder(img) || img.startsWith('/brand/')
                  ? 'object-cover'
                  : 'object-contain product-well p-5 sm:p-7'
              }`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const el = e.currentTarget
                // Advance through Amazon candidates → quiet monogram (never busy flatlay)
                const idx = Number(el.dataset.fbIdx || '0') + 1
                el.dataset.fbIdx = String(idx)
                const next = chain[idx]
                if (next) {
                  el.src = next
                  if (isQuietPlaceholder(next) || next.startsWith('/brand/')) {
                    el.classList.remove(
                      'object-contain',
                      'product-well',
                      'p-5',
                      'sm:p-7',
                    )
                    el.classList.add('object-cover')
                  } else {
                    el.classList.add(
                      'object-contain',
                      'product-well',
                      'p-5',
                      'sm:p-7',
                    )
                    el.classList.remove('object-cover')
                  }
                } else {
                  el.style.display = 'none'
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-paper-2" />
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {product.limitedTime && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#b45309] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-sm">
                <Clock3 className="size-3" /> Limited time
              </span>
            )}
            {product.badge && (
              <span className="rounded-full bg-moss text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                {product.badge}
              </span>
            )}
          </div>
          {product.bsrRank != null && product.bsrRank <= 100 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 text-ink text-[10px] font-bold px-2.5 py-1 shadow-sm border border-line/80">
              #{product.bsrRank}
              {product.bsrCategory ? ` · ${product.bsrCategory}` : ''}
            </span>
          )}
        </div>
        <div className={`flex flex-col flex-1 ${compact ? 'p-3.5 gap-1' : 'p-4 gap-1.5'}`}>
          {pickLabel ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-bamboo">
              {pickLabel}
              {product.limitedTime ? ' · This week' : ''}
            </p>
          ) : (
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {categoryLabel(product.category)}
              {product.limitedTime ? ' · This week' : ''}
            </p>
          )}
          <h3
            className={`font-display font-semibold leading-snug text-ink group-hover:text-bamboo transition ${
              compact ? 'text-lg' : 'text-xl'
            }`}
          >
            {product.name}
          </h3>
          {whyLine ? (
            <p className="text-sm text-ink-soft leading-snug line-clamp-2">
              {whyLine}
            </p>
          ) : !compact ? (
            <p className="text-sm text-ink-soft line-clamp-2 leading-relaxed">
              {product.tagline}
            </p>
          ) : null}
          <div className="mt-1">
            <StarRating rating={product.rating} count={product.reviewCount} />
          </div>
          <div className="mt-auto pt-3 flex items-end justify-between gap-2 border-t border-line/70">
            <div className="flex items-baseline gap-2">
              <span className={`price ${compact ? 'text-base' : 'text-lg'}`}>
                {formatMoney(product.priceHint)}
              </span>
              {product.listPrice != null &&
                product.listPrice > product.priceHint && (
                  <span className="text-xs text-muted line-through tabular-nums">
                    {formatMoney(product.listPrice)}
                  </span>
                )}
            </div>
            <span className="text-[11px] font-semibold text-bamboo opacity-0 group-hover:opacity-100 transition">
              View
            </span>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <a
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="btn-amazon !w-full !py-2.5 !text-xs"
          onClick={(e) => {
            e.stopPropagation()
            trackAmazonClick({
              id: product.id,
              name: product.name,
              category: product.category,
              price: product.priceHint,
              asin: product.asin,
              location: `product_card:${listName}`,
            })
          }}
        >
          Buy on Amazon <ExternalLink className="size-3.5" />
        </a>
      </div>
    </article>
  )
}
