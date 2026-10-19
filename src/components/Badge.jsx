import { TONE } from '../lib/tones'

/**
 * Status badge capsule with a 2px border — used for winner badges,
 * certifications, and fighter allegiance chips.
 *
 * @param {object} props
 * @param {'fighter1' | 'fighter2' | 'judge' | 'neutral' | 'error'} [props.tone='neutral']
 * @param {string} [props.icon] Material Symbols icon name.
 * @param {React.ReactNode} props.children
 * @param {'sm' | 'md'} [props.size='sm']
 * @param {string} [props.className]
 */
function Badge({ tone = 'neutral', icon, children, size = 'sm', className = '' }) {
  const t = TONE[tone]
  const SIZES = {
    sm: 'px-2 py-0.5 text-label-caps',
    md: 'px-2.5 py-1 text-label-caps',
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded border-2 font-display font-bold uppercase tracking-[0.12em]',
        t.text,
        t.border,
        SIZES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <span aria-hidden="true" className="material-symbols-outlined text-[14px] leading-none">
          {icon}
        </span>
      )}
      {children}
    </span>
  )
}

export default Badge
