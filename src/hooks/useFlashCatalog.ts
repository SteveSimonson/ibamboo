import { useEffect, useMemo, useState } from 'react'
import {
  isMerchandisableProduct,
  isZ9goGatedProduct,
  shopProducts,
} from '../data/catalog'
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
    if (!isZ9goGatedProduct(p)) continue
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

/**
 * Merge flash over static house catalog.
 * Flash alone is still too thin (~12 SKUs) to own the full shop; until Flash
 * publish depth is production-grade, keep static assortment and layer flash on top.
 */
function mergeFlashOverStatic(flash: Product[]): Product[] {
  return finalizePool([...flash, ...shopProducts])
}

export type FlashCatalogState = {
  /** Full shop list: flash picks first, then full static catalog */
  products: Product[]
  flashOnly: Product[]
  payload: FlashCatalogPayload | null
  loading: boolean
  source: 'flash' | 'static' | 'merged'
  error?: string
  generatedAt?: string
  weekOf?: string
  catalogBaseUrl: string
}

/**
 * Load flash catalog and merge onto the static house/BSR assortment.
 * Static is the bulk shelf; flash is live control-plane overlay (not a wipe).
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
    const staticPool = finalizePool(shopProducts)
    if (flashOnly.length > 0) {
      return {
        products: mergeFlashOverStatic(flashOnly),
        flashOnly,
        payload,
        loading,
        source: 'merged' as const,
        error: undefined,
        generatedAt: payload?.generatedAt,
        weekOf: payload?.weekOf,
        catalogBaseUrl,
      }
    }
    return {
      products: staticPool,
      flashOnly: [],
      payload: null,
      loading,
      source: 'static' as const,
      error: error || (loading ? undefined : undefined),
      weekOf: undefined,
      generatedAt: undefined,
      catalogBaseUrl,
    }
  }, [payload, loading, error, catalogBaseUrl])
}
