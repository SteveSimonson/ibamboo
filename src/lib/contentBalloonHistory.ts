export const MAX_RECENT_BALLOON_SLUGS = 24

const validSlug = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z0-9-]{1,80}$/.test(value)

/** Rotation is contextual: a kitchen PDP does not exhaust a Why-page deck. */
export function contentBalloonHistoryKey(siteKey: string, routeKey: string) {
  return `ibamboo:content-balloon:previous:${siteKey}:${encodeURIComponent(routeKey)}`
}

export function parseRecentBalloonSlugs(raw: string | null): string[] {
  try {
    const values = raw ? JSON.parse(raw) : []
    return Array.isArray(values)
      ? [...new Set(values.filter(validSlug))].slice(0, MAX_RECENT_BALLOON_SLUGS)
      : []
  } catch {
    return []
  }
}

export function recentBalloonSlugs(values: unknown[]): string[] {
  return [...new Set(values.filter(validSlug))].slice(0, MAX_RECENT_BALLOON_SLUGS)
}
