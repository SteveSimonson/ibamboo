import { expect, test, type Page } from '@playwright/test'

const PRODUCT_PATH = '/product/riveira-dark-bamboo-wooden-spoons-for-cooking-6-piece-apartment-essentials-wood-'
const WIDTHS = [390, 768, 1024, 1440, 2560]

async function mockSmartDelivery(page: Page) {
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

    if (width >= 1024) {
      const columnBottoms = await page.locator('[data-product-column]').evaluateAll((nodes) =>
        nodes.map((node) => Math.round(node.getBoundingClientRect().bottom)),
      )
      expect(Math.abs(columnBottoms[0] - columnBottoms[1])).toBeLessThanOrEqual(100)
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
  const productCount = await page.locator('a[href^="/product/"]').count()
  const balloonCount = await page.locator('[data-content-balloon]').count()
  expect(productCount).toBeGreaterThan(0)
  expect(balloonCount).toBeLessThanOrEqual(Math.max(1, Math.floor(productCount / 4)))

  await page.goto('/shop?q=definitely-no-such-bamboo-product')
  await expect(page.getByText('No matches')).toBeVisible()
  await expect(page.locator('[data-content-balloon]')).toHaveCount(0)
})
