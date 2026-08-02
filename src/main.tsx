import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// A tab restored from the browser back/forward cache can contain an old React
// tree and old hashed assets even though the HTML shell is configured to
// revalidate. Compare the active hashed assets with the latest shell and only
// reload when a deployment actually changed, preserving state otherwise.
function hashedAssetPaths(root: Document) {
  return [...root.querySelectorAll('script[src], link[href]')]
    .map((element) => element.getAttribute('src') || element.getAttribute('href'))
    .filter((asset): asset is string => Boolean(asset && asset.includes('/assets/')))
    .map((asset) => new URL(asset, window.location.href).pathname)
    .sort()
}

async function refreshPersistedPageIfStale(event: PageTransitionEvent) {
  if (!event.persisted) return

  const activeAssets = hashedAssetPaths(document)
  if (!activeAssets.length) return

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
    const latestAssets = hashedAssetPaths(latestDocument)
    if (latestAssets.length && JSON.stringify(activeAssets) !== JSON.stringify(latestAssets)) {
      window.location.reload()
    }
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
