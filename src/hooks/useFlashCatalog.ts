import { useEffect, useMemo, useState } from 'react'
import { isMerchandisableProduct, shopProducts } from '../data/catalog'
import { withProductMedia } from '../data/productMedia'
import type { Product } from '../data/types'
import {
  fetchFlashCatalog,
  mapFlashProducts,
  type FlashCatalogPayload,
} from '../lib/flashCatalog'

function mergeFlashOverStatic(flash: Product[]): Product[] {
  const seenAsin = new Set<string>()
  const seenSlug = new Set<string>()
  const out: Product[] = []

  // Flash limited drop first, then full static catalog (BSR + curated)
  for (const p of [...flash, ...shopProducts]) {
    if (!isMerchandisableProduct(p)) continue
    if (p.asin && seenAsin.has(p.asin)) continue
    if (p.asin) seenAsin.add(p.asin)
    let slug = p.slug
    if (seenSlug.has(slug)) slug = `${slug}-${p.id}`
    seenSlug.add(slug)
    const merged = slug === p.slug ? p : { ...p, slug }
    out.push(withProductMedia(merged))
  }
  return out
}

export type FlashCatalogState = {
  /** Full shop list with live flash products preferred */
  products: Product[]
  flashOnly: Product[]
  payload: FlashCatalogPayload | null
  loading: boolean
  source: 'flash' | 'static'
  generatedAt?: string
  weekOf?: string
}

/**
 * Prefer live flash catalog for limited-time merchandising.
 * Falls back to static BSR-generated catalog when URL unset or fetch fails.
 */
export function useFlashCatalog(siteId = 'ibamboo'): FlashCatalogState {
  const [payload, setPayload] = useState<FlashCatalogPayload | null>(null)
  const [loading, setLoading] = useState(Boolean(import.meta.env.VITE_FLASH_CATALOG_URL))

  useEffect(() => {
    let cancelled = false
    const base = import.meta.env.VITE_FLASH_CATALOG_URL
    if (!base) {
      setLoading(false)
      return
    }
    setLoading(true)
    fetchFlashCatalog(siteId)
      .then((data) => {
        if (!cancelled) setPayload(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [siteId])

  return useMemo(() => {
    const flashOnly = mapFlashProducts(payload)
    if (flashOnly.length > 0) {
      return {
        products: mergeFlashOverStatic(flashOnly),
        flashOnly,
        payload,
        loading,
        source: 'flash' as const,
        generatedAt: payload?.generatedAt,
        weekOf: payload?.weekOf,
      }
    }
    return {
      products: shopProducts,
      flashOnly: [],
      payload: null,
      loading,
      source: 'static' as const,
      weekOf: undefined,
      generatedAt: undefined,
    }
  }, [payload, loading])
}
