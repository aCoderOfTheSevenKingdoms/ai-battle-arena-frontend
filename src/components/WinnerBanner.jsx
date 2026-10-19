import ConfettiBurst from './ConfettiBurst'

/**
 * Dramatic WINNER! / DRAW! announcement banner with trophy or handshake
 * iconography and an optional confetti burst.
 *
 * @param {object} props
 * @param {'fighter1' | 'fighter2' | 'draw'} props.outcome
 * @param {string} [props.winnerLabel='FIGHTER 1'] Name of the winning fighter.
 * @param {string} [props.subtitle] One-line praise / explanation.
 * @param {string} [props.tag='DECISIVE KNOCKOUT'] Small chip next to the title.
 * @param {boolean} [props.showConfetti=true]
 * @param {React.ReactNode} [props.actions] Extra buttons on the right.
 * @param {string} [props.className]
 */
function WinnerBanner({
  outcome,
  winnerLabel = 'FIGHTER 1',
  subtitle,
  tag,
  showConfetti = true,
  actions,
  className = '',
}) {
  const isDraw = outcome === 'draw'
  const isTwo = outcome === 'fighter2'

  const accentText = isDraw ? 'text-on-surface' : isTwo ? 'text-secondary' : 'text-primary'
  const accentChip = isDraw
    ? 'bg-tertiary text-on-tertiary'
    : isTwo
      ? 'bg-secondary text-on-secondary'
      : 'bg-primary text-on-primary'
  const accentIconBg = isDraw
    ? 'bg-tertiary-container text-on-tertiary-container'
    : 'bg-tertiary text-on-tertiary'
  const gradient = isDraw
    ? 'bg-surface-container'
    : isTwo
      ? 'bg-gradient-to-r from-secondary-container/20 via-surface-container to-surface-container'
      : 'bg-gradient-to-r from-primary-container/20 via-surface-container to-surface-container'

  const headline = isDraw ? 'DRAW!' : `${winnerLabel} WINS!`
  const defaultTag = isDraw ? 'PERFECT PARITY' : tag || 'DECISIVE KNOCKOUT'
  const subTag = isDraw ? 'ARBITER VERDICT: DEAD HEAT' : 'MATCH VERDICT CERTIFIED'
  const iconName = isDraw ? 'handshake' : 'emoji_events'

  return (
    <div
      className={[
        'relative overflow-hidden rounded-xl p-space-lg shadow-2xl panel-inset',
        'flex flex-col sm:flex-row items-center justify-between gap-space-md',
        gradient,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-live="polite"
    >
      {showConfetti && <ConfettiBurst />}

      <div className="flex items-center gap-space-md">
        <div
          className={`w-16 h-16 shrink-0 rounded-xl flex items-center justify-center font-bold ${accentIconBg} ${
            isDraw ? '' : 'shadow-[0_0_24px_rgba(255,177,71,0.6)]'
          }`}
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[36px]">
            {iconName}
          </span>
        </div>
        <div className="flex flex-col gap-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-space-xs">
            <span
              className={`px-2 py-0.5 rounded font-display text-label-caps font-bold uppercase tracking-[0.12em] ${accentChip}`}
            >
              {defaultTag}
            </span>
            <span className="font-display text-label-caps font-bold uppercase tracking-[0.12em] text-tertiary">
              {subTag}
            </span>
          </div>
          <h2
            className={`font-display text-display-hero-mobile sm:text-display-hero font-bold uppercase ${accentText} ${
              isDraw ? '' : isTwo ? 'text-glow-fighter-2' : 'text-glow-fighter-1'
            }`}
          >
            {headline}
          </h2>
          {subtitle && (
            <p className="font-body text-body-md text-on-surface-variant max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex items-center gap-space-sm shrink-0">{actions}</div>}
    </div>
  )
}

export default WinnerBanner
