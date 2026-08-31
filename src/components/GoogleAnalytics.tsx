import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { GA_MEASUREMENT_ID, trackPageView } from '../lib/analytics'

const INTERACT_EVENTS = ['pointerdown', 'keydown', 'touchstart'] as const

/**
 * Loads gtag.js after window load + idle, or on first interaction — never in
 * the render-blocking HTML head.
 */
export function GoogleAnalytics() {
  const location = useLocation()

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return
    if (typeof window.gtag === 'function') return

    let idleId = 0
    let timeoutId = 0
    let booted = false

    const inject = () => {
      if (booted || typeof window.gtag === 'function') return
      booted = true
      const s = document.createElement('script')
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
      document.head.appendChild(s)
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag(...args: unknown[]) {
        window.dataLayer?.push(args)
      }
      window.gtag('js', new Date())
      window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false })
      trackPageView(`${window.location.pathname}${window.location.search}`)
    }

    const onIdle = () => {
      const ric = window.requestIdleCallback
      if (typeof ric === 'function') {
        idleId = ric(inject, { timeout: 2500 })
      } else {
        timeoutId = window.setTimeout(inject, 1200)
      }
    }

    if (document.readyState === 'complete') onIdle()
    else window.addEventListener('load', onIdle, { once: true })

    for (const ev of INTERACT_EVENTS) {
      window.addEventListener(ev, inject, { once: true, passive: true })
    }

    return () => {
      window.removeEventListener('load', onIdle)
      for (const ev of INTERACT_EVENTS) {
        window.removeEventListener(ev, inject)
      }
      if (idleId && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId)
      }
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [])

  useEffect(() => {
    const path = `${location.pathname}${location.search}`
    trackPageView(path)
  }, [location.pathname, location.search])

  return null
}
