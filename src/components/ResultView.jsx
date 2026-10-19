import { useCallback, useEffect, useRef, useState } from 'react'
import WinnerBanner from './WinnerBanner'
import FighterResultCard from './FighterResultCard'
import Button from './Button'
import { REVEAL_DURATION_MS } from '../lib/constants'

const STAGE_CARDS_DELAY_MS = 0
const STAGE_SCORE_DELAY_MS = 900
const STAGE_FEEDBACK_DELAY_MS = 2000
const STAGE_WINNER_DELAY_MS = 3000
const REDUCED_FINISH_DELAY_MS = 300

/**
 * True when the OS asks for reduced motion.
 * @returns {boolean}
 */
function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  )
}

/**
 * Post-battle reveal: staged entrance of the two fighter cards, then score
 * meters, then judge feedback, then the winner announcement with confetti and
 * the recommended ribbon. The outcome is already normalized by the caller —
 * this view never derives the winner itself.
 *
 * @param {object} props
 * @param {import('../lib/types.js').Battle} props.battle
 * @param {import('../lib/types.js').Outcome} props.outcome
 * @param {string} [props.winnerLabel] Defaults to DRAW / FIGHTER 1 / FIGHTER 2.
 * @param {boolean} [props.animated=false] True while the live battle is in its revealing phase.
 * @param {() => void} [props.onRevealComplete] Fires exactly once per reveal timeline, only when animated.
 * @param {boolean} [props.compact=false] History rendering: static, no confetti, no skip, never completes.
 * @param {string} [props.className='']
 */
function ResultView({
  battle,
  outcome,
  winnerLabel = outcome === 'draw' ? 'DRAW' : outcome === 'fighter2' ? 'FIGHTER 2' : 'FIGHTER 1',
  animated = false,
  onRevealComplete,
  compact = false,
  className = '',
}) {
  const reduced = prefersReducedMotion()
  const staged = animated && !compact
  // Changes only when a new reveal should start; null while static.
  const revealKey = staged ? battle.id : null

  const [stage, setStage] = useState(() =>
    animated && !compact && !prefersReducedMotion() ? 0 : 4,
  )
  const [prevRevealKey, setPrevRevealKey] = useState(revealKey)
  const doneRef = useRef(false)
  const onCompleteRef = useRef(onRevealComplete)

  // Always call the callback that was current at completion time, without
  // restarting the timeline when the parent re-creates the function.
  useEffect(() => {
    onCompleteRef.current = onRevealComplete
  })

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onCompleteRef.current?.()
  }, [])

  // Rewind to stage 0 before paint when a new reveal begins, so no stale
  // frame of the previous result flashes through.
  if (revealKey !== prevRevealKey) {
    setPrevRevealKey(revealKey)
    if (revealKey !== null) setStage(0)
  }

  // The completion guard belongs to exactly one reveal timeline.
  useEffect(() => {
    doneRef.current = false
  }, [revealKey])

  useEffect(() => {
    if (revealKey === null) return undefined

    const timers = []
    if (reduced) {
      timers.push(setTimeout(finish, REDUCED_FINISH_DELAY_MS))
    } else {
      // Math.max keeps a late tick from rewinding a skipped-ahead stage.
      timers.push(setTimeout(() => setStage((s) => Math.max(s, 1)), STAGE_CARDS_DELAY_MS))
      timers.push(setTimeout(() => setStage((s) => Math.max(s, 2)), STAGE_SCORE_DELAY_MS))
      timers.push(setTimeout(() => setStage((s) => Math.max(s, 3)), STAGE_FEEDBACK_DELAY_MS))
      timers.push(setTimeout(() => setStage((s) => Math.max(s, 4)), STAGE_WINNER_DELAY_MS))
      timers.push(setTimeout(finish, REVEAL_DURATION_MS))
    }
    return () => timers.forEach((id) => clearTimeout(id))
  }, [revealKey, reduced, finish])

  // Static, compact, and reduced-motion renders always show the full result.
  const revealStage = staged && !reduced ? stage : 4
  const entrance = staged ? 'animate-arena-fade-in' : ''
  const judgement = battle.judgement

  const handleSkip = () => {
    setStage(4)
    finish()
  }

  return (
    <section
      aria-label="Battle result"
      className={['flex flex-col gap-space-lg', className].filter(Boolean).join(' ')}
    >
      <p aria-live="polite" className="sr-only">
        Winner: {winnerLabel}
      </p>

      {revealStage >= 1 && (
        <div className={entrance}>
          {revealStage >= 4 && (
            <WinnerBanner
              outcome={outcome}
              winnerLabel={winnerLabel}
              showConfetti={animated && !compact && !reduced}
              className={entrance}
            />
          )}
        </div>
      )}

      <div
        className={[
          'grid grid-cols-1 gap-space-lg',
          compact ? '' : 'lg:grid-cols-2',
        ].join(' ')}
      >
        <FighterResultCard
          side="1"
          title="FIGHTER 1"
          solution={battle.solution_1}
          score={judgement.solution_1.score}
          feedback={judgement.solution_1.feedback}
          outcome={outcome}
          recommended={outcome === 'fighter1'}
          visible={revealStage >= 1}
          compact={compact}
          stage={revealStage}
        />
        <FighterResultCard
          side="2"
          title="FIGHTER 2"
          solution={battle.solution_2}
          score={judgement.solution_2.score}
          feedback={judgement.solution_2.feedback}
          outcome={outcome}
          recommended={outcome === 'fighter2'}
          visible={revealStage >= 1}
          compact={compact}
          stage={revealStage}
        />
      </div>

      {staged && !reduced && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" icon="fast_forward" onClick={handleSkip}>
            Skip animation
          </Button>
        </div>
      )}
    </section>
  )
}

export default ResultView
