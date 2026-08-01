export const MAX_RECENT_BALLOON_SLUGS = 8

const validSlug = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-z0-9-]{1,80}$/.test(value)

/** One site-wide key makes the previous deck follow route and viewport changes. */
export function contentBalloonHistoryKey(siteKey: string) {
  return `ibamboo:content-balloon:previous:${siteKey}`
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
