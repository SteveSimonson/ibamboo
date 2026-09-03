import { jsonResponse } from './requestSecurity'

type UnsubscribeEnv = {
  GHL_PIT?: string
}

type EmailParts = {
  html: string
  text: string
  [key: string]: unknown
}

const encoder = new TextEncoder()

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = atob(padded)
    return Uint8Array.from(binary, (character) => character.charCodeAt(0))
  } catch {
    return null
  }
}

async function hmac(secret: string, message: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(message)))
}

async function validToken(token: string, secret: string): Promise<string | null> {
  const separator = token.lastIndexOf('.')
  if (separator < 1) return null
  const payload = token.slice(0, separator)
  const signature = fromBase64Url(token.slice(separator + 1))
  const encodedContactId = fromBase64Url(payload)
  if (!signature || !encodedContactId) return null
  const contactId = new TextDecoder().decode(encodedContactId)
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(contactId)) return null
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  return (await crypto.subtle.verify('HMAC', key, signature, encoder.encode(payload))) ? contactId : null
}

export async function createUnsubscribeLink(site: string, contactId: string, secret: string): Promise<string> {
  const payload = base64Url(encoder.encode(contactId))
  const signature = base64Url(await hmac(secret, payload))
  return `${site}/api/unsubscribe?token=${payload}.${signature}`
}

export function addUnsubscribeFooter(parts: EmailParts, unsubscribeUrl: string): EmailParts {
  return {
    ...parts,
    html: `${parts.html}<hr style="border:0;border-top:1px solid #e5e7eb;margin:32px 0 16px"><p style="font:12px/1.5 Arial,sans-serif;color:#6b7280">You received this because you completed the iBamboo Vibe Check. <a href="${unsubscribeUrl}">Unsubscribe from future emails</a>.</p>`,
    text: `${parts.text}\n\n---\nYou received this because you completed the iBamboo Vibe Check. Unsubscribe: ${unsubscribeUrl}`,
  }
}

export async function handleUnsubscribe(request: Request, env: UnsubscribeEnv, site: string): Promise<Response> {
  const url = new URL(request.url)
  let token = url.searchParams.get('token') || ''
  if (!token && request.method === 'POST' && (request.headers.get('Content-Type') || '').includes('application/x-www-form-urlencoded')) {
    token = new URLSearchParams(await request.text()).get('token') || ''
  }
  const contactId = env.GHL_PIT ? await validToken(token, env.GHL_PIT) : null
  if (!contactId) return jsonResponse(site, request, { ok: false, error: 'Invalid unsubscribe link.' }, 400)

  if (request.method === 'GET') {
    const action = `${url.pathname}?token=${encodeURIComponent(token)}`
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Unsubscribe — iBamboo</title></head><body style="margin:0;background:#f7f7f2;color:#1f2933;font:16px/1.5 Arial,sans-serif"><main style="max-width:520px;margin:12vh auto;padding:32px;background:#fff;border:1px solid #e5e7eb;border-radius:16px"><p style="color:#64748b;font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:12px">iBamboo preferences</p><h1 style="font-size:32px;line-height:1.1">Stop future emails?</h1><p>Confirm below and we’ll update your email preference.</p><form method="post" action="${action}"><button type="submit" style="border:0;border-radius:999px;background:#111827;color:#fff;padding:12px 18px;font-weight:700;cursor:pointer">Unsubscribe</button></form></main></body></html>`, { headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/html; charset=utf-8' } })
  }
  if (request.method !== 'POST') return jsonResponse(site, request, { ok: false, error: 'Method not allowed' }, 405)

  const result = await fetch(`https://services.leadconnectorhq.com/contacts/${encodeURIComponent(contactId)}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${env.GHL_PIT}`, Version: '2021-07-28', 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ dnd: true, dndSettings: { Email: { status: 'active', message: 'Unsubscribed', code: '' } } }),
  })
  if (!result.ok) {
    console.error('unsubscribe update failed', result.status)
    return jsonResponse(site, request, { ok: false, error: 'Unsubscribe could not be completed.' }, 502)
  }
  return jsonResponse(site, request, { ok: true, message: 'You are unsubscribed.' })
}
