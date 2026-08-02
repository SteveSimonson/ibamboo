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
  const [delivery, setDelivery] = useState<{
    deck: ContentBalloonDeck
    routeKey: string
  }>(() => ({ deck: {}, routeKey: plan.routeKey }))
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
    if (!enabled || activePlan.slots.length === 0) {
      setDelivery({ deck: {}, routeKey: activePlan.routeKey })
      return
    }
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
        if (response.status === 404 || response.status === 405) {
          const legacy = await legacyLoad()
          if (!legacy || typeof legacy !== 'object' || Array.isArray(legacy)) return {}
          return Object.fromEntries(Object.entries(legacy).filter(([, item]) => {
            const slug = (item as { slug?: unknown })?.slug
            return typeof slug === 'string' && !previous.includes(slug)
          }))
        }
        if (!isJson) throw new Error('Smart content sample returned a non-JSON response')
        if (!response.ok) throw new Error(`Smart content sample failed: ${response.status}`)
        return ((await response.json()) as { assignments?: unknown }).assignments
    }

    async function load() {
      try {
        const received = await smartLoad()
        const valid = validatedContentBalloonDeck(activePlan, received)
        if (!controller.signal.aborted) {
          setDelivery({ deck: valid, routeKey: activePlan.routeKey })
          saveDeck(historyKey, valid, previous)
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setDelivery({ deck: {}, routeKey: activePlan.routeKey })
          console.warn('Unable to load editorial content', error)
        }
      }
    }
    void load()
    return () => controller.abort()
  }, [enabled, historyKey, origin, plan.signature, siteKey])
  return delivery.routeKey === plan.routeKey ? delivery.deck : {}
}
