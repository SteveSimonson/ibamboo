import type { ContentBalloonPayload } from './contentBalloonValidation'

export type ContentBalloonCopy = {
  body: string
  headline: string
}

const MAX_HEADLINE_LENGTH = 72
const MAX_BODY_LENGTH = 180

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&nbsp;', ' ')
}

function plainText(value: string) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()
}

/**
 * Temporary bridge for published v1 inventory. The smart renderer never mounts
 * remote HTML or CSS; it extracts copy and lets iBamboo own the presentation.
 */
export function legacyBalloonCopy(html: string): ContentBalloonCopy | null {
  const headline = plainText(html.match(/<strong\b[^>]*>([\s\S]*?)<\/strong>/i)?.[1] || '')
  const candidates = [...html.matchAll(/<(?:span|p|div)\b[^>]*>([\s\S]*?)<\/(?:span|p|div)>/gi)]
    .map((match) => plainText(match[1]))
    .filter((value) => value && value !== headline && !/^\d{1,3}$/.test(value))
    .filter((value) => !/^(?:iBamboo\s+)?field note$/i.test(value))
    .filter((value) => !/^bamboo fact(?:\s*[·/]\s*\d+)?$/i.test(value))
  const body = candidates
    .filter((value) => value.length >= 24)
    .sort((left, right) => right.length - left.length)[0] || ''

  if (!headline || !body) return null
  return {
    headline: headline.slice(0, MAX_HEADLINE_LENGTH),
    body: body.slice(0, MAX_BODY_LENGTH),
  }
}

export function contentBalloonCopy(item: ContentBalloonPayload): ContentBalloonCopy | null {
  if (item.content) {
    const headline = plainText(item.content.headline)
    const body = plainText(item.content.body)
    if (!headline || !body) return null
    return { headline, body }
  }
  return item.html ? legacyBalloonCopy(item.html) : null
}
