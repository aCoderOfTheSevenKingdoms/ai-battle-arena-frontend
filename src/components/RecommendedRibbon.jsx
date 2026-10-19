/**
 * Amber "RECOMMENDED" ribbon pinned to the winning fighter's card.
 * `pinned` renders a diagonal corner ribbon (parent must be relative);
 * otherwise an inline badge.
 *
 * @param {object} props
 * @param {string} [props.label='RECOMMENDED CODE']
 * @param {boolean} [props.pinned=false] Diagonal corner variant.
 * @param {string} [props.className]
 */
function RecommendedRibbon({ label = 'RECOMMENDED CODE', pinned = false, className = '' }) {
  if (pinned) {
    return (
      <span
        className={[
          'absolute -top-1 -right-10 z-20 w-36 py-1 text-center',
          'rotate-45 bg-tertiary text-on-tertiary',
          'font-display text-label-caps font-bold uppercase tracking-[0.12em]',
          'shadow-[0_0_16px_rgba(255,177,71,0.5)]',
          className,
        ].join(' ')}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded',
        'bg-tertiary text-on-tertiary',
        'font-display text-label-caps font-bold uppercase tracking-[0.12em]',
        'shadow-[0_0_16px_rgba(255,177,71,0.4)]',
        className,
      ].join(' ')}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[14px] leading-none">
        military_tech
      </span>
      {label}
    </span>
  )
}

export default RecommendedRibbon
