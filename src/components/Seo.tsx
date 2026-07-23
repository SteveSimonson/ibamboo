import { useEffect } from 'react'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  clipMeta,
  organizationJsonLd,
  pageTitle,
  websiteJsonLd,
  type PageSeo,
} from '../lib/seo'

const JSON_LD_ID = 'ibamboo-jsonld'
const JSON_LD_GLOBAL_ID = 'ibamboo-jsonld-global'

function upsertMeta(
  attr: 'name' | 'property',
  key: string,
  content: string,
) {
  const selector = `meta[${attr}="${key}"]`
  let el = document.head.querySelector(selector) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(id: string, data: unknown) {
  let el = document.getElementById(id) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = id
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/** Global Organization + WebSite schema (once). */
export function GlobalSeo() {
  useEffect(() => {
    upsertJsonLd(JSON_LD_GLOBAL_ID, [organizationJsonLd(), websiteJsonLd()])
  }, [])
  return null
}

/**
 * Per-route SEO: title, description, canonical, Open Graph, Twitter, JSON-LD.
 * Safe for SPA crawlers that execute JavaScript (Google).
 */
export function Seo({
  title,
  description,
  path,
  image,
  type = 'website',
  noindex = false,
  jsonLd,
}: PageSeo) {
  // Stabilize object deps so parents can pass inline jsonLd safely
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : ''

  useEffect(() => {
    const fullTitle = pageTitle(title || DEFAULT_TITLE)
    const desc = clipMeta(description || DEFAULT_DESCRIPTION)
    const url = absoluteUrl(path || '/')
    const img = image
      ? absoluteUrl(image)
      : DEFAULT_OG_IMAGE

    document.title = fullTitle

    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')
    upsertMeta('name', 'author', SITE_NAME)
    upsertMeta('name', 'theme-color', '#3f6b35')

    upsertLink('canonical', url)

    upsertMeta('property', 'og:site_name', SITE_NAME)
    upsertMeta('property', 'og:type', type === 'product' ? 'product' : 'website')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', img)
    upsertMeta('property', 'og:locale', 'en_US')

    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', img)

    if (jsonLdKey) {
      const payload = JSON.parse(jsonLdKey) as
        | Record<string, unknown>
        | Record<string, unknown>[]
      const list = Array.isArray(payload) ? payload : [payload]
      upsertJsonLd(JSON_LD_ID, list)
    } else {
      const existing = document.getElementById(JSON_LD_ID)
      if (existing) existing.remove()
    }
  }, [title, description, path, image, type, noindex, jsonLdKey])

  return null
}

/** Convenience defaults for shell pages before content loads. */
export function DefaultSeo() {
  return (
    <Seo
      title={DEFAULT_TITLE}
      description={DEFAULT_DESCRIPTION}
      path="/"
    />
  )
}

// Re-export site URL for sitemap builders / debugging
export { SITE_URL }
