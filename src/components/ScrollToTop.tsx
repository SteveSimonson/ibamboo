import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll to top on every navigation (pathname + search). */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' in window ? 'instant' : 'auto',
    })
  }, [pathname, search])

  return null
}
