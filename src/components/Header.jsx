import HudChip from './HudChip'

/**
 * Sticky top bar: app wordmark + tagline on the left, session battle-count
 * HUD on the right. Presentational only — the caller owns `battleCount`.
 *
 * @param {object} props
 * @param {number} [props.battleCount=0] Battles fought this session.
 * @param {string} [props.className]
 */
function Header({ battleCount = 0, className = '' }) {
  const paddedCount = String(battleCount).padStart(2, '0')

  return (
    <header
      className={[
        'w-full sticky top-0 z-40',
        'flex items-center justify-between gap-space-sm md:gap-space-md',
        'px-gutter py-space-sm min-h-14 md:min-h-16',
        'bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-center gap-space-sm md:gap-space-md min-w-0">
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-primary text-[20px] md:text-[24px] leading-none shrink-0"
        >
          swords
        </span>
        <div className="flex flex-col gap-space-xs min-w-0">
          <span className="font-display font-bold uppercase leading-none tracking-wider text-sm sm:text-base md:text-headline-md text-primary text-glow-fighter-1 truncate">
            AI Battle Arena
          </span>
          <span className="hidden sm:block font-display text-label-caps text-on-surface-variant truncate">
            DUAL MODEL SYNTHESIS &amp; JUDICIAL BENCHMARK
          </span>
        </div>
      </div>

      <span
        aria-label={`${battleCount} battles this session`}
        className="inline-flex shrink-0"
      >
        <HudChip tone="judge" dot>
          Battles: {paddedCount}
        </HudChip>
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-fighter-1/50 via-judge/40 to-fighter-1/50"
      />
    </header>
  )
}

export default Header
