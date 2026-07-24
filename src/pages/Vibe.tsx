import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  ShoppingBag,
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
import { CATEGORY_LABELS, shopProducts } from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import type { Category } from '../data/types'
import { trackVibeView } from '../lib/analytics'
import { Seo } from '../components/Seo'
import { breadcrumbJsonLd, clipMeta } from '../lib/seo'

export function VibePage() {
  const { vibeId } = useParams()
  const vibe = getVibe(vibeId)
  const [stored, setStored] = useState<string | null>(null)
  const vibeKey = vibe?.id
  const vibeTitle = vibe?.title

  useEffect(() => {
    setStored(readStoredVibeId())
  }, [vibeId])

  useEffect(() => {
    if (!vibeKey || !vibeTitle) return
    trackVibeView({ vibeId: vibeKey, vibeTitle })
  }, [vibeKey, vibeTitle])

  const picks = useMemo(() => {
    if (!vibe) return []
    const pool = shopProducts.filter(
      (p) => vibe.categories.includes(p.category) && p.images?.length,
    )
    const limited = pool.filter((p) => p.limitedTime)
    return (limited.length >= 4 ? limited : pool).slice(0, 6)
  }, [vibe])

  if (!vibe) return <Navigate to="/quiz" replace />

  const isYours = stored === vibe.id
  const hasChecked = Boolean(stored)
  const shortName = vibe.title.split(' ').slice(-1)[0]
  const blendVibes = vibe.blendsWith
    .map((id) => getVibe(id))
    .filter(Boolean) as VibeProfile[]
  const vibeSeoPath = `/vibe/${vibe.id}`

  return (
    <div className="pb-24">
      <Seo
        title={`${vibe.title} — bamboo vibe card`}
        description={clipMeta(
          `${vibe.tagline} ${vibe.story} Meet ${vibe.avatar.name} and shop rooms that match the ${vibe.title} lifestyle on iBamboo.`,
        )}
        path={vibeSeoPath}
        image={vibe.avatar.image}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: vibe.title,
            description: vibe.tagline,
            url: `https://ibamboo.com${vibeSeoPath}`,
          },
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Vibe check', path: '/quiz' },
            { name: vibe.title, path: vibeSeoPath },
          ]),
        ]}
      />
      {/* Lived-in scene hero */}
      <section
        className="relative w-full overflow-hidden bg-charcoal min-h-[18rem] sm:min-h-[22rem] lg:min-h-[26rem]"
        aria-labelledby="vibe-hero-title"
      >
        <img
          src={vibe.scene.image}
          alt={vibe.scene.alt}
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/70 via-charcoal/25 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-12 pb-10 sm:pb-12 flex flex-col justify-end min-h-[18rem] sm:min-h-[22rem] lg:min-h-[26rem]">
          <Link
            to="/quiz"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/75 hover:text-white mb-6 w-fit"
          >
            <ArrowLeft className="size-4" /> Vibe check
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/12 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
              <Sparkles className="size-3" />
              {vibe.rarity}
            </p>
            <p className="rounded-full bg-black/30 border border-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90">
              {vibe.typeLabel}
            </p>
            {isYours && (
              <p className="inline-flex items-center gap-1 rounded-full bg-white text-ink px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                <Star className="size-3 fill-gold text-gold" /> Your vibe
              </p>
            )}
          </div>

          <h1
            id="vibe-hero-title"
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.05] max-w-2xl text-balance"
          >
            {vibe.title}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-white/80 font-light max-w-xl">
            {vibe.tagline}
          </p>
          <p className="mt-4 text-sm text-white/55 max-w-lg flex items-center gap-2">
            <Clock3 className="size-3.5 shrink-0" />
            {vibe.scene.caption}
          </p>
        </div>
      </section>

      {/* Avatar + trading card strip */}
      <section className="border-b border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-12">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Avatar dossier */}
            <div className="lg:col-span-5">
              <div className="rounded-[1.5rem] overflow-hidden border border-line bg-card shadow-[0_20px_50px_-28px_rgba(18,26,18,0.35)]">
                <div className="relative aspect-[3/4] sm:aspect-[4/5] max-h-[28rem] overflow-hidden bg-paper-2">
                  <img
                    src={vibe.avatar.image}
                    alt={vibe.avatar.alt}
                    className="w-full h-full object-cover object-top"
                    decoding="async"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-charcoal/90 via-charcoal/40 to-transparent pt-20 pb-4 px-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                      Face of the vibe
                    </p>
                    <p className="font-display text-2xl font-semibold text-white leading-tight mt-1">
                      {vibe.avatar.name}
                    </p>
                    <p className="text-sm text-white/75 mt-0.5">
                      {vibe.avatar.role}
                    </p>
                  </div>
                </div>
                <div className="p-5 sm:p-6 space-y-4">
                  <p className="text-ink-soft italic leading-relaxed text-base border-l-2 pl-4"
                    style={{ borderColor: vibe.accent }}
                  >
                    “{vibe.avatar.quote}”
                  </p>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Energy
                      </dt>
                      <dd className="font-semibold text-ink-soft mt-0.5">
                        {vibe.avatar.ageBand}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">
                        Habitat
                      </dt>
                      <dd className="font-semibold text-ink-soft mt-0.5">
                        {vibe.avatar.hometown}
                      </dd>
                    </div>
                  </dl>
                  <p className="text-sm text-ink-soft leading-relaxed font-light">
                    {vibe.story}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {!isYours && (
                      <Link
                        to="/quiz"
                        className="inline-flex items-center gap-1.5 rounded-full bg-moss text-paper px-4 py-2.5 text-xs font-bold hover:bg-bamboo-deep transition"
                      >
                        Is this you? Take the check
                      </Link>
                    )}
                    <Link
                      to={`/shop?cat=${vibe.categories[0]}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2.5 text-xs font-semibold text-ink-soft hover:border-bamboo hover:text-bamboo transition"
                    >
                      Shop this energy <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Collector card + stats */}
            <div className="lg:col-span-7 space-y-6">
              <VibeTradingCard vibe={vibe} yours={isYours} />

              <div className="grid sm:grid-cols-2 gap-4">
                <div
                  className={`rounded-2xl border border-line p-5 bg-gradient-to-br ${vibe.cardBg}`}
                >
                  <p className="label-micro mb-3">Signature setup</p>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {vibe.signatureSetup}
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-card p-5">
                  <p className="label-micro mb-3">Catchphrase</p>
                  <p className="font-display text-xl sm:text-2xl font-semibold text-ink leading-snug">
                    “{vibe.catchphrase}”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VibeCheckPrompt
        hasChecked={hasChecked}
        currentId={vibe.id}
        stored={stored}
      />

      {/* Day in the life + material truths */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-16">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-10">
            <div>
              <p className="label-micro mb-2">Anchored in reality</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-2">
                A day in {vibe.avatar.name}’s house
              </h2>
              <p className="text-ink-soft font-light leading-relaxed mb-6 max-w-xl">
                {vibe.flavor}
              </p>
              <ol className="space-y-3">
                {vibe.dayInTheLife.map((moment, i) => (
                  <li
                    key={moment}
                    className="flex gap-3 rounded-2xl border border-line bg-card px-4 py-3.5"
                  >
                    <span
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: vibe.accent }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-ink-soft leading-relaxed pt-0.5">
                      {moment}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Personality traits
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {vibe.traits.map((t, i) => (
                  <li
                    key={t}
                    className="rounded-2xl border border-line bg-card px-4 py-3.5 text-sm font-semibold text-ink-soft flex items-start gap-3"
                  >
                    <span
                      className="mt-0.5 size-2 rounded-full shrink-0"
                      style={{ background: vibe.accent }}
                    />
                    <span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted block mb-0.5">
                        Trait {i + 1}
                      </span>
                      {t}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Signature powers
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {vibe.powers.map((p, i) => (
                  <div
                    key={p.name}
                    className={`relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br ${vibe.cardBg} p-4`}
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

            <div
              className={`rounded-3xl border border-line p-6 bg-gradient-to-br ${vibe.cardBg}`}
            >
              <p className="label-micro mb-1">Material truth</p>
              <h2 className="font-display text-2xl font-semibold mb-4">
                Grounded, not gimmicky
              </h2>
              <ul className="space-y-3">
                {vibe.materialTruths.map((t) => (
                  <li
                    key={t}
                    className="text-sm text-ink-soft leading-relaxed flex gap-2"
                  >
                    <span className="text-bamboo font-bold shrink-0">·</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-line bg-moss text-paper p-6">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="size-4 text-gold" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                  Real shopping list
                </p>
              </div>
              <h2 className="font-display text-xl font-semibold mb-4">
                What {vibe.avatar.name} actually buys
              </h2>
              <ul className="space-y-2.5">
                {vibe.shoppingList.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-paper/85 flex items-center gap-2"
                  >
                    <span className="size-1.5 rounded-full bg-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to={`/shop?cat=${vibe.categories[0]}`}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white text-moss px-4 py-2.5 text-sm font-bold hover:bg-cream transition"
              >
                Shop the list <ArrowRight className="size-4" />
              </Link>
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
                Pieces that match {vibe.avatar.name}’s energy — buy on Amazon
                when you’re ready.
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
              <ProductCard
                key={p.id}
                product={p}
                compact
                listName={`vibe_loadout_${vibe.id}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Blends with */}
      {blendVibes.length > 0 && (
        <section className="border-t border-line bg-paper">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <p className="label-micro mb-2">Often blends with</p>
            <h2 className="font-display text-2xl font-semibold mb-6">
              Real homes mix vibes
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {blendVibes.map((v) => (
                <Link
                  key={v.id}
                  to={vibePath(v.id)}
                  className="group flex gap-4 rounded-2xl border border-line bg-card p-4 hover:border-bamboo/40 hover:shadow-md transition"
                >
                  <img
                    src={v.avatar.image}
                    alt=""
                    className="size-16 sm:size-20 rounded-xl object-cover object-top shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold group-hover:text-bamboo transition">
                      {v.title}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{v.avatar.name}</p>
                    <p className="text-sm text-ink-soft mt-1 line-clamp-2">
                      {v.tagline}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full set */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <p className="label-micro mb-2">The house of vibes</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">
                Meet the full set
              </h2>
            </div>
            <Link
              to="/quiz"
              className="text-sm font-semibold text-bamboo inline-flex items-center gap-1"
            >
              Find yours <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {VIBE_LIST.map((v) => {
              const active = v.id === vibe.id
              return (
                <Link
                  key={v.id}
                  to={vibePath(v.id)}
                  className={`group relative overflow-hidden rounded-2xl border transition ${
                    active
                      ? 'border-bamboo ring-1 ring-bamboo/30'
                      : 'border-line hover:border-bamboo/40 hover:shadow-md'
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden bg-paper-2">
                    <img
                      src={v.avatar.image}
                      alt=""
                      className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition duration-500"
                    />
                  </div>
                  <div className="p-3.5 bg-paper">
                    <p className="font-display text-base font-semibold leading-snug group-hover:text-bamboo transition">
                      {v.title}
                    </p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                      {v.avatar.name} · {v.rarity}
                    </p>
                  </div>
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
      <div
        className={`absolute -inset-2 rounded-[2rem] bg-gradient-to-br ${vibe.gradient} opacity-30 blur-2xl group-hover:opacity-45 transition duration-500`}
      />
      <div
        className={`relative rounded-[1.75rem] p-[3px] shadow-[0_28px_70px_-28px_rgba(0,0,0,0.45)] bg-gradient-to-br ${vibe.gradient}`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] vibe-foil opacity-50 mix-blend-overlay" />
        <div
          className={`relative rounded-[1.55rem] bg-gradient-to-br ${vibe.cardBg} p-5 sm:p-6 border border-white/50 overflow-hidden`}
        >
          <div className="flex items-start justify-between gap-3">
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

          <div className="mt-4 grid grid-cols-[5.5rem_1fr] sm:grid-cols-[6.5rem_1fr] gap-4 items-center">
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-md">
              <img
                src={vibe.avatar.image}
                alt=""
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold leading-tight text-ink">
                {vibe.title}
              </p>
              <p className="text-sm text-ink-soft mt-1">
                {vibe.avatar.name} · {vibe.avatar.role}
              </p>
              {yours && (
                <p className="mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white"
                  style={{ background: vibe.accent }}
                >
                  <Star className="size-3 fill-white" /> Your result
                </p>
              )}
            </div>
          </div>

          <p className="mt-4 text-sm text-ink-soft leading-relaxed italic">
            {vibe.flavor}
          </p>

          <div className="mt-5 space-y-2">
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

          <div className="mt-5 flex flex-wrap gap-1.5">
            {vibe.powers.map((p) => (
              <span
                key={p.name}
                className="rounded-full border border-line/80 bg-white/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-soft"
              >
                {p.name}
              </span>
            ))}
          </div>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted text-center">
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
            className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl overflow-hidden"
            aria-hidden
          >
            {other ? (
              <img
                src={other.avatar.image}
                alt=""
                className="w-full h-full object-cover object-top"
              />
            ) : (
              '✨'
            )}
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
                ? 'Take the 60-second Bamboo Vibe Check. We’ll match you to a real house energy and rooms that fit.'
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
