import assert from 'node:assert/strict'
import test from 'node:test'

import { cacheControlForPath } from '../worker/cache.ts'

test('hashed Vite assets and self-hosted fonts are immutable for 1y', () => {
  assert.equal(
    cacheControlForPath('/assets/index-D7aK9xYz.js'),
    'public, max-age=31536000, immutable',
  )
  assert.equal(
    cacheControlForPath('/assets/index-AbCdEf12.css'),
    'public, max-age=31536000, immutable',
  )
  assert.equal(
    cacheControlForPath('/fonts/dm-sans-latin-wght-normal.woff2'),
    'public, max-age=31536000, immutable',
  )
  assert.equal(
    cacheControlForPath('/assets/fonts/cormorant.woff2'),
    'public, max-age=31536000, immutable',
  )
})

test('unhashed JS/CSS is 1d must-revalidate, not immutable', () => {
  assert.equal(
    cacheControlForPath('/assets/index.js'),
    'public, max-age=86400, must-revalidate',
  )
  assert.equal(
    cacheControlForPath('/assets/main.css'),
    'public, max-age=86400, must-revalidate',
  )
})

test('unhashed brand media is 7 days', () => {
  assert.equal(
    cacheControlForPath('/brand/hero.webp'),
    'public, max-age=604800',
  )
  assert.equal(
    cacheControlForPath('/videos/royal-craft-cutting-boards.mp4'),
    'public, max-age=604800',
  )
})

test('HTML and unknown paths leave Cache-Control to the caller', () => {
  assert.equal(cacheControlForPath('/'), null)
  assert.equal(cacheControlForPath('/shop'), null)
  assert.equal(cacheControlForPath('/sitemap.xml'), null)
})
