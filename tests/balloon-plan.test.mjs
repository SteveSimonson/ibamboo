import assert from 'node:assert/strict'
import test from 'node:test'

import {
  DESIGN_EDITORIAL_TYPES,
  FACT_EDITORIAL_TYPES,
  deriveBalloonPlan,
  editorialTypesForTier,
  isLayoutCompatible,
  sizeForTier,
} from '../src/lib/balloonPlan.ts'

test('creative sizes inherit upward without sending desktop formats to compact screens', () => {
  const creative = {
    compact: 'responsive',
    tablet: '320x100',
    desktop: '728x90',
  }

  assert.equal(sizeForTier('compact', creative), 'responsive')
  assert.equal(sizeForTier('tablet', creative), '320x100')
  assert.equal(sizeForTier('desktop', creative), '728x90')
  assert.equal(sizeForTier('wide', creative), '728x90')
})

test('wide plans can opt into a rail without changing smaller tiers', () => {
  const creative = {
    compact: 'responsive',
    tablet: '300x250',
    desktop: '336x280',
    wide: '160x600',
  }

  assert.equal(sizeForTier('compact', creative), 'responsive')
  assert.equal(sizeForTier('desktop', creative), '336x280')
  assert.equal(sizeForTier('wide', creative), '160x600')
})

test('compact slots share the factual pool while larger tiers keep specialization', () => {
  assert.equal(editorialTypesForTier('compact', DESIGN_EDITORIAL_TYPES), FACT_EDITORIAL_TYPES)
  assert.equal(editorialTypesForTier('tablet', DESIGN_EDITORIAL_TYPES), DESIGN_EDITORIAL_TYPES)
  assert.equal(editorialTypesForTier('desktop', DESIGN_EDITORIAL_TYPES), DESIGN_EDITORIAL_TYPES)
})

test('container-native layouts fail closed when paired with fixed-size creative', () => {
  const compatible = (layout, size) => isLayoutCompatible({
    anchor: 'test', ariaLabel: 'Test', editorialTypes: ['fun_fact'], layout, size, topics: ['general'],
  })
  assert.equal(compatible('inline', 'responsive'), true)
  assert.equal(compatible('panel', '336x280'), false)
  assert.equal(compatible('product-card', '300x250'), false)
  assert.equal(compatible('banner', '728x90'), true)
  assert.equal(compatible('fixed', '336x280'), true)

  const plan = deriveBalloonPlan({
    routeKey: 'layout-safe',
    candidates: [
      { anchor: 'bad', ariaLabel: 'Bad', editorialTypes: ['fun_fact'], layout: 'panel', size: '336x280', topics: ['general'] },
      { anchor: 'good', ariaLabel: 'Good', editorialTypes: ['fun_fact'], layout: 'panel', size: 'responsive', topics: ['general'] },
      { anchor: 'opt-in', ariaLabel: 'Opt in', editorialTypes: ['fun_fact'], layout: 'fixed', size: '336x280', topics: ['general'] },
    ],
  })

  assert.deepEqual(plan.slots.map((slot) => slot.anchor), ['good', 'opt-in'])
  assert.match(plan.signature, /\"layout\":\"panel\"/)
})

test('page-density planning remains bounded by viewport and unique anchors', () => {
  const candidates = Array.from({ length: 12 }, (_, index) => ({
    anchor: `slot-${index}`,
    ariaLabel: 'Bamboo note',
    editorialTypes: ['did_you_know'],
    size: 'responsive',
    topics: ['general'],
  }))
  const short = deriveBalloonPlan({ routeKey: 'short', candidates })
  const compactLong = deriveBalloonPlan({
    routeKey: 'compact-long',
    tier: 'compact',
    narrativeSections: 20,
    itemCount: 200,
    candidates,
  })
  const tabletLong = deriveBalloonPlan({
    routeKey: 'tablet-long',
    tier: 'tablet',
    narrativeSections: 20,
    itemCount: 200,
    candidates,
  })
  const long = deriveBalloonPlan({
    routeKey: 'long',
    tier: 'wide',
    narrativeSections: 20,
    featureGroups: 20,
    itemCount: 200,
    candidates,
  })

  assert.equal(short.slots.length, 3)
  assert.equal(compactLong.slots.length, 4)
  assert.equal(tabletLong.slots.length, 6)
  assert.equal(long.slots.length, 8)
  assert.equal(new Set(long.slots.map((slot) => slot.anchor)).size, 8)
  assert.match(long.signature, /"tier":"wide"/)
})
