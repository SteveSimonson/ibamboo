import { useState, type ReactNode } from 'react'
import { ChevronDown, Leaf, ThumbsDown, ThumbsUp, Wrench } from 'lucide-react'
import type { ProductEnrichment } from '../data/types'

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((para, i) => (
        <p
          key={i}
          className="text-sm text-ink-soft leading-relaxed mb-3 last:mb-0"
        >
          {para}
        </p>
      ))}
    </>
  )
}

function ChipList({
  items,
  tone,
}: {
  items: string[]
  tone: 'love' | 'caveat' | 'neutral'
}) {
  const cls =
    tone === 'love'
      ? 'border-bamboo/30 bg-bamboo/5 text-ink-soft'
      : tone === 'caveat'
        ? 'border-line bg-paper/60 text-ink-soft'
        : 'border-line bg-card text-ink-soft'
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-full border px-3 py-1.5 text-xs leading-snug ${cls}`}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-ink leading-snug">{q}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted mt-0.5 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <p className="pb-4 text-sm text-ink-soft leading-relaxed -mt-1 pr-8">{a}</p>
      ) : null}
    </div>
  )
}

export function ProductEnrichmentSections({
  enrichment,
  guideNote,
  reviewNote,
}: {
  enrichment: ProductEnrichment
  guideNote?: ReactNode
  reviewNote?: ReactNode
}) {
  const { reviewSnapshot: r, blog, faq, setupTips, researchNotes } = enrichment

  return (
    <div className="mt-16 space-y-16">
      <section aria-labelledby="review-snapshot-heading">
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <p className="label-micro mb-1">House judgment</p>
            <h2
              id="review-snapshot-heading"
              className="font-display text-2xl sm:text-3xl font-semibold"
            >
              Review snapshot
            </h2>
          </div>
          {r.ratingNote ? (
            <p className="text-[11px] text-muted max-w-[14rem] text-right leading-snug hidden sm:block">
              {r.ratingNote}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-line bg-card p-6 sm:p-8 space-y-8">
          <p className="text-base sm:text-lg text-ink font-medium leading-relaxed border-l-2 border-bamboo/50 pl-4">
            {r.verdict}
          </p>
          {r.ratingNote ? (
            <p className="text-[11px] text-muted sm:hidden">{r.ratingNote}</p>
          ) : null}

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ThumbsUp className="size-4 text-bamboo" />
                <h3 className="text-sm font-bold text-ink">What people love</h3>
              </div>
              <ChipList items={r.love} tone="love" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ThumbsDown className="size-4 text-muted" />
                <h3 className="text-sm font-bold text-ink">Honest caveats</h3>
              </div>
              <ChipList items={r.caveats} tone="caveat" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 pt-2 border-t border-line">
            <div>
              <h3 className="text-sm font-bold text-ink mb-3">Best for</h3>
              <ul className="space-y-2">
                {r.bestFor.map((x) => (
                  <li key={x} className="text-sm text-ink-soft flex gap-2">
                    <span className="text-bamboo font-bold">+</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink mb-3">Skip if</h3>
              <ul className="space-y-2">
                {r.skipIf.map((x) => (
                  <li key={x} className="text-sm text-ink-soft flex gap-2">
                    <span className="text-muted font-bold">−</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {reviewNote}

      <section aria-labelledby="item-blog-heading">
        <div className="mb-6">
          <p className="label-micro mb-1 flex items-center gap-1.5">
            <Leaf className="size-3.5 text-bamboo" />
            iBamboo field notes
          </p>
          <h2
            id="item-blog-heading"
            className="font-display text-2xl sm:text-3xl font-semibold"
          >
            {blog.title}
          </h2>
          <p className="text-sm text-muted mt-2 max-w-2xl">{blog.dek}</p>
        </div>
        <article className="rounded-2xl border border-line bg-card p-6 sm:p-8 space-y-10">
          {blog.sections.map((s) => (
            <div key={s.heading}>
              <h3 className="font-display text-lg font-semibold text-ink mb-3">
                {s.heading}
              </h3>
              <Paragraphs text={s.body} />
            </div>
          ))}
        </article>
      </section>

      {guideNote}

      {setupTips && setupTips.length > 0 ? (
        <section aria-labelledby="setup-tips-heading">
          <div className="flex items-center gap-2 mb-5">
            <Wrench className="size-4 text-bamboo" />
            <h2
              id="setup-tips-heading"
              className="font-display text-2xl font-semibold"
            >
              First-week tips
            </h2>
          </div>
          <ol className="rounded-2xl border border-line bg-card divide-y divide-line">
            {setupTips.map((tip, i) => (
              <li
                key={tip}
                className="flex gap-4 px-5 py-4 text-sm text-ink-soft leading-relaxed"
              >
                <span className="font-display font-bold text-bamboo tabular-nums w-6 shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {faq.length > 0 ? (
        <section aria-labelledby="faq-heading">
          <div className="mb-5">
            <p className="label-micro mb-1">Before you buy</p>
            <h2
              id="faq-heading"
              className="font-display text-2xl sm:text-3xl font-semibold"
            >
              Questions worth answering
            </h2>
          </div>
          <div className="rounded-2xl border border-line bg-card px-5 sm:px-6">
            {faq.map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
          {researchNotes && researchNotes.length > 0 ? (
            <p className="text-[11px] text-muted mt-4 leading-relaxed">
              Editorial synthesis informed by public review themes (
              {researchNotes.join(' · ')}
              ). Original iBamboo copy—not scraped listings.
            </p>
          ) : (
            <p className="text-[11px] text-muted mt-4 leading-relaxed">
              Editorial synthesis from public review themes. Original iBamboo
              copy—not scraped listings. Confirm live specs and price on Amazon.
            </p>
          )}
        </section>
      ) : null}
    </div>
  )
}
