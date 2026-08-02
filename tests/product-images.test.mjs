import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { galleryThumbImages, resolveProductImages } from '../src/lib/productImages.ts'

const primary = 'https://m.media-amazon.com/images/I/primary._AC_SL1000_.jpg'
const unrelated = [
  'https://m.media-amazon.com/images/I/recommendation-one.jpg',
  'https://m.media-amazon.com/images/I/recommendation-two.jpg',
  'https://m.media-amazon.com/images/I/recommendation-three.jpg',
]
const product = {
  id: 'bsr-B0829DCVN6',
  slug: 'smirly-cutting-boards',
  name: 'SMIRLY Bamboo Cutting Boards',
  tagline: 'Weekly list',
  description: 'A cutting board set.',
  category: 'cutting-boards',
  collection: 'Boards',
  material: 'Bamboo',
  features: [],
  specs: [],
  priceHint: 0,
  asin: 'B0829DCVN6',
  searchKeywords: 'SMIRLY cutting boards',
  images: [primary, ...unrelated],
  hue: 70,
  source: 'amazon-bsr',
}

test('unverified Amazon catalog entries expose only their primary image', () => {
  assert.deepEqual(galleryThumbImages(product, 1000), [primary])
  const resolved = resolveProductImages(product, 1000)
  assert.equal(resolved[0], primary)
  assert.ok(unrelated.every((url) => !resolved.includes(url)))
})

test('ASIN-scoped verified galleries retain their secondary images', () => {
  const verified = { ...product, imageGalleryVerified: true }
  assert.deepEqual(galleryThumbImages(verified, 1000), [primary, ...unrelated])
})

test('generated Amazon catalog persists no unverified secondary images', () => {
  const snapshot = JSON.parse(
    readFileSync(new URL('../src/data/bsr-snapshot.json', import.meta.url), 'utf8'),
  )
  const unsafe = snapshot.products.filter(
    (entry) =>
      ['amazon-bsr', 'amazon-search'].includes(entry.source) &&
      !entry.imageGalleryVerified &&
      entry.images.length > 1,
  )
  assert.deepEqual(
    unsafe.map((entry) => entry.asin),
    [],
  )
})
