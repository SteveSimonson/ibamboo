import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../lib/analytics'

/**
 * Sends GA4 page_view on every SPA route (and query) change.
 * Initial config uses send_page_view: false so we don't double-count.
 */
export function GoogleAnalytics() {
  const location = useLocation()

  useEffect(() => {
    const path = `${location.pathname}${location.search}`
    trackPageView(path)
  }, [location.pathname, location.search])

  return null
}
