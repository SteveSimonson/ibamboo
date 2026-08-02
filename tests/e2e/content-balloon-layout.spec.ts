import { expect, test, type Page } from '@playwright/test'
import { products as curatedProducts } from '../../src/data/products'
import { bsrProducts } from '../../src/data/products.bsr.generated'

const PRODUCT_PATH = '/product/riveira-dark-bamboo-wooden-spoons-for-cooking-6-piece-apartment-essentials-wood-'
const NIAGARA_PATH = '/product/niagara-sleep-solution-ultra-soft-queen-size-mattress-topper-rayon-derived-from-'
const SMIRLY_PATH = '/product/smirly-bamboo-cutting-boards-for-kitchen-wood-cutting-board-for-meal-prep-servin'
const WIDTHS = [390, 768, 1024, 1440, 2560]
const products = (() => {
  const seenAsins = new Set<string>()
  const seenSlugs = new Set<string>()
  return [...bsrProducts, ...curatedProducts].flatMap((product) => {
    if (!product.asin || seenAsins.has(product.asin)) return []
    seenAsins.add(product.asin)
    const slug = seenSlugs.has(product.slug) ? `${product.slug}-${product.id}` : product.slug
    seenSlugs.add(slug)
    return [{ ...product, slug }]
  })
})()

/**
 * Force static emergency catalog in e2e so layout gates stay deterministic.
 * Production uses live flash SoT; unit tests cover the flash mapper/contract.
 */
async function mockFlashCatalogOffline(page: Page) {
  await page.route(
    (url) =>
      /amazon-flash-catalog/i.test(url.href) ||
      /\/api\/catalog\//i.test(url.pathname),
    async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'e2e: flash mocked offline' }),
      })
    },
  )
}

async function mockSmartDelivery(page: Page) {
  await mockFlashCatalogOffline(page)
  await page.route('https://conbal.us/v2/b/**/sample', async (route) => {
    const request = route.request()
    const body = request.postDataJSON() as {
      contract: string
      page_view_id: string
      slots: Array<{
        budget: 'compact-v1' | 'standard-v1'
        id: string
        role: string
      }>
    }
    const assignments = Object.fromEntries(body.slots.map((slot, index) => [
      slot.id,
      {
        assignment_id: `test-${body.page_view_id}-${index}`,
        budget: slot.budget,
        content: {
          body: slot.budget === 'compact-v1'
            ? 'Bamboo utensils benefit from prompt drying and calm, everyday care.'
            : 'Bamboo is light, strong, and naturally varied. A little context makes the material easier to choose and care for.',
          headline: `Useful bamboo note ${index + 1}`,
        },
        editorial_type: 'did_you_know',
        role: slot.role,
        slug: `test-bamboo-note-${index + 1}`,
      },
    ]))
    await route.fulfill({
      body: JSON.stringify({ assignments, contract: body.contract }),
      contentType: 'application/json',
      status: 200,
    })
  })
}

async function loadWithFacts(page: Page, path: string) {
  await mockSmartDelivery(page)
  await page.goto(path)
  await page.locator('[data-content-balloon]').first().waitFor()
}

async function expectNoHorizontalOverflow(page: Page) {
  const geometry = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }))
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client + 1)
}

for (const width of WIDTHS) {
  test(`PDP smart placements are safe at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await loadWithFacts(page, PRODUCT_PATH)

    const balloons = page.locator('[data-content-balloon]')
    await expect(balloons).toHaveCount(3)
    await expectNoHorizontalOverflow(page)

    const audit = await balloons.evaluateAll((nodes) => ({
      anchors: nodes.map((node) => node.getAttribute('data-balloon-anchor')),
      nested: nodes.some((node) => Boolean(node.querySelector('[data-content-balloon]'))),
      remoteStyles: nodes.some((node) => Boolean(node.querySelector('style'))),
      sections: nodes.map((node) => node.getAttribute('data-balloon-section')),
      slugs: nodes.map((node) => node.getAttribute('data-content-balloon')),
      unsafe: nodes.some((node) => Boolean(node.closest('[data-balloon-zone]'))),
    }))
    expect(audit.anchors.sort()).toEqual([
      'product-guide-note',
      'product-related-card',
      'product-review-note',
    ])
    expect(new Set(audit.sections).size).toBe(3)
    expect(new Set(audit.slugs).size).toBe(3)
    expect(audit.nested).toBe(false)
    expect(audit.remoteStyles).toBe(false)
    expect(audit.unsafe).toBe(false)

    if (width >= 1280) {
      const surfaces = await page.locator('[data-product-surface]').evaluateAll((nodes) =>
        nodes.map((node) => ({
          bottom: Math.round(node.getBoundingClientRect().bottom),
          contentBottom: Math.round(node.lastElementChild?.getBoundingClientRect().bottom || node.getBoundingClientRect().bottom),
        })),
      )
      expect(surfaces).toHaveLength(2)
      expect(surfaces.every((surface) => surface.bottom - surface.contentBottom <= 40)).toBe(true)
      expect(Math.abs(surfaces[0].bottom - surfaces[1].bottom)).toBeLessThanOrEqual(128)
    }

    const amazonLinks = page.locator('a[href*="amazon.com"]')
    const hrefs = await amazonLinks.evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).href))
    expect(hrefs.length).toBeGreaterThan(0)
    expect(hrefs.every((href) => new URL(href).searchParams.get('tag') === 'iu0e3-20')).toBe(true)

    if (width >= 768) {
      const gridAudit = await page.locator('[data-balloon-role="grid-tile"]').evaluate((node) => {
        const grid = node.parentElement
        const cards = grid ? [...grid.children].filter((child) => child !== node) : []
        const rowPeer = cards.find((card) => Math.abs(card.getBoundingClientRect().top - node.getBoundingClientRect().top) < 2)
        return {
          childCount: grid?.children.length || 0,
          heightRatio: rowPeer ? node.getBoundingClientRect().height / rowPeer.getBoundingClientRect().height : 1,
        }
      })
      expect(gridAudit.childCount).toBe(4)
      expect(gridAudit.heightRatio).toBeGreaterThanOrEqual(0.9)
      expect(gridAudit.heightRatio).toBeLessThanOrEqual(1.1)
    } else {
      await expect(page.locator('[data-balloon-role="grid-tile"]')).toHaveAttribute('data-balloon-mobile-variant', 'compact-stream')
    }
  })
}

test('a standard PDP has three useful, separated placements', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await loadWithFacts(page, NIAGARA_PATH)
  const anchors = await page.locator('[data-content-balloon]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-balloon-anchor')).sort(),
  )
  expect(anchors).toEqual(['product-guide-note', 'product-related-card', 'product-spec-note'])
  expect(new Set(await page.locator('[data-content-balloon]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-balloon-section')),
  )).size).toBe(3)
})

test('an unverified Amazon gallery never exposes recommendation images', async ({ page }) => {
  await page.goto(SMIRLY_PATH)
  const media = page.locator('[data-product-surface="media"]')
  await expect(media.locator('img')).toHaveAttribute('src', /81FoZNCStHL/)
  await expect(media.locator('[data-has-thumbnail-rail]')).toHaveAttribute(
    'data-has-thumbnail-rail',
    'false',
  )
  await expect(media.locator('button')).toHaveCount(0)
})

test('mobile reads image, purchase decision, then specifications', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await loadWithFacts(page, NIAGARA_PATH)
  const order = await page.evaluate(() => {
    const top = (selector: string) => document.querySelector(selector)?.getBoundingClientRect().top ?? -1
    return {
      buy: top('[data-product-surface="purchase"] a[href*="amazon.com"]'),
      details: top('#product-details-heading'),
      title: top('h1'),
    }
  })
  expect(order.title).toBeGreaterThanOrEqual(0)
  expect(order.buy).toBeGreaterThan(order.title)
  expect(order.details).toBeGreaterThan(order.buy)
})

test('every catalog PDP uses balanced top surfaces at desktop width', async ({ page }) => {
  test.setTimeout(180_000)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.route('**/*', async (route) => {
    const request = route.request()
    if (['image', 'media'].includes(request.resourceType()) && new URL(request.url()).origin !== 'http://127.0.0.1:4175') {
      await route.abort()
    } else {
      await route.continue()
    }
  })
  await mockSmartDelivery(page)

  const failures: string[] = []
  for (const [index, product] of products.entries()) {
    const path = `/product/${product.slug}`
    if (index === 0) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
    } else {
      await page.evaluate((nextPath) => {
        window.history.pushState({}, '', nextPath)
        window.dispatchEvent(new PopStateEvent('popstate'))
      }, path)
    }
    await expect(page.locator('h1')).toHaveText(product.name)
    await page.locator('[data-product-surface="purchase"]').waitFor()
    const geometry = await page.locator('[data-product-surface]').evaluateAll((nodes) => nodes.map((node) => ({
      bottom: Math.round(node.getBoundingClientRect().bottom),
      contentBottom: Math.round(node.lastElementChild?.getBoundingClientRect().bottom || node.getBoundingClientRect().bottom),
    })))
    const detailsTop = await page.locator('#product-details-heading').evaluate((node) => Math.round(node.getBoundingClientRect().top))
    const imagePadding = await page.locator('[data-has-thumbnail-rail]').evaluate((node) => ({
      hasRail: node.getAttribute('data-has-thumbnail-rail') === 'true',
      paddingBottom: Number.parseFloat(getComputedStyle(node).paddingBottom),
    }))
    if (
      geometry.length !== 2 ||
      geometry.some((surface) => surface.bottom - surface.contentBottom > 40) ||
      Math.max(...geometry.map((surface) => surface.bottom)) - Math.min(...geometry.map((surface) => surface.bottom)) > 128 ||
      detailsTop < Math.max(...geometry.map((item) => item.bottom)) ||
      (!imagePadding.hasRail && imagePadding.paddingBottom > 40)
    ) failures.push(product.slug)
  }
  expect(failures, `unbalanced PDPs: ${failures.join(', ')}`).toEqual([])
})

test('a failed route request cannot retain facts from the prior product', async ({ page }) => {
  let deliveries = 0
  await page.route('https://conbal.us/v2/b/**/sample', async (route) => {
    deliveries += 1
    if (deliveries > 1) {
      await route.fulfill({ body: JSON.stringify({ error: 'temporary' }), contentType: 'application/json', status: 503 })
      return
    }
    const body = route.request().postDataJSON() as { slots: Array<{ budget: string; id: string; role: string }> }
    await route.fulfill({
      body: JSON.stringify({ assignments: Object.fromEntries(body.slots.map((slot, index) => [slot.id, {
        assignment_id: `first-${index}`,
        budget: slot.budget,
        content: { headline: `First route ${index}`, body: 'This copy belongs only to the first product route and must not survive navigation.' },
        editorial_type: 'did_you_know',
        role: slot.role,
        slug: `first-route-${index}`,
      }])) }),
      contentType: 'application/json',
    })
  })
  await page.goto(PRODUCT_PATH)
  await expect(page.locator('[data-content-balloon]')).toHaveCount(3)
  await page.goto(NIAGARA_PATH)
  await expect(page.locator('[data-content-balloon]')).toHaveCount(0)
  await expect.poll(() => deliveries).toBe(2)
})

test('responsive host rendering does not clear or refetch a compatible deck', async ({ page }) => {
  let requests = 0
  await page.route('https://conbal.us/v2/b/**/sample', async (route) => {
    requests += 1
    const body = route.request().postDataJSON() as { page_view_id: string; slots: Array<{ budget: string; id: string; role: string }> }
    await route.fulfill({
      body: JSON.stringify({ assignments: Object.fromEntries(body.slots.map((slot, index) => [slot.id, {
        assignment_id: `stable-${index}`,
        budget: slot.budget,
        content: { headline: `Stable fact ${index}`, body: 'This fact remains mounted when the viewport crosses a responsive breakpoint.' },
        editorial_type: 'did_you_know',
        role: slot.role,
        slug: `stable-fact-${index}`,
      }])) }),
      contentType: 'application/json',
    })
  })
  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto(PRODUCT_PATH)
  await expect(page.locator('[data-content-balloon]')).toHaveCount(3)
  const before = await page.locator('[data-content-balloon]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-content-balloon')))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.waitForTimeout(500)
  const after = await page.locator('[data-content-balloon]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-content-balloon')))
  expect(after).toEqual(before)
  expect(requests).toBe(1)
})

test('empty or failed delivery reserves no geometry', async ({ page }) => {
  await mockFlashCatalogOffline(page)
  await page.route('https://conbal.us/v2/b/**/sample', (route) => route.fulfill({
    body: JSON.stringify({ assignments: {} }),
    contentType: 'application/json',
  }))
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(PRODUCT_PATH)
  await page.waitForTimeout(250)
  await expect(page.locator('[data-content-balloon]')).toHaveCount(0)
  await expect(page.locator('[data-balloon-anchor]')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})

test('short and empty Shop results never become balloon-led', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await loadWithFacts(page, '/shop?q=Riveira')
  await expect(page.locator('a[href^="/product/"]').first()).toBeVisible({
    timeout: 15_000,
  })
  const productCount = await page.locator('a[href^="/product/"]').count()
  const balloonCount = await page.locator('[data-content-balloon]').count()
  expect(productCount).toBeGreaterThan(0)
  expect(balloonCount).toBeLessThanOrEqual(Math.max(1, Math.floor(productCount / 4)))

  await mockFlashCatalogOffline(page)
  await page.goto('/shop?q=definitely-no-such-bamboo-product')
  await expect(page.getByText('No matches')).toBeVisible()
  await expect(page.locator('[data-content-balloon]')).toHaveCount(0)
})
