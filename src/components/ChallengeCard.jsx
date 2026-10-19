import HudChip from './HudChip'

/**
 * Shows the user's problem statement in a "challenge card" during loading
 * so they can re-read it while the fighters generate.
 *
 * @param {object} props
 * @param {string} props.problem
 * @param {string} [props.phaseLabel] e.g. "PHASE: INFERENCE GENERATION".
 * @param {'fighter1' | 'fighter2' | 'judge' | 'neutral' | 'error'} [props.tone='judge']
 * @param {string} [props.className]
 */
function ChallengeCard({ problem, phaseLabel, tone = 'judge', className = '' }) {
  return (
    <div
      className={[
        'w-full flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm',
        'p-space-md rounded-xl bg-surface-container panel-inset shadow-md',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start gap-space-sm min-w-0">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px] mt-0.5">
          bolt
        </span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-display text-label-caps font-bold uppercase tracking-[0.12em] text-on-surface-variant">
            ACTIVE CONFLICT:
          </span>
          <p className="font-body text-body-code font-semibold text-on-surface break-words">
            &ldquo;{problem}&rdquo;
          </p>
        </div>
      </div>
      {phaseLabel && <HudChip tone={tone}>{phaseLabel}</HudChip>}
    </div>
  )
}

export default ChallengeCard
