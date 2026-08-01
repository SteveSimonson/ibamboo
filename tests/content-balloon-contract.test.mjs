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
import {
  canReplaceShelfProduct,
  shopGridInsertions,
} from '../src/lib/shopBalloonGrid.ts'

test('history is site-wide, bounded, deduplicated, and rejects malformed storage', () => {
  assert.equal(contentBalloonHistoryKey('site-a'), 'ibamboo:content-balloon:previous:site-a')
  assert.deepEqual(parseRecentBalloonSlugs('{bad json'), [])
  assert.deepEqual(parseRecentBalloonSlugs(JSON.stringify(['valid-slug', 'NOPE', 'valid-slug'])), ['valid-slug'])

  const many = Array.from({ length: 20 }, (_, index) => `fact-${index}`)
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
  assert.equal(shopGridInsertions(3).length, 2)
})

test('home shelf replacement never drops a product without inserting a note', () => {
  assert.equal(canReplaceShelfProduct(3, 2), false)
  assert.equal(canReplaceShelfProduct(4, 2), true)
  assert.equal(canReplaceShelfProduct(2, 1), false)
  assert.equal(canReplaceShelfProduct(3, 1), true)
  assert.equal(canReplaceShelfProduct(8, -1), false)
})
