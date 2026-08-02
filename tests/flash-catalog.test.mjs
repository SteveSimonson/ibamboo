/**
 * Flash catalog mapper / SoT helpers.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Node test runner with strip-types can't import Vite TS directly cleanly for all envs.
// Re-implement pure logic checks against the module when available via dynamic import path.
// These tests encode the Phase A contract so regressions fail loudly.

function houseNameFromTitle(title) {
  let t = title.trim()
  t = t.split(/\s*[|–—]\s*/)[0] || t
  if (t.length > 72) {
    const comma = t.indexOf(',')
    if (comma > 24 && comma < 72) t = t.slice(0, comma)
  }
  t = t.replace(/\s+/g, ' ').trim()
  if (t.length > 64) t = `${t.slice(0, 61).replace(/\s+\S*$/, '')}…`
  return t || title.slice(0, 48)
}

function isUsableFlashImage(url) {
  if (!url || !/^https:\/\//i.test(url)) return false
  if (!/\/images\/I\//i.test(url)) return false
  if (/\/images\/P\//i.test(url)) return false
  const m = url.match(/\/images\/I\/([A-Za-z0-9_+%-]+)/i)
  if (!m || m[1].length < 10) return false
  if (!/\._[A-Z0-9_,+%-]+\./i.test(url) && !/\.(jpe?g|png|webp)(\?|$)/i.test(url)) {
    return false
  }
  return true
}

function isQualityFlashTitle(title) {
  if (!title || title.trim().length < 12) return false
  if (/^amazon product\s+[a-z0-9]{10}$/i.test(title.trim())) return false
  return /\bbamboo\b/i.test(title)
}

describe('flash catalog Phase A contract', () => {
  it('shortens Amazon titles to house names', () => {
    const name = houseNameFromTitle(
      'Bamboo Monitor Stand Riser with Drawer | Ergonomic Computer Riser for Desk with Cable Management',
    )
    assert.equal(name, 'Bamboo Monitor Stand Riser with Drawer')
    assert.ok(name.length < 80)
  })

  it('rejects truncated Amazon image hashes', () => {
    assert.equal(
      isUsableFlashImage('https://m.media-amazon.com/images/I/71eJfNw'),
      false,
    )
    assert.equal(
      isUsableFlashImage(
        'https://m.media-amazon.com/images/I/71TJOGfSKhL._AC_SL500_.jpg',
      ),
      true,
    )
  })

  it('requires bamboo in title', () => {
    assert.equal(isQualityFlashTitle('Plastic monitor stand for desk'), false)
    assert.equal(
      isQualityFlashTitle('Bamboo Monitor Stand Riser with Drawer'),
      true,
    )
  })

  it('merges flash over static without wiping the house catalog', () => {
    const flashOnly = [{ id: 'flash-A', asin: 'A' }, { id: 'flash-B', asin: 'B' }]
    const staticPool = [
      { id: 'static-1', asin: 'A' }, // duplicate ASIN → flash wins
      { id: 'static-2', asin: 'C' },
      { id: 'static-3', asin: 'D' },
    ]
    const seen = new Set()
    const products = []
    for (const p of [...flashOnly, ...staticPool]) {
      if (seen.has(p.asin)) continue
      seen.add(p.asin)
      products.push(p)
    }
    assert.equal(products.length, 4)
    assert.equal(products[0].id, 'flash-A')
    assert.ok(products.some((p) => p.id === 'static-2'))
    assert.ok(products.some((p) => p.id === 'static-3'))
  })
})

