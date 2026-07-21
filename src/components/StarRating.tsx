import { Star } from 'lucide-react'

export function StarRating({
  rating,
  count,
  size = 'sm',
}: {
  rating?: number
  count?: number
  size?: 'sm' | 'md'
}) {
  if (rating == null) return null
  const dim = size === 'md' ? 'size-4' : 'size-3.5'
  const full = Math.round(rating)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex text-gold">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${dim} ${i < full ? 'fill-gold text-gold' : 'fill-transparent text-line'}`}
          />
        ))}
      </div>
      <span className="text-xs font-semibold tabular-nums text-ink-soft">
        {rating.toFixed(1)}
        {count != null ? (
          <span className="font-normal text-muted">
            {' '}
            ({count.toLocaleString()})
          </span>
        ) : null}
      </span>
    </div>
  )
}
