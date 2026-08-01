/**
 * iBamboo Admin POC — /admin
 * Flash catalog · Library · Conbal · Avatars · Editor in Chief
 */
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Database,
  Flashlight,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  ScrollText,
  Save,
  Sparkles,
  Users,
} from 'lucide-react'

type Tab =
  | 'overview'
  | 'flash'
  | 'library'
  | 'conbal'
  | 'avatars'
  | 'editor'
  | 'audit'

type AuditEntry = {
  id: string
  at: string
  action: 'login' | 'login_denied' | 'logout' | 'config_save'
  actor: {
    email?: string
    name?: string
    provider?: 'google' | 'password'
  }
  detail: string
  meta?: Record<string, unknown>
  ip?: string
}

type TargetingCategory = {
  id: string
  label: string
  description: string
  keywords: string[]
  languageNotes: string
}

type AvatarRecord = {
  id: string
  vibeId: string
  name: string
  role: string
  ageBand: string
  hometown: string
  quote: string
  image: string
  alt: string
  enabled: boolean
}

type AdminConfig = {
  version: 1
  editorInChief: {
    systemPrompt: string
    demeanor: string
    audience: string
    languageRules: string
    guardrails: string
    categories: TargetingCategory[]
    updatedAt: string
  }
  avatars: AvatarRecord[]
  conbal: { origin: string; siteKey: string; notes: string }
  flash: {
    siteId: string
    catalogUrl: string
    adminUrl: string
    notes: string
  }
  library: { baseUrl: string; siteId: string; notes: string }
  featureFlags: {
    flashEnabled: boolean
    conbalEnabled: boolean
    quizCrmEnabled: boolean
  }
  updatedAt: string
}

async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  })
  const data = (await res.json()) as T & { error?: string }
  if (!res.ok) {
    throw new Error(data.error || `${res.status}`)
  }
  return data
}

const TABS: { id: Tab; label: string; icon: typeof Database }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'flash', label: 'Flash catalog', icon: Flashlight },
  { id: 'library', label: 'Product library', icon: Database },
  { id: 'conbal', label: 'Conbal', icon: MessageSquareQuote },
  { id: 'avatars', label: 'Avatars', icon: Users },
  { id: 'editor', label: 'Editor in Chief', icon: BookOpen },
  { id: 'audit', label: 'Activity log', icon: ScrollText },
]

function actionLabel(action: AuditEntry['action']): string {
  switch (action) {
    case 'login':
      return 'Login'
    case 'login_denied':
      return 'Login denied'
    case 'logout':
      return 'Logout'
    case 'config_save':
      return 'Config save'
    default:
      return action
  }
}

function actionClass(action: AuditEntry['action']): string {
  switch (action) {
    case 'login':
      return 'text-bamboo'
    case 'login_denied':
      return 'text-red-300'
    case 'logout':
      return 'text-white/60'
    case 'config_save':
      return 'text-sky-300'
    default:
      return 'text-white/70'
  }
}

type SessionUser = {
  provider: 'google' | 'password'
  email?: string
  name?: string
  picture?: string
}

export function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [user, setUser] = useState<SessionUser | null>(null)
  const [googleConfigured, setGoogleConfigured] = useState(false)
  const [passwordConfigured, setPasswordConfigured] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [status, setStatus] = useState('')
  const [flash, setFlash] = useState<Record<string, unknown> | null>(null)
  const [library, setLibrary] = useState<Record<string, unknown> | null>(null)
  const [conbal, setConbal] = useState<Record<string, unknown> | null>(null)
  const [audit, setAudit] = useState<{
    entries: AuditEntry[]
    cap?: number
    allowlistNote?: string
    allowedEmails?: string[]
  } | null>(null)
  const [busy, setBusy] = useState(false)

  const refreshSession = useCallback(async () => {
    try {
      const s = await api<{
        authenticated: boolean
        user?: SessionUser
        googleConfigured?: boolean
        passwordConfigured?: boolean
      }>('/api/admin/session')
      setGoogleConfigured(Boolean(s.googleConfigured))
      setPasswordConfigured(Boolean(s.passwordConfigured))
      setAuthed(s.authenticated)
      setUser(s.user ?? null)
      if (s.authenticated) {
        const c = await api<{ config: AdminConfig }>('/api/admin/config')
        setConfig(c.config)
      }
    } catch {
      setAuthed(false)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    // Surface OAuth callback errors from ?auth_error=
    const params = new URLSearchParams(window.location.search)
    const authErr = params.get('auth_error')
    if (authErr) {
      setLoginError(authErr)
      params.delete('auth_error')
      params.delete('auth')
      const qs = params.toString()
      window.history.replaceState(
        {},
        '',
        `/admin${qs ? `?${qs}` : ''}`,
      )
    } else if (params.get('auth') === 'ok') {
      params.delete('auth')
      const qs = params.toString()
      window.history.replaceState(
        {},
        '',
        `/admin${qs ? `?${qs}` : ''}`,
      )
    }
    void refreshSession()
  }, [refreshSession])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setBusy(true)
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      })
      setPassword('')
      await refreshSession()
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    await api('/api/admin/logout', { method: 'POST' })
    setAuthed(false)
    setUser(null)
    setConfig(null)
  }

  async function saveConfig() {
    if (!config) return
    setBusy(true)
    setStatus('Saving…')
    try {
      const res = await api<{ config: AdminConfig }>('/api/admin/config', {
        method: 'PUT',
        body: JSON.stringify(config),
      })
      setConfig(res.config)
      setStatus('Saved ' + new Date().toLocaleTimeString())
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function loadFlash() {
    setBusy(true)
    try {
      setFlash(await api('/api/admin/flash/status'))
    } catch (err) {
      setFlash({ ok: false, error: err instanceof Error ? err.message : 'fail' })
    } finally {
      setBusy(false)
    }
  }

  async function loadLibrary() {
    setBusy(true)
    try {
      setLibrary(await api('/api/admin/library/status'))
    } catch (err) {
      setLibrary({
        ok: false,
        error: err instanceof Error ? err.message : 'fail',
      })
    } finally {
      setBusy(false)
    }
  }

  async function loadConbal() {
    setBusy(true)
    try {
      setConbal(await api('/api/admin/conbal/status'))
    } catch (err) {
      setConbal({ ok: false, error: err instanceof Error ? err.message : 'fail' })
    } finally {
      setBusy(false)
    }
  }

  async function loadAudit() {
    setBusy(true)
    try {
      const res = await api<{
        entries: AuditEntry[]
        cap?: number
        allowlistNote?: string
        allowedEmails?: string[]
      }>('/api/admin/audit?limit=150')
      setAudit({
        entries: res.entries || [],
        cap: res.cap,
        allowlistNote: res.allowlistNote,
        allowedEmails: res.allowedEmails,
      })
    } catch (err) {
      setAudit({
        entries: [],
        allowlistNote:
          err instanceof Error ? err.message : 'Failed to load activity log',
      })
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!authed) return
    if (tab === 'flash' && !flash) void loadFlash()
    if (tab === 'library' && !library) void loadLibrary()
    if (tab === 'conbal' && !conbal) void loadConbal()
    if (tab === 'audit') void loadAudit()
  }, [tab, authed]) // eslint-disable-line react-hooks/exhaustive-deps

  if (authed === null) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-ink-soft">
        Checking session…
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-charcoal text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4">
          <div className="flex items-center gap-2 text-bamboo">
            <Sparkles className="size-5" />
            <span className="font-display font-semibold text-lg">iBamboo Admin</span>
          </div>
          <p className="text-sm text-white/60">
            Control plane — flash, library, Conbal, avatars, Editor in Chief.
            Sign in with an allowed Google account.
          </p>

          {loginError ? (
            <p className="text-sm text-red-300 rounded-lg bg-red-500/10 border border-red-400/20 px-3 py-2">
              {loginError}
            </p>
          ) : null}

          {googleConfigured ? (
            <a
              href="/api/admin/auth/google"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white text-charcoal font-semibold py-2.5 hover:bg-white/90 transition"
            >
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </a>
          ) : (
            <p className="text-xs text-amber-200/80 rounded-lg border border-amber-400/20 bg-amber-500/10 px-3 py-2">
              Google OAuth not configured yet. Set{' '}
              <code className="text-white/70">GOOGLE_CLIENT_ID</code>,{' '}
              <code className="text-white/70">GOOGLE_CLIENT_SECRET</code>, and{' '}
              <code className="text-white/70">ADMIN_ALLOWED_EMAILS</code> on the
              Worker.
            </p>
          )}

          {passwordConfigured ? (
            <div className="pt-2 border-t border-white/10 space-y-3">
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-xs text-white/45 hover:text-white/70 w-full text-center"
              >
                {showPassword ? 'Hide password login' : 'Use password instead'}
              </button>
              {showPassword ? (
                <form onSubmit={login} className="space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-white/50">
                    Password
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-white"
                      autoComplete="current-password"
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-full border border-bamboo/50 text-bamboo font-semibold py-2.5 disabled:opacity-50"
                  >
                    {busy ? 'Signing in…' : 'Sign in with password'}
                  </button>
                </form>
              ) : null}
            </div>
          ) : null}

          <p className="text-[11px] text-white/40">
            Only allowlisted Google accounts can access this panel.
          </p>
          <Link to="/" className="block text-center text-sm text-bamboo">
            ← Back to storefront
          </Link>
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        Loading config…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1412] text-[#e8efe9]">
      <header className="border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-bamboo" />
          <div>
            <p className="font-display font-semibold">iBamboo Admin</p>
            <p className="text-[11px] text-white/45">
              POC · updated {new Date(config.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/55 mr-1">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt=""
                  className="size-6 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : null}
              <span className="max-w-[12rem] truncate">
                {user.name || user.email || user.provider}
              </span>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void saveConfig()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full bg-bamboo text-charcoal text-sm font-semibold px-4 py-2 disabled:opacity-50"
          >
            <Save className="size-3.5" /> Save all
          </button>
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 text-sm px-3 py-2"
          >
            <LogOut className="size-3.5" /> Logout
          </button>
        </div>
      </header>
      {status ? (
        <p className="px-4 py-2 text-xs bg-bamboo/15 text-bamboo border-b border-bamboo/20">
          {status}
        </p>
      ) : null}

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        <nav className="lg:w-52 border-b lg:border-b-0 lg:border-r border-white/10 p-2 flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap text-left ${
                tab === t.id
                  ? 'bg-bamboo/20 text-bamboo'
                  : 'text-white/70 hover:bg-white/5'
              }`}
            >
              <t.icon className="size-4 shrink-0" />
              {t.label}
            </button>
          ))}
        </nav>

        <main className="flex-1 p-4 sm:p-6 max-w-4xl">
          {tab === 'overview' && (
            <section className="space-y-4">
              <h1 className="font-display text-2xl font-semibold">Overview</h1>
              <p className="text-sm text-white/65 leading-relaxed">
                This is the iBamboo-native admin POC. It does not replace the public
                storefront. Flash full editing still lives in Flash Catalog (GitHub
                OAuth); this panel reviews live state and owns house voice, avatars,
                and Conbal connection settings.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {(
                  [
                    ['Flash', config.featureFlags.flashEnabled ? 'On' : 'Off'],
                    ['Conbal', config.featureFlags.conbalEnabled ? 'On' : 'Off'],
                    ['Quiz CRM', config.featureFlags.quizCrmEnabled ? 'On' : 'Off'],
                    ['Library site id', config.library.siteId],
                  ] as const
                ).map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-[11px] uppercase tracking-wider text-white/45">
                      {k}
                    </p>
                    <p className="font-semibold mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.featureFlags.flashEnabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      featureFlags: {
                        ...config.featureFlags,
                        flashEnabled: e.target.checked,
                      },
                    })
                  }
                />
                Flash shelf enabled (flag — storefront still needs wiring to honor it)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.featureFlags.conbalEnabled}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      featureFlags: {
                        ...config.featureFlags,
                        conbalEnabled: e.target.checked,
                      },
                    })
                  }
                />
                Conbal balloons enabled (flag)
              </label>
            </section>
          )}

          {tab === 'flash' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-display text-2xl font-semibold">Flash catalog</h1>
                <button
                  type="button"
                  onClick={() => void loadFlash()}
                  className="text-sm rounded-full border border-white/20 px-3 py-1.5"
                >
                  Refresh status
                </button>
              </div>
              <p className="text-sm text-white/65">{config.flash.notes}</p>
              <p className="text-sm">
                Full manage UI:{' '}
                <a
                  className="text-bamboo underline"
                  href={config.flash.adminUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {config.flash.adminUrl}
                </a>{' '}
                (GitHub OAuth · ParsimonyGit / SteveSimonson)
              </p>
              {flash ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
                  <p>
                    Status:{' '}
                    <strong className={flash.ok ? 'text-bamboo' : 'text-red-300'}>
                      {flash.ok ? 'OK' : 'Error'}
                    </strong>
                  </p>
                  <p>Products: {String(flash.productCount ?? '—')}</p>
                  <p>Week of: {String(flash.weekOf || '—')}</p>
                  <p>Generated: {String(flash.generatedAt || '—')}</p>
                  {Array.isArray(flash.sample) && flash.sample.length > 0 ? (
                    <ul className="mt-3 space-y-1 max-h-64 overflow-auto text-xs">
                      {(flash.sample as { asin?: string; title?: string; siteCategory?: string }[]).map(
                        (p, i) => (
                          <li key={i} className="border-t border-white/10 pt-1">
                            <span className="text-white/40">{p.asin}</span> ·{' '}
                            {p.title?.slice(0, 80)}
                            {p.siteCategory ? (
                              <span className="text-bamboo/80"> · {p.siteCategory}</span>
                            ) : null}
                          </li>
                        ),
                      )}
                    </ul>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-white/50">Loading flash status…</p>
              )}
              <label className="block text-xs text-white/50">
                Catalog URL
                <input
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white"
                  value={config.flash.catalogUrl}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      flash: { ...config.flash, catalogUrl: e.target.value },
                    })
                  }
                />
              </label>
            </section>
          )}

          {tab === 'library' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-display text-2xl font-semibold">
                  Product library
                </h1>
                <button
                  type="button"
                  onClick={() => void loadLibrary()}
                  className="text-sm rounded-full border border-white/20 px-3 py-1.5"
                >
                  Refresh
                </button>
              </div>
              <p className="text-sm text-white/65">
                This storefront only — site{' '}
                <code className="text-bamboo">ibamboo</code>. Other network
                sites are not shown here.
              </p>
              <p className="text-sm text-white/50">{config.library.notes}</p>
              {library ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
                  <p>
                    Connected:{' '}
                    <strong className={library.ok ? 'text-bamboo' : 'text-red-300'}>
                      {library.ok ? 'Yes' : 'No'}
                    </strong>
                    {' · '}
                    Site{' '}
                    <code className="text-bamboo">
                      {String(library.siteId || 'ibamboo')}
                    </code>
                  </p>
                  {library.stats && typeof library.stats === 'object' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-black/30 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wider text-white/45">
                          Linked ASINs
                        </p>
                        <p className="font-semibold text-lg">
                          {String(
                            (library.stats as { itemCount?: number }).itemCount ??
                              '—',
                          )}
                        </p>
                      </div>
                      <div className="rounded-lg bg-black/30 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wider text-white/45">
                          Showing
                        </p>
                        <p className="font-semibold text-lg">
                          {String(
                            (library.stats as { listed?: number }).listed ??
                              '—',
                          )}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  <p className="text-xs text-white/50">
                    {String(library.syncHint || '')}
                  </p>
                  {library.items &&
                  typeof library.items === 'object' &&
                  Array.isArray(
                    (library.items as { items?: unknown[] }).items,
                  ) ? (
                    <div className="max-h-80 overflow-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="text-white/45">
                          <tr>
                            <th className="py-1">ASIN</th>
                            <th>Title</th>
                            <th>Imgs</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            library.items as {
                              items: {
                                externalId: string
                                title?: string
                                images?: string[]
                              }[]
                            }
                          ).items.map((it) => (
                            <tr
                              key={it.externalId}
                              className="border-t border-white/10"
                            >
                              <td className="py-1.5 font-mono text-white/50">
                                {it.externalId}
                              </td>
                              <td>{(it.title || '—').slice(0, 48)}</td>
                              <td>{it.images?.length ?? 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-white/50">Loading library…</p>
              )}
            </section>
          )}

          {tab === 'conbal' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-display text-2xl font-semibold">Conbal</h1>
                <button
                  type="button"
                  onClick={() => void loadConbal()}
                  className="text-sm rounded-full border border-white/20 px-3 py-1.5"
                >
                  Probe
                </button>
              </div>
              <p className="text-sm text-white/65">{config.conbal.notes}</p>
              <label className="block text-xs text-white/50">
                Origin
                <input
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                  value={config.conbal.origin}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      conbal: { ...config.conbal, origin: e.target.value },
                    })
                  }
                />
              </label>
              <label className="block text-xs text-white/50">
                Site key (public embed id)
                <input
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm font-mono"
                  value={config.conbal.siteKey}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      conbal: { ...config.conbal, siteKey: e.target.value },
                    })
                  }
                />
              </label>
              {conbal ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm space-y-2">
                  <p>
                    Health:{' '}
                    <strong
                      className={conbal.healthOk ? 'text-bamboo' : 'text-amber-300'}
                    >
                      {conbal.healthOk ? 'reachable' : 'check failed / no health'}
                    </strong>
                  </p>
                  <p className="text-xs text-white/50">
                    {String(conbal.adminHint || '')}
                  </p>
                  <pre className="text-[11px] overflow-auto bg-black/30 p-3 rounded-lg">
                    {JSON.stringify(conbal.health, null, 2)}
                  </pre>
                </div>
              ) : null}
            </section>
          )}

          {tab === 'avatars' && (
            <section className="space-y-4">
              <h1 className="font-display text-2xl font-semibold">Avatars</h1>
              <p className="text-sm text-white/65">
                House personas used on vibe/quiz surfaces. POC stores edits in admin
                KV; storefront still ships from <code className="text-bamboo">vibes.ts</code>{' '}
                until we wire runtime read.
              </p>
              <div className="space-y-4">
                {config.avatars.map((av, idx) => (
                  <div
                    key={av.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 grid sm:grid-cols-[100px_1fr] gap-4"
                  >
                    <img
                      src={av.image}
                      alt={av.alt}
                      className="size-24 rounded-xl object-cover bg-black/40"
                      referrerPolicy="no-referrer"
                    />
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <label className="text-xs text-white/45">
                        Name
                        <input
                          className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5"
                          value={av.name}
                          onChange={(e) => {
                            const avatars = [...config.avatars]
                            avatars[idx] = { ...av, name: e.target.value }
                            setConfig({ ...config, avatars })
                          }}
                        />
                      </label>
                      <label className="text-xs text-white/45">
                        Role
                        <input
                          className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5"
                          value={av.role}
                          onChange={(e) => {
                            const avatars = [...config.avatars]
                            avatars[idx] = { ...av, role: e.target.value }
                            setConfig({ ...config, avatars })
                          }}
                        />
                      </label>
                      <label className="text-xs text-white/45 sm:col-span-2">
                        Quote
                        <textarea
                          className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5 min-h-[60px]"
                          value={av.quote}
                          onChange={(e) => {
                            const avatars = [...config.avatars]
                            avatars[idx] = { ...av, quote: e.target.value }
                            setConfig({ ...config, avatars })
                          }}
                        />
                      </label>
                      <label className="text-xs text-white/45 sm:col-span-2">
                        Image path
                        <input
                          className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5 font-mono text-[11px]"
                          value={av.image}
                          onChange={(e) => {
                            const avatars = [...config.avatars]
                            avatars[idx] = { ...av, image: e.target.value }
                            setConfig({ ...config, avatars })
                          }}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={av.enabled}
                          onChange={(e) => {
                            const avatars = [...config.avatars]
                            avatars[idx] = { ...av, enabled: e.target.checked }
                            setConfig({ ...config, avatars })
                          }}
                        />
                        Enabled
                      </label>
                      <button
                        type="button"
                        className="text-xs text-red-300/80 hover:text-red-300 justify-self-start"
                        onClick={() => {
                          if (!confirm(`Remove avatar “${av.name}”?`)) return
                          setConfig({
                            ...config,
                            avatars: config.avatars.filter((_, i) => i !== idx),
                          })
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="text-sm rounded-full border border-bamboo/40 text-bamboo px-3 py-1.5"
                onClick={() => {
                  const id = `avatar-${Date.now()}`
                  setConfig({
                    ...config,
                    avatars: [
                      ...config.avatars,
                      {
                        id,
                        vibeId: id,
                        name: 'New persona',
                        role: 'Role · room',
                        ageBand: '',
                        hometown: '',
                        quote: '',
                        image: '/brand/vibes/craft-avatar.webp',
                        alt: '',
                        enabled: true,
                      },
                    ],
                  })
                }}
              >
                + Add avatar
              </button>
            </section>
          )}

          {tab === 'editor' && (
            <section className="space-y-4">
              <h1 className="font-display text-2xl font-semibold">
                Editor in Chief
              </h1>
              <p className="text-sm text-white/65">
                Master prompt + targeting categories for agents, enrichment voice,
                and overall site demeanor. Saved to admin KV for the house.
              </p>
              <label className="block text-xs text-white/50">
                System prompt
                <textarea
                  className="mt-1 w-full min-h-[120px] rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                  value={config.editorInChief.systemPrompt}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      editorInChief: {
                        ...config.editorInChief,
                        systemPrompt: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="block text-xs text-white/50">
                Site demeanor
                <textarea
                  className="mt-1 w-full min-h-[72px] rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                  value={config.editorInChief.demeanor}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      editorInChief: {
                        ...config.editorInChief,
                        demeanor: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="block text-xs text-white/50">
                Audience
                <textarea
                  className="mt-1 w-full min-h-[60px] rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                  value={config.editorInChief.audience}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      editorInChief: {
                        ...config.editorInChief,
                        audience: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="block text-xs text-white/50">
                Language rules
                <textarea
                  className="mt-1 w-full min-h-[60px] rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                  value={config.editorInChief.languageRules}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      editorInChief: {
                        ...config.editorInChief,
                        languageRules: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label className="block text-xs text-white/50">
                Guardrails
                <textarea
                  className="mt-1 w-full min-h-[60px] rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm"
                  value={config.editorInChief.guardrails}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      editorInChief: {
                        ...config.editorInChief,
                        guardrails: e.target.value,
                      },
                    })
                  }
                />
              </label>

              <h2 className="font-semibold pt-2">Targeting categories</h2>
              <div className="space-y-3">
                {config.editorInChief.categories.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2 text-sm"
                  >
                    <div className="grid sm:grid-cols-2 gap-2">
                      <label className="text-xs text-white/45">
                        Label
                        <input
                          className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5"
                          value={cat.label}
                          onChange={(e) => {
                            const categories = [
                              ...config.editorInChief.categories,
                            ]
                            categories[idx] = {
                              ...cat,
                              label: e.target.value,
                            }
                            setConfig({
                              ...config,
                              editorInChief: {
                                ...config.editorInChief,
                                categories,
                              },
                            })
                          }}
                        />
                      </label>
                      <label className="text-xs text-white/45">
                        Id
                        <input
                          className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5 font-mono text-[11px]"
                          value={cat.id}
                          onChange={(e) => {
                            const categories = [
                              ...config.editorInChief.categories,
                            ]
                            categories[idx] = { ...cat, id: e.target.value }
                            setConfig({
                              ...config,
                              editorInChief: {
                                ...config.editorInChief,
                                categories,
                              },
                            })
                          }}
                        />
                      </label>
                    </div>
                    <label className="block text-xs text-white/45">
                      Description
                      <input
                        className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5"
                        value={cat.description}
                        onChange={(e) => {
                          const categories = [...config.editorInChief.categories]
                          categories[idx] = {
                            ...cat,
                            description: e.target.value,
                          }
                          setConfig({
                            ...config,
                            editorInChief: {
                              ...config.editorInChief,
                              categories,
                            },
                          })
                        }}
                      />
                    </label>
                    <label className="block text-xs text-white/45">
                      Keywords (comma-separated)
                      <input
                        className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5"
                        value={cat.keywords.join(', ')}
                        onChange={(e) => {
                          const categories = [...config.editorInChief.categories]
                          categories[idx] = {
                            ...cat,
                            keywords: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }
                          setConfig({
                            ...config,
                            editorInChief: {
                              ...config.editorInChief,
                              categories,
                            },
                          })
                        }}
                      />
                    </label>
                    <label className="block text-xs text-white/45">
                      Language notes
                      <textarea
                        className="mt-0.5 w-full rounded border border-white/15 bg-black/30 px-2 py-1.5 min-h-[48px]"
                        value={cat.languageNotes}
                        onChange={(e) => {
                          const categories = [...config.editorInChief.categories]
                          categories[idx] = {
                            ...cat,
                            languageNotes: e.target.value,
                          }
                          setConfig({
                            ...config,
                            editorInChief: {
                              ...config.editorInChief,
                              categories,
                            },
                          })
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      className="text-xs text-red-300/80 hover:text-red-300"
                      onClick={() => {
                        if (!confirm(`Remove category “${cat.label}”?`)) return
                        setConfig({
                          ...config,
                          editorInChief: {
                            ...config.editorInChief,
                            categories: config.editorInChief.categories.filter(
                              (_, i) => i !== idx,
                            ),
                          },
                        })
                      }}
                    >
                      Remove category
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="text-sm rounded-full border border-bamboo/40 text-bamboo px-3 py-1.5"
                onClick={() => {
                  const categories = [
                    ...config.editorInChief.categories,
                    {
                      id: `cat-${Date.now()}`,
                      label: 'New category',
                      description: '',
                      keywords: [],
                      languageNotes: '',
                    },
                  ]
                  setConfig({
                    ...config,
                    editorInChief: { ...config.editorInChief, categories },
                  })
                }}
              >
                + Add category
              </button>
            </section>
          )}

          {tab === 'audit' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="font-display text-2xl font-semibold">
                  Activity log
                </h1>
                <button
                  type="button"
                  onClick={() => void loadAudit()}
                  className="text-sm rounded-full border border-white/20 px-3 py-1.5"
                >
                  Refresh
                </button>
              </div>
              <p className="text-sm text-white/65">
                Logins, denied attempts, logouts, and config saves. Stored in
                admin KV (last {audit?.cap ?? 500} events).
              </p>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
                <p className="text-xs uppercase tracking-wider text-white/45">
                  Who can sign in with Google?
                </p>
                <p className="text-white/70 text-sm leading-relaxed">
                  {audit?.allowlistNote ||
                    'Emails listed in Worker secret ADMIN_ALLOWED_EMAILS.'}
                </p>
                {audit?.allowedEmails && audit.allowedEmails.length > 0 ? (
                  <ul className="text-xs font-mono text-bamboo space-y-0.5">
                    {audit.allowedEmails.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-amber-200/80">
                    No allowlisted emails configured.
                  </p>
                )}
              </div>

              {audit ? (
                audit.entries.length === 0 ? (
                  <p className="text-sm text-white/50">
                    No events yet — log in or save config to start the log.
                  </p>
                ) : (
                  <div className="rounded-xl border border-white/10 overflow-hidden">
                    <div className="max-h-[28rem] overflow-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-[#0f1412] text-white/45 border-b border-white/10">
                          <tr>
                            <th className="py-2 px-3 font-medium">When</th>
                            <th className="py-2 px-3 font-medium">Action</th>
                            <th className="py-2 px-3 font-medium">User</th>
                            <th className="py-2 px-3 font-medium">Detail</th>
                            <th className="py-2 px-3 font-medium">IP</th>
                          </tr>
                        </thead>
                        <tbody>
                          {audit.entries.map((row) => (
                            <tr
                              key={row.id}
                              className="border-t border-white/10 align-top"
                            >
                              <td className="py-2 px-3 whitespace-nowrap text-white/50">
                                {new Date(row.at).toLocaleString()}
                              </td>
                              <td
                                className={`py-2 px-3 font-medium whitespace-nowrap ${actionClass(row.action)}`}
                              >
                                {actionLabel(row.action)}
                              </td>
                              <td className="py-2 px-3">
                                <div className="text-white/85">
                                  {row.actor.name || row.actor.email || '—'}
                                </div>
                                {row.actor.email && row.actor.name ? (
                                  <div className="text-white/40 font-mono">
                                    {row.actor.email}
                                  </div>
                                ) : null}
                                {row.actor.provider ? (
                                  <div className="text-white/35">
                                    via {row.actor.provider}
                                  </div>
                                ) : null}
                              </td>
                              <td className="py-2 px-3 text-white/70">
                                {row.detail}
                              </td>
                              <td className="py-2 px-3 font-mono text-white/40">
                                {row.ip || '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <p className="text-sm text-white/50">Loading activity log…</p>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
