import { useEffect, useState } from 'react'
import { MAX_SCORE, SCORE_COUNTUP_DURATION_MS, SCORE_METER_SEGMENTS } from '../lib/constants'
import { TONE, toneForSide } from '../lib/tones'

/**
 * True when the OS asks for reduced motion.
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  )
}

/**
 * Health-bar style score meter: discrete segments that fill to the score,
 * plus a count-up number, both driven by `score / maxScore`.
 *
 * @param {object} props
 * @param {number} props.score
 * @param {number} [props.maxScore=MAX_SCORE]
 * @param {number} [props.segments=SCORE_METER_SEGMENTS]
 * @param {'1' | '2'} [props.side='1'] Fighter side — picks the color.
 * @param {boolean} [props.animate=true] Animate the fill + count-up.
 * @param {boolean} [props.showNumber=true] Show the big score readout.
 * @param {string} [props.label] Accessible label for the meter.
 * @param {string} [props.className]
 */
function ScoreMeter({
  score,
  maxScore = MAX_SCORE,
  segments = SCORE_METER_SEGMENTS,
  side = '1',
  animate = true,
  showNumber = true,
  label,
  className = '',
}) {
  const toneKey = toneForSide(side)
  const t = TONE[toneKey]
  const clamped = Math.min(Math.max(score, 0), maxScore)
  const targetSegments = Math.round((clamped / maxScore) * segments)
  const shouldAnimate = animate && !prefersReducedMotion()

  const [animScore, setAnimScore] = useState(0)

  const displayScore = shouldAnimate ? animScore : clamped
  const visibleSegments = shouldAnimate
    ? Math.round((animScore / maxScore) * segments)
    : targetSegments

  useEffect(() => {
    if (!shouldAnimate) return undefined

    let rafId
    const start = performance.now()

    const tick = (now) => {
      const progress = Math.min((now - start) / SCORE_COUNTUP_DURATION_MS, 1)
      const eased = 1 - (1 - progress) * (1 - progress)
      setAnimScore(clamped * eased)
      if (progress < 1) rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [shouldAnimate, clamped])

  // Re-trigger the count-up whenever the target score changes.
  const [prevClamped, setPrevClamped] = useState(clamped)
  if (clamped !== prevClamped) {
    setPrevClamped(clamped)
    if (shouldAnimate) setAnimScore(0)
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-end justify-between gap-space-sm">
        <span className="font-display text-label-sm font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          {label || `Fighter ${side}`}
        </span>
        {showNumber && (
          <span className="flex items-baseline gap-1">
            <span
              className={`font-display text-[32px] leading-none font-bold tabular-nums ${t.text}`}
            >
              {displayScore.toFixed(1)}
            </span>
            <span className="font-display text-label-sm text-on-surface-variant">
              /{maxScore}
            </span>
          </span>
        )}
      </div>
      <div
        className="flex items-center gap-1"
        role="meter"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={maxScore}
        aria-label={label || `Fighter ${side} score`}
      >
        {Array.from({ length: segments }, (_, index) => {
          const isFilled = index < visibleSegments
          return (
            <span
              key={index}
              className={[
                'h-2.5 flex-1 rounded-sm transition-colors duration-150',
                isFilled ? `${t.fill} ${t.glowShadow}` : 'bg-surface-variant',
              ].join(' ')}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ScoreMeter
