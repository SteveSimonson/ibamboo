import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..')
const HOME_H1 = 'Living designed in bamboo.'
const HERO_ALT =
  'Sunlit modern kitchen with bamboo boards and utensils overlooking a bamboo garden'

test('built index.html contains the homepage h1, nav links, and hero alt', () => {
  const html = readFileSync(join(ROOT, 'dist/index.html'), 'utf8')
  assert.match(html, new RegExp(`<h1[^>]*>${HOME_H1}</h1>`))
  assert.ok((html.match(/<h[1-6]\b/gi) || []).length > 1)
  assert.match(html, /href="\/quiz"/)
  assert.match(html, /href="\/guides"/)
  assert.match(html, /href="\/gifts"/)
  assert.match(html, /href="\/shop"/)
  assert.match(html, /href="\/shop\?cat=kitchen"/)
  assert.ok((html.match(/<a\b/gi) || []).length > 5)
  const heroes = [
    ...html.matchAll(/<img\b[^>]*src="\/brand\/hero\.webp"[^>]*>/gi),
  ].map((match) => match[0])
  assert.ok(heroes.length >= 1)
  for (const img of heroes) {
    assert.match(img, new RegExp(`alt="${HERO_ALT}"`))
  }
  assert.match(html, /tag=iu0e3-20/)
})

test('built spa shell stays empty so other routes do not ship the homepage', () => {
  const html = readFileSync(join(ROOT, 'dist/spa-shell.html'), 'utf8')
  assert.match(html, /<div id="root">\s*<\/div>/)
  assert.equal(html.includes(HOME_H1), false)
  assert.equal(html.includes('<h1'), false)
})
