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
]

export function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [status, setStatus] = useState('')
  const [flash, setFlash] = useState<Record<string, unknown> | null>(null)
  const [library, setLibrary] = useState<Record<string, unknown> | null>(null)
  const [conbal, setConbal] = useState<Record<string, unknown> | null>(null)
  const [busy, setBusy] = useState(false)

  const refreshSession = useCallback(async () => {
    try {
      const s = await api<{ authenticated: boolean }>('/api/admin/session')
      setAuthed(s.authenticated)
      if (s.authenticated) {
        const c = await api<{ config: AdminConfig }>('/api/admin/config')
        setConfig(c.config)
      }
    } catch {
      setAuthed(false)
    }
  }, [])

  useEffect(() => {
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

  useEffect(() => {
    if (!authed) return
    if (tab === 'flash' && !flash) void loadFlash()
    if (tab === 'library' && !library) void loadLibrary()
    if (tab === 'conbal' && !conbal) void loadConbal()
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
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 space-y-4"
        >
          <div className="flex items-center gap-2 text-bamboo">
            <Sparkles className="size-5" />
            <span className="font-display font-semibold text-lg">iBamboo Admin</span>
          </div>
          <p className="text-sm text-white/60">
            Proof-of-concept control plane — flash, library, Conbal, avatars, Editor
            in Chief.
          </p>
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
          {loginError ? (
            <p className="text-sm text-red-300">{loginError}</p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-bamboo text-charcoal font-semibold py-2.5 disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          <p className="text-[11px] text-white/40">
            Set secret <code className="text-white/60">ADMIN_PASSWORD</code> on the
            Worker. Not for public merch editing yet.
          </p>
          <Link to="/" className="block text-center text-sm text-bamboo">
            ← Back to storefront
          </Link>
        </form>
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
              <p className="text-sm text-white/65">{config.library.notes}</p>
              <p className="text-sm">
                Dashboard:{' '}
                <a
                  className="text-bamboo underline"
                  href={config.library.baseUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {config.library.baseUrl}
                </a>
              </p>
              {library ? (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3 text-sm">
                  <p>
                    Connected:{' '}
                    <strong className={library.ok ? 'text-bamboo' : 'text-red-300'}>
                      {library.ok ? 'Yes' : 'No'}
                    </strong>
                  </p>
                  {library.stats && typeof library.stats === 'object' ? (
                    <pre className="text-[11px] overflow-auto bg-black/30 p-3 rounded-lg">
                      {JSON.stringify(library.stats, null, 2)}
                    </pre>
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
                            <tr key={it.externalId} className="border-t border-white/10">
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
        </main>
      </div>
    </div>
  )
}
