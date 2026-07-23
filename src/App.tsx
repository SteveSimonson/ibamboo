import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ScrollToTop } from './components/ScrollToTop'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { Home } from './pages/Home'
import { Shop } from './pages/Shop'
import { ProductPage } from './pages/Product'
import { Why } from './pages/Why'
import { Quiz } from './pages/Quiz'
import { VibePage } from './pages/Vibe'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GoogleAnalytics />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="why" element={<Why />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="vibe/:vibeId" element={<VibePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
