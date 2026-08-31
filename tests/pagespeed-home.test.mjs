import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { hideLcpHeroWrap, LCP_HERO_WRAP_ID } from '../src/lib/lcpHeroWrap.ts'
import { renderShell } from '../worker/renderShell.ts'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const SHELL = `<!doctype html>
<html lang="en">
  <head>
    <meta name="description" content="d" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://ibamboo.com/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://ibamboo.com/" />
    <meta property="og:title" content="x" />
    <meta property="og:description" content="d" />
    <meta property="og:image" content="https://ibamboo.com/brand/social.png" />
    <meta name="twitter:title" content="x" />
    <meta name="twitter:description" content="d" />
    <meta name="twitter:image" content="https://ibamboo.com/brand/social.png" />
    <title>iBamboo</title>
    <link rel="stylesheet" crossorigin href="/assets/index.css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

test('homepage shell self-hosts fonts and does not call Google Fonts or gtag', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8')
  const css = readFileSync(join(ROOT, 'src/index.css'), 'utf8')
  const ga = readFileSync(
    join(ROOT, 'src/components/GoogleAnalytics.tsx'),
    'utf8',
  )
  assert.equal(html.includes('fonts.googleapis.com'), false)
  assert.equal(html.includes('fonts.gstatic.com'), false)
  assert.equal(html.includes('googletagmanager.com'), false)
  assert.equal(html.includes('gtag/js'), false)
  assert.ok(html.includes('rel="preload"'))
  assert.ok(html.includes('/fonts/cormorant-garamond-latin-600-normal.woff2'))
  assert.ok(html.includes('/fonts/dm-sans-latin-wght-normal.woff2'))
  assert.ok(css.includes('@font-face'))
  assert.ok(css.includes('font-family: "DM Sans"'))
  assert.ok(css.includes('font-family: "Cormorant Garamond"'))
  assert.ok(css.includes('font-display: swap'))
  assert.ok(ga.includes('requestIdleCallback'))
  assert.ok(ga.includes('pointerdown'))
})

test('home routeMeta preloads WebP LCP and Worker injects a static hero img', () => {
  const seo = readFileSync(join(ROOT, 'src/lib/seoData.ts'), 'utf8')
  assert.ok(seo.includes("preloadImage: '/brand/hero.webp'"))
  const html = renderShell(
    SHELL,
    {
      title: 'iBamboo — Bamboo living, elevated',
      description: 'Discover bamboo for kitchen, table, bath, desk, and home.',
      canonical: 'https://ibamboo.com/',
      robots: 'index,follow',
      ogType: 'website',
      jsonLd: null,
      preloadImage: '/brand/hero.webp',
    },
    'https://ibamboo.com/brand/social.png',
  )
  assert.ok(html.includes('rel="preload" as="image"'))
  assert.ok(html.includes('type="image/webp"'))
  assert.ok(html.includes('fetchpriority="high"'))
  const imgPreloadAt = html.indexOf('rel="preload" as="image"')
  const cssAt = html.indexOf('rel="stylesheet"')
  assert.ok(imgPreloadAt > html.indexOf('<head>') && imgPreloadAt < html.indexOf('</head>'))
  assert.ok(cssAt < 0 || imgPreloadAt < cssAt)
  assert.ok(html.includes('id="lcp-hero-wrap"'))
  const imgAt = html.indexOf('<img src="/brand/hero.webp"')
  const rootAt = html.indexOf('<div id="root"')
  assert.ok(imgAt > 0 && rootAt > imgAt)
  assert.equal(html.includes('decoding="async"'), false)
  assert.ok(html.includes('width="1280"'))
  assert.ok(html.includes('height="720"'))
  assert.ok(html.includes('media="print"'))
  assert.ok(html.includes("onload=\"this.media='all'\""))
})

test('homepage React LCP img has dimensions and no decoding=async', () => {
  const home = readFileSync(join(ROOT, 'src/pages/Home.tsx'), 'utf8')
  assert.ok(home.includes('src="/brand/hero.webp"'))
  assert.ok(home.includes('width={1280}'))
  assert.ok(home.includes('height={720}'))
  assert.ok(home.includes('fetchPriority="high"'))
  const heroBlock = home.slice(
    home.indexOf('src="/brand/hero.webp"'),
    home.indexOf('src="/brand/hero.webp"') + 500,
  )
  assert.equal(heroBlock.includes('decoding'), false)
})

const HOME_META = {
  title: 'iBamboo — Bamboo living, elevated',
  description: 'Discover bamboo for kitchen, table, bath, desk, and home.',
  canonical: 'https://ibamboo.com/',
  robots: 'index,follow',
  ogType: 'website',
  jsonLd: null,
  preloadImage: '/brand/hero.webp',
}

const SHOP_META = {
  title: 'Shop bamboo for every room | iBamboo',
  description: 'Shop bamboo kitchen tools, cutting boards, tabletop, bath, desk, and home.',
  canonical: 'https://ibamboo.com/shop',
  robots: 'index,follow',
  ogType: 'website',
  jsonLd: null,
  preloadImage: '/brand/categories/kitchen.webp',
}

test('LCP wrap is homepage-only and React tears it down', () => {
  const homeHtml = renderShell(SHELL, HOME_META, 'https://ibamboo.com/brand/social.png')
  const shopHtml = renderShell(SHELL, SHOP_META, 'https://ibamboo.com/brand/social.png')
  const noPreloadHtml = renderShell(
    SHELL,
    { ...SHOP_META, preloadImage: undefined },
    'https://ibamboo.com/brand/social.png',
  )
  assert.ok(homeHtml.includes('id="lcp-hero-wrap"'))
  assert.equal(shopHtml.includes('id="lcp-hero-wrap"'), false)
  assert.equal(noPreloadHtml.includes('id="lcp-hero-wrap"'), false)
  assert.equal(shopHtml.includes('media="print"'), false)
  assert.ok(homeHtml.includes('#lcp-hero-wrap.is-gone'))
  assert.equal(homeHtml.includes('decoding="async"'), false)

  const home = readFileSync(join(ROOT, 'src/pages/Home.tsx'), 'utf8')
  const layout = readFileSync(join(ROOT, 'src/components/Layout.tsx'), 'utf8')
  const render = readFileSync(join(ROOT, 'worker/renderShell.ts'), 'utf8')
  assert.ok(home.includes('hideLcpHeroWrap'))
  assert.ok(home.includes('heroRef'))
  assert.equal(home.includes('decoding="async"'), false)
  assert.ok(layout.includes('hideLcpHeroWrap'))
  assert.ok(layout.includes("pathname !== '/'"))
  assert.ok(render.includes("preloadImage === '/brand/hero.webp'"))
  assert.equal(render.includes('decoding="async"'), false)
})

test('hideLcpHeroWrap removes #lcp-hero-wrap', () => {
  let removed = false
  const wrap = {
    hidden: false,
    classList: {
      added: [],
      add(name) {
        this.added.push(name)
      },
    },
    attrs: {},
    setAttribute(name, value) {
      this.attrs[name] = value
    },
    remove() {
      removed = true
    },
  }
  const doc = {
    getElementById(id) {
      return id === LCP_HERO_WRAP_ID ? wrap : null
    },
  }
  assert.equal(hideLcpHeroWrap(doc), true)
  assert.equal(wrap.hidden, true)
  assert.equal(wrap.attrs.hidden, '')
  assert.equal(wrap.attrs['aria-hidden'], 'true')
  assert.deepEqual(wrap.classList.added, ['is-gone'])
  assert.equal(removed, true)
  assert.equal(hideLcpHeroWrap({ getElementById: () => null }), false)
})
