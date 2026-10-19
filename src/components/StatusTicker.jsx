import { useEffect, useState } from 'react'
import { STATUS_TICKER_INTERVAL_MS } from '../lib/constants'
import { TONE } from '../lib/tones'

/**
 * Rotating playful status lines ("Fighter 1 is sharpening its tokens...").
 * Announced politely to screen readers. Rotation is cosmetic only.
 *
 * @param {object} props
 * @param {string[]} props.lines
 * @param {number} [props.intervalMs=STATUS_TICKER_INTERVAL_MS]
 * @param {'fighter1' | 'fighter2' | 'judge' | 'neutral' | 'error'} [props.tone='judge']
 * @param {string} [props.icon='terminal'] Material Symbols icon name.
 * @param {string} [props.className]
 */
function StatusTicker({
  lines,
  intervalMs = STATUS_TICKER_INTERVAL_MS,
  tone = 'judge',
  icon = 'terminal',
  className = '',
}) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (lines.length <= 1) return undefined
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % lines.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [lines.length, intervalMs])

  if (lines.length === 0) return null
  const t = TONE[tone]

  return (
    <div
      className={[
        'flex items-center justify-center gap-space-sm text-center p-space-md',
        'rounded-xl bg-surface-container-lowest',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden="true" className={`material-symbols-outlined text-[18px] ${t.text}`}>
        {icon}
      </span>
      <p
        aria-live="polite"
        className={`font-body text-body-code font-semibold ${t.text} animate-arena-fade-in`}
        key={index}
      >
        {lines[index]}
      </p>
    </div>
  )
}

export default StatusTicker
