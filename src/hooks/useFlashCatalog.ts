import { useEffect, useMemo, useState } from 'react'
import { isMerchandisableProduct, shopProducts } from '../data/catalog'
import { withProductMedia } from '../data/productMedia'
import type { Product } from '../data/types'
import {
  fetchFlashCatalog,
  flashCatalogBaseUrl,
  mapFlashProducts,
  type FlashCatalogPayload,
} from '../lib/flashCatalog'

function finalizePool(list: Product[]): Product[] {
  const seenAsin = new Set<string>()
  const seenSlug = new Set<string>()
  const out: Product[] = []
  for (const p of list) {
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
  /**
   * Active shop assortment.
   * When source === 'flash', this is flash-only (control plane SoT).
   * When source === 'static', emergency fallback (static BSR/curated).
   */
  products: Product[]
  flashOnly: Product[]
  payload: FlashCatalogPayload | null
  loading: boolean
  source: 'flash' | 'static'
  error?: string
  generatedAt?: string
  weekOf?: string
  catalogBaseUrl: string
}

/**
 * Load site assortment from Flash Catalog (source of truth).
 * Static catalog is emergency fallback only when flash is empty/unreachable.
 */
export function useFlashCatalog(siteId = 'ibamboo'): FlashCatalogState {
  const catalogBaseUrl = flashCatalogBaseUrl()
  const [payload, setPayload] = useState<FlashCatalogPayload | null>(null)
  const [loading, setLoading] = useState(Boolean(catalogBaseUrl))
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    let cancelled = false
    const base = flashCatalogBaseUrl()
    if (!base) {
      setLoading(false)
      setError('Flash catalog URL not configured')
      return
    }
    setLoading(true)
    setError(undefined)
    fetchFlashCatalog(siteId)
      .then((data) => {
        if (cancelled) return
        if (!data) {
          setPayload(null)
          setError('Flash catalog unreachable or empty')
          return
        }
        setPayload(data)
        setError(undefined)
      })
      .catch((e) => {
        if (cancelled) return
        setPayload(null)
        setError(e instanceof Error ? e.message : 'Flash catalog fetch failed')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [siteId])

  return useMemo(() => {
    const flashOnly = finalizePool(mapFlashProducts(payload))
    if (flashOnly.length > 0) {
      return {
        // Assortment SoT: flash products only — do not merge static shelves
        products: flashOnly,
        flashOnly,
        payload,
        loading,
        source: 'flash' as const,
        error: undefined,
        generatedAt: payload?.generatedAt,
        weekOf: payload?.weekOf,
        catalogBaseUrl,
      }
    }
    return {
      products: finalizePool(shopProducts),
      flashOnly: [],
      payload: null,
      loading,
      source: 'static' as const,
      error: error || (loading ? undefined : 'Using static emergency catalog'),
      weekOf: undefined,
      generatedAt: undefined,
      catalogBaseUrl,
    }
  }, [payload, loading, error, catalogBaseUrl])
}
