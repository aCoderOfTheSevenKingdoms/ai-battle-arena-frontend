import { TONE } from '../lib/tones'

/**
 * Compact HUD capsule for meta labels ("ARMED", "STATUS: LISTENING"...),
 * optionally with a glowing pulse dot.
 *
 * @param {object} props
 * @param {'fighter1' | 'fighter2' | 'judge' | 'neutral' | 'error'} [props.tone='neutral']
 * @param {boolean} [props.dot=false] Show a pulsing status dot.
 * @param {string} [props.icon] Material Symbols icon name (rendered before children).
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
function HudChip({ tone = 'neutral', dot = false, icon, children, className = '' }) {
  const t = TONE[tone]

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded',
        'font-display text-label-caps font-bold uppercase tracking-[0.12em]',
        t.soft,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={`inline-block w-2 h-2 rounded-full animate-pulse ${t.fill}`}
        />
      )}
      {icon && (
        <span aria-hidden="true" className="material-symbols-outlined text-[14px] leading-none">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}

export default HudChip
