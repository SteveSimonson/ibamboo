import { useEffect, useRef, useState } from 'react'
import type { BalloonPlan, EditorialType } from '../lib/balloonPlan'
import type { ConbalSize } from '../components/ConbalBalloon'
import type { ViewportTier } from './useViewportTier'

export type ContentBalloonPayload = {
  css?: string
  editorial_type?: EditorialType
  html: string
  size?: ConbalSize
  slug?: string
}

export type ContentBalloonDeck = Record<string, ContentBalloonPayload>

const DEFAULT_ORIGIN = 'https://conbal.us'
const DEFAULT_SITE_KEY = 'NYcKxGAVDdeF'
const MAX_EXCLUDED_SLUGS = 8
const validSlug = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z0-9-]{1,80}$/.test(value)

function requestNonce() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Fetch one random deck for a stable route/data state. */
function storageKey(siteKey: string, routeKey: string, signature: string, tier: ViewportTier) {
  return `ibamboo:content-balloon:previous:${siteKey}:${tier}:${encodeURIComponent(routeKey)}:${encodeURIComponent(signature)}`
}

function priorDeck(key: string): string[] {
  try {
    const raw = window.sessionStorage.getItem(key)
    const values = raw ? JSON.parse(raw) : []
    return Array.isArray(values)
      ? [...new Set(values.filter(validSlug))].slice(0, MAX_EXCLUDED_SLUGS)
      : []
  } catch {
    return []
  }
}

function saveDeck(key: string, deck: ContentBalloonDeck) {
  try {
    const slugs = [...new Set(Object.values(deck).map((item) => item.slug).filter(validSlug))]
      .slice(0, MAX_EXCLUDED_SLUGS)
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
  const historyKey = storageKey(siteKey, plan.routeKey, plan.signature, tier)

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
        const received = ((await response.json()) as { slots?: ContentBalloonDeck }).slots
        if (!received || typeof received !== 'object') return
        const knownSlugs = new Set<string>()
        const valid = Object.fromEntries(plan.slots.flatMap((slot) => {
          const item = received[slot.anchor]
          if (!item || typeof item.html !== 'string' || item.size !== slot.size || !item.slug || knownSlugs.has(item.slug) || !item.editorial_type || !slot.editorialTypes.includes(item.editorial_type)) return []
          knownSlugs.add(item.slug)
          return [[slot.anchor, item]]
        })) as ContentBalloonDeck
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
  }, [enabled, historyKey, origin, plan.signature, plan.slots, siteKey, tier])
  return deck
}
