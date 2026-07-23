import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { CATEGORY_LABELS } from '../data/catalog'
import type { Category } from '../data/types'
import {
  getVibe,
  readStoredVibeId,
  vibeForCategory,
  vibePath,
} from '../data/vibes'

/**
 * Room-aware vibe check CTA for category shop pages.
 * Drives quiz engagement (and optional email registration on the quiz).
 */
export function CategoryVibeCheck({
  category,
  placement = 'mid',
}: {
  category: Category
  /** mid = between filters and grid; end = after products */
  placement?: 'mid' | 'end'
}) {
  const [storedId, setStoredId] = useState<string | null>(null)
  const suggested = vibeForCategory(category)
  const roomLabel = CATEGORY_LABELS[category]

  useEffect(() => {
    setStoredId(readStoredVibeId())
  }, [category])

  const yours = storedId ? getVibe(storedId) : null
  const face = yours ?? suggested
  if (!face) return null

  const isEnd = placement === 'end'
  const hasChecked = Boolean(yours)
  const matchRoom = yours?.categories.includes(category)

  return (
    <section
      className={`relative overflow-hidden rounded-3xl border ${
        isEnd
          ? 'border-bamboo/25 bg-gradient-to-br from-moss via-[#1e3320] to-[#2c4f25] text-paper mt-14'
          : 'border-line bg-card mt-2 mb-8'
      }`}
      aria-label="Bamboo vibe check"
    >
      {!isEnd && (
        <div
          className={`pointer-events-none absolute inset-y-0 right-0 w-1/2 max-w-xs opacity-40 bg-gradient-to-l ${face.gradient}`}
        />
      )}

      <div
        className={`relative flex flex-col sm:flex-row sm:items-center gap-5 ${
          isEnd ? 'p-6 sm:p-8' : 'p-5 sm:p-6'
        }`}
      >
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
          <div
            className={`relative shrink-0 overflow-hidden rounded-2xl border-2 shadow-md ${
              isEnd ? 'border-white/25 size-16 sm:size-20' : 'border-white size-14 sm:size-16'
            }`}
          >
            <img
              src={face.avatar.image}
              alt=""
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
          </div>

          <div className="min-w-0">
            <p
              className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] mb-1.5 ${
                isEnd ? 'text-gold' : 'text-bamboo'
              }`}
            >
              <Sparkles className="size-3" />
              {hasChecked ? 'Your vibe' : 'Vibe check'}
            </p>

            <h2
              className={`font-display font-semibold leading-snug text-balance ${
                isEnd
                  ? 'text-xl sm:text-2xl text-white'
                  : 'text-lg sm:text-xl text-ink'
              }`}
            >
              {hasChecked
                ? matchRoom
                  ? `${yours!.title} loves this room`
                  : `You’re a ${yours!.title} — still browsing ${roomLabel}?`
                : `Does ${roomLabel} fit your house energy?`}
            </h2>

            <p
              className={`mt-1.5 text-sm leading-relaxed max-w-xl ${
                isEnd ? 'text-paper/75' : 'text-ink-soft'
              }`}
            >
              {hasChecked
                ? matchRoom
                  ? `${yours!.avatar.name}’s pick for ${roomLabel.toLowerCase()}. Open your card or retake the check anytime.`
                  : `Take 60 seconds to confirm — or open ${yours!.avatar.name}’s vibe card.`
                : `60-second Bamboo Vibe Check maps you to a persona like ${face.avatar.name} (${face.title}) — then unlock your card and optional email save.`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 sm:flex-col sm:items-stretch lg:flex-row">
          {hasChecked ? (
            <>
              <Link
                to={vibePath(yours!.id)}
                className={
                  isEnd
                    ? 'inline-flex items-center justify-center gap-2 rounded-full bg-white text-moss px-5 py-3 text-sm font-bold hover:bg-cream transition'
                    : 'btn-primary !py-2.5 !px-5 text-xs'
                }
              >
                Open my vibe card
              </Link>
              <Link
                to="/quiz"
                className={
                  isEnd
                    ? 'inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition'
                    : 'btn-secondary !py-2.5 !px-5 text-xs'
                }
              >
                Retake check
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/quiz"
                className={
                  isEnd
                    ? 'inline-flex items-center justify-center gap-2 rounded-full bg-white text-moss px-5 py-3 text-sm font-bold hover:bg-cream transition'
                    : 'btn-primary !py-2.5 !px-5 text-xs'
                }
              >
                Take the vibe check <ArrowRight className="size-4" />
              </Link>
              <Link
                to={vibePath(face.id)}
                className={
                  isEnd
                    ? 'inline-flex items-center justify-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition'
                    : 'btn-secondary !py-2.5 !px-5 text-xs'
                }
              >
                Meet {face.avatar.name}
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
