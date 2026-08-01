import assert from 'node:assert/strict'
import test from 'node:test'

import {
  MAX_RECENT_BALLOON_SLUGS,
  contentBalloonHistoryKey,
  parseRecentBalloonSlugs,
  recentBalloonSlugs,
} from '../src/lib/contentBalloonHistory.ts'
import { validatedContentBalloonDeck } from '../src/lib/contentBalloonValidation.ts'
import { deriveBalloonPlan } from '../src/lib/balloonPlan.ts'
import { legacyBalloonCopy } from '../src/lib/contentBalloonContent.ts'
import {
  canReplaceShelfProduct,
  shopBalloonTarget,
  shopGridInsertions,
} from '../src/lib/shopBalloonGrid.ts'

test('history is route-aware, bounded, deduplicated, and rejects malformed storage', () => {
  assert.equal(contentBalloonHistoryKey('site-a', 'product:kitchen'), 'ibamboo:content-balloon:previous:site-a:product%3Akitchen')
  assert.deepEqual(parseRecentBalloonSlugs('{bad json'), [])
  assert.deepEqual(parseRecentBalloonSlugs(JSON.stringify(['valid-slug', 'NOPE', 'valid-slug'])), ['valid-slug'])

  const many = Array.from({ length: 40 }, (_, index) => `fact-${index}`)
  assert.equal(recentBalloonSlugs(many).length, MAX_RECENT_BALLOON_SLUGS)
})

test('response validation rejects duplicate slugs, wrong sizes, and wrong editorial types', () => {
  const plan = deriveBalloonPlan({
    routeKey: 'validation',
    tier: 'desktop',
    candidates: [
      { anchor: 'one', ariaLabel: 'One', editorialTypes: ['fun_fact'], layout: 'fixed', size: '728x90', topics: ['general'] },
      { anchor: 'two', ariaLabel: 'Two', editorialTypes: ['did_you_know'], layout: 'fixed', size: '336x280', topics: ['general'] },
      { anchor: 'three', ariaLabel: 'Three', editorialTypes: ['nature_note'], layout: 'fixed', size: '320x100', topics: ['general'] },
    ],
  })
  const deck = validatedContentBalloonDeck(plan, {
    one: { slug: 'accepted', size: '728x90', editorial_type: 'fun_fact', html: '<p>ok</p>' },
    two: { slug: 'accepted', size: '336x280', editorial_type: 'did_you_know', html: '<p>duplicate</p>' },
    three: { slug: 'wrong-size', size: '300x250', editorial_type: 'nature_note', html: '<p>wrong</p>' },
  })

  assert.deepEqual(Object.keys(deck), ['one'])
  assert.deepEqual(validatedContentBalloonDeck(plan, []), {})
})

test('response validation rejects a mismatched layout while accepting legacy payloads', () => {
  const plan = deriveBalloonPlan({
    routeKey: 'layout-validation',
    candidates: [
      { anchor: 'one', ariaLabel: 'One', editorialTypes: ['fun_fact'], layout: 'panel', size: 'responsive', topics: ['general'] },
      { anchor: 'two', ariaLabel: 'Two', editorialTypes: ['did_you_know'], layout: 'inline', size: 'responsive', topics: ['general'] },
      { anchor: 'three', ariaLabel: 'Three', editorialTypes: ['nature_note'], layout: 'product-card', size: 'responsive', topics: ['general'] },
    ],
  })

  const deck = validatedContentBalloonDeck(plan, {
    one: { slug: 'wrong-layout', layout: 'inline', size: 'responsive', editorial_type: 'fun_fact', html: '<p>wrong</p>' },
    two: { slug: 'matching-layout', layout: 'inline', size: 'responsive', editorial_type: 'did_you_know', html: '<p>ok</p>' },
    three: { slug: 'legacy-layout', size: 'responsive', editorial_type: 'nature_note', html: '<p>legacy</p>' },
  })

  assert.deepEqual(Object.keys(deck), ['two', 'three'])
})

test('structured delivery enforces role, budget, and copy limits', () => {
  const plan = deriveBalloonPlan({
    routeKey: 'structured',
    candidates: [
      { anchor: 'one', ariaLabel: 'One', budget: 'compact-v1', editorialTypes: ['fun_fact'], layout: 'product-card', role: 'grid-tile', section: 'grid', size: 'responsive', topics: ['general'] },
      { anchor: 'two', ariaLabel: 'Two', budget: 'standard-v1', editorialTypes: ['did_you_know'], layout: 'inline', role: 'inline-note', section: 'article', size: 'responsive', topics: ['general'] },
      { anchor: 'three', ariaLabel: 'Three', budget: 'standard-v1', editorialTypes: ['nature_note'], layout: 'panel', role: 'section-break', section: 'close', size: 'responsive', topics: ['general'] },
    ],
  })
  const valid = validatedContentBalloonDeck(plan, {
    one: { slug: 'compact-fact', budget: 'compact-v1', role: 'grid-tile', editorial_type: 'fun_fact', content: { headline: 'A compact fact', body: 'Short enough to fit safely inside an iBamboo product-grid card.' } },
    two: { slug: 'wrong-role', budget: 'standard-v1', role: 'aside-note', editorial_type: 'did_you_know', content: { headline: 'Wrong role', body: 'This assignment must be rejected because the role does not match.' } },
    three: { slug: 'too-long', budget: 'standard-v1', role: 'section-break', editorial_type: 'nature_note', content: { headline: 'Too long', body: 'x'.repeat(181) } },
  })
  assert.deepEqual(Object.keys(valid), ['one'])
})

test('legacy HTML is reduced to copy and never needs remote CSS to render', () => {
  assert.deepEqual(legacyBalloonCopy('<aside><span>45</span><div><p>iBamboo field note</p><strong>Lucky bamboo is a look-alike</strong><span>Lucky bamboo is a dracaena; the plants are not closely related.</span></div></aside>'), {
    headline: 'Lucky bamboo is a look-alike',
    body: 'Lucky bamboo is a dracaena; the plants are not closely related.',
  })
  assert.equal(legacyBalloonCopy('<style>body{display:none}</style><p>no structured copy</p>'), null)
})

test('planner preserves the editorial types authored for each placement', () => {
  const plan = deriveBalloonPlan({
    routeKey: 'relevance',
    candidates: [
      { anchor: 'one', ariaLabel: 'One', editorialTypes: ['fun_fact'], size: 'responsive', topics: ['general'] },
      { anchor: 'two', ariaLabel: 'Two', editorialTypes: ['design_note'], size: 'responsive', topics: ['general'] },
      { anchor: 'three', ariaLabel: 'Three', editorialTypes: ['material_myth'], size: 'responsive', topics: ['general'] },
    ],
  })

  assert.deepEqual(plan.slots.map((slot) => slot.editorialTypes), [
    ['fun_fact'],
    ['design_note'],
    ['material_myth'],
  ])
})

test('shop editorial cards occupy unique progressive product-grid positions', () => {
  const full = shopGridInsertions(50)
  assert.equal(full.length, 4)
  assert.deepEqual(full.map((item) => item.anchor), [
    'shop-grid-20',
    'shop-grid-40',
    'shop-grid-60',
    'shop-grid-80',
  ])
  assert.equal(new Set(full.map((item) => item.afterIndex)).size, full.length)
  assert.ok(full.every((item, index) => index === 0 || item.afterIndex > full[index - 1].afterIndex))

  assert.deepEqual(shopGridInsertions(0), [])
  assert.equal(shopGridInsertions(3).length, 1)
  assert.equal(shopBalloonTarget(5), 1)
  assert.equal(shopBalloonTarget(8), 2)
  assert.equal(shopBalloonTarget(12), 3)
  assert.equal(shopBalloonTarget(98), 4)
})

test('home shelf replacement never drops a product without inserting a note', () => {
  assert.equal(canReplaceShelfProduct(3, 2), false)
  assert.equal(canReplaceShelfProduct(4, 2), true)
  assert.equal(canReplaceShelfProduct(2, 1), false)
  assert.equal(canReplaceShelfProduct(3, 1), true)
  assert.equal(canReplaceShelfProduct(8, -1), false)
})
