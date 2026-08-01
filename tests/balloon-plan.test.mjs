import assert from 'node:assert/strict'
import test from 'node:test'

import { deriveBalloonPlan, sizeForTier } from '../src/lib/balloonPlan.ts'

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
