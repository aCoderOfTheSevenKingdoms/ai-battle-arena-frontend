import { TONE, toneForSide } from '../lib/tones'

/**
 * Indeterminate "charging" progress bar. The fill slides forever and must
 * never be driven toward 100% — it only signals "still working".
 *
 * @param {object} props
 * @param {'1' | '2' | 'fighter1' | 'fighter2' | 'judge' | 'neutral' | 'error'} [props.tone='fighter1']
 * @param {'sm' | 'md'} [props.size='md'] Bar thickness.
 * @param {string} [props.label] Optional caption above the bar.
 * @param {string} [props.className]
 */
function IndeterminateProgressBar({ tone = 'fighter1', size = 'md', label, className = '' }) {
  const toneKey = tone === '1' || tone === '2' ? toneForSide(tone) : tone
  const t = TONE[toneKey]
  const heights = { sm: 'h-2', md: 'h-3' }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="font-display text-label-sm font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          {label}
        </span>
      )}
      <div
        className={`w-full ${heights[size]} rounded-full bg-surface-container-lowest overflow-hidden p-0.5`}
        role="progressbar"
        aria-label={label || 'Loading'}
        aria-valuetext="Loading"
      >
        <div className="relative h-full w-full">
          <div
            className={`absolute inset-y-0 left-0 w-1/3 rounded-full animate-arena-shimmer ${t.fill} ${t.glowShadow}`}
          />
        </div>
      </div>
    </div>
  )
}

export default IndeterminateProgressBar
