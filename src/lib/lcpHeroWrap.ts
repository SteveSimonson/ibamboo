/** Worker-injected static LCP hero lives outside React (`#lcp-hero-wrap` before `#root`). */

export const LCP_HERO_WRAP_ID = 'lcp-hero-wrap'

export type LcpWrapEl = {
  hidden: boolean
  classList?: { add(name: string): void }
  setAttribute(name: string, value: string): void
  remove(): void
}

export type LcpWrapRoot = {
  getElementById(id: string): LcpWrapEl | null
}

/** Hide/remove the wrap after the React hero paints, or immediately off `/`. */
export function hideLcpHeroWrap(root?: LcpWrapRoot | null): boolean {
  const doc =
    root ?? (typeof document !== 'undefined' ? document : null)
  if (!doc) return false
  const wrap = doc.getElementById(LCP_HERO_WRAP_ID)
  if (!wrap) return false
  wrap.classList?.add('is-gone')
  wrap.hidden = true
  wrap.setAttribute('hidden', '')
  wrap.setAttribute('aria-hidden', 'true')
  wrap.remove()
  return true
}
