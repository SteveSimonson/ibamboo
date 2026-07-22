/**
 * iBamboo Worker: static SPA assets + server-side Parsimony Automate (GHL) quiz API.
 * Secrets: GHL_PIT, GHL_LOCATION_ID (wrangler secret put)
 */

export interface Env {
  ASSETS: Fetcher
  GHL_PIT: string
  GHL_LOCATION_ID: string
}

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
  env: Env,
  body: QuizPayload,
): Promise<{ contactId: string; isNew: boolean }> {
  const email = String(body.email || '')
    .trim()
    .toLowerCase()
  if (!isEmail(email)) throw new Error('Valid email required')

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

/** Best-effort welcome email; fails soft if location email is not configured. */
async function ghlWelcomeEmail(
  env: Env,
  contactId: string,
  personaLabel: string,
  interests: string[],
) {
  const interestLine =
    interests.length > 0
      ? interests.map((i) => i.replace(/^interest:/, '')).join(', ')
      : 'bamboo living'
  const subject = `Your iBamboo vibe: ${personaLabel || 'Bamboo explorer'}`
  const html = `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#121a12">
      <p style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#3f6b35">iBamboo</p>
      <h1 style="font-size:28px;line-height:1.2">You're a ${escapeHtml(personaLabel || 'bamboo explorer')}.</h1>
      <p style="font-size:16px;line-height:1.6;color:#3d4a3c">
        Thanks for taking the Bamboo Vibe Check. Based on your answers, lean into:
        <strong>${escapeHtml(interestLine)}</strong>.
      </p>
      <p style="margin:28px 0">
        <a href="https://ibamboo.com/shop?limited=1"
           style="display:inline-block;background:#1e3320;color:#f6f3eb;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:600">
          Shop this week’s drop
        </a>
      </p>
      <p style="font-size:14px;color:#6b7768">
        Discover on iBamboo · Buy on Amazon · Lists refresh weekly.
      </p>
    </div>
  `

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
        subject,
        html,
        emailFrom: undefined,
      }),
    },
  )

  return { ok: res.ok, status: res.status }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

async function handleQuiz(request: Request, env: Env) {
  if (!env.GHL_PIT || !env.GHL_LOCATION_ID) {
    return json(
      { ok: false, error: 'Quiz backend is not configured (missing secrets).' },
      503,
    )
  }

  let body: QuizPayload
  try {
    body = (await request.json()) as QuizPayload
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }

  try {
    const { contactId, isNew } = await ghlUpsertContact(env, body)
    let email: { ok: boolean; status: number } | null = null
    if (body.marketingOptIn !== false) {
      try {
        email = await ghlWelcomeEmail(
          env,
          contactId,
          String(body.personaLabel || ''),
          Array.isArray(body.interests) ? body.interests : [],
        )
      } catch {
        email = { ok: false, status: 0 }
      }
    }
    return json({
      ok: true,
      contactId,
      isNew,
      emailSent: Boolean(email?.ok),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Submit failed'
    return json({ ok: false, error: msg }, 400)
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/quiz') {
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS })
      }
      if (request.method === 'POST') {
        return handleQuiz(request, env)
      }
      return json({ ok: false, error: 'Method not allowed' }, 405)
    }

    return env.ASSETS.fetch(request)
  },
}
