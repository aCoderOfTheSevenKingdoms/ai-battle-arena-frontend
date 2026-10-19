/**
 * Circular gold judge portrait. Deliberating adds a pulsing spotlight;
 * verdict snaps to a firm amber glow.
 *
 * @param {object} props
 * @param {'idle' | 'deliberating' | 'verdict'} [props.variant='idle']
 * @param {'md' | 'lg'} [props.size='md']
 * @param {string} [props.icon='gavel'] Material Symbols icon name.
 * @param {string} [props.label] Optional caption under the portrait.
 * @param {() => void} [props.onClick] Optional idle mini-interaction.
 * @param {string} [props.className]
 */
function JudgeAvatar({
  variant = 'idle',
  size = 'md',
  icon = 'gavel',
  label,
  onClick,
  className = '',
}) {
  const SIZES = {
    md: { box: 'w-20 h-20', icon: 'text-[36px]' },
    lg: { box: 'w-24 h-24', icon: 'text-[48px]' },
  }
  const s = SIZES[size]

  const VARIANT = {
    idle: 'shadow-[0_0_16px_rgba(255,177,71,0.25)]',
    deliberating: 'shadow-[0_0_30px_rgba(255,177,71,0.5)]',
    verdict: 'shadow-[0_0_36px_rgba(255,177,71,0.7)] ring-4 ring-tertiary-container',
  }

  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={onClick ? 'Poke the judge' : undefined}
      className={`inline-flex flex-col items-center gap-space-sm ${className}`}
    >
      <div
        className={[
          `relative ${s.box} rounded-full bg-surface-container flex items-center justify-center`,
          VARIANT[variant],
        ].join(' ')}
      >
        {variant === 'deliberating' && (
          <span
            aria-hidden="true"
            className="absolute inset-[-8px] rounded-full bg-tertiary-container/20 blur-md animate-arena-aura"
          />
        )}
        <span
          aria-hidden="true"
          className={`material-symbols-outlined ${s.icon} text-tertiary relative z-10 ${
            variant === 'deliberating' ? 'animate-pulse' : ''
          }`}
        >
          {icon}
        </span>
        {variant === 'verdict' && (
          <span
            aria-hidden="true"
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-[14px] material-symbols-outlined"
          >
            check
          </span>
        )}
      </div>
      {label && (
        <span className="font-display text-label-caps font-bold uppercase tracking-[0.12em] text-tertiary">
          {label}
        </span>
      )}
    </Tag>
  )
}

export default JudgeAvatar
