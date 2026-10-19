import { useEffect, useState } from 'react'
import { BATTLE_PHASES, REASSURANCE_AFTER_MS, STILL_WORKING_AFTER_MS } from '../lib/constants.js'
import ChallengeCard from './ChallengeCard'
import FighterLoadingColumn from './FighterLoadingColumn'
import IndeterminateProgressBar from './IndeterminateProgressBar'
import JudgeAvatar from './JudgeAvatar'
import SpeechBubble from './SpeechBubble'
import StatusTicker from './StatusTicker'

const GENERATING_LINES = [
  'Fighter 1 is sharpening its tokens...',
  'Fighter 2 is warming up its neurons...',
  'Both fighters are drafting their opening moves...',
  'Cross-checking assumptions against the problem...',
]

const JUDGING_LINES = [
  'The Judge is reading both answers...',
  'Weighing creativity vs correctness...',
  'Consulting the scrolls of best practices...',
  'Counting edge cases on the abacus...',
]

const EMOTES = {
  1: ['Hmph. Bring it on.', 'My answer is already better.'],
  2: ['Just watch this round.', 'Tokens in, victory out.'],
  judge: ['Order in the arena!', 'I am weighing... patiently.'],
}

const MS_PER_SECOND = 1000

/**
 * @param {'1' | '2' | 'judge'} side Which cast member reacts.
 * @returns {string} A short idle reaction line.
 */
const randomEmote = (side) => {
  const lines = EMOTES[side]
  return lines[Math.floor(Math.random() * lines.length)]
}

/**
 * Loading phases: Phase A "fighters generating" and Phase B
 * "judge deliberating" (simulated client-side, never real server progress).
 *
 * @param {object} props
 * @param {'generating' | 'judging'} props.phase
 * @param {string} props.problem Shown in the challenge card while waiting.
 */
function LoadingStage({ phase, problem }) {
  const [elapsedMs, setElapsedMs] = useState(0)
  const [emote, setEmote] = useState(null)

  // Elapsed-time clock for the 20s/45s reassurance messages.
  useEffect(() => {
    const startedAt = Date.now()
    const timer = setInterval(() => setElapsedMs(Date.now() - startedAt), MS_PER_SECOND)
    return () => clearInterval(timer)
  }, [])

  // Idle emote bubbles fade out on their own.
  useEffect(() => {
    if (!emote) return undefined
    const timer = setTimeout(() => setEmote(null), 1600)
    return () => clearTimeout(timer)
  }, [emote])

  const isJudging = phase === BATTLE_PHASES.JUDGING
  const fighterVariant = isJudging ? 'waiting' : 'charging'

  return (
    <div className="flex flex-col items-center gap-space-lg py-space-md">
      <ChallengeCard
        problem={problem}
        phaseLabel={
          isJudging ? 'PHASE: JUDICIAL REVIEW' : 'PHASE: INFERENCE GENERATION'
        }
        tone={isJudging ? 'judge' : 'neutral'}
      />

      <div className="flex w-full items-start justify-center gap-space-sm sm:gap-space-lg">
        <FighterLoadingColumn
          side="1"
          variant={fighterVariant}
          emote={emote?.side === 1 ? emote.text : null}
          onReact={() => setEmote({ side: 1, text: randomEmote('1') })}
        />

        <div className="flex flex-col items-center gap-space-md self-center">
          <JudgeAvatar
            variant={isJudging ? 'deliberating' : 'idle'}
            size={isJudging ? 'lg' : 'md'}
            label={isJudging ? 'THE ARBITER IS DELIBERATING' : 'THE ARBITER'}
            onClick={() => setEmote({ side: 'judge', text: randomEmote('judge') })}
          />
          {emote?.side === 'judge' && (
            <SpeechBubble text={emote.text} tone="judge" mode="fade" />
          )}
        </div>

        <FighterLoadingColumn
          side="2"
          variant={fighterVariant}
          emote={emote?.side === 2 ? emote.text : null}
          onReact={() => setEmote({ side: 2, text: randomEmote('2') })}
        />
      </div>

      {!isJudging && (
        <div className="grid w-full max-w-3xl grid-cols-1 gap-space-md sm:grid-cols-2">
          <IndeterminateProgressBar tone="1" label="FIGHTER 1 // SYNTHESIZING" />
          <IndeterminateProgressBar tone="2" label="FIGHTER 2 // SYNTHESIZING" />
        </div>
      )}

      <StatusTicker
        lines={isJudging ? JUDGING_LINES : GENERATING_LINES}
        tone={isJudging ? 'judge' : 'neutral'}
        icon={isJudging ? 'gavel' : 'terminal'}
        className="w-full max-w-xl justify-center"
      />

      <p className="min-h-5 text-body-md text-on-surface-variant" aria-live="polite">
        {elapsedMs >= STILL_WORKING_AFTER_MS
          ? 'Still working — long battles are normal. The verdict will land.'
          : elapsedMs >= REASSURANCE_AFTER_MS
            ? 'This can take a moment — two answers and a verdict are in flight.'
            : ''}
      </p>
    </div>
  )
}

export default LoadingStage
