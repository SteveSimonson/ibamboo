/**
 * iBamboo Admin API — POC control plane at /api/admin/*
 * Auth: Google OAuth (email allowlist) + optional password fallback.
 * State: KV ADMIN_KV key "config".
 */

export type AdminEnv = {
  ADMIN_KV?: KVNamespace
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  /** Google OAuth Web client id */
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  /** Comma-separated emails allowed after Google sign-in */
  ADMIN_ALLOWED_EMAILS?: string
  FLASH_CATALOG_URL?: string
  LIBRARY_URL?: string
  LIBRARY_TOKEN?: string
}

export type AdminSessionUser = {
  provider: 'google' | 'password'
  email?: string
  name?: string
  picture?: string
}

type SessionPayload = AdminSessionUser & {
  exp: number
  v: 1
}

export type TargetingCategory = {
  id: string
  label: string
  description: string
  keywords: string[]
  languageNotes: string
}

export type AvatarRecord = {
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

export type EditorInChief = {
  /** Master system prompt for agents / content generation */
  systemPrompt: string
  /** Overall site demeanor in plain language */
  demeanor: string
  /** Audience targeting notes */
  audience: string
  /** Language / tone rules */
  languageRules: string
  /** Do-not-say / brand guardrails */
  guardrails: string
  categories: TargetingCategory[]
  updatedAt: string
}

export type ConbalConfig = {
  origin: string
  siteKey: string
  notes: string
}

export type AdminConfig = {
  version: 1
  editorInChief: EditorInChief
  avatars: AvatarRecord[]
  conbal: ConbalConfig
  flash: {
    siteId: string
    catalogUrl: string
    adminUrl: string
    notes: string
  }
  library: {
    baseUrl: string
    siteId: string
    notes: string
  }
  featureFlags: {
    flashEnabled: boolean
    conbalEnabled: boolean
    quizCrmEnabled: boolean
  }
  updatedAt: string
}

const COOKIE = 'ibamboo_admin_session'
const OAUTH_STATE_COOKIE = 'ibamboo_admin_oauth_state'
const CONFIG_KEY = 'config'
const SESSION_MAX_AGE_SEC = 12 * 60 * 60
const GOOGLE_AUTH = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO = 'https://openidconnect.googleapis.com/v1/userinfo'

function defaultConfig(): AdminConfig {
  const now = new Date().toISOString()
  return {
    version: 1,
    editorInChief: {
      systemPrompt:
        'You write for iBamboo: calm natural living, bamboo home goods, material truth over gadget hype. Discover on iBamboo; buy on Amazon. Never invent inventory, medical claims, or cure language. Prefer short house names and honest care tips.',
      demeanor:
        'Warm, grounded, unhurried — like a well-kept kitchen and a quiet porch. Helpful without salesy urgency. Trust compounds; no bro-speak, no spa-clinic hype.',
      audience:
        'Home cooks, hosts, nest-builders, bath ritualists, desk organizers, patio people — adults who choose natural materials for daily rooms.',
      languageRules:
        'Prefer concrete material language (grain, density, care, knife-kind). Avoid “miracle”, “toxin-free” absolutism, and keyword stuffing. Prices are hints; Amazon is source of truth.',
      guardrails:
        'No Associate-tag chrome on page. Footer disclosure only. No medical/safety guarantees. Original prose only — never paste Amazon copy.',
      categories: [
        {
          id: 'kitchen',
          label: 'Kitchen & prep',
          description: 'Boards, utensils, meal-prep flow',
          keywords: ['cutting board', 'bamboo utensils', 'prep'],
          languageNotes: 'Chef-practical, heat-of-the-moment, not gadget theater',
        },
        {
          id: 'bath',
          label: 'Bath & ritual',
          description: 'Trays, soft fiber, spa-calm surfaces',
          keywords: ['bath tray', 'bamboo bath', 'spa'],
          languageNotes: 'Steam sanctuary energy; quiet luxury, not clinical',
        },
        {
          id: 'organization',
          label: 'Order & nest',
          description: 'Storage, drawers, calm clutter control',
          keywords: ['organizer', 'storage', 'drawer'],
          languageNotes: 'Soft structure; joy without plastic pile-up',
        },
        {
          id: 'outdoor',
          label: 'Patio & outdoor',
          description: 'Deck, serving, open-air hosting',
          keywords: ['patio', 'outdoor', 'serving'],
          languageNotes: 'Sunset mode, share-friendly, weather-honest',
        },
      ],
      updatedAt: now,
    },
    avatars: [
      {
        id: 'craft',
        vibeId: 'craft',
        name: 'Maya',
        role: 'Home cook · Weeknight lead',
        ageBand: 'Mid-30s',
        hometown: 'Portland kitchen island',
        quote:
          "If it doesn't earn a spot next to the stove, it doesn't come home with me.",
        image: '/brand/vibes/craft-avatar.webp',
        alt: 'Maya at her kitchen island with a bamboo cutting board',
        enabled: true,
      },
      {
        id: 'ritual',
        vibeId: 'ritual',
        name: 'Elena',
        role: 'Bath ritual · Soft fiber',
        ageBand: '30s–40s',
        hometown: 'Quiet tiled bath',
        quote: 'Reset is a material choice.',
        image: '/brand/vibes/ritual-avatar.webp',
        alt: 'Elena in a calm bath setting with bamboo accents',
        enabled: true,
      },
      {
        id: 'focus',
        vibeId: 'focus',
        name: 'Jordan',
        role: 'Desk · Signal quiet',
        ageBand: 'Late 20s–30s',
        hometown: 'Minimal work nook',
        quote: 'Clear surface, clear head.',
        image: '/brand/vibes/focus-avatar.webp',
        alt: 'Jordan at a tidy desk with bamboo organizers',
        enabled: true,
      },
      {
        id: 'host',
        vibeId: 'host',
        name: 'Sofia',
        role: 'Host · Board presence',
        ageBand: '30s–40s',
        hometown: 'Open dining table',
        quote: 'The table sets the tone before anyone sits.',
        image: '/brand/vibes/host-avatar.webp',
        alt: 'Sofia hosting with bamboo serving pieces',
        enabled: true,
      },
      {
        id: 'patio',
        vibeId: 'patio',
        name: 'Marcus',
        role: 'Patio · Fresh air',
        ageBand: '30s–50s',
        hometown: 'Back deck at golden hour',
        quote: 'Outside is still a room — outfit it that way.',
        image: '/brand/vibes/patio-avatar.webp',
        alt: 'Marcus on a patio with bamboo outdoor pieces',
        enabled: true,
      },
      {
        id: 'nest',
        vibeId: 'nest',
        name: 'Priya',
        role: 'Nest · Soft edge',
        ageBand: '20s–40s',
        hometown: 'Cozy living corner',
        quote: 'Home should hold you without clutter holding you back.',
        image: '/brand/vibes/nest-avatar.webp',
        alt: 'Priya in a nested living space with bamboo storage',
        enabled: true,
      },
    ],
    conbal: {
      origin: 'https://conbal.us',
      siteKey: 'NYcKxGAVDdeF',
      notes:
        'Content balloons (did-you-know, care tips) load from Conbal for route anchors. Site key is public embed id, not a secret.',
    },
    flash: {
      siteId: 'ibamboo',
      catalogUrl:
        'https://amazon-flash-catalog.tech-bf6.workers.dev/api/catalog/ibamboo',
      adminUrl: 'https://amazon-flash-catalog.tech-bf6.workers.dev/admin',
      notes:
        'Limited-time bamboo flash shelf. Full category/filter editing lives in Flash Catalog admin (GitHub OAuth).',
    },
    library: {
      baseUrl: 'https://kyasi.us',
      siteId: 'ibamboo',
      notes:
        'Federated ASIN library for this storefront only (site ibamboo). Site catalog remains shelf source of truth; library:sync writes house metadata + images to kyasi.us.',
    },
    featureFlags: {
      flashEnabled: true,
      conbalEnabled: true,
      quizCrmEnabled: true,
    },
    updatedAt: now,
  }
}

function json(data: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extra,
    },
  })
}

function b64urlEncode(bytes: Uint8Array | ArrayBuffer): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let s = ''
  for (const b of u8) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function hmacSign(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(payload),
  )
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function sessionSecret(env: AdminEnv): string | null {
  return env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || null
}

function cookieFlags(secure: boolean, maxAge: number): string {
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
}

async function signSession(
  env: AdminEnv,
  user: AdminSessionUser,
): Promise<string> {
  const secret = sessionSecret(env)
  if (!secret) {
    throw new Error(
      'Session signing requires ADMIN_SESSION_SECRET or ADMIN_PASSWORD',
    )
  }
  const payload: SessionPayload = {
    v: 1,
    exp: Date.now() + SESSION_MAX_AGE_SEC * 1000,
    provider: user.provider,
    email: user.email,
    name: user.name,
    picture: user.picture,
  }
  const body = b64urlEncode(new TextEncoder().encode(JSON.stringify(payload)))
  const sig = await hmacSign(secret, body)
  return `${body}.${sig}`
}

async function sessionCookie(
  env: AdminEnv,
  secure: boolean,
  user: AdminSessionUser,
): Promise<string> {
  const value = await signSession(env, user)
  return `${COOKIE}=${value}; ${cookieFlags(secure, SESSION_MAX_AGE_SEC)}`
}

function clearSessionCookie(secure: boolean): string {
  return `${COOKIE}=; ${cookieFlags(secure, 0)}`
}

function oauthStateCookie(state: string, secure: boolean): string {
  return `${OAUTH_STATE_COOKIE}=${state}; ${cookieFlags(secure, 600)}`
}

function clearOauthStateCookie(secure: boolean): string {
  return `${OAUTH_STATE_COOKIE}=; ${cookieFlags(secure, 0)}`
}

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get('Cookie') || ''
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : null
}

async function readSession(
  request: Request,
  env: AdminEnv,
): Promise<SessionPayload | null> {
  const secret = sessionSecret(env)
  if (!secret) return null
  const raw = readCookie(request, COOKIE)
  if (!raw) return null
  const [body, sig] = raw.split('.')
  if (!body || !sig) return null
  const expected = await hmacSign(secret, body)
  if (expected !== sig) return null

  // Legacy password sessions: admin:<exp>.sig
  if (body.startsWith('admin:')) {
    const exp = Number(body.split(':')[1] || 0)
    if (exp > Date.now()) {
      return { v: 1, exp, provider: 'password' }
    }
    return null
  }

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(body)),
    ) as SessionPayload
    if (payload.v !== 1 || !payload.exp || payload.exp < Date.now()) return null
    if (payload.provider !== 'google' && payload.provider !== 'password') {
      return null
    }
    return payload
  } catch {
    return null
  }
}

async function isAuthed(request: Request, env: AdminEnv): Promise<boolean> {
  return Boolean(await readSession(request, env))
}

function parseAllowedEmails(csv: string | undefined): string[] {
  return (csv || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

function isEmailAllowed(email: string, env: AdminEnv): boolean {
  const list = parseAllowedEmails(env.ADMIN_ALLOWED_EMAILS)
  if (!list.length) return false
  return list.includes(email.trim().toLowerCase())
}

function googleConfigured(env: AdminEnv): boolean {
  // Need a real session secret so cookies can be verified (no 'dev' fallback).
  return Boolean(
    env.GOOGLE_CLIENT_ID &&
      env.GOOGLE_CLIENT_SECRET &&
      parseAllowedEmails(env.ADMIN_ALLOWED_EMAILS).length &&
      sessionSecret(env),
  )
}

function googleRedirectUri(requestUrl: URL): string {
  return `${requestUrl.origin}/api/admin/auth/google/callback`
}

function randomState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return b64urlEncode(bytes)
}

async function exchangeGoogleCode(
  env: AdminEnv,
  code: string,
  redirectUri: string,
): Promise<string> {
  const body = new URLSearchParams({
    code,
    client_id: env.GOOGLE_CLIENT_ID || '',
    client_secret: env.GOOGLE_CLIENT_SECRET || '',
    redirect_uri: redirectUri,
    grant_type: 'authorization_code',
  })
  const res = await fetch(GOOGLE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  const data = (await res.json()) as {
    access_token?: string
    error?: string
    error_description?: string
  }
  if (!data.access_token) {
    throw new Error(
      data.error_description || data.error || 'Google token exchange failed',
    )
  }
  return data.access_token
}

async function fetchGoogleUser(accessToken: string): Promise<{
  email: string
  name?: string
  picture?: string
  email_verified?: boolean
}> {
  const res = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) {
    throw new Error(`Google userinfo failed (${res.status})`)
  }
  const data = (await res.json()) as {
    email?: string
    name?: string
    picture?: string
    email_verified?: boolean
  }
  if (!data.email) throw new Error('Google account has no email')
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
    email_verified: data.email_verified,
  }
}

function adminErrorRedirect(origin: string, message: string): Response {
  const u = new URL('/admin', origin)
  u.searchParams.set('auth_error', message)
  return Response.redirect(u.toString(), 302)
}

async function loadConfig(env: AdminEnv): Promise<AdminConfig> {
  if (!env.ADMIN_KV) return defaultConfig()
  const raw = await env.ADMIN_KV.get(CONFIG_KEY)
  if (!raw) return defaultConfig()
  try {
    const saved = JSON.parse(raw) as Partial<AdminConfig>
    const base = defaultConfig()
    return {
      ...base,
      ...saved,
      version: 1,
      editorInChief: { ...base.editorInChief, ...saved.editorInChief },
      avatars: saved.avatars ?? base.avatars,
      conbal: { ...base.conbal, ...saved.conbal },
      flash: { ...base.flash, ...saved.flash },
      library: { ...base.library, ...saved.library },
      featureFlags: { ...base.featureFlags, ...saved.featureFlags },
      updatedAt: saved.updatedAt || base.updatedAt,
    }
  } catch {
    return defaultConfig()
  }
}

async function saveConfig(env: AdminEnv, cfg: AdminConfig): Promise<void> {
  if (!env.ADMIN_KV) throw new Error('ADMIN_KV not bound')
  cfg.updatedAt = new Date().toISOString()
  await env.ADMIN_KV.put(CONFIG_KEY, JSON.stringify(cfg))
}

export async function handleAdmin(
  request: Request,
  env: AdminEnv,
): Promise<Response | null> {
  const url = new URL(request.url)
  if (!url.pathname.startsWith('/api/admin')) return null

  const path = url.pathname.replace(/\/+$/, '') || '/api/admin'
  const method = request.method.toUpperCase()
  const secure = url.protocol === 'https:'

  // CORS for admin SPA (same origin normally)
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }

  if (path === '/api/admin/health' && method === 'GET') {
    return json({
      ok: true,
      service: 'ibamboo-admin',
      kv: Boolean(env.ADMIN_KV),
      passwordConfigured: Boolean(env.ADMIN_PASSWORD),
      googleConfigured: googleConfigured(env),
      authMethods: [
        ...(googleConfigured(env) ? (['google'] as const) : []),
        ...(env.ADMIN_PASSWORD ? (['password'] as const) : []),
      ],
    })
  }

  // --- Google OAuth start ---
  if (path === '/api/admin/auth/google' && method === 'GET') {
    if (!googleConfigured(env)) {
      return json(
        {
          ok: false,
          error:
            'Google OAuth not configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, ADMIN_ALLOWED_EMAILS)',
        },
        503,
      )
    }
    const state = randomState()
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID || '',
      redirect_uri: googleRedirectUri(url),
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    })
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${GOOGLE_AUTH}?${params}`,
        'Set-Cookie': oauthStateCookie(state, secure),
        'Cache-Control': 'no-store',
      },
    })
  }

  // --- Google OAuth callback ---
  if (path === '/api/admin/auth/google/callback' && method === 'GET') {
    const origin = url.origin
    if (!googleConfigured(env)) {
      return adminErrorRedirect(origin, 'Google OAuth is not configured')
    }
    const err = url.searchParams.get('error')
    if (err) {
      // Don't reflect Google's free-text error_description (phishing banner risk)
      return adminErrorRedirect(origin, 'Google sign-in was cancelled or failed')
    }
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const expectedState = readCookie(request, OAUTH_STATE_COOKIE)
    if (!code || !state || !expectedState || state !== expectedState) {
      return adminErrorRedirect(origin, 'Invalid OAuth state — try again')
    }
    try {
      const token = await exchangeGoogleCode(
        env,
        code,
        googleRedirectUri(url),
      )
      const profile = await fetchGoogleUser(token)
      if (profile.email_verified !== true) {
        return adminErrorRedirect(origin, 'Google email is not verified')
      }
      if (!isEmailAllowed(profile.email, env)) {
        return adminErrorRedirect(
          origin,
          `Access denied for ${profile.email}`,
        )
      }
      const setCookie = await sessionCookie(env, secure, {
        provider: 'google',
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      })
      const headers = new Headers({
        Location: `${origin}/admin?auth=ok`,
        'Cache-Control': 'no-store',
      })
      // Multiple Set-Cookie: session + clear oauth state
      headers.append('Set-Cookie', setCookie)
      headers.append('Set-Cookie', clearOauthStateCookie(secure))
      return new Response(null, { status: 302, headers })
    } catch (e) {
      console.error('Google OAuth callback failed', e)
      return adminErrorRedirect(origin, 'Google sign-in failed')
    }
  }

  // Password fallback (emergency / break-glass)
  if (path === '/api/admin/login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD) {
      return json({ ok: false, error: 'Password login not enabled' }, 503)
    }
    if (!sessionSecret(env)) {
      return json(
        { ok: false, error: 'ADMIN_SESSION_SECRET or ADMIN_PASSWORD required' },
        503,
      )
    }
    let body: { password?: string }
    try {
      body = (await request.json()) as { password?: string }
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400)
    }
    if (body.password !== env.ADMIN_PASSWORD) {
      return json({ ok: false, error: 'Invalid password' }, 401)
    }
    try {
      const setCookie = await sessionCookie(env, secure, {
        provider: 'password',
        email: 'password@local',
        name: 'Password operator',
      })
      return json({ ok: true }, 200, { 'Set-Cookie': setCookie })
    } catch (e) {
      return json(
        {
          ok: false,
          error: e instanceof Error ? e.message : 'Session create failed',
        },
        500,
      )
    }
  }

  if (path === '/api/admin/logout' && method === 'POST') {
    return json(
      { ok: true },
      200,
      { 'Set-Cookie': clearSessionCookie(secure) },
    )
  }

  if (path === '/api/admin/session' && method === 'GET') {
    const session = await readSession(request, env)
    if (!session) {
      return json({
        ok: false,
        authenticated: false,
        googleConfigured: googleConfigured(env),
        passwordConfigured: Boolean(env.ADMIN_PASSWORD),
      })
    }
    return json({
      ok: true,
      authenticated: true,
      user: {
        provider: session.provider,
        email: session.email,
        name: session.name,
        picture: session.picture,
      },
      googleConfigured: googleConfigured(env),
      passwordConfigured: Boolean(env.ADMIN_PASSWORD),
    })
  }

  // Everything below requires auth
  if (!(await isAuthed(request, env))) {
    return json({ ok: false, error: 'Unauthorized' }, 401)
  }

  if (path === '/api/admin/config' && method === 'GET') {
    const config = await loadConfig(env)
    return json({ ok: true, config })
  }

  if (path === '/api/admin/config' && method === 'PUT') {
    let body: Partial<AdminConfig>
    try {
      body = (await request.json()) as Partial<AdminConfig>
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400)
    }
    const current = await loadConfig(env)
    const next: AdminConfig = {
      ...current,
      ...body,
      version: 1,
      editorInChief: body.editorInChief
        ? { ...current.editorInChief, ...body.editorInChief }
        : current.editorInChief,
      avatars: body.avatars ?? current.avatars,
      conbal: body.conbal
        ? { ...current.conbal, ...body.conbal }
        : current.conbal,
      flash: body.flash ? { ...current.flash, ...body.flash } : current.flash,
      library: body.library
        ? { ...current.library, ...body.library }
        : current.library,
      featureFlags: body.featureFlags
        ? { ...current.featureFlags, ...body.featureFlags }
        : current.featureFlags,
      updatedAt: new Date().toISOString(),
    }
    try {
      await saveConfig(env, next)
    } catch (e) {
      return json(
        {
          ok: false,
          error: e instanceof Error ? e.message : 'Save failed',
        },
        500,
      )
    }
    return json({ ok: true, config: next })
  }

  // Live flash catalog snapshot (auth-gated operator probe)
  if (path === '/api/admin/flash/status' && method === 'GET') {
    const cfg = await loadConfig(env)
    const catalogUrl =
      env.FLASH_CATALOG_URL ||
      cfg.flash.catalogUrl ||
      'https://amazon-flash-catalog.tech-bf6.workers.dev/api/catalog/ibamboo'
    try {
      const res = await fetch(catalogUrl, {
        headers: { Accept: 'application/json' },
      })
      const data = (await res.json()) as Record<string, unknown>
      return json({
        ok: res.ok,
        status: res.status,
        catalogUrl,
        adminUrl: cfg.flash.adminUrl,
        siteId: cfg.flash.siteId,
        productCount: data.productCount ?? (data.products as unknown[])?.length,
        generatedAt: data.generatedAt,
        weekOf: data.weekOf,
        sample: Array.isArray(data.products)
          ? (data.products as unknown[]).slice(0, 8)
          : [],
        notes: cfg.flash.notes,
      })
    } catch (e) {
      return json({
        ok: false,
        error: e instanceof Error ? e.message : 'Flash fetch failed',
        catalogUrl,
        adminUrl: cfg.flash.adminUrl,
      })
    }
  }

  // Library review — this storefront only (never network-wide bySite dump)
  if (path === '/api/admin/library/status' && method === 'GET') {
    const cfg = await loadConfig(env)
    const base = (env.LIBRARY_URL || cfg.library.baseUrl || 'https://kyasi.us').replace(
      /\/$/,
      '',
    )
    // Always this site: admin panel is site-local (ibamboo), not a network hub.
    const siteId = 'ibamboo'
    try {
      const [statsRes, itemsRes] = await Promise.all([
        fetch(`${base}/api/stats`),
        fetch(
          `${base}/api/library/items?site=${encodeURIComponent(siteId)}&limit=100`,
        ),
      ])
      const networkStats = (await statsRes.json()) as {
        bySite?: { siteId: string; count: number }[]
        items?: number
        siteLinks?: number
      }
      const itemsPayload = (await itemsRes.json()) as {
        items?: unknown[]
        total?: number
      }
      const siteRow = (networkStats.bySite || []).find(
        (r) => r.siteId === siteId,
      )
      const itemTotal =
        typeof itemsPayload.total === 'number'
          ? itemsPayload.total
          : siteRow?.count
      const siteItems = Array.isArray(itemsPayload.items)
        ? itemsPayload.items
        : []
      return json({
        ok: statsRes.ok && itemsRes.ok,
        baseUrl: base,
        siteId,
        // Site-local summary only — do not expose other storefronts
        stats: {
          siteId,
          itemCount: itemTotal ?? siteItems.length,
          listed: siteItems.length,
        },
        items: {
          items: siteItems,
          total: itemTotal ?? siteItems.length,
        },
        notes: cfg.library.notes,
        syncHint:
          'From repo: KYASI_LIBRARY_TOKEN=… npm run library:sync (writes this site only)',
      })
    } catch (e) {
      return json({
        ok: false,
        error: e instanceof Error ? e.message : 'Library fetch failed',
        baseUrl: base,
        siteId,
      })
    }
  }

  // Conbal probe
  if (path === '/api/admin/conbal/status' && method === 'GET') {
    const cfg = await loadConfig(env)
    const origin = cfg.conbal.origin.replace(/\/$/, '')
    let health: unknown = null
    let healthOk = false
    try {
      const res = await fetch(`${origin}/api/health`, {
        headers: { Accept: 'application/json' },
      })
      healthOk = res.ok
      health = await res.json().catch(() => ({ status: res.status }))
    } catch (e) {
      health = { error: e instanceof Error ? e.message : 'unreachable' }
    }
    return json({
      ok: true,
      origin,
      siteKey: cfg.conbal.siteKey,
      siteKeyMasked:
        cfg.conbal.siteKey.slice(0, 4) +
        '…' +
        cfg.conbal.siteKey.slice(-3),
      notes: cfg.conbal.notes,
      healthOk,
      health,
      adminHint: `${origin}/admin/ (Conbal dashboard, separate login)`,
    })
  }

  return json({ ok: false, error: 'Not found' }, 404)
}
