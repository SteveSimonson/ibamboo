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

function saveDeck(key: string, deck: ContentBalloonDeck) {
  try {
    const slugs = recentBalloonSlugs(Object.values(deck).map((item) => item.slug))
    if (slugs.length) window.sessionStorage.setItem(key, JSON.stringify(slugs))
  } catch {
    // Storage may be blocked or full; delivery still works without history.
  }
}

export function useAdaptiveContentBalloons(
  plan: BalloonPlan,
  enabled = true,
  tier: ViewportTier = 'compact',
) {
  const [deck, setDeck] = useState<ContentBalloonDeck>({})
  const routeRef = useRef(plan.routeKey)
  const nonceRef = useRef(requestNonce())
  if (routeRef.current !== plan.routeKey) {
    routeRef.current = plan.routeKey
    nonceRef.current = requestNonce()
  }
  const origin = (import.meta.env.VITE_CONBAL_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, '')
  const siteKey = import.meta.env.VITE_CONBAL_SITE_KEY || DEFAULT_SITE_KEY
  const historyKey = contentBalloonHistoryKey(siteKey)

  useEffect(() => {
    if (!enabled) { setDeck({}); return }
    const controller = new AbortController()
    setDeck({})
    const previous = priorDeck(historyKey)
    const params = new URLSearchParams({
      nonce: nonceRef.current,
      slots: JSON.stringify(plan.slots.map((slot) => ({ id: slot.anchor, size: slot.size, topics: slot.topics, editorial_types: slot.editorialTypes }))),
    })
    if (previous.length) params.set('exclude_slugs', previous.join(','))
    async function load() {
      try {
        const response = await fetch(`${origin}/b/${encodeURIComponent(siteKey)}/_sample?${params}`, { cache: 'no-store', mode: 'cors', signal: controller.signal })
        if (!response.ok) throw new Error(`Content sample failed: ${response.status}`)
        const received = ((await response.json()) as { slots?: unknown }).slots
        const valid = validatedContentBalloonDeck(plan, received)
        if (!controller.signal.aborted) {
          setDeck(valid)
          saveDeck(historyKey, valid)
        }
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Unable to load editorial content', error)
      }
    }
    void load()
    return () => controller.abort()
  }, [enabled, historyKey, origin, plan, siteKey, tier])
  return deck
}
