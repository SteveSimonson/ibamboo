import type { Product } from './types'

export type Z9goUnknownPolicy = 'include' | 'exclude'

export interface Z9goGate {
  enabled?: boolean
  siteId?: string
  unknownPolicy?: Z9goUnknownPolicy
  fetchedAt?: string | null
  asins?: string[]
  source?: string
}

type GateProduct = Pick<Product, 'asin' | 'limitedTime' | 'source'>

/**
 * Curated ASIN URL-health gate. Fail-open when the sidecar is missing or
 * disabled. BSR / limited-time / amazon-search rows skip the gate.
 */
export function productPassesZ9goGate(
  p: GateProduct,
  gate?: Z9goGate | null,
): boolean {
  if (!gate || gate.enabled !== true) return true
  if (p.limitedTime) return true
  if (p.source === 'amazon-bsr' || p.source === 'amazon-search') return true
  if (!p.asin) return true
  const allowed = new Set(
    (gate.asins ?? []).map((a) => a.trim().toUpperCase()).filter(Boolean),
  )
  return allowed.has(p.asin.toUpperCase())
}
