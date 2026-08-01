const SHOP_GRID_SLOTS = [
  { anchor: 'shop-grid-20', progress: 0.2, topic: 'design' },
  { anchor: 'shop-grid-40', progress: 0.4, topic: 'bamboo-basics' },
  { anchor: 'shop-grid-60', progress: 0.6, topic: 'care' },
  { anchor: 'shop-grid-80', progress: 0.8, topic: 'sustainability' },
] as const

/** Product-led density: never let editorial cards approach a 1:1 result ratio. */
export function shopBalloonTarget(itemCount: number) {
  if (!Number.isInteger(itemCount) || itemCount <= 0) return 0
  return Math.min(4, Math.max(1, Math.floor(itemCount / 4)))
}

/** Place the approved fact count at unique, progressive grid positions. */
export function shopGridInsertions(itemCount: number) {
  const target = shopBalloonTarget(itemCount)
  if (!target || itemCount < 2) return []
  const usedIndexes = new Set<number>()
  return SHOP_GRID_SLOTS.slice(0, target).flatMap((slot, index) => {
    const progress = (index + 1) / (target + 1)
    const afterIndex = Math.min(
      itemCount - 2,
      Math.max(0, Math.round(itemCount * progress) - 1),
    )
    if (usedIndexes.has(afterIndex)) return []
    usedIndexes.add(afterIndex)
    return [{ ...slot, afterIndex, progress }]
  })
}

/** A shelf replacement is atomic: retain one product after the insertion point. */
export function canReplaceShelfProduct(itemCount: number, afterIndex: number) {
  return Number.isInteger(itemCount) &&
    Number.isInteger(afterIndex) &&
    afterIndex >= 0 &&
    itemCount >= afterIndex + 2
}
