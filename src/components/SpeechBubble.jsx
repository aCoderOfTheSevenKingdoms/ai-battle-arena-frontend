import { useEffect, useState } from 'react'
import { TONE } from '../lib/tones'

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
 * Speech-bubble style feedback box with a typewriter or fade reveal.
 * While `typing` is true with no text yet, bouncing dots are shown.
 *
 * @param {object} props
 * @param {string} [props.text='']
 * @param {'fighter1' | 'fighter2' | 'judge' | 'neutral' | 'error'} [props.tone='judge']
 * @param {'typewriter' | 'fade'} [props.mode='typewriter']
 * @param {string} [props.label] Small caps label, e.g. "ARBITER APPRAISAL".
 * @param {string} [props.icon='gavel'] Material Symbols icon name.
 * @param {boolean} [props.typing=false] Force the typing-dots placeholder.
 * @param {number} [props.speedMs=16] ms per character in typewriter mode.
 * @param {string} [props.className]
 */
function SpeechBubble({
  text = '',
  tone = 'judge',
  mode = 'typewriter',
  label,
  icon = 'gavel',
  typing = false,
  speedMs = 16,
  className = '',
}) {
  const t = TONE[tone]
  const shouldType = mode === 'typewriter' && !prefersReducedMotion() && text.length > 0

  const [prevText, setPrevText] = useState(text)
  const [revealed, setRevealed] = useState(text.length)

  // Restart the reveal when the text changes (render-phase adjustment).
  if (text !== prevText) {
    setPrevText(text)
    setRevealed(shouldType ? 0 : text.length)
  }

  const done = revealed >= text.length

  useEffect(() => {
    if (!shouldType || done) return undefined
    const id = setInterval(() => {
      setRevealed((current) => {
        const next = current + 1
        if (next >= text.length) clearInterval(id)
        return Math.min(next, text.length)
      })
    }, speedMs)
    return () => clearInterval(id)
  }, [shouldType, done, text, speedMs])

  const showDots = typing && !text

  return (
    <div
      className={[
        'flex items-start gap-space-sm p-space-md rounded-lg bg-surface-container',
        'border border-outline-variant/50 panel-inset',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span aria-hidden="true" className={`material-symbols-outlined text-[20px] mt-0.5 ${t.text}`}>
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        {label && (
          <span
            className={`font-display text-label-caps font-bold uppercase tracking-[0.12em] ${t.text}`}
          >
            {label}
          </span>
        )}
        {showDots ? (
          <span className="inline-flex items-center gap-1 py-1" aria-label="Typing">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                aria-hidden="true"
                className={`w-1.5 h-1.5 rounded-full animate-arena-aura ${t.fill}`}
                style={{ animationDelay: `${dot * 0.2}s` }}
              />
            ))}
          </span>
        ) : shouldType && !done ? (
          <p className="font-body text-body-md text-on-surface">
            {text.slice(0, revealed)}
            <span
              aria-hidden="true"
              className={`inline-block w-0.5 h-4 ml-0.5 animate-arena-caret ${t.fill}`}
            />
          </p>
        ) : (
          <p
            className={`font-body text-body-md text-on-surface ${
              mode === 'fade' ? 'animate-arena-fade-in' : ''
            }`}
          >
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default SpeechBubble
