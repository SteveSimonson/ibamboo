const SHOP_GRID_SLOTS = [
  { anchor: 'shop-grid-20', progress: 0.2, topic: 'design' },
  { anchor: 'shop-grid-40', progress: 0.4, topic: 'bamboo-basics' },
  { anchor: 'shop-grid-60', progress: 0.6, topic: 'care' },
  { anchor: 'shop-grid-80', progress: 0.8, topic: 'sustainability' },
] as const

/** Place up to four facts at unique, progressive points in a product result. */
export function shopGridInsertions(itemCount: number) {
  if (itemCount < 2) return []
  const usedIndexes = new Set<number>()
  return SHOP_GRID_SLOTS.flatMap((slot) => {
    const afterIndex = Math.min(
      itemCount - 2,
      Math.max(0, Math.round(itemCount * slot.progress) - 1),
    )
    if (usedIndexes.has(afterIndex)) return []
    usedIndexes.add(afterIndex)
    return [{ ...slot, afterIndex }]
  })
}

/** A shelf replacement is atomic: retain one product after the insertion point. */
export function canReplaceShelfProduct(itemCount: number, afterIndex: number) {
  return Number.isInteger(itemCount) &&
    Number.isInteger(afterIndex) &&
    afterIndex >= 0 &&
    itemCount >= afterIndex + 2
}
