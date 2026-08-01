/**
 * iBamboo Admin API — POC control plane at /api/admin/*
 * Auth: password → signed cookie (ADMIN_PASSWORD secret).
 * State: KV ADMIN_KV key "config".
 */

export type AdminEnv = {
  ADMIN_KV?: KVNamespace
  ADMIN_PASSWORD?: string
  ADMIN_SESSION_SECRET?: string
  FLASH_CATALOG_URL?: string
  LIBRARY_URL?: string
  LIBRARY_TOKEN?: string
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
const CONFIG_KEY = 'config'

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
        'Federated ASIN library. Site catalog remains shelf source of truth; library:sync writes house metadata + images to kyasi.us.',
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

async function sessionCookie(
  env: AdminEnv,
  secure: boolean,
): Promise<string> {
  const secret = env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD || 'dev'
  const exp = Date.now() + 12 * 60 * 60 * 1000
  const payload = `admin:${exp}`
  const sig = await hmacSign(secret, payload)
  const value = `${payload}.${sig}`
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=43200${secure ? '; Secure' : ''}`
}

async function isAuthed(request: Request, env: AdminEnv): Promise<boolean> {
  const secret = env.ADMIN_SESSION_SECRET || env.ADMIN_PASSWORD
  if (!secret) return false
  const cookie = request.headers.get('Cookie') || ''
  const m = cookie.match(new RegExp(`${COOKIE}=([^;]+)`))
  if (!m) return false
  const [payload, sig] = m[1].split('.')
  if (!payload || !sig) return false
  const expected = await hmacSign(secret, payload)
  if (expected !== sig) return false
  const exp = Number(payload.split(':')[1] || 0)
  return exp > Date.now()
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
    })
  }

  if (path === '/api/admin/login' && method === 'POST') {
    if (!env.ADMIN_PASSWORD) {
      return json({ ok: false, error: 'ADMIN_PASSWORD secret not set' }, 503)
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
    const setCookie = await sessionCookie(env, secure)
    return json(
      { ok: true },
      200,
      { 'Set-Cookie': setCookie },
    )
  }

  if (path === '/api/admin/logout' && method === 'POST') {
    return json(
      { ok: true },
      200,
      {
        'Set-Cookie': `${COOKIE}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`,
      },
    )
  }

  if (path === '/api/admin/session' && method === 'GET') {
    const ok = await isAuthed(request, env)
    return json({ ok, authenticated: ok })
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

  // Library review for this site
  if (path === '/api/admin/library/status' && method === 'GET') {
    const cfg = await loadConfig(env)
    const base = (env.LIBRARY_URL || cfg.library.baseUrl || 'https://kyasi.us').replace(
      /\/$/,
      '',
    )
    const siteId = cfg.library.siteId || 'ibamboo'
    try {
      const [statsRes, itemsRes] = await Promise.all([
        fetch(`${base}/api/stats`),
        fetch(`${base}/api/library/items?site=${encodeURIComponent(siteId)}&limit=40`),
      ])
      const stats = await statsRes.json()
      const items = await itemsRes.json()
      return json({
        ok: statsRes.ok && itemsRes.ok,
        baseUrl: base,
        siteId,
        stats,
        items,
        notes: cfg.library.notes,
        syncHint:
          'From repo: KYASI_LIBRARY_TOKEN=… npm run library:sync',
      })
    } catch (e) {
      return json({
        ok: false,
        error: e instanceof Error ? e.message : 'Library fetch failed',
        baseUrl: base,
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
