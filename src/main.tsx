import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// A tab restored from the browser back/forward cache can contain an old React
// tree and old hashed assets even though the HTML shell is configured to
// revalidate. Reload persisted pages so returning visitors see the current
// layout and imagery instead of a stale pre-deploy render.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
