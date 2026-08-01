import { useEffect, useMemo, useRef, useState } from 'react'
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
  buildQuizPicks,
  encodeAnswerIds,
  getBranchQuestion,
  parseAnswerIds,
  scoreQuiz,
  shopLinkForCategories,
  type Persona,
  type QuizAnswers,
  type QuizPick,
  type QuizQuestion,
} from '../data/quiz'
import { getVibe, vibePath, writeStoredVibeId } from '../data/vibes'
import {
  CATEGORY_LABELS,
  shopProducts,
} from '../data/catalog'
import { ProductCard } from '../components/ProductCard'
import { AdaptiveContentBalloon } from '../components/AdaptiveContentBalloons'
import { useAdaptiveContentBalloons } from '../hooks/useAdaptiveContentBalloons'
import { useViewportTier } from '../hooks/useViewportTier'
import {
  CARE_EDITORIAL_TYPES,
  DESIGN_EDITORIAL_TYPES,
  FACT_EDITORIAL_TYPES,
  deriveBalloonPlan,
  editorialTypesForTier,
  sizeForTier,
} from '../lib/balloonPlan'
import type { Category } from '../data/types'
import {
  trackQuizAnswer,
  trackQuizComplete,
  trackQuizRetake,
  trackQuizStart,
  trackRegistration,
} from '../lib/analytics'
import { Seo } from '../components/Seo'
import { quizSeo } from '../lib/seoData'

/** Short shop-edit label from persona id (host → “host edit”). */
function editWordForPersona(personaId: string): string {
  const known = ['host', 'craft', 'ritual', 'focus', 'nest', 'patio'] as const
  return (known as readonly string[]).includes(personaId) ? personaId : 'house'
}

type Phase = 'intro' | 'questions' | 'result'

export function Quiz() {
  const navigate = useNavigate()
  const { tier: viewportTier, ready: viewportReady } = useViewportTier()
  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  /** Single-select highlight / multi-select working set */
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [branchQ, setBranchQ] = useState<QuizQuestion | null>(null)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [optIn, setOptIn] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  /** Prevent double-taps while single-select auto-advances */
  const [advancing, setAdvancing] = useState(false)
  const advancingRef = useRef(false)
  const submittingRef = useRef(false)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const completedTracked = useRef(false)

  function setAdvancingBoth(v: boolean) {
    advancingRef.current = v
    setAdvancing(v)
  }

  const activeQuestions = useMemo(() => {
    const list: QuizQuestion[] = [...QUIZ_QUESTIONS]
    if (branchQ) list.push(branchQ)
    return list
  }, [branchQ])

  const q = activeQuestions[step]
  const totalSteps = activeQuestions.length

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current)
    }
  }, [])

  function retake() {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    trackQuizRetake()
    setPhase('intro')
    setStep(0)
    setAnswers({})
    setSelectedIds([])
    setBranchQ(null)
    setAdvancingBoth(false)
    setFirstName('')
    setEmail('')
    setOptIn(true)
    setSubmitError(null)
    setSaved(false)
    completedTracked.current = false
    submittingRef.current = false
    navigate('/quiz', { replace: true })
  }

  const scored = useMemo(() => scoreQuiz(answers), [answers])

  const progress =
    phase === 'questions'
      ? ((step + (selectedIds.length ? 0.55 : 0)) / Math.max(totalSteps, 1)) *
        100
      : phase === 'result'
        ? 100
        : 0

  const picks = useMemo(
    () =>
      buildQuizPicks(
        shopProducts,
        scored.persona.id,
        scored.topCategories.length
          ? scored.topCategories
          : scored.persona.categories,
        5,
      ),
    [scored],
  )
  const balloonPlan = useMemo(
    () => deriveBalloonPlan({
      routeKey: 'quiz', tier: viewportTier, narrativeSections: 3, featureGroups: 2, interactiveSteps: 6,
      candidates: [
        { anchor: 'quiz-intro', ariaLabel: 'Bamboo fact', size: sizeForTier(viewportTier, { compact: 'responsive', tablet: '320x100', desktop: '728x90' }), minHeight: 108, topics: ['quiz', 'lifestyle'], editorialTypes: FACT_EDITORIAL_TYPES },
        { anchor: 'quiz-result', ariaLabel: 'Bamboo design note', size: sizeForTier(viewportTier, { compact: 'responsive', tablet: '300x250', desktop: '336x280' }), minHeight: 108, topics: ['quiz', 'home'], editorialTypes: editorialTypesForTier(viewportTier, DESIGN_EDITORIAL_TYPES) },
        { anchor: 'quiz-picks', ariaLabel: 'Bamboo care tip', size: sizeForTier(viewportTier, { compact: 'responsive', tablet: '320x100' }), minHeight: 108, topics: ['quiz', 'care'], editorialTypes: editorialTypesForTier(viewportTier, CARE_EDITORIAL_TYPES) },
      ],
    }), [viewportTier],
  )
  const balloonDeck = useAdaptiveContentBalloons(balloonPlan, viewportReady, viewportTier)

  function finishToResult(nextAnswers: QuizAnswers) {
    const result = scoreQuiz(nextAnswers)
    writeStoredVibeId(result.persona.id)
    if (!completedTracked.current) {
      completedTracked.current = true
      trackQuizComplete({
        personaId: result.persona.id,
        personaLabel: result.persona.title,
        registered: false,
      })
    }
    setPhase('result')
  }

  /** After committing an answer for the current question, advance or finish. */
  function advanceAfterAnswer(nextAnswers: QuizAnswers, fromStep: number) {
    // Still in core questions (not yet on last core)
    if (fromStep < QUIZ_QUESTIONS.length - 1) {
      const nextStep = fromStep + 1
      setStep(nextStep)
      const nextQ = QUIZ_QUESTIONS[nextStep]
      setSelectedIds(parseAnswerIds(nextAnswers[nextQ.id]))
      return
    }

    // Just finished last core question — optional branch
    if (fromStep === QUIZ_QUESTIONS.length - 1) {
      const interim = scoreQuiz(nextAnswers)
      const branch = getBranchQuestion(interim.persona.id)
      if (branch && !nextAnswers[branch.id]) {
        setBranchQ(branch)
        setStep(QUIZ_QUESTIONS.length)
        setSelectedIds([])
        return
      }
      finishToResult(nextAnswers)
      return
    }

    // Finished branch (or any extra step)
    finishToResult(nextAnswers)
  }

  function commitSingle(optionId: string) {
    if (!q || advancingRef.current) return
    setSelectedIds([optionId])
    setAdvancingBoth(true)
    trackQuizAnswer({
      questionId: q.id,
      optionId,
      step,
      totalSteps,
    })
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    const questionId = q.id
    const fromStep = step
    advanceTimer.current = setTimeout(() => {
      setAnswers((prev) => {
        const nextAnswers = {
          ...prev,
          [questionId]: encodeAnswerIds([optionId]),
        }
        // Defer navigation so we don't set other state inside this updater
        queueMicrotask(() => {
          setSelectedIds([])
          setAdvancingBoth(false)
          advanceAfterAnswer(nextAnswers, fromStep)
        })
        return nextAnswers
      })
    }, 340)
  }

  function toggleMulti(optionId: string) {
    if (!q || advancingRef.current) return
    const max = q.maxSelect ?? 2
    setSelectedIds((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId)
      }
      if (prev.length >= max) {
        // Replace oldest selection so tap always does something
        return [...prev.slice(1), optionId]
      }
      return [...prev, optionId]
    })
  }

  function continueMulti() {
    if (!q || selectedIds.length === 0 || advancingRef.current) return
    setAdvancingBoth(true)
    trackQuizAnswer({
      questionId: q.id,
      optionId: encodeAnswerIds(selectedIds),
      step,
      totalSteps,
    })
    const nextAnswers = {
      ...answers,
      [q.id]: encodeAnswerIds(selectedIds),
    }
    setAnswers(nextAnswers)
    setSelectedIds([])
    setAdvancingBoth(false)
    advanceAfterAnswer(nextAnswers, step)
  }

  function goBackQuestion() {
    if (advancingRef.current) return
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
    setAdvancingBoth(false)
    if (step === 0) {
      setPhase('intro')
      setSelectedIds([])
      setAnswers({})
      setBranchQ(null)
      return
    }
    const prevStep = step - 1
    // Leaving branch step back into core
    if (branchQ && step === QUIZ_QUESTIONS.length) {
      setBranchQ(null)
      // drop branch answer if any
      setAnswers((a) => {
        const next = { ...a }
        delete next[branchQ.id]
        return next
      })
    }
    setStep(prevStep)
    const prevQ =
      prevStep < QUIZ_QUESTIONS.length
        ? QUIZ_QUESTIONS[prevStep]
        : branchQ
    if (prevQ) {
      setSelectedIds(parseAnswerIds(answers[prevQ.id]))
    } else {
      setSelectedIds([])
    }
  }

  async function submitCapture(e: React.FormEvent) {
    e.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
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
      writeStoredVibeId(result.persona.id)
      setSaved(true)
      trackRegistration({
        personaId: result.persona.id,
        personaLabel: result.persona.title,
        marketingOptIn: optIn,
        hasFirstName: Boolean(firstName.trim()),
        success: true,
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submit failed')
      trackRegistration({
        personaId: result.persona.id,
        personaLabel: result.persona.title,
        marketingOptIn: optIn,
        hasFirstName: Boolean(firstName.trim()),
        success: false,
      })
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <Seo {...quizSeo()} />
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
                Question {step + 1} of {totalSteps}
                {branchQ && step === totalSteps - 1 ? ' · bonus' : ''}
              </p>
            )}
          </div>
        )}

        {phase === 'intro' && (
          <Intro
            onStart={() => {
              trackQuizStart()
              setPhase('questions')
            }}
          />
        )}

        {phase === 'questions' && q && (
          <QuestionStep
            question={q}
            selectedIds={selectedIds}
            advancing={advancing}
            onSelectSingle={commitSingle}
            onToggleMulti={toggleMulti}
            onContinueMulti={continueMulti}
            onBack={goBackQuestion}
          />
        )}

        {phase === 'result' && (
          <ResultStep
            persona={scored.persona}
            secondaryPersona={scored.secondaryPersona}
            confidence={scored.confidence}
            topCategories={scored.topCategories}
            answerLabels={scored.answerLabels}
            picks={picks}
            saved={saved}
            firstName={firstName}
            email={email}
            optIn={optIn}
            submitting={submitting}
            submitError={submitError}
            onFirstName={setFirstName}
            onEmail={setEmail}
            onOptIn={setOptIn}
            onSubmit={submitCapture}
            onRetake={retake}
          />
        )}

        <footer className="mt-12 space-y-8 border-t border-line pt-10" aria-label="Bamboo notes">
          <AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="quiz-intro" />
          <AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="quiz-result" />
          <AdaptiveContentBalloon plan={balloonPlan} deck={balloonDeck} anchor="quiz-picks" />
        </footer>
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
        A handful of quick taps. Zero wrong answers. See your bamboo persona
        and named picks immediately — save to the house book only if you want
        updates.
      </p>
      <button type="button" onClick={onStart} className="btn-primary mt-10 !px-10">
        Start the vibe check <ArrowRight className="size-4" />
      </button>
      <p className="mt-4 text-xs text-muted">
        No account required · Results first · Email optional
      </p>
    </div>
  )
}

function QuestionStep({
  question,
  selectedIds,
  advancing,
  onSelectSingle,
  onToggleMulti,
  onContinueMulti,
  onBack,
}: {
  question: QuizQuestion
  selectedIds: string[]
  advancing: boolean
  onSelectSingle: (id: string) => void
  onToggleMulti: (id: string) => void
  onContinueMulti: () => void
  onBack: () => void
}) {
  const multi = Boolean(question.multiSelect)
  const max = question.maxSelect ?? 2

  return (
    <div key={question.id} className="animate-in">
      <h2 className="font-display text-3xl sm:text-4xl font-semibold leading-tight text-balance">
        {question.prompt}
      </h2>
      {question.sub && (
        <p className="mt-2 text-ink-soft">{question.sub}</p>
      )}
      {multi && (
        <p className="mt-2 text-xs font-semibold text-bamboo">
          {selectedIds.length === 0
            ? `Select 1–${max}`
            : `${selectedIds.length} of ${max} selected`}
        </p>
      )}

      <div className="mt-8 grid sm:grid-cols-2 gap-3">
        {question.options.map((opt) => {
          const active = selectedIds.includes(opt.id)
          return (
            <button
              key={opt.id}
              type="button"
              disabled={advancing && !multi}
              aria-pressed={active}
              onClick={() =>
                multi ? onToggleMulti(opt.id) : onSelectSingle(opt.id)
              }
              className={`text-left rounded-2xl border p-4 sm:p-5 transition duration-200 ${
                active
                  ? 'border-bamboo bg-bamboo/10 shadow-[0_12px_30px_-16px_rgba(63,107,53,0.45)] scale-[1.02]'
                  : 'border-line bg-card hover:border-bamboo/40 hover:bg-paper-2'
              } ${advancing && !multi && !active ? 'opacity-50' : ''} ${
                advancing && !multi ? 'pointer-events-none' : ''
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
          disabled={advancing && !multi}
          className="text-sm font-semibold text-ink-soft hover:text-bamboo disabled:opacity-40"
        >
          Back
        </button>
        {multi ? (
          <button
            type="button"
            onClick={onContinueMulti}
            disabled={selectedIds.length === 0}
            className="btn-primary !py-2.5 !px-5 disabled:opacity-40"
          >
            Continue <ArrowRight className="size-4" />
          </button>
        ) : (
          <p className="text-xs text-muted font-medium">
            {advancing ? 'Next…' : 'Tap a card to continue'}
          </p>
        )}
      </div>
    </div>
  )
}

function SaveHouseBook({
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
}) {
  const editLabel = editWordForPersona(persona.id)

  return (
    <section
      className="mt-8 rounded-2xl border border-bamboo/25 bg-paper-2/90 p-5 sm:p-6 shadow-[0_12px_40px_-24px_rgba(63,107,53,0.35)]"
      aria-labelledby="save-house-book-heading"
    >
      <p className="label-micro text-bamboo mb-1">Optional · house book</p>
      <h3
        id="save-house-book-heading"
        className="font-display text-xl sm:text-2xl font-semibold leading-tight"
      >
        Save your {persona.title} card
      </h3>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed">
        Keep this vibe in the house book and get this week’s {editLabel} edit
        by email. You already have full results above — this is just for
        follow-up.
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">
              First name
            </span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => onFirstName(e.target.value)}
              placeholder="Alex"
              className="mt-1.5 w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-bamboo focus:ring-2 focus:ring-bamboo/20"
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
              className="mt-1.5 w-full rounded-xl border border-line bg-card px-4 py-2.5 text-sm outline-none focus:border-bamboo focus:ring-2 focus:ring-bamboo/20"
              autoComplete="email"
            />
          </label>
        </div>
        <label className="flex items-start gap-2.5 text-sm text-ink-soft cursor-pointer">
          <input
            type="checkbox"
            checked={optIn}
            onChange={(e) => onOptIn(e.target.checked)}
            className="mt-1 rounded border-line"
          />
          <span>
            Welcome note + occasional limited-time bamboo drops. Unsubscribe
            anytime.
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="text-sm text-[#9a3412] bg-[#fff7ed] border border-[#fdba74] rounded-xl px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="btn-secondary w-full sm:w-auto !py-2.5 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving…
            </>
          ) : (
            <>
              Save to house book <Sparkles className="size-4" />
            </>
          )}
        </button>
      </form>
    </section>
  )
}

function ResultStep({
  persona,
  secondaryPersona,
  confidence,
  topCategories,
  answerLabels,
  picks,
  saved,
  firstName,
  email,
  optIn,
  submitting,
  submitError,
  onFirstName,
  onEmail,
  onOptIn,
  onSubmit,
  onRetake,
}: {
  persona: Persona
  secondaryPersona: Persona | null
  confidence: number
  topCategories: Category[]
  answerLabels: string[]
  picks: QuizPick[]
  saved: boolean
  firstName: string
  email: string
  optIn: boolean
  submitting: boolean
  submitError: string | null
  onFirstName: (v: string) => void
  onEmail: (v: string) => void
  onOptIn: (v: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  onRetake: () => void
}) {
  const cats = topCategories.length ? topCategories : persona.categories
  const shopTo = shopLinkForCategories(cats)
  const vibe = getVibe(persona.id)
  const secondaryVibe = secondaryPersona
    ? getVibe(secondaryPersona.id)
    : null
  const editWord = editWordForPersona(persona.id)
  const confidencePct = Math.round(confidence * 100)

  return (
    <div className="animate-in">
      <div
        className="rounded-3xl border border-line bg-card overflow-hidden shadow-[0_20px_50px_-28px_rgba(18,26,18,0.35)]"
        style={{ borderColor: `${persona.accent}44` }}
      >
        <div className="grid sm:grid-cols-[9rem_1fr] lg:grid-cols-[11rem_1fr]">
          {vibe && (
            <div className="relative aspect-[3/4] sm:aspect-auto sm:min-h-[22rem] bg-paper-2">
              <img
                src={vibe.avatar.image}
                alt={vibe.avatar.alt}
                className="absolute inset-0 w-full h-full object-cover object-top"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <p className="label-micro" style={{ color: persona.accent }}>
              Your bamboo persona
              {vibe ? ` · ${vibe.avatar.name}` : ''}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold mt-2 leading-tight">
              {firstName ? `${firstName}, you’re a` : 'You’re a'}{' '}
              <span style={{ color: persona.accent }}>{persona.title}</span>
            </h2>
            <p className="mt-2 text-lg text-ink-soft font-medium">
              {persona.tagline}
            </p>

            {/* Primary + secondary vibe */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-paper"
                style={{ backgroundColor: persona.accent }}
              >
                Primary · {persona.title}
              </span>
              {secondaryPersona && (
                <Link
                  to={vibePath(secondaryPersona.id)}
                  className="rounded-full border px-2.5 py-1 text-xs font-semibold hover:border-bamboo/50 transition"
                  style={{
                    borderColor: `${secondaryPersona.accent}66`,
                    color: secondaryPersona.accent,
                  }}
                >
                  Secondary · {secondaryPersona.title}
                  {secondaryVibe ? ` · ${secondaryVibe.avatar.name}` : ''}
                </Link>
              )}
              {confidencePct >= 40 && (
                <span className="text-xs text-muted font-medium">
                  {confidencePct}% match confidence
                </span>
              )}
            </div>

            {vibe && (
              <p
                className="mt-3 text-ink-soft italic leading-relaxed border-l-2 pl-3 max-w-xl"
                style={{ borderColor: `${persona.accent}66` }}
              >
                “{vibe.avatar.quote}”
              </p>
            )}
            <p className="mt-4 text-ink-soft leading-relaxed max-w-2xl">
              {persona.story}
            </p>

            {/* Answer summary — makes the match feel earned */}
            {answerLabels.length > 0 && (
              <div
                className="mt-5 rounded-2xl border bg-paper-2/80 px-4 py-3"
                style={{ borderColor: `${persona.accent}33` }}
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted mb-1.5">
                  You chose
                </p>
                <p className="text-sm text-ink-soft leading-relaxed">
                  <span className="text-ink font-medium">
                    {answerLabels.join(' · ')}
                  </span>
                  <span className="text-muted"> → </span>
                  <span
                    className="font-semibold"
                    style={{ color: persona.accent }}
                  >
                    {persona.title}
                  </span>
                </p>
              </div>
            )}

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
                <Check className="size-4" /> Interests saved — watch your inbox
                for a welcome note.
              </p>
            )}

            {/* CTA hierarchy: shop primary · vibe secondary · limited/retake tertiary */}
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to={shopTo} className="btn-primary">
                Shop your {editWord} edit <ArrowRight className="size-4" />
              </Link>
              <Link to={vibePath(persona.id)} className="btn-secondary">
                See vibe card
              </Link>
              {secondaryPersona && (
                <Link
                  to={vibePath(secondaryPersona.id)}
                  className="text-sm font-semibold text-ink-soft hover:text-bamboo px-2 py-2"
                >
                  Explore {secondaryPersona.title}
                </Link>
              )}
              <Link
                to="/shop?limited=1"
                className="text-sm font-semibold text-ink-soft hover:text-bamboo px-2 py-2"
              >
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
        </div>
      </div>

      {/* Reverse email: soft save after full results */}
      {!saved && (
        <SaveHouseBook
          persona={persona}
          firstName={firstName}
          email={email}
          optIn={optIn}
          submitting={submitting}
          error={submitError}
          onFirstName={onFirstName}
          onEmail={onEmail}
          onOptIn={onOptIn}
          onSubmit={onSubmit}
        />
      )}

      {picks.length > 0 && (
        <section className="mt-12">
          <h3 className="font-display text-2xl sm:text-3xl font-semibold">
            Named picks for your vibe
          </h3>
          <p className="mt-1 text-sm text-muted">
            Variety over six similar boards — each pick has a role and a why.
          </p>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {picks.map((pick) => (
              <ProductCard
                key={pick.product.id}
                product={pick.product}
                compact
                listName="quiz_picks"
                pickLabel={pick.role}
                whyLine={pick.why}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to={shopTo} className="btn-primary">
              Shop your full {editWord} edit <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
