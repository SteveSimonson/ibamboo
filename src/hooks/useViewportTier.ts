import { useEffect, useState, useSyncExternalStore } from 'react'

export type ViewportTier = 'compact' | 'tablet' | 'desktop' | 'wide'

const serverTier: ViewportTier = 'compact'

function tierForWidth(width: number): ViewportTier {
  if (width >= 1280) return 'wide'
  if (width >= 1024) return 'desktop'
  if (width >= 640) return 'tablet'
  return 'compact'
}

function getTierSnapshot(): ViewportTier {
  if (typeof window === 'undefined') return serverTier
  return tierForWidth(window.innerWidth)
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const queries = [
    window.matchMedia('(min-width: 640px)'),
    window.matchMedia('(min-width: 1024px)'),
    window.matchMedia('(min-width: 1280px)'),
  ]
  for (const query of queries) query.addEventListener('change', callback)
  return () => {
    for (const query of queries) query.removeEventListener('change', callback)
  }
}

/**
 * Returns a stable creative tier and delays network-sensitive work until the
 * browser has mounted. The server snapshot is intentionally compact.
 */
export function useViewportTier(): { tier: ViewportTier; ready: boolean } {
  const tier = useSyncExternalStore(subscribe, getTierSnapshot, () => serverTier)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  return { tier, ready: typeof window !== 'undefined' && ready }
}
