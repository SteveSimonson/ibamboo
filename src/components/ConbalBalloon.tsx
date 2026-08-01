import { useEffect, useState, type CSSProperties } from 'react'

export type ConbalSize =
  | 'responsive'
  | '300x250'
  | '336x280'
  | '728x90'
  | '160x600'
  | '320x100'

type ConbalPayload = {
  css?: string
  html: string
  size?: ConbalSize
}
type ConbalBalloonProps = {
  ariaLabel: string
  className?: string
  minHeight?: number
  size: ConbalSize
  slug: string
}

const DEFAULT_CONBAL_ORIGIN = 'https://conbal.us'
const DEFAULT_CONBAL_SITE_KEY = 'NYcKxGAVDdeF'

function reservedStyle(size: ConbalSize, minHeight?: number): CSSProperties {
  if (size === 'responsive') {
    return { minHeight, overflow: 'hidden', width: '100%' }
  }

  const [width, height] = size.split('x').map(Number)
  return { height, overflow: 'hidden', width }
}

/**
 * React-safe Conbal delivery slot.
 *
 * Conbal's stock embed scans the DOM once. iBamboo is an SPA, so this component
 * reads the same public delivery endpoint whenever a routed placement mounts.
 * Balloon markup is trusted site-owner content by Conbal's contract.
 */
export function ConbalBalloon({
  ariaLabel,
  className = '',
  minHeight,
  size,
  slug,
}: ConbalBalloonProps) {
  const [content, setContent] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'empty' | 'error'>(
    'loading',
  )
  const origin = (import.meta.env.VITE_CONBAL_ORIGIN || DEFAULT_CONBAL_ORIGIN).replace(
    /\/$/,
    '',
  )
  const siteKey = import.meta.env.VITE_CONBAL_SITE_KEY || DEFAULT_CONBAL_SITE_KEY

  useEffect(() => {
    const controller = new AbortController()
    setContent(null)
    setStatus('loading')

    async function load() {
      try {
        const response = await fetch(
          `${origin}/b/${encodeURIComponent(siteKey)}/${encodeURIComponent(slug)}`,
          { mode: 'cors', signal: controller.signal },
        )
        if (!response.ok) throw new Error(`Conbal delivery failed: ${response.status}`)

        const payloads = (await response.json()) as Record<string, ConbalPayload>
        const balloon = payloads[slug]
        if (!balloon || typeof balloon.html !== 'string') {
          setStatus('empty')
          return
        }

        if (balloon.size !== size) {
          console.warn('Conbal balloon size does not match its placement', {
            actual: balloon.size,
            expected: size,
            slug,
          })
          setStatus('error')
          return
        }

        setContent(`<style>${balloon.css || ''}</style>${balloon.html}`)
        setStatus('ready')
      } catch (error) {
        if (controller.signal.aborted) return
        console.warn('Unable to load Conbal balloon', { slug, error })
        setStatus('error')
      }
    }

    void load()
    return () => controller.abort()
  }, [origin, siteKey, size, slug])

  if (status === 'empty' || status === 'error') return null

  return (
    <div
      aria-busy={status === 'loading'}
      aria-label={ariaLabel}
      className={`conbal-slot ${className}`.trim()}
      data-conbal={slug}
      data-conbal-site={siteKey}
      data-conbal-state={status}
      data-size={size}
      style={reservedStyle(size, minHeight)}
      dangerouslySetInnerHTML={content ? { __html: content } : undefined}
    />
  )
}
