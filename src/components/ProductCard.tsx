import { Link } from 'react-router-dom'
import { Clock3, ExternalLink } from 'lucide-react'
import {
  type Product,
  categoryLabel,
  formatMoney,
  primaryImage,
} from '../data/catalog'
import { affiliateUrl } from '../lib/amazon'
import { StarRating } from './StarRating'

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product
  compact?: boolean
}) {
  const shopUrl = affiliateUrl({
    asin: product.asin,
    searchKeywords: product.searchKeywords,
    name: product.name,
  })
  const img = primaryImage(product)

  return (
    <article className="card-soft group flex flex-col overflow-hidden">
      <Link to={`/product/${product.slug}`} className="flex flex-col flex-1 min-h-0">
        <div className="relative aspect-[4/5] bg-cream overflow-hidden">
          {img ? (
            <img
              src={img}
              alt={product.name}
              className={`absolute inset-0 w-full h-full transition duration-700 group-hover:scale-[1.04] ${
                img.startsWith('/brand/')
                  ? 'object-cover'
                  : 'object-contain bg-cream p-4 sm:p-6'
              }`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const el = e.currentTarget
                // Fall back through remaining product images, then brand art
                const fallbacks = [
                  ...(product.images || []).slice(1),
                  '/brand/products-flatlay.png',
                ]
                const next = fallbacks.find((u) => u && u !== el.src)
                if (next) {
                  el.src = next
                  if (next.startsWith('/brand/')) {
                    el.classList.remove('object-contain', 'p-4', 'sm:p-6')
                    el.classList.add('object-cover')
                  }
                } else {
                  el.style.display = 'none'
                }
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-paper-2 to-line" />
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {product.limitedTime && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#b45309] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow">
                <Clock3 className="size-3" /> Limited time
              </span>
            )}
            {product.badge && (
              <span className="rounded-full bg-moss text-paper text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
                {product.badge}
              </span>
            )}
          </div>
          {product.bsrRank != null && product.bsrRank <= 100 && (
            <span className="absolute bottom-3 left-3 rounded-full bg-white/95 text-ink text-[10px] font-bold px-2.5 py-1 shadow-sm">
              #{product.bsrRank}
              {product.bsrCategory ? ` · ${product.bsrCategory}` : ''}
            </span>
          )}
        </div>
        <div className={`flex flex-col flex-1 ${compact ? 'p-3.5 gap-1' : 'p-4 gap-1.5'}`}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            {categoryLabel(product.category)}
            {product.limitedTime ? ' · This week' : ''}
          </p>
          <h3
            className={`font-display font-semibold leading-snug text-ink group-hover:text-bamboo transition ${
              compact ? 'text-lg' : 'text-xl'
            }`}
          >
            {product.name}
          </h3>
          {!compact && (
            <p className="text-sm text-ink-soft line-clamp-2 leading-relaxed">
              {product.tagline}
            </p>
          )}
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
          onClick={(e) => e.stopPropagation()}
        >
          Buy on Amazon <ExternalLink className="size-3.5" />
        </a>
      </div>
    </article>
  )
}
