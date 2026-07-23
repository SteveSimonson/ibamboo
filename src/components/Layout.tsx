import { Link, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'
import { formatExpiry, limitedTimeCopy } from '../data/catalog'
import { VIBE_LIST, vibePath } from '../data/vibes'
import type { Category } from '../data/types'

type NavItem =
  | { kind: 'link'; to: string; label: string }
  | { kind: 'shop'; mode: 'all' | 'limited' | 'cat'; cat?: Category; label: string }

/** Short labels that map 1:1 to room categories (same grammar as Shop pills). */
const nav: NavItem[] = [
  { kind: 'shop', mode: 'limited', label: 'This week' },
  { kind: 'shop', mode: 'all', label: 'Shop' },
  { kind: 'link', to: '/quiz', label: 'Vibe check' },
  { kind: 'shop', mode: 'cat', cat: 'kitchen', label: 'Kitchen' },
  { kind: 'shop', mode: 'cat', cat: 'cutting-boards', label: 'Boards' },
  { kind: 'shop', mode: 'cat', cat: 'dining', label: 'Table' },
  { kind: 'shop', mode: 'cat', cat: 'bath', label: 'Bath' },
  { kind: 'shop', mode: 'cat', cat: 'desk', label: 'Desk' },
  { kind: 'link', to: '/why', label: 'Our story' },
]

function shopHref(item: Extract<NavItem, { kind: 'shop' }>) {
  if (item.mode === 'limited') return '/shop?limited=1'
  if (item.mode === 'cat' && item.cat) return `/shop?cat=${item.cat}`
  return '/shop'
}

function useShopNavActive() {
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const cat = params.get('cat') || ''
  const limited = params.get('limited') === '1'
  const onShop = pathname === '/shop' || pathname.startsWith('/shop/')

  return (item: NavItem): boolean => {
    if (item.kind === 'link') {
      if (item.to === '/quiz') return pathname.startsWith('/quiz')
      if (item.to === '/why') return pathname.startsWith('/why')
      return pathname === item.to
    }
    if (!onShop) return false
    // Category owns the room even if limited is also on
    if (item.mode === 'cat') return cat === item.cat
    if (item.mode === 'limited') return limited && !cat
    // Shop = bare catalog browse
    if (item.mode === 'all') return !cat && !limited
    return false
  }
}

function navClass(active: boolean) {
  return `px-3.5 py-2 rounded-full text-[13px] font-semibold transition whitespace-nowrap ${
    active
      ? 'bg-ink text-paper'
      : 'text-ink-soft hover:bg-paper-2 hover:text-ink'
  }`
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const limited = limitedTimeCopy()
  const until = formatExpiry(limited.expiresAt ?? undefined)
  const isActive = useShopNavActive()

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-moss text-paper text-center text-[11px] sm:text-xs py-2.5 px-4 font-medium tracking-wide">
        <Link
          to="/shop?limited=1"
          className="hover:underline underline-offset-2"
        >
          <span className="font-semibold text-gold">Limited-time options</span>
          {limited.count > 0 ? ` · ${limited.count} this week` : ''}
          {until ? ` · Refresh ${until}` : ''}
          <span className="text-paper/70">
            {' '}
            · Shop on iBamboo · Buy on Amazon
          </span>
        </Link>
      </div>

      <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-xl border-b border-line/70 shadow-[0_1px_0_rgba(18,26,18,0.03)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 sm:h-[4.75rem] flex items-center justify-between gap-4">
          <Link
            to="/"
            className="group flex items-center shrink-0 py-1"
            aria-label="iBamboo home"
          >
            <img
              src="/brand/logo-wordmark.png"
              alt="iBamboo"
              className="h-9 sm:h-11 w-auto max-w-[min(52vw,15rem)] object-contain object-left transition duration-200 group-hover:opacity-85"
              width={395}
              height={114}
              decoding="async"
            />
          </Link>

          <nav
            className="hidden lg:flex items-center gap-0.5 flex-1 justify-center"
            aria-label="Primary"
          >
            {nav.map((item) => {
              const active = isActive(item)
              if (item.kind === 'link') {
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={() => navClass(active)}
                  >
                    {item.label}
                  </NavLink>
                )
              }
              const to = shopHref(item)
              return (
                <Link
                  key={to + item.label}
                  to={to}
                  className={navClass(active)}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft hover:text-bamboo px-2"
            >
              <Search className="size-4" />
              Search
            </Link>
            <Link
              to="/shop?limited=1"
              className="hidden sm:inline-flex btn-primary !py-2.5 !px-5 text-xs"
            >
              Shop this week
            </Link>
            <button
              type="button"
              className="lg:hidden p-2.5 rounded-xl border border-line bg-card"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-line bg-paper/98 px-4 py-3 space-y-1 shadow-lg">
            {nav.map((item) => {
              const active = isActive(item)
              const to = item.kind === 'link' ? item.to : shopHref(item)
              return (
                <Link
                  key={to + item.label}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`block px-3 py-3 rounded-xl text-sm font-semibold transition ${
                    active ? 'bg-ink text-paper' : 'hover:bg-paper-2'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
            <Link
              to="/shop?limited=1"
              onClick={() => setOpen(false)}
              className="btn-primary w-full !py-3 mt-2 text-sm"
            >
              Shop this week
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-auto bg-charcoal text-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-5">
            <Link to="/" className="inline-block">
              <img
                src="/brand/logo-wordmark-white.png"
                alt="iBamboo"
                className="h-10 sm:h-11 w-auto object-contain object-left opacity-95"
                width={395}
                height={114}
                decoding="async"
              />
            </Link>
            <p className="text-sm text-paper/65 leading-relaxed max-w-sm font-light">
              A destination for bamboo living—kitchen, table, bath, workspace,
              and home. Discover the collection here; complete your purchase on
              Amazon.
            </p>
            <p className="text-xs text-paper/45 leading-relaxed max-w-sm">
              Amazon Associates participant. We may earn from qualifying
              purchases at no extra cost to you.
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
                <Link to="/quiz" className="hover:text-leaf">
                  Vibe check
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold mb-4">
              Vibes
            </p>
            <ul className="space-y-2.5 text-sm text-paper/70">
              <li>
                <Link to="/quiz" className="hover:text-leaf font-semibold text-paper/85">
                  Find yours
                </Link>
              </li>
              {VIBE_LIST.map((v) => (
                <li key={v.id}>
                  <Link to={vibePath(v.id)} className="hover:text-leaf">
                    {v.emoji} {v.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-[11px] text-paper/40 tracking-wide">
          © {new Date().getFullYear()} iBamboo · Bamboo living, elevated
        </div>
      </footer>
    </div>
  )
}
