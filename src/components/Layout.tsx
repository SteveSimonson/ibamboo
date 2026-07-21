import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { formatExpiry, limitedTimeCopy } from '../data/catalog'

const nav = [
  { to: '/shop?limited=1', label: 'This week' },
  { to: '/shop', label: 'Shop' },
  { to: '/shop?cat=kitchen', label: 'Kitchen' },
  { to: '/shop?cat=cutting-boards', label: 'Boards' },
  { to: '/shop?cat=desk', label: 'Workspace' },
  { to: '/shop?cat=bath', label: 'Bath' },
  { to: '/why', label: 'Our story' },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const limited = limitedTimeCopy()
  const until = formatExpiry(limited.expiresAt ?? undefined)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-[#9a3412] text-white text-center text-[11px] sm:text-[12px] py-2.5 px-4 font-semibold tracking-wide">
        <Link to="/shop?limited=1" className="hover:underline">
          {limited.headline}
          {limited.count > 0 ? ` · ${limited.count} options this week` : ''}
          {until ? ` · Refresh ${until}` : ' · Weekly Amazon Best Sellers edit'}
        </Link>
      </div>
      <div className="bg-moss text-paper/90 text-center text-[11px] py-2 px-4 font-medium tracking-wide">
        Shop on iBamboo · Buy on Amazon · Secure Amazon checkout
      </div>

      <header className="sticky top-0 z-50 bg-paper/95 backdrop-blur-xl border-b border-line/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-[4.25rem] flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <img
              src="/brand/logo-color.svg"
              alt="iBamboo"
              className="h-9 w-auto transition group-hover:opacity-90"
            />
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full text-[13px] font-semibold transition ${
                    isActive
                      ? 'bg-ink text-paper'
                      : 'text-ink-soft hover:bg-paper-2 hover:text-ink'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft hover:text-bamboo px-2"
            >
              <Search className="size-4" />
              Search
            </Link>
            <Link
              to="/shop"
              className="hidden sm:inline-flex btn-primary !py-2.5 !px-5 text-xs"
            >
              Shop collection
            </Link>
            <button
              type="button"
              className="lg:hidden p-2 rounded-xl border border-line"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-line bg-paper px-4 py-3 space-y-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-paper-2"
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto bg-charcoal text-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-4">
            <img
              src="/brand/logo-white.svg"
              alt="iBamboo"
              className="h-8 w-auto"
            />
            <p className="text-sm text-paper/65 leading-relaxed max-w-sm font-light">
              iBamboo is a destination for bamboo living—kitchen, table, bath,
              workspace, and home. Discover the collection here; complete your
              purchase on Amazon.
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold mb-4">
              Shop
            </p>
            <ul className="space-y-2.5 text-sm text-paper/70">
              <li>
                <Link to="/shop" className="hover:text-leaf">
                  All products
                </Link>
              </li>
              <li>
                <Link to="/shop?cat=kitchen" className="hover:text-leaf">
                  Kitchen
                </Link>
              </li>
              <li>
                <Link to="/shop?cat=cutting-boards" className="hover:text-leaf">
                  Boards
                </Link>
              </li>
              <li>
                <Link to="/shop?cat=desk" className="hover:text-leaf">
                  Workspace
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold mb-4">
              Brand
            </p>
            <ul className="space-y-2.5 text-sm text-paper/70">
              <li>
                <Link to="/why" className="hover:text-leaf">
                  Our story
                </Link>
              </li>
              <li>
                <Link to="/shop?cat=organization" className="hover:text-leaf">
                  Organization
                </Link>
              </li>
              <li>
                <Link to="/shop?cat=bath" className="hover:text-leaf">
                  Bath
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold mb-4">
              Affiliate disclosure
            </p>
            <p className="text-sm text-paper/60 leading-relaxed">
              iBamboo is a participant in the Amazon Services LLC Associates
              Program. We may earn from qualifying purchases at no extra cost to
              you. Prices and availability are set by Amazon and its sellers.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-[11px] text-paper/40 tracking-wide">
          © {new Date().getFullYear()} iBamboo · Bamboo living, elevated
        </div>
      </footer>
    </div>
  )
}
