import { useEffect, useRef, useState } from 'react'
import type { BalloonPlan, EditorialType } from '../lib/balloonPlan'
import type { ConbalSize } from '../components/ConbalBalloon'

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

function requestNonce() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/** Fetch one random deck for a stable route/data state. */
export function useAdaptiveContentBalloons(plan: BalloonPlan, enabled = true) {
  const [deck, setDeck] = useState<ContentBalloonDeck>({})
  const routeRef = useRef(plan.routeKey)
  const nonceRef = useRef(requestNonce())
  if (routeRef.current !== plan.routeKey) {
    routeRef.current = plan.routeKey
    nonceRef.current = requestNonce()
  }
  const origin = (import.meta.env.VITE_CONBAL_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, '')
  const siteKey = import.meta.env.VITE_CONBAL_SITE_KEY || DEFAULT_SITE_KEY

  useEffect(() => {
    if (!enabled) { setDeck({}); return }
    const controller = new AbortController()
    setDeck({})
    const params = new URLSearchParams({
      nonce: nonceRef.current,
      slots: JSON.stringify(plan.slots.map((slot) => ({ id: slot.anchor, size: slot.size, topics: slot.topics, editorial_types: slot.editorialTypes }))),
    })
    async function load() {
      try {
        const response = await fetch(`${origin}/b/${encodeURIComponent(siteKey)}/_sample?${params}`, { mode: 'cors', signal: controller.signal })
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
        if (!controller.signal.aborted) setDeck(valid)
      } catch (error) {
        if (!controller.signal.aborted) console.warn('Unable to load editorial content', error)
      }
    }
    void load()
    return () => controller.abort()
  }, [enabled, origin, plan.signature, plan.slots, siteKey])
  return deck
}
