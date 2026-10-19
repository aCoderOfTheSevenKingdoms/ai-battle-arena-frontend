import { FIGHTER_SIDES } from '../lib/constants'

/**
 * Square neon fighter portrait with pose variants for every battle phase.
 * Fighter 1 is always cyan, Fighter 2 always magenta.
 *
 * @param {object} props
 * @param {'1' | '2'} [props.side='1']
 * @param {'idle' | 'charging' | 'waiting' | 'winner' | 'loser' | 'knockedOut'} [props.variant='idle']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {string} [props.name] Name shown under the portrait.
 * @param {string} [props.icon] Material Symbols icon name. Defaults per side.
 * @param {() => void} [props.onClick] Optional click reaction (e.g. bounce).
 * @param {string} [props.className]
 */
function FighterAvatar({
  side = FIGHTER_SIDES.ONE,
  variant = 'idle',
  size = 'md',
  name,
  icon,
  onClick,
  className = '',
}) {
  const isTwo = side === FIGHTER_SIDES.TWO
  const accentText = isTwo ? 'text-secondary' : 'text-primary'
  const accentBg = isTwo ? 'bg-secondary' : 'bg-primary'
  const accentOn = isTwo ? 'text-on-secondary' : 'text-on-primary'
  const accentGlow = isTwo ? 'shadow-[0_0_30px_rgba(255,176,207,0.25)]' : 'shadow-[0_0_30px_rgba(34,211,238,0.25)]'
  const accentGlowStrong = isTwo
    ? 'shadow-[0_0_40px_rgba(209,1,131,0.55)]'
    : 'shadow-[0_0_40px_rgba(34,211,238,0.55)]'

  const SIZES = {
    sm: { box: 'w-16 h-16 rounded-xl', icon: 'text-[32px]' },
    md: { box: 'w-36 h-36 rounded-2xl', icon: 'text-[72px]' },
    lg: { box: 'w-44 h-44 rounded-2xl', icon: 'text-[88px]' },
  }
  const s = SIZES[size]

  const VARIANT = {
    idle: `animate-arena-float ${accentGlow}`,
    charging: `${accentGlowStrong}`,
    waiting: `${accentGlow} opacity-80`,
    winner: `glow-judge ${accentGlowStrong} ring-4 ring-tertiary`,
    loser: `${accentGlow} opacity-60 saturate-50`,
    knockedOut: `${accentGlow} rotate-3 opacity-70 ring-2 ring-error`,
  }

  const defaultIcon = isTwo ? 'psychology' : 'smart_toy'
  const displayIcon = icon || defaultIcon
  const label = isTwo ? 'PLAYER 2' : 'PLAYER 1'
  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={onClick ? `React to ${name || label}` : undefined}
      className={`relative inline-flex flex-col items-center gap-space-sm ${className}`}
    >
      <div
        className={[
          `relative ${s.box} bg-surface-container-high flex items-center justify-center`,
          VARIANT[variant],
        ].join(' ')}
      >
        {/* Energy aura behind the glyph */}
        {variant === 'charging' && (
          <span
            aria-hidden="true"
            className={`absolute inset-0 rounded-[inherit] bg-current opacity-30 animate-arena-aura ${isTwo ? 'text-secondary' : 'text-primary'}`}
          />
        )}

        {variant === 'winner' && (
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute -top-3 -right-3 text-tertiary text-[28px] drop-shadow-[0_0_10px_rgba(255,177,71,0.8)]"
          >
            emoji_events
          </span>
        )}

        {variant === 'knockedOut' && (
          <>
            <span aria-hidden="true" className="absolute -top-2 -left-2 text-tertiary text-sm">
              💫
            </span>
            <span aria-hidden="true" className="absolute -bottom-2 -right-2 text-primary text-sm">
              ✦
            </span>
          </>
        )}

        <span
          aria-hidden="true"
          className={`material-symbols-outlined ${s.icon} ${accentText} relative z-10 ${
            variant === 'charging' ? 'animate-pulse' : ''
          }`}
        >
          {displayIcon}
        </span>

        {/* Orbiting charge particles */}
        {variant === 'charging' && (
          <>
            <span
              aria-hidden="true"
              className={`absolute w-2 h-2 rounded-full ${accentBg} animate-arena-aura`}
              style={{ top: '10%', left: '15%' }}
            />
            <span
              aria-hidden="true"
              className={`absolute w-1.5 h-1.5 rounded-full ${accentBg} animate-arena-aura`}
              style={{ bottom: '12%', right: '14%', animationDelay: '0.6s' }}
            />
          </>
        )}

        <span
          className={`absolute -bottom-2 px-2.5 py-0.5 rounded font-display text-label-caps font-bold uppercase tracking-[0.12em] ${accentBg} ${accentOn}`}
        >
          {label}
        </span>
      </div>

      {name && (
        <span className={`font-display text-headline-md uppercase ${accentText}`}>{name}</span>
      )}
    </Tag>
  )
}

export default FighterAvatar
