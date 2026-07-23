/** Google Analytics 4 measurement ID */
export const GA_MEASUREMENT_ID = 'G-QX1HKSKTYL'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

type EventParams = Record<
  string,
  string | number | boolean | undefined | null
>

export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  })
}

export function trackEvent(name: string, params?: EventParams) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  // Drop null/undefined so gtag payloads stay clean
  const cleaned: Record<string, string | number | boolean> = {
    send_to: GA_MEASUREMENT_ID,
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) cleaned[k] = v
    }
  }
  window.gtag('event', name, cleaned)
}

// ─── Quiz & registration ───────────────────────────────────────────

export function trackQuizStart() {
  trackEvent('quiz_start', {
    engagement_type: 'vibe_check',
  })
}

export function trackQuizAnswer(opts: {
  questionId: string
  optionId: string
  step: number
  totalSteps: number
}) {
  trackEvent('quiz_answer', {
    question_id: opts.questionId,
    option_id: opts.optionId,
    quiz_step: opts.step + 1,
    quiz_total: opts.totalSteps,
  })
}

export function trackQuizComplete(opts: {
  personaId: string
  personaLabel: string
  registered: boolean
}) {
  trackEvent('quiz_complete', {
    persona_id: opts.personaId,
    persona_label: opts.personaLabel,
    registered: opts.registered,
  })
}

/** Email capture submitted to CRM (house book). No PII in GA. */
export function trackRegistration(opts: {
  personaId: string
  personaLabel: string
  marketingOptIn: boolean
  hasFirstName: boolean
  success: boolean
}) {
  // GA4 recommended event for lead forms
  trackEvent('generate_lead', {
    lead_source: 'vibe_check',
    persona_id: opts.personaId,
    persona_label: opts.personaLabel,
    marketing_opt_in: opts.marketingOptIn,
    has_first_name: opts.hasFirstName,
    success: opts.success,
    currency: 'USD',
    value: opts.success ? 1 : 0,
  })
  trackEvent(opts.success ? 'registration_success' : 'registration_failed', {
    lead_source: 'vibe_check',
    persona_id: opts.personaId,
    marketing_opt_in: opts.marketingOptIn,
  })
}

export function trackQuizSkipRegistration(opts: {
  personaId: string
  personaLabel: string
}) {
  trackEvent('quiz_skip_registration', {
    persona_id: opts.personaId,
    persona_label: opts.personaLabel,
  })
}

export function trackQuizRetake() {
  trackEvent('quiz_retake')
}

// ─── Commerce (catalog + Amazon outbound) ──────────────────────────

export function trackViewItem(opts: {
  id: string
  name: string
  category: string
  price?: number
  asin?: string
  limitedTime?: boolean
}) {
  trackEvent('view_item', {
    currency: 'USD',
    value: opts.price ?? 0,
    item_id: opts.id,
    item_name: opts.name,
    item_category: opts.category,
    item_variant: opts.asin,
    limited_time: opts.limitedTime ?? false,
  })
}

export function trackSelectItem(opts: {
  id: string
  name: string
  category: string
  price?: number
  listName?: string
}) {
  trackEvent('select_item', {
    item_list_name: opts.listName ?? 'catalog',
    item_id: opts.id,
    item_name: opts.name,
    item_category: opts.category,
    value: opts.price ?? 0,
    currency: 'USD',
  })
}

/** Outbound Amazon Associates click — primary conversion proxy. */
export function trackAmazonClick(opts: {
  id: string
  name: string
  category: string
  price?: number
  asin?: string
  location: string
}) {
  trackEvent('amazon_click', {
    item_id: opts.id,
    item_name: opts.name,
    item_category: opts.category,
    item_variant: opts.asin,
    value: opts.price ?? 0,
    currency: 'USD',
    click_location: opts.location,
    outbound: true,
  })
  // Also fire GA ecommerce-style select for funnels that expect it
  trackEvent('select_content', {
    content_type: 'amazon_product',
    item_id: opts.id,
    content_id: opts.asin ?? opts.id,
  })
}

export function trackShopFilter(opts: {
  category?: string
  limited?: boolean
  query?: string
}) {
  trackEvent('shop_filter', {
    item_category: opts.category || 'all',
    limited_time: opts.limited ?? false,
    has_query: Boolean(opts.query),
    search_term: opts.query ? opts.query.slice(0, 80) : undefined,
  })
  if (opts.query && opts.query.trim().length >= 2) {
    trackEvent('search', {
      search_term: opts.query.trim().slice(0, 80),
    })
  }
}

// ─── Vibes & engagement CTAs ───────────────────────────────────────

export function trackVibeView(opts: { vibeId: string; vibeTitle: string }) {
  trackEvent('vibe_view', {
    vibe_id: opts.vibeId,
    vibe_title: opts.vibeTitle,
  })
}

export function trackVibeCta(opts: {
  action: string
  location: string
  vibeId?: string
  category?: string
}) {
  trackEvent('vibe_cta_click', {
    cta_action: opts.action,
    cta_location: opts.location,
    vibe_id: opts.vibeId,
    item_category: opts.category,
  })
}

export function trackNavClick(opts: { label: string; href: string }) {
  trackEvent('nav_click', {
    link_text: opts.label,
    link_url: opts.href,
  })
}
