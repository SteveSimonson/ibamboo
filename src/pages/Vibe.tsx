import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react'
import {
  getVibe,
  readStoredVibeId,
  VIBE_LIST,
  vibePath,
  type VibeProfile,
} from '../data/vibes'
import { CATEGORY_LABELS, products } from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import type { Category } from '../data/types'

export function VibePage() {
  const { vibeId } = useParams()
  const vibe = getVibe(vibeId)
  const [stored, setStored] = useState<string | null>(null)

  useEffect(() => {
    setStored(readStoredVibeId())
  }, [vibeId])

  const picks = useMemo(() => {
    if (!vibe) return []
    const pool = products.filter(
      (p) => vibe.categories.includes(p.category) && p.images?.length,
    )
    const limited = pool.filter((p) => p.limitedTime)
    return (limited.length >= 4 ? limited : pool).slice(0, 6)
  }, [vibe])

  if (!vibe) return <Navigate to="/quiz" replace />

  const isYours = stored === vibe.id
  const hasChecked = Boolean(stored)
  const shortName = vibe.title.split(' ').slice(-1)[0]

  return (
    <div className="pb-24">
      {/* Cinematic type banner */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${vibe.gradient} text-white`}
      >
        {/* Pattern mesh */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 25%, rgba(255,255,255,0.4), transparent 42%), radial-gradient(circle at 85% 75%, rgba(0,0,0,0.3), transparent 48%)',
          }}
        />
        {/* Floating orbs */}
        <div
          className="pointer-events-none absolute -top-16 -right-10 size-64 rounded-full blur-3xl opacity-30 vibe-float"
          style={{ background: 'rgba(255,255,255,0.35)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/4 size-48 rounded-full blur-3xl opacity-20"
          style={{ background: vibe.accent }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
          <Link
            to="/quiz"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white mb-8"
          >
            <ArrowLeft className="size-4" /> Vibe check
          </Link>

          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 animate-in">
              <div className="flex flex-wrap items-center gap-2">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/15 border border-white/25 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
                  <Sparkles className="size-3.5" />
                  {vibe.rarity}
                </p>
                <p className="inline-flex items-center gap-1.5 rounded-full bg-black/20 border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em]">
                  <Zap className="size-3" />
                  {vibe.typeLabel}
                </p>
              </div>

              <p
                className="mt-6 text-7xl sm:text-8xl leading-none vibe-float"
                aria-hidden
              >
                {vibe.emoji}
              </p>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.05] text-balance">
                {vibe.title}
              </h1>
              <p className="mt-3 text-lg sm:text-xl text-white/85 font-light max-w-xl">
                {vibe.tagline}
              </p>
              <p className="mt-5 text-base sm:text-lg text-white/75 italic max-w-xl leading-relaxed border-l-2 border-white/30 pl-4">
                “{vibe.catchphrase}”
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {isYours ? (
                  <p className="inline-flex items-center gap-2 rounded-full bg-white text-ink px-4 py-2.5 text-sm font-bold shadow-lg">
                    <Star className="size-4 fill-gold text-gold" />
                    This is your mapped vibe
                  </p>
                ) : (
                  <Link
                    to="/quiz"
                    className="inline-flex items-center gap-2 rounded-full bg-white text-ink px-4 py-2.5 text-sm font-bold shadow-lg hover:bg-cream transition"
                  >
                    Is this yours? Take the check
                  </Link>
                )}
                <Link
                  to={`/shop?cat=${vibe.categories[0]}`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition"
                >
                  Shop this energy <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>

            {/* Trading card */}
            <div className="lg:col-span-5 animate-in" style={{ animationDelay: '80ms' }}>
              <VibeTradingCard vibe={vibe} yours={isYours} />
            </div>
          </div>
        </div>
      </section>

      {/* Quiz bot strip */}
      <VibeCheckPrompt
        hasChecked={hasChecked}
        currentId={vibe.id}
        stored={stored}
      />

      {/* Story + traits */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-8">
            <div>
              <p className="label-micro mb-2">Flavor text</p>
              <p className="font-display text-2xl sm:text-3xl font-semibold text-ink leading-snug">
                {vibe.flavor}
              </p>
              <p className="mt-4 text-ink-soft text-lg leading-relaxed font-light">
                {vibe.story}
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Personality traits
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {vibe.traits.map((t, i) => (
                  <li
                    key={t}
                    className="rounded-2xl border border-line bg-card px-4 py-3.5 text-sm font-semibold text-ink-soft flex items-start gap-3 shadow-[0_2px_12px_-8px_rgba(18,26,18,0.12)]"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ background: vibe.accent }}
                    >
                      {i + 1}
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Powers as ability cards */}
            <div>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Signature powers
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {vibe.powers.map((p, i) => (
                  <div
                    key={p.name}
                    className={`relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br ${vibe.cardBg} p-4 shadow-sm`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest"
                        style={{ color: vibe.accent }}
                      >
                        Ability {i + 1}
                      </span>
                      <Zap
                        className="size-3.5 opacity-70"
                        style={{ color: vibe.accent }}
                      />
                    </div>
                    <p className="font-display text-lg font-semibold text-ink leading-snug">
                      {p.name}
                    </p>
                    <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">
                      {p.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {/* HP-style benefits panel */}
            <div className="rounded-3xl border border-line bg-card p-6 shadow-[0_12px_40px_-24px_rgba(18,26,18,0.25)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-2xl font-semibold">
                  Why it feels good
                </h2>
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ background: vibe.accent }}
                >
                  Buffs
                </span>
              </div>
              <ul className="space-y-3">
                {vibe.benefits.map((b) => (
                  <li
                    key={b}
                    className="flex gap-3 text-sm text-ink-soft leading-relaxed"
                  >
                    <span
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: `${vibe.accent}22` }}
                    >
                      <Check
                        className="size-3"
                        style={{ color: vibe.accent }}
                      />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mini stat radar substitute — full bars */}
            <div
              className={`rounded-3xl border border-line p-6 bg-gradient-to-br ${vibe.cardBg}`}
            >
              <p className="label-micro mb-1">Combat stats</p>
              <h2 className="font-display text-2xl font-semibold mb-5">
                House energy read
              </h2>
              <div className="space-y-3.5">
                {vibe.stats.map((s, i) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-muted mb-1.5">
                      <span>{s.label}</span>
                      <span className="tabular-nums">{s.value}/100</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/70 border border-line/60 overflow-hidden">
                      <div
                        className="h-full rounded-full vibe-stat-bar"
                        style={{
                          width: `${Math.min(100, s.value)}%`,
                          background: `linear-gradient(90deg, ${vibe.accent}, ${vibe.accent}cc)`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                ★ {vibe.rarity} · Collector series
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms */}
      <section className="border-y border-line bg-paper-2/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <p className="label-micro mb-2">Preferred rooms</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">
            Where this vibe shops
          </h2>
          <p className="text-sm text-muted mb-6 max-w-xl">{vibe.shopHint}</p>
          <div className="flex flex-wrap gap-2">
            {vibe.categories.map((c) => (
              <Link
                key={c}
                to={`/shop?cat=${c}`}
                className="rounded-full border border-line bg-card px-4 py-2.5 text-sm font-semibold text-ink-soft hover:border-bamboo hover:text-bamboo transition shadow-sm"
              >
                {CATEGORY_LABELS[c as Category]}
              </Link>
            ))}
            <Link
              to="/shop?limited=1"
              className="rounded-full bg-moss text-paper px-4 py-2.5 text-sm font-semibold hover:bg-bamboo-deep transition"
            >
              This week’s drop
            </Link>
          </div>
        </div>
      </section>

      {/* Products */}
      {picks.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="label-micro mb-2">Loadout</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                Starter kit for {shortName}s
              </h2>
              <p className="mt-1 text-sm text-muted">
                Pieces that match this energy — shop on Amazon when you’re ready.
              </p>
            </div>
            <Link
              to={`/shop?cat=${vibe.categories[0]}`}
              className="text-sm font-semibold text-bamboo inline-flex items-center gap-1"
            >
              Shop the room <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {picks.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}

      {/* Other vibes */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="label-micro mb-2">The house of vibes</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                Collect the full set
              </h2>
            </div>
            <Link
              to="/quiz"
              className="text-sm font-semibold text-bamboo inline-flex items-center gap-1"
            >
              Find yours <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {VIBE_LIST.map((v) => {
              const active = v.id === vibe.id
              return (
                <Link
                  key={v.id}
                  to={vibePath(v.id)}
                  className={`group relative overflow-hidden rounded-2xl border p-4 transition ${
                    active
                      ? 'border-bamboo bg-bamboo/10 ring-1 ring-bamboo/30'
                      : 'border-line bg-paper hover:border-bamboo/40 hover:shadow-md'
                  }`}
                >
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${v.gradient}`}
                  />
                  <span className="text-2xl" aria-hidden>
                    {v.emoji}
                  </span>
                  <p className="mt-2 font-display text-lg font-semibold leading-snug group-hover:text-bamboo transition">
                    {v.title}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    {v.rarity}
                  </p>
                  <p className="mt-1 text-xs text-muted line-clamp-2">
                    {v.tagline}
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}

function VibeTradingCard({
  vibe,
  yours,
}: {
  vibe: VibeProfile
  yours: boolean
}) {
  return (
    <div className="relative group">
      {/* Soft glow behind card */}
      <div
        className={`absolute -inset-3 rounded-[2rem] bg-gradient-to-br ${vibe.gradient} opacity-40 blur-2xl group-hover:opacity-55 transition duration-500`}
      />

      <div
        className={`relative rounded-[1.75rem] p-[3px] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.6)] bg-gradient-to-br ${vibe.gradient}`}
      >
        {/* Foil shimmer overlay on border */}
        <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] vibe-foil opacity-60 mix-blend-overlay" />

        <div
          className={`relative rounded-[1.55rem] bg-gradient-to-br ${vibe.cardBg} p-5 sm:p-6 border border-white/50 overflow-hidden`}
        >
          {/* Corner holographic flecks */}
          <div className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-white/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 size-24 rounded-full opacity-30 blur-2xl"
            style={{ background: vibe.accent }}
          />

          <div className="relative flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                iBamboo · Vibe Card
              </p>
              <p
                className="mt-1 text-xs font-bold uppercase tracking-wide"
                style={{ color: vibe.accent }}
              >
                {vibe.typeLabel}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted">
                HP
              </p>
              <p
                className="font-display text-2xl font-semibold tabular-nums leading-none"
                style={{ color: vibe.accent }}
              >
                {Math.max(...vibe.stats.map((s) => s.value))}
              </p>
            </div>
          </div>

          {/* Hero art panel */}
          <div
            className={`relative mt-4 rounded-2xl bg-gradient-to-br ${vibe.gradient} p-7 text-center text-white shadow-inner overflow-hidden`}
          >
            <div className="pointer-events-none absolute inset-0 vibe-foil opacity-40" />
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 40%, white, transparent 55%)',
              }}
            />
            <p className="relative text-6xl drop-shadow-lg" aria-hidden>
              {vibe.emoji}
            </p>
            <p className="relative mt-3 font-display text-2xl font-semibold leading-tight">
              {vibe.title}
            </p>
            {yours && (
              <p className="relative mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
                <Star className="size-3 fill-white" /> Your result
              </p>
            )}
          </div>

          <p className="relative mt-4 text-sm text-ink-soft leading-relaxed italic">
            {vibe.flavor}
          </p>

          {/* Compact stats on card */}
          <div className="relative mt-5 space-y-2">
            {vibe.stats.map((s, i) => (
              <div key={s.label}>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wide text-muted mb-0.5">
                  <span>{s.label}</span>
                  <span className="tabular-nums">{s.value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-line/70 overflow-hidden">
                  <div
                    className="h-full rounded-full vibe-stat-bar"
                    style={{
                      width: `${Math.min(100, s.value)}%`,
                      background: vibe.accent,
                      animationDelay: `${150 + i * 80}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Power names strip */}
          <div className="relative mt-5 flex flex-wrap gap-1.5">
            {vibe.powers.map((p) => (
              <span
                key={p.name}
                className="rounded-full border border-line/80 bg-white/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft"
              >
                {p.name}
              </span>
            ))}
          </div>

          <p className="relative mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted text-center">
            ★ {vibe.rarity} · House series
          </p>
        </div>
      </div>
    </div>
  )
}

function VibeCheckPrompt({
  hasChecked,
  currentId,
  stored,
}: {
  hasChecked: boolean
  currentId: string
  stored: string | null
}) {
  const other = stored && stored !== currentId ? getVibe(stored) : null

  return (
    <section className="border-b border-line bg-moss text-paper">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl"
            aria-hidden
          >
            ✨
          </span>
          <div>
            <p className="font-display text-xl sm:text-2xl font-semibold leading-snug">
              {!hasChecked
                ? 'Haven’t found your vibe yet?'
                : other
                  ? `Your mapped vibe is ${other.title}`
                  : 'This is your vibe — own it.'}
            </p>
            <p className="mt-1 text-sm text-paper/75 max-w-xl">
              {!hasChecked
                ? 'Take the 60-second Bamboo Vibe Check. We’ll match you to a persona card and rooms that fit.'
                : other
                  ? 'Explore yours, or retake the check if your house energy shifted.'
                  : 'Shop the rooms below, or retake the check anytime.'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {!hasChecked ? (
            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 rounded-full bg-white text-moss px-5 py-3 text-sm font-bold hover:bg-cream transition shadow-lg"
            >
              Take the vibe check <ArrowRight className="size-4" />
            </Link>
          ) : (
            <>
              {other && (
                <Link
                  to={vibePath(other.id)}
                  className="inline-flex items-center gap-2 rounded-full bg-white text-moss px-5 py-3 text-sm font-bold hover:bg-cream transition shadow-lg"
                >
                  Open my vibe card
                </Link>
              )}
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Retake check
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
