import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductPage } from './pages/Product'
import { Why } from './pages/Why'
import { About } from './pages/About'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { Quiz } from './pages/Quiz'
import { VibePage } from './pages/Vibe'
import { GiftsHubPage } from './pages/Gifts'
import { GiftGuidePage } from './pages/GiftGuide'
import { BuyerGuidesHubPage } from './pages/BuyerGuides'
import { BuyerGuidePage } from './pages/BuyerGuide'

const Admin = lazy(() =>
  import('./pages/Admin').then((m) => ({ default: m.Admin })),
)

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GoogleAnalytics />
      <Routes>
        {/* Admin is full-bleed (no storefront chrome); lazy to keep merch chunk lean */}
        <Route
          path="admin/*"
          element={
            <Suspense
              fallback={
                <div className="min-h-screen bg-[#0f1412] text-white/60 flex items-center justify-center text-sm">
                  Loading admin…
                </div>
              }
            >
              <Admin />
            </Suspense>
          }
        />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="gifts" element={<GiftsHubPage />} />
          <Route path="gifts/:slug" element={<GiftGuidePage />} />
          <Route path="guides" element={<BuyerGuidesHubPage />} />
          <Route path="guides/:slug" element={<BuyerGuidePage />} />
          <Route path="why" element={<Why />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="vibe/:vibeId" element={<VibePage />} />
          <Route path="about" element={<About />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
