import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// A tab restored from the browser back/forward cache can contain an old React
// tree and old hashed assets even though the HTML shell is configured to
// revalidate. Compare the active bundle with the latest shell and only reload
// when a deployment actually changed, preserving scroll/form state otherwise.
async function refreshPersistedPageIfStale(event: PageTransitionEvent) {
  if (!event.persisted) return

  const activeScript = [...document.scripts].find((script) =>
    /\/assets\/index-[^/]+\.js$/.test(script.src),
  )
  if (!activeScript) return

  try {
    const checkUrl = new URL(window.location.href)
    checkUrl.searchParams.set('__bfcache_check', String(Date.now()))
    checkUrl.hash = ''
    const response = await fetch(checkUrl, {
      cache: 'no-store',
      headers: { Accept: 'text/html' },
    })
    if (!response.ok) return

    const latestHtml = await response.text()
    const latestDocument = new DOMParser().parseFromString(latestHtml, 'text/html')
    const latestScript = [...latestDocument.scripts].find((script) =>
      /\/assets\/index-[^/]+\.js$/.test(script.src),
    )
    if (!latestScript) return

    const activePath = new URL(activeScript.src, window.location.href).pathname
    const latestPath = new URL(latestScript.src, window.location.href).pathname
    if (activePath !== latestPath) window.location.reload()
  } catch {
    // Keep the restored page usable when the network is unavailable.
  }
}

window.addEventListener('pageshow', (event) => {
  void refreshPersistedPageIfStale(event)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
