/**
 * iBamboo Worker: static SPA + quiz API.
 *
 * - CRM: GoHighLevel contact upsert (secrets GHL_PIT, GHL_LOCATION_ID)
 * - Email: Cloudflare Email Sending binding (`EMAIL`) from hello@ibamboo.com
 *   Domain onboarded: `npx wrangler email sending enable ibamboo.com`
 */

import { buildWelcomeEmail } from './welcomeEmail'

/** Secrets not always present in generated Env until re-run wrangler types after secret put */
type WorkerEnv = Env & {
  GHL_PIT?: string
  GHL_LOCATION_ID?: string
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

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
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
