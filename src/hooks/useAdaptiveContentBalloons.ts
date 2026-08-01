import { useEffect, useRef, useState } from 'react'
import type { BalloonPlan } from '../lib/balloonPlan'
import type { ViewportTier } from './useViewportTier'
import {
  contentBalloonHistoryKey,
  parseRecentBalloonSlugs,
  recentBalloonSlugs,
} from '../lib/contentBalloonHistory'
import {
  validatedContentBalloonDeck,
  type ContentBalloonDeck,
} from '../lib/contentBalloonValidation'

export type { ContentBalloonDeck, ContentBalloonPayload } from '../lib/contentBalloonValidation'

const DEFAULT_ORIGIN = 'https://conbal.us'
const DEFAULT_SITE_KEY = 'NYcKxGAVDdeF'
function requestNonce() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function estimatedContainer(role: BalloonPlan['slots'][number]['role']) {
  const viewport = typeof window === 'undefined' ? 390 : window.innerWidth
  const content = Math.max(280, Math.min(1280, viewport - (viewport >= 640 ? 48 : 32)))
  if (role !== 'grid-tile') return { width: content, height: 360 }
  const columns = viewport >= 1280 ? 4 : viewport >= 1024 ? 3 : viewport >= 640 ? 2 : 1
  const gaps = (columns - 1) * 20
  return { width: Math.floor((content - gaps) / columns), height: columns === 1 ? 320 : 760 }
}

/** Fetch one random deck for a stable route/data state. */
function priorDeck(key: string): string[] {
  try {
    return parseRecentBalloonSlugs(window.sessionStorage.getItem(key))
  } catch {
    return []
  }
}

function saveDeck(key: string, deck: ContentBalloonDeck, previous: string[]) {
  try {
    const slugs = recentBalloonSlugs([
      ...Object.values(deck).map((item) => item.slug),
      ...previous,
    ])
    if (slugs.length) window.sessionStorage.setItem(key, JSON.stringify(slugs))
  } catch {
    // Storage may be blocked or full; delivery still works without history.
  }
}

export function useAdaptiveContentBalloons(
  plan: BalloonPlan,
  enabled = true,
  _tier: ViewportTier = 'compact',
) {
  const [deck, setDeck] = useState<ContentBalloonDeck>({})
  const routeRef = useRef(plan.routeKey)
  const planRef = useRef(plan)
  planRef.current = plan
  const nonceRef = useRef(requestNonce())
  if (routeRef.current !== plan.routeKey) {
    routeRef.current = plan.routeKey
    nonceRef.current = requestNonce()
  }
  const origin = (import.meta.env.VITE_CONBAL_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, '')
  const siteKey = import.meta.env.VITE_CONBAL_SITE_KEY || DEFAULT_SITE_KEY
  const historyKey = contentBalloonHistoryKey(siteKey, plan.routeKey)

  useEffect(() => {
    const activePlan = planRef.current
    if (!enabled || activePlan.slots.length === 0) { setDeck({}); return }
    const controller = new AbortController()
    const previous = priorDeck(historyKey)
    const params = new URLSearchParams({
      nonce: nonceRef.current,
      slots: JSON.stringify(activePlan.slots.map((slot) => ({ id: slot.anchor, layout: slot.layout || 'inline', size: slot.size, topics: slot.topics, editorial_types: slot.editorialTypes }))),
    })
    if (previous.length) params.set('exclude_slugs', previous.join(','))
    const v2Body = {
      contract: '2.0',
      page_view_id: nonceRef.current,
      repeat_policy: 'omit',
      exclude_slugs: previous,
      slots: activePlan.slots.map((slot) => ({
        id: slot.anchor,
        role: slot.role,
        budget: slot.budget,
        topics: slot.topics,
        editorial_types: slot.editorialTypes,
        container: estimatedContainer(slot.role),
      })),
    }

    async function legacyLoad() {
      const response = await fetch(`${origin}/b/${encodeURIComponent(siteKey)}/_sample?${params}`, { cache: 'no-store', mode: 'cors', signal: controller.signal })
      if (!response.ok) throw new Error(`Content sample failed: ${response.status}`)
      return ((await response.json()) as { slots?: unknown }).slots
    }

    async function smartLoad() {
        const response = await fetch(`${origin}/v2/b/${encodeURIComponent(siteKey)}/sample`, {
          body: JSON.stringify(v2Body),
          cache: 'no-store',
          headers: { 'content-type': 'application/json' },
          method: 'POST',
          mode: 'cors',
          signal: controller.signal,
        })
        const isJson = response.headers.get('content-type')?.includes('application/json')
        if (response.status === 404 || response.status === 405 || !isJson) return legacyLoad()
        if (!response.ok) throw new Error(`Smart content sample failed: ${response.status}`)
        return ((await response.json()) as { assignments?: unknown }).assignments
    }

    async function load() {
      try {
        let received: unknown
        try {
          received = await smartLoad()
        } catch (error) {
          if (controller.signal.aborted) throw error
          received = await legacyLoad()
        }
        const valid = validatedContentBalloonDeck(activePlan, received)
        if (!controller.signal.aborted) {
          setDeck(valid)
          saveDeck(historyKey, valid, previous)
        }
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Unable to load editorial content', error)
      }
    }
    void load()
    return () => controller.abort()
  }, [enabled, historyKey, origin, plan.signature, siteKey])
  return deck
}
