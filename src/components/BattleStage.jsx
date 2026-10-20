import { BATTLE_PHASES } from '../lib/constants.js'
import ErrorStage from './ErrorStage'
import IdleStage from './IdleStage'
import LoadingStage from './LoadingStage'
import ResultView from './ResultView'
import RoundCountdown from './RoundCountdown'

const { IDLE, SUBMITTING, GENERATING, JUDGING, REVEALING, DONE, ERROR } = BATTLE_PHASES

/** Screen-reader line announced when the phase changes (stable text, no ticker spam). */
const ANNOUNCEMENTS = {
  [IDLE]: 'Arena idle. Waiting for a problem.',
  [SUBMITTING]: 'Round 1 starting.',
  [GENERATING]: 'Fighters are generating.',
  [JUDGING]: 'Judge is deliberating.',
  [REVEALING]: 'Result reveal in progress.',
  [DONE]: 'Battle complete.',
  [ERROR]: 'The arena crashed. The round was not decided.',
}

/**
 * The active battle area: renders the view that matches the current phase.
 *
 * @param {object} props
 * @param {string} props.phase One of `BATTLE_PHASES`.
 * @param {string} props.problem Submitted problem (challenge card + retry source).
 * @param {import('../lib/types.js').Battle | null} props.battle Completed battle once resolved.
 * @param {import('../lib/types.js').BattleError | null} props.error Present in the error phase.
 * @param {import('../lib/types.js').Outcome} props.outcome Normalized winner side.
 * @param {import('../lib/types.js').ModelRoster} props.models Real model names, with generic fallbacks.
 * @param {() => void} props.onRevealComplete Ends the reveal phase.
 * @param {() => void} props.onRetry Resubmits the same problem after an error.
 * @param {() => void} props.onAbort Leaves the error state for idle.
 */
function BattleStage({
  phase,
  problem,
  battle,
  error,
  outcome,
  models,
  onRevealComplete,
  onRetry,
  onAbort,
}) {
  return (
    <section
      aria-label="Battle stage"
      className="w-full rounded-xl bg-surface-container-low/70 panel-inset p-space-md sm:p-space-lg"
    >
      <p aria-live="polite" className="sr-only">
        {ANNOUNCEMENTS[phase] ?? ''}
      </p>

      {phase === IDLE && <IdleStage models={models} />}

      {phase === SUBMITTING && <RoundCountdown />}

      {(phase === GENERATING || phase === JUDGING) && (
        <LoadingStage phase={phase} problem={problem} models={models} />
      )}

      {(phase === REVEALING || phase === DONE) && battle && (
        <ResultView
          battle={battle}
          outcome={outcome}
          models={models}
          animated={phase === REVEALING}
          onRevealComplete={onRevealComplete}
        />
      )}

      {phase === ERROR && error && (
        <ErrorStage
          error={error}
          problem={problem}
          models={models}
          onRetry={onRetry}
          onAbort={onAbort}
        />
      )}
    </section>
  )
}

export default BattleStage
