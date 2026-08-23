/**
 * SPA shell transforms: per-route head + crawler-visible body.
 * Kept separate from the Worker fetch handler so unit tests can import it.
 */

export type CrawlerBody = {
  h1: string
  paragraphs: string[]
  faq: { q: string; a: string }[]
  disclosure: string
}

export type RouteMeta = {
  title: string
  description: string
  canonical: string
  robots: string
  ogType: 'website' | 'product'
  jsonLd: Record<string, unknown>[] | null
  preloadImage?: string
  crawler?: CrawlerBody
}

export function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function escapeHtmlText(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function setMetaContent(
  html: string,
  attr: 'name' | 'property',
  key: string,
  value: string,
): string {
  const re = new RegExp(`(<meta\\s+${attr}="${key}"\\s+content=")[^"]*(")`)
  return html.replace(re, `$1${escapeHtmlAttr(value)}$2`)
}

function jsonLdScript(data: unknown): string {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">${json}</script>`
}

/** iBamboo tokens for no-JS readers; visually hidden when html.js. */
const CRAWLER_HEAD = `<style>#aeo-main{font-family:"DM Sans",system-ui,sans-serif;color:#121a12;background:#f4f5f3;max-width:42rem;margin:0 auto;padding:24px 16px 40px;line-height:1.6}#aeo-main h1,#aeo-main h2,#aeo-main h3{font-family:"Cormorant Garamond",serif;font-weight:600;color:#121a12}#aeo-main p{color:#3a423c}html.js #aeo-main{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}</style><script>document.documentElement.classList.add('js')</script>`

export function renderCrawlerArticle(crawler: CrawlerBody): string {
  const paras = crawler.paragraphs
    .map((p) => `<p>${escapeHtmlText(p)}</p>`)
    .join('')
  const faq =
    crawler.faq.length > 0
      ? `<section><h2>FAQ</h2>${crawler.faq
          .map(
            (item) =>
              `<h3>${escapeHtmlText(item.q)}</h3><p>${escapeHtmlText(item.a)}</p>`,
          )
          .join('')}</section>`
      : ''
  return `<article id="aeo-main"><h1>${escapeHtmlText(crawler.h1)}</h1>${paras}${faq}<p>${escapeHtmlText(crawler.disclosure)}</p></article>`
}

function injectCrawler(html: string, crawler: CrawlerBody): string {
  let out = html.includes('</head>')
    ? html.replace('</head>', `${CRAWLER_HEAD}</head>`)
    : html
  const article = renderCrawlerArticle(crawler)
  if (out.includes('<div id="root"')) {
    return out.replace('<div id="root"', `${article}<div id="root"`)
  }
  return out.replace('</body>', `${article}</body>`)
}

export function renderShell(
  html: string,
  meta: RouteMeta | null,
  ogImage: string,
  globalJsonLd: Record<string, unknown>[] = [],
): string {
  let out = html
  if (meta) {
    out = out.replace(
      /<title>[^<]*<\/title>/,
      `<title>${escapeHtmlText(meta.title)}</title>`,
    )
    out = setMetaContent(out, 'name', 'description', meta.description)
    out = setMetaContent(out, 'name', 'robots', meta.robots)
    out = out.replace(
      /(<link\s+rel="canonical"\s+href=")[^"]*(")/,
      `$1${escapeHtmlAttr(meta.canonical)}$2`,
    )
    out = setMetaContent(out, 'property', 'og:type', meta.ogType)
    out = setMetaContent(out, 'property', 'og:url', meta.canonical)
    out = setMetaContent(out, 'property', 'og:title', meta.title)
    out = setMetaContent(out, 'property', 'og:description', meta.description)
    out = setMetaContent(out, 'property', 'og:image', ogImage)
    out = setMetaContent(out, 'name', 'twitter:title', meta.title)
    out = setMetaContent(out, 'name', 'twitter:description', meta.description)
    out = setMetaContent(out, 'name', 'twitter:image', ogImage)
  } else {
    out = setMetaContent(out, 'name', 'robots', 'noindex,nofollow')
  }
  const schemas = [...globalJsonLd, ...(meta?.jsonLd ?? [])]
  const preload = meta?.preloadImage
    ? `<link rel="preload" as="image" href="${escapeHtmlAttr(meta.preloadImage)}" fetchpriority="high">`
    : ''
  out = out.replace(
    '</head>',
    `${preload}${schemas.map(jsonLdScript).join('')}</head>`,
  )
  if (meta?.crawler) {
    out = injectCrawler(out, meta.crawler)
  }
  return out
}
