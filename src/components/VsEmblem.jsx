/**
 * Glowing "VS" emblem placed between the two fighters.
 *
 * @param {object} props
 * @param {string} [props.label='MATCH READY'] Status text under the emblem.
 * @param {'md' | 'lg'} [props.size='md']
 * @param {string} [props.className]
 */
function VsEmblem({ label = 'MATCH READY', size = 'md', className = '' }) {
  const SIZES = {
    md: { circle: 'w-14 h-14', text: 'text-headline-lg' },
    lg: { circle: 'w-20 h-20', text: 'text-headline-lg-mobile sm:text-headline-lg' },
  }
  const s = SIZES[size]

  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${className}`}
      aria-hidden="true"
    >
      <div
        className={`relative ${s.circle} rounded-full bg-surface-container-high flex items-center justify-center shadow-lg`}
      >
        <span
          className={`font-display ${s.text} font-bold tracking-tighter text-tertiary text-glow-judge`}
        >
          VS
        </span>
        <span className="absolute -top-1 w-3 h-3 rounded-full bg-tertiary-container animate-ping" />
      </div>
      {label && (
        <span className="mt-1 font-display text-label-caps font-bold uppercase tracking-[0.12em] text-on-surface-variant">
          {label}
        </span>
      )}
    </div>
  )
}

export default VsEmblem
