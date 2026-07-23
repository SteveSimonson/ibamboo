/**
 * iBamboo Worker: static SPA assets + server-side Parsimony Automate (GHL) quiz API.
 * Secrets: GHL_PIT, GHL_LOCATION_ID (wrangler secret put)
 */

import { buildWelcomeEmail } from './welcomeEmail'

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

/**
 * Best-effort welcome email via GHL Conversations API.
 * Soft-fails if location email is not configured.
 *
 * Deliverability notes:
 * - Send only when marketingOptIn !== false (caller enforces)
 * - Moderate content richness; 2 content links; no Amazon URLs
 * - Confirm GHL location injects physical address + List-Unsubscribe
 */
async function ghlWelcomeEmail(
  env: Env,
  contactId: string,
  body: QuizPayload,
) {
  const parts = buildWelcomeEmail({
    firstName: body.firstName,
    personaId: body.personaId,
    personaLabel: body.personaLabel,
    interests: body.interests,
  })

  // GHL Conversations Email: html is primary; message used as plain-text fallback by some clients
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
        // Plain-text companion when the API accepts it (ignored if unsupported)
        message: parts.text,
        emailFrom: undefined,
      }),
    },
  )

  return {
    ok: res.ok,
    status: res.status,
    personaId: parts.profile.id,
  }
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
    let email: { ok: boolean; status: number; personaId?: string } | null = null
    if (body.marketingOptIn !== false) {
      try {
        email = await ghlWelcomeEmail(env, contactId, body)
      } catch {
        email = { ok: false, status: 0 }
      }
    }
    return json({
      ok: true,
      contactId,
      isNew,
      emailSent: Boolean(email?.ok),
      vibeId: email?.personaId || body.personaId || null,
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
