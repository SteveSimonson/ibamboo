import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  PartyPopper,
} from 'lucide-react'
import {
  QUIZ_QUESTIONS,
  scoreQuiz,
  shopLinkForCategories,
  type Persona,
} from '../data/quiz'
import { CATEGORY_LABELS, products } from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import type { Category } from '../data/types'

type Phase = 'intro' | 'questions' | 'capture' | 'result'

export function Quiz() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [optIn, setOptIn] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function retake() {
    setPhase('intro')
    setStep(0)
    setAnswers({})
    setSelected(null)
    setFirstName('')
    setEmail('')
    setOptIn(true)
    setSubmitError(null)
    setSaved(false)
    navigate('/quiz', { replace: true })
  }

  const scored = useMemo(() => scoreQuiz(answers), [answers])
  const q = QUIZ_QUESTIONS[step]
  const progress =
    phase === 'questions'
      ? ((step + (selected ? 0.5 : 0)) / QUIZ_QUESTIONS.length) * 100
      : phase === 'capture'
        ? 92
        : phase === 'result'
          ? 100
          : 0

  const picks = useMemo(() => {
    const cats = scored.topCategories.length
      ? scored.topCategories
      : scored.persona.categories
    const pool = products.filter(
      (p) => cats.includes(p.category) && p.images?.length,
    )
    const limited = pool.filter((p) => p.limitedTime)
    const list = (limited.length >= 3 ? limited : pool).slice(0, 6)
    return list
  }, [scored])

  function pickOption(optionId: string) {
    setSelected(optionId)
  }

  function advanceFromQuestion() {
    if (!q || !selected) return
    const nextAnswers = { ...answers, [q.id]: selected }
    setAnswers(nextAnswers)
    setSelected(null)
    if (step + 1 < QUIZ_QUESTIONS.length) {
      setStep((s) => s + 1)
    } else {
      setPhase('capture')
    }
  }

  async function submitCapture(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    const result = scoreQuiz(answers)
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          personaId: result.persona.id,
          personaLabel: result.persona.title,
          interests: result.interestTags,
          answers,
          marketingOptIn: optIn,
        }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Could not save your results')
      }
      setSaved(true)
      setPhase('result')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submit failed')
      // Still show results offline if CRM fails
      setPhase('result')
    } finally {
      setSubmitting(false)
    }
  }

  function skipToResult() {
    setSaved(false)
    setPhase('result')
  }

  return (
    <div className="relative overflow-hidden">
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -right-24 size-[28rem] rounded-full bg-bamboo/10 blur-3xl" />
        <div className="absolute top-1/3 -left-20 size-[22rem] rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-[18rem] rounded-full bg-sunset/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between gap-3 mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-soft hover:text-bamboo"
          >
            <ArrowLeft className="size-4" /> Home
          </Link>
          <p className="label-micro flex items-center gap-1.5">
            <Sparkles className="size-3.5" /> Bamboo Vibe Check
          </p>
        </div>

        {/* Progress */}
        {phase !== 'intro' && (
          <div className="mb-8">
            <div className="h-2 rounded-full bg-line/70 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-bamboo to-leaf transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {phase === 'questions' && (
              <p className="mt-2 text-xs text-muted font-medium">
                Question {step + 1} of {QUIZ_QUESTIONS.length}
              </p>
            )}
          </div>
        )}

        {phase === 'intro' && <Intro onStart={() => setPhase('questions')} />}

        {phase === 'questions' && q && (
          <QuestionStep
            question={q}
            selected={selected}
            onSelect={pickOption}
            onNext={advanceFromQuestion}
            onBack={() => {
              if (step === 0) {
                setPhase('intro')
                setSelected(null)
              } else {
                setStep((s) => s - 1)
                const prev = QUIZ_QUESTIONS[step - 1]
                setSelected(answers[prev.id] || null)
              }
            }}
          />
        )}

        {phase === 'capture' && (
          <CaptureStep
            persona={scored.persona}
            firstName={firstName}
            email={email}
            optIn={optIn}
            submitting={submitting}
            error={submitError}
            onFirstName={setFirstName}
            onEmail={setEmail}
            onOptIn={setOptIn}
            onSubmit={submitCapture}
            onSkip={skipToResult}
          />
        )}

        {phase === 'result' && (
          <ResultStep
            persona={scored.persona}
            topCategories={scored.topCategories}
            picks={picks}
            saved={saved}
            firstName={firstName}
            onRetake={retake}
          />
        )}
      </div>
    </div>
  )
}

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center animate-in">
      <div className="inline-flex items-center gap-2 rounded-full bg-moss text-paper px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider mb-6">
        <PartyPopper className="size-3.5" /> 60-second vibe check
      </div>
      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] text-balance">
        Which bamboo life are you building?
      </h1>
      <p className="mt-5 text-lg text-ink-soft max-w-xl mx-auto leading-relaxed">
        Five quick taps. Zero wrong answers. We’ll match you to a bamboo
        persona and a short list from this week’s house edit — then save your
        interests if you want updates.
      </p>
      <button type="button" onClick={onStart} className="btn-primary mt-10 !px-10">
        Start the vibe check <ArrowRight className="size-4" />
      </button>
      <p className="mt-4 text-xs text-muted">No account required to play · Email optional for results save</p>
    </div>
  )
}

function QuestionStep({
  question,
  selected,
  onSelect,
  onNext,
  onBack,
}: {
  question: (typeof QUIZ_QUESTIONS)[0]
  selected: string | null
  onSelect: (id: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <div key={question.id} className="animate-in">
      <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-balance">
        {question.prompt}
      </h2>
      {question.sub && (
        <p className="mt-2 text-ink-soft">{question.sub}</p>
      )}

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {question.options.map((opt) => {
          const active = selected === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`text-left rounded-2xl border p-4 sm:p-5 transition duration-200 ${
                active
                  ? 'border-bamboo bg-bamboo/10 shadow-[0_12px_30px_-16px_rgba(63,107,53,0.45)] scale-[1.02]'
                  : 'border-line bg-card hover:border-bamboo/40 hover:bg-paper-2'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl leading-none" aria-hidden>
                  {opt.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-ink">{opt.label}</p>
                    {active && (
                      <span className="shrink-0 rounded-full bg-moss text-paper p-1">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft leading-snug">
                    {opt.blurb}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-semibold text-ink-soft hover:text-bamboo"
        >
          Back
        </button>
        <button
          type="button"
          disabled={!selected}
          onClick={onNext}
          className="btn-primary disabled:opacity-40 disabled:pointer-events-none"
        >
          Continue <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  )
}

function CaptureStep({
  persona,
  firstName,
  email,
  optIn,
  submitting,
  error,
  onFirstName,
  onEmail,
  onOptIn,
  onSubmit,
  onSkip,
}: {
  persona: Persona
  firstName: string
  email: string
  optIn: boolean
  submitting: boolean
  error: string | null
  onFirstName: (v: string) => void
  onEmail: (v: string) => void
  onOptIn: (v: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  onSkip: () => void
}) {
  return (
    <div className="animate-in max-w-lg mx-auto">
      <p className="label-micro mb-2">Almost there</p>
      <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight">
        Unlock your vibe card
      </h2>
      <p className="mt-3 text-ink-soft leading-relaxed">
        You’re trending <strong className="text-ink">{persona.title}</strong>.
        Drop your email to save interests in our house book and get a short
        welcome note — or skip and see results now.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">
            First name
          </span>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onFirstName(e.target.value)}
            placeholder="Alex"
            className="mt-1.5 w-full rounded-xl border border-line bg-card px-4 py-3 text-sm outline-none focus:border-bamboo focus:ring-2 focus:ring-bamboo/20"
            autoComplete="given-name"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">
            Email <span className="text-sunset">*</span>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="you@email.com"
            className="mt-1.5 w-full rounded-xl border border-line bg-card px-4 py-3 text-sm outline-none focus:border-bamboo focus:ring-2 focus:ring-bamboo/20"
            autoComplete="email"
          />
        </label>
        <label className="flex items-start gap-2.5 text-sm text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => onOptIn(e.target.checked)}
            className="mt-1 rounded border-line"
          />
          <span>
            Send me a welcome email and occasional limited-time bamboo drops.
            Unsubscribe anytime.
          </span>
        </label>

        {error && (
          <p className="text-sm text-[#9a3412] bg-[#fff7ed] border border-[#fdba74] rounded-xl px-3 py-2">
            {error} — showing your results anyway.
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full !py-3.5 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              Save & reveal <Sparkles className="size-4" />
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="w-full text-sm font-semibold text-muted hover:text-bamboo py-2"
        >
          Skip — just show my results
        </button>
      </form>
    </div>
  )
}

function ResultStep({
  persona,
  topCategories,
  picks,
  saved,
  firstName,
  onRetake,
}: {
  persona: Persona
  topCategories: Category[]
  picks: typeof products
  saved: boolean
  firstName: string
  onRetake: () => void
}) {
  const cats = topCategories.length ? topCategories : persona.categories
  const shopTo = shopLinkForCategories(cats)

  return (
    <div className="animate-in">
      <div
        className="rounded-3xl border border-line bg-card p-6 sm:p-8 shadow-[0_20px_50px_-28px_rgba(18,26,18,0.35)]"
        style={{ borderColor: `${persona.accent}44` }}
      >
        <p className="label-micro" style={{ color: persona.accent }}>
          Your bamboo persona
        </p>
        <h2 className="font-display text-3xl sm:text-5xl font-semibold mt-2 leading-tight">
          {firstName ? `${firstName}, you’re a` : 'You’re a'}{' '}
          <span style={{ color: persona.accent }}>{persona.title}</span>
        </h2>
        <p className="mt-2 text-lg text-ink-soft font-medium">{persona.tagline}</p>
        <p className="mt-4 text-ink-soft leading-relaxed max-w-2xl">
          {persona.story}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {cats.map((c) => (
            <Link
              key={c}
              to={`/shop?cat=${c}`}
              className="rounded-full bg-paper-2 border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:border-bamboo/40 hover:text-bamboo transition"
            >
              {CATEGORY_LABELS[c]}
            </Link>
          ))}
        </div>

        {saved && (
          <p className="mt-5 text-sm text-bamboo font-semibold flex items-center gap-1.5">
            <Check className="size-4" /> Interests saved — watch your inbox for a
            welcome note.
          </p>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <Link to={shopTo} className="btn-primary">
            Shop your vibe <ArrowRight className="size-4" />
          </Link>
          <Link to="/shop?limited=1" className="btn-secondary">
            This week’s limited drop
          </Link>
          <button
            type="button"
            onClick={onRetake}
            className="text-sm font-semibold text-muted hover:text-bamboo px-2"
          >
            Retake quiz
          </button>
        </div>
      </div>

      {picks.length > 0 && (
        <section className="mt-12">
          <h3 className="font-display text-2xl sm:text-3xl font-semibold">
            Picked for your vibe
          </h3>
          <p className="mt-1 text-sm text-muted">
            From the current iBamboo catalog — buy on Amazon when you’re ready.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {picks.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
