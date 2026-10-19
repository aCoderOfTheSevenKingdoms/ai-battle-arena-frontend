import FighterAvatar from './FighterAvatar'
import Badge from './Badge'
import RecommendedRibbon from './RecommendedRibbon'
import MarkdownBlock from './MarkdownBlock'
import ScoreMeter from './ScoreMeter'
import SpeechBubble from './SpeechBubble'
import { TONES } from '../lib/constants'

/**
 * One fighter's post-battle result panel: avatar + title + score badge,
 * the full scrollable solution, the score meter, and the arbiter's feedback.
 * Presentational only — the parent decides when each part is revealed.
 *
 * @param {object} props
 * @param {'1' | '2'} props.side Fighter side — picks the accent color.
 * @param {string} props.title Header title, e.g. "FIGHTER 1".
 * @param {string} props.solution Full markdown solution.
 * @param {number} props.score Judge score (0..MAX_SCORE).
 * @param {string} props.feedback Judge feedback for this solution.
 * @param {import('../lib/types.js').Outcome} props.outcome Normalized battle outcome.
 * @param {boolean} [props.recommended=false] Pins the RECOMMENDED ribbon to this card.
 * @param {boolean} [props.visible=true] When false the card renders nothing (staged entrance).
 * @param {boolean} [props.compact=false] History rendering: no entrance animation, fade instead of typewriter.
 * @param {number} [props.stage=4] Reveal stage: 1 cards, 2 score meters, 3 feedback, 4 verdict.
 */
function FighterResultCard({
  side,
  title,
  solution,
  score,
  feedback,
  outcome,
  recommended = false,
  visible = true,
  compact = false,
  stage = 4,
}) {
  if (!visible) return null

  const isTwo = side === '2'
  const isDraw = outcome === 'draw'
  const won = (side === '1' && outcome === 'fighter1') || (side === '2' && outcome === 'fighter2')
  // Glow, trophy, dimming, and ribbon all land with the stage-4 announcement.
  const verdict = stage >= 4
  const showGlow = verdict && won
  const isLoser = verdict && !isDraw && !won
  const avatarVariant = !verdict ? 'idle' : won ? 'winner' : isDraw ? 'idle' : 'loser'

  const accentText = isTwo ? 'text-secondary' : 'text-primary'
  const badgeTone = isTwo ? TONES.FIGHTER_2 : TONES.FIGHTER_1
  const accentBorder = isTwo ? 'border border-secondary/40' : 'border border-primary/40'

  return (
    <article
      className={[
        'relative w-full overflow-hidden rounded-xl',
        showGlow && !isDraw ? (isTwo ? 'glow-fighter-2' : 'glow-fighter-1') : '',
        compact ? '' : 'animate-arena-fade-in',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Decorative shell: carries accent, panel sheen, and the loser dimming so
          the body text above it never loses contrast. */}
      <div
        aria-hidden="true"
        className={[
          'absolute inset-0 bg-surface-container-low panel-inset',
          accentBorder,
          isLoser ? 'opacity-80 saturate-50' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      />

      {recommended && verdict && <RecommendedRibbon pinned />}

      <div className="relative flex flex-col gap-space-md p-space-lg">
        <header className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm min-w-0">
            <FighterAvatar side={side} size="sm" variant={avatarVariant} />
            <h3 className={`font-display text-headline-md uppercase ${accentText}`}>{title}</h3>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="font-display text-label-sm text-on-surface-variant">JUDGE SCORE:</span>
            <Badge tone={badgeTone} size="md">
              {score.toFixed(1)}
            </Badge>
          </div>
        </header>

        <MarkdownBlock content={solution} showCopy />

        {stage >= 2 && <ScoreMeter score={score} side={side} animate={!compact} />}

        {stage >= 3 && (
          <SpeechBubble
            label="ARBITER APPRAISAL"
            tone="judge"
            text={feedback}
            mode={compact ? 'fade' : 'typewriter'}
          />
        )}
      </div>
    </article>
  )
}

export default FighterResultCard
