export type RateLimiterBinding = {
  limit(options: { key: string }): Promise<boolean | { success: boolean }>
}

export const MAX_JSON_BODY_BYTES = 32_768

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data: https:",
  "style-src 'self' 'unsafe-inline' https:",
  "script-src 'self' 'unsafe-inline' https:",
  "connect-src 'self' https:",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  'upgrade-insecure-requests',
].join('; ')

const fallbackBuckets = new Map<string, { count: number; resetAt: number }>()

function allowedOrigins(site: string): Set<string> {
  const host = new URL(site).hostname
  return new Set([
    site,
    `https://www.${host}`,
    'http://localhost:3000',
    'http://localhost:4173',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:4173',
    'http://127.0.0.1:5173',
  ])
}

export function originAllowed(site: string, request: Request): boolean {
  const origin = request.headers.get('Origin')
  return !origin || allowedOrigins(site).has(origin)
}

export function corsHeaders(site: string, request: Request): Headers {
  const headers = new Headers({ 'Cache-Control': 'no-store', Vary: 'Origin' })
  const origin = request.headers.get('Origin')
  if (origin && allowedOrigins(site).has(origin)) {
    headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Access-Control-Max-Age', '600')
  }
  return headers
}

export function jsonResponse(site: string, request: Request, data: unknown, status = 200): Response {
  const headers = corsHeaders(site, request)
  headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(data), { status, headers })
}

export function secureResponse(response: Response): Response {
  const out = new Response(response.body, response)
  out.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  out.headers.set('X-Content-Type-Options', 'nosniff')
  out.headers.set('X-Frame-Options', 'DENY')
  out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  out.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  out.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  out.headers.set('Cross-Origin-Resource-Policy', 'same-site')
  out.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
  out.headers.set('Content-Security-Policy', CONTENT_SECURITY_POLICY)
  return out
}

export async function readJsonBody<T>(
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<{ ok: true; value: T } | { ok: false; reason: 'too-large' | 'invalid' }> {
  const declaredLength = Number(request.headers.get('Content-Length') || 0)
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) return { ok: false, reason: 'too-large' }
  const raw = await request.text()
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return { ok: false, reason: 'too-large' }
  try {
    return { ok: true, value: JSON.parse(raw) as T }
  } catch {
    return { ok: false, reason: 'invalid' }
  }
}

function clientKey(request: Request): string {
  return request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function rateLimited(site: string, request: Request, binding?: RateLimiterBinding, limit = 8, windowMs = 60_000): Promise<boolean> {
  const key = `${site}:${clientKey(request)}`
  if (binding) {
    try {
      const result = await binding.limit({ key })
      return typeof result === 'boolean' ? !result : !result.success
    } catch {
      // Fall back to a local guard if the optional binding is unavailable.
    }
  }
  const now = Date.now()
  const current = fallbackBuckets.get(key)
  if (!current || current.resetAt <= now) {
    fallbackBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return false
  }
  current.count += 1
  return current.count > limit
}
