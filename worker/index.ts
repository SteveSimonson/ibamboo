/**
 * iBamboo Worker: static SPA + quiz API + SEO edge layer.
 *
 * - Canonical redirects: http:// and www.ibamboo.com → https://ibamboo.com (301)
 * - Raw-HTML SEO: per-route title/description/canonical/og + JSON-LD injected
 *   into the SPA shell. Route table: worker/generated/routeMeta.json, emitted
 *   by scripts/generate-sitemap.mjs from src/lib/seoData.ts (same source the
 *   React app hydrates from). og:image stays sitewide.
 * - Real 404 status for unknown routes (SPA shell + noindex)
 * - Cache-Control: immutable for Vite-hashed /assets/*, 7d for unhashed media
 * - HSTS on every response
 * - CRM: GoHighLevel contact upsert (secrets GHL_PIT, GHL_LOCATION_ID)
 * - Email: Cloudflare Email Sending binding (`EMAIL`) from hello@ibamboo.com
 *   Domain onboarded: `npx wrangler email sending enable ibamboo.com`
 */

import { buildWelcomeEmail } from './welcomeEmail'
import routeMetaJson from './generated/routeMeta.json'
import { handleAdmin, type AdminEnv } from './admin'
import { renderShell, type RouteMeta } from './renderShell'

export { renderShell }
export type { RouteMeta }

/** Secrets not always present in generated Env until re-run wrangler types after secret put */
type WorkerEnv = Env &
  AdminEnv & {
    GHL_PIT?: string
    GHL_LOCATION_ID?: string
  }

type RouteMetaFile = {
  generatedAt: string
  ogImage: string
  globalJsonLd: Record<string, unknown>[]
  routes: Record<string, RouteMeta>
}

const routeMeta = routeMetaJson as unknown as RouteMetaFile

const SITE = 'https://ibamboo.com'
const CANONICAL_HOST = 'ibamboo.com'
const HSTS = 'max-age=31536000'

type QuizPayload = {
  email?: string
  firstName?: string
  lastName?: string
  personaId?: string
  personaLabel?: string
  interests?: string[]
  answers?: Record<string, string>
  marketingOptIn?: boolean
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function sanitizeTag(s: string) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9:_-]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48)
}

async function ghlUpsertContact(
  env: WorkerEnv,
  body: QuizPayload,
): Promise<{ contactId: string; isNew: boolean }> {
  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  if (!isEmail(email)) throw new Error('Valid email required')

  if (!env.GHL_PIT || !env.GHL_LOCATION_ID) {
    throw new Error('Quiz backend is not configured (missing GHL secrets).')
  }

  const interests = Array.isArray(body.interests)
    ? body.interests.map(sanitizeTag).filter(Boolean).slice(0, 12)
    : []
  const personaId = body.personaId ? sanitizeTag(body.personaId) : ''
  const tags = [
    'quiz:bamboo-vibe',
    'source:ibamboo-quiz',
    ...(personaId ? [`persona:${personaId}`] : []),
    ...interests.map((i) =>
      i.startsWith('interest:') ? i : `interest:${i}`,
    ),
  ]

  const firstName = String(body.firstName || '').trim().slice(0, 80) || undefined
  const lastName = String(body.lastName || '').trim().slice(0, 80) || undefined

  const payload: Record<string, unknown> = {
    locationId: env.GHL_LOCATION_ID,
    email,
    source: 'ibamboo-quiz',
    tags,
    country: 'US',
  }
  if (firstName) payload.firstName = firstName
  if (lastName) payload.lastName = lastName
  if (body.marketingOptIn === false) {
    payload.dnd = true
    payload.dndSettings = {
      Email: { status: 'active', message: 'Opted out at quiz submit', code: '' },
    }
  }

  const res = await fetch('https://services.leadconnectorhq.com/contacts/upsert', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GHL_PIT}`,
      Version: '2021-07-28',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await res.json()) as {
    new?: boolean
    contact?: { id?: string }
    message?: string
    error?: string
  }

  if (!res.ok || !data.contact?.id) {
    throw new Error(data.message || data.error || `GHL upsert failed (${res.status})`)
  }

  return { contactId: data.contact.id, isNew: Boolean(data.new) }
}

/**
 * Welcome email via Cloudflare Email Sending.
 * Transactional only (user completed vibe check + opted in).
 */
async function sendWelcomeEmailCf(
  env: WorkerEnv,
  toEmail: string,
  body: QuizPayload,
) {
  const parts = buildWelcomeEmail({
    firstName: body.firstName,
    personaId: body.personaId,
    personaLabel: body.personaLabel,
    interests: body.interests,
  })

  const fromEmail = env.EMAIL_FROM || 'hello@ibamboo.com'
  const fromName = env.EMAIL_FROM_NAME || 'iBamboo'
  const replyTo = env.EMAIL_REPLY_TO || fromEmail

  const result = await env.EMAIL.send({
    to: toEmail,
    from: { email: fromEmail, name: fromName },
    replyTo: { email: replyTo, name: fromName },
    subject: parts.subject,
    html: parts.html,
    text: parts.text,
    headers: {
      // One-click unsub landing (preference / contact) — keep first-party
      'List-Unsubscribe': '<https://ibamboo.com/quiz>',
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  })

  return {
    ok: true,
    provider: 'cloudflare' as const,
    personaId: parts.profile.id,
    result,
  }
}

/**
 * Fallback: GHL Conversations email if Cloudflare send fails.
 * Soft-fails if location email is not configured.
 */
async function sendWelcomeEmailGhl(
  env: WorkerEnv,
  contactId: string,
  body: QuizPayload,
) {
  if (!env.GHL_PIT) {
    return { ok: false, provider: 'ghl' as const, status: 0, personaId: body.personaId }
  }

  const parts = buildWelcomeEmail({
    firstName: body.firstName,
    personaId: body.personaId,
    personaLabel: body.personaLabel,
    interests: body.interests,
  })

  const res = await fetch(
    'https://services.leadconnectorhq.com/conversations/messages',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.GHL_PIT}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        type: 'Email',
        contactId,
        subject: parts.subject,
        html: parts.html,
        message: parts.text,
        emailFrom: undefined,
      }),
    },
  )

  return {
    ok: res.ok,
    provider: 'ghl' as const,
    status: res.status,
    personaId: parts.profile.id,
  }
}

async function handleQuiz(request: Request, env: WorkerEnv) {
  let body: QuizPayload
  try {
    body = (await request.json()) as QuizPayload
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  const recipient = String(body.email || '')
    .trim()
    .toLowerCase()
  if (!isEmail(recipient)) {
    return json({ ok: false, error: 'Valid email required' }, 400)
  }

  try {
    // CRM still lives in GHL when secrets are present
    let contactId: string | null = null
    let isNew = false
    if (env.GHL_PIT && env.GHL_LOCATION_ID) {
      const upsert = await ghlUpsertContact(env, body)
      contactId = upsert.contactId
      isNew = upsert.isNew
    }

    let emailSent = false
    let emailProvider: string | null = null
    let vibeId = body.personaId || null

    if (body.marketingOptIn !== false) {
      try {
        const cf = await sendWelcomeEmailCf(env, recipient, body)
        emailSent = true
        emailProvider = 'cloudflare'
        vibeId = cf.personaId
      } catch (cfErr) {
        // Fall back to GHL outbound if CF binding/send fails
        if (contactId) {
          try {
            const ghl = await sendWelcomeEmailGhl(env, contactId, body)
            emailSent = ghl.ok
            emailProvider = ghl.ok ? 'ghl' : null
            vibeId = ghl.personaId || vibeId
          } catch {
            emailSent = false
          }
        } else {
          console.error(
            'Cloudflare email send failed',
            cfErr instanceof Error ? cfErr.message : cfErr,
          )
        }
      }
    }

    return json({
      ok: true,
      contactId,
      isNew,
      emailSent,
      emailProvider,
      vibeId,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Submit failed'
    return json({ ok: false, error: msg }, 400)
  }
}

/* ------------------------------------------------------------------ */
/* SEO edge layer: route lookup, shell transform, caching              */
/* ------------------------------------------------------------------ */

/**
 * Resolve the route-table entry for a request URL (query-aware for /shop).
 * The route map doubles as the known-route list: null ⇒ unknown route.
 */
function findRouteMeta(url: URL): RouteMeta | null {
  let path = url.pathname
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1)
  const { routes } = routeMeta

  if (path === '/shop') {
    const cat = url.searchParams.get('cat') || ''
    const limited = url.searchParams.get('limited') === '1'
    const q = url.searchParams.get('q') || ''
    if (cat) {
      const key = `/shop?cat=${cat}${limited ? '&limited=1' : ''}`
      if (routes[key]) return routes[key]
    }
    if (limited && routes['/shop?limited=1']) {
      return routes['/shop?limited=1']
    }
    if (q) {
      // Client keeps base /shop title+description, canonicalizes with ?q=
      return {
        ...routes['/shop'],
        canonical: `${SITE}/shop?q=${encodeURIComponent(q)}`,
      }
    }
    return routes['/shop'] ?? null
  }

  return routes[path] ?? null
}

let shellPromise: Promise<string> | null = null

/** SPA shell (dist/index.html) via the assets binding, memoized per isolate. */
function getShell(request: Request, env: WorkerEnv): Promise<string> {
  if (!shellPromise) {
    const origin = new URL(request.url).origin
    // Always an explicit GET: passing the incoming request as init copies its
    // method, and a HEAD subfetch returns an empty body (intermittent 500s on
    // HEAD-first cold isolates).
    shellPromise = env.ASSETS.fetch(new Request(`${origin}/`, { method: 'GET' }))
      .then((res) => res.text())
      .then((text) => {
        // Never memoize a broken shell (deploy in progress, bad fallback…)
        if (!text.includes('</head>')) {
          shellPromise = null
          throw new Error('Assets binding returned an invalid HTML shell')
        }
        return text
      })
      .catch((err) => {
        shellPromise = null
        throw err
      })
  }
  return shellPromise
}

async function serveShell(
  request: Request,
  env: WorkerEnv,
  meta: RouteMeta | null,
  status: number,
): Promise<Response> {
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=0, must-revalidate',
  }
  // HEAD: status + headers only — no shell fetch, no transform, no body
  if (request.method === 'HEAD') {
    return new Response(null, { status, headers })
  }
  const html = renderShell(
    await getShell(request, env),
    meta,
    routeMeta.ogImage,
    routeMeta.globalJsonLd || [],
  )
  return new Response(html, { status, headers })
}

/** Long cache for Vite-hashed assets; medium for unhashed public media. */
function withCacheHeaders(res: Response, path: string): Response {
  let cacheControl: string | null = null
  if (path.startsWith('/assets/')) {
    cacheControl = 'public, max-age=31536000, immutable'
  } else if (/^\/(brand|images|products|videos)\//.test(path)) {
    cacheControl = 'public, max-age=604800'
  }
  if (!cacheControl) return res
  const out = new Response(res.body, res)
  out.headers.set('Cache-Control', cacheControl)
  return out
}

async function handleRequest(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  const url = new URL(request.url)
  const host = url.hostname.toLowerCase()

  // Canonical host + protocol in one 301 hop. Scoped to production hosts so
  // workers.dev previews and wrangler dev keep working.
  if (
    host === `www.${CANONICAL_HOST}` ||
    (host === CANONICAL_HOST && url.protocol === 'http:')
  ) {
    return new Response(null, {
      status: 301,
      headers: {
        Location: `${SITE}${url.pathname}${url.search}`,
      },
    })
  }

  if (url.pathname === '/api/quiz') {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS })
    }
    if (request.method === 'POST') {
      return handleQuiz(request, env)
    }
    return json({ ok: false, error: 'Method not allowed' }, 405)
  }

  // iBamboo Admin POC control plane
  const adminRes = await handleAdmin(request, env)
  if (adminRes) return adminRes

  // API misses are JSON 404s, never the HTML shell
  if (url.pathname.startsWith('/api/')) {
    return json({ ok: false, error: 'Not found' }, 404)
  }

  if (request.method === 'GET' || request.method === 'HEAD') {
    const meta = findRouteMeta(url)
    if (meta) return serveShell(request, env, meta, 200)

    // Admin control plane: 200 + noindex shell (not a soft-404 storefront miss)
    if (
      url.pathname === '/admin' ||
      url.pathname.startsWith('/admin/')
    ) {
      return serveShell(request, env, null, 200)
    }

    // Unknown path: extension ⇒ file request → assets; otherwise the SPA
    // shell with a real 404 (client boots and redirects home from there).
    const lastSegment = url.pathname.split('/').pop() || ''
    if (lastSegment.includes('.')) {
      const res = await env.ASSETS.fetch(request)
      // SPA fallback returns index.html for missing files — don't serve
      // HTML under a file URL
      if ((res.headers.get('Content-Type') || '').startsWith('text/html')) {
        return new Response('Not found', { status: 404 })
      }
      return withCacheHeaders(res, url.pathname)
    }
    return serveShell(request, env, null, 404)
  }

  return env.ASSETS.fetch(request)
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const res = await handleRequest(request, env)
    const out = new Response(res.body, res)
    out.headers.set('Strict-Transport-Security', HSTS)
    return out
  },
}
