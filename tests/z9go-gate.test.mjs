import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { catalogNumber } from '../scripts/lib/kyasi-library.mjs'
import { productPassesZ9goGate } from '../src/data/z9goGate.ts'

const curated = {
  asin: 'B0CURATED01',
  source: 'curated',
}

const bsr = {
  asin: 'B0BSR00001',
  source: 'amazon-bsr',
  limitedTime: true,
}

const search = {
  asin: 'B0SEARCH001',
  source: 'amazon-search',
}

const on = {
  enabled: true,
  siteId: 'ibamboo',
  asins: ['b0curated01'],
  source: 'z9go-catalog',
}

describe('productPassesZ9goGate', () => {
  it('fails open when the gate is missing', () => {
    assert.equal(productPassesZ9goGate(curated, null), true)
    assert.equal(productPassesZ9goGate(curated, undefined), true)
  })

  it('fails open when enabled is not true', () => {
    assert.equal(productPassesZ9goGate(curated, { enabled: false, asins: [] }), true)
    assert.equal(productPassesZ9goGate(curated, { asins: [] }), true)
  })

  it('hides curated ASINs when enabled with an empty allow-list', () => {
    assert.equal(productPassesZ9goGate(curated, { enabled: true, asins: [] }), false)
  })

  it('keeps curated ASINs that are in the gated set (case-insensitive)', () => {
    assert.equal(productPassesZ9goGate(curated, on), true)
    assert.equal(
      productPassesZ9goGate({ ...curated, asin: 'b0curated01' }, on),
      true,
    )
  })

  it('hides curated ASINs that are not in the gated set', () => {
    assert.equal(
      productPassesZ9goGate({ ...curated, asin: 'B0HIDDEN001' }, on),
      false,
    )
  })

  it('skips BSR / limited-time / amazon-search even when ASIN is absent', () => {
    assert.equal(productPassesZ9goGate(bsr, on), true)
    assert.equal(
      productPassesZ9goGate({ asin: 'B0LIMITED01', limitedTime: true }, on),
      true,
    )
    assert.equal(productPassesZ9goGate(search, on), true)
  })

  it('lets ASIN-less rows through (fill-* already excluded upstream)', () => {
    assert.equal(productPassesZ9goGate({ source: 'curated' }, on), true)
  })

  it('treats missing source as curated (products.ts rows have no source)', () => {
    assert.equal(
      productPassesZ9goGate({ asin: 'B0HIDDEN001' }, on),
      false,
    )
    assert.equal(productPassesZ9goGate({ asin: 'B0CURATED01' }, on), true)
  })
})

describe('catalogNumber (pagination coercion)', () => {
  it('coerces string total/returned/items.length so paging continues', () => {
    assert.equal(catalogNumber('250'), 250)
    assert.equal(catalogNumber('100'), 100)
    assert.equal(catalogNumber(98), 98)
    assert.equal(catalogNumber(['a', 'b'].length), 2)
  })

  it('falls back when the value is missing or invalid', () => {
    assert.equal(catalogNumber(undefined, 0), 0)
    assert.equal(catalogNumber('nope', 0), 0)
    assert.equal(catalogNumber(-1, 0), 0)
    assert.ok(Number.isNaN(catalogNumber('nope')))
  })
})
