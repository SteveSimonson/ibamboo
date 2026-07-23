/** Google Analytics 4 measurement ID */
export const GA_MEASUREMENT_ID = 'G-QX1HKSKTYL'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title ?? document.title,
    page_location: window.location.href,
    send_to: GA_MEASUREMENT_ID,
  })
}

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', name, {
    ...params,
    send_to: GA_MEASUREMENT_ID,
  })
}
