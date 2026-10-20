import { useState } from 'react'
import Badge from './Badge'
import Button from './Button'
import ConfirmPopover from './ConfirmPopover'
import ResultView from './ResultView'
import { normalizeWinner } from '../lib/normalizeWinner'
import { MAX_SCORE } from '../lib/constants'
import { getModelIdentifiers, getWinnerLabel } from '../lib/models'

/** Winner badge tone per normalized outcome — text always carries the meaning. */
const BADGE_TONE = {
  fighter1: 'fighter1',
  fighter2: 'fighter2',
  draw: 'neutral',
}

/**
 * One collapsible entry in the battle history log. The collapsed row shows a
 * one-line problem summary, scores, timestamp, and winner badge; expanding
 * reveals the full problem, the compact ResultView, and re-run / delete
 * actions. Layout is driven by container width (not viewport): it stacks inside
 * the narrow sidebar dropdown and runs inline in the wide arena/landing view.
 * Deletion is guarded by a local ConfirmPopover.
 *
 * @param {object} props
 * @param {import('../lib/types.js').Battle} props.battle
 * @param {import('../lib/types.js').ModelRoster} [props.models] Real model names, with generic fallbacks.
 * @param {(problem: string) => void} props.onRerun Prefills the input; never submits.
 * @param {(id: string) => void} props.onDelete
 * @param {number} [props.index=0] Used only for a capped staggered entrance delay.
 */
function BattleCard({ battle, models, onRerun, onDelete, index = 0 }) {
  const [expanded, setExpanded] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const outcome = normalizeWinner(battle.judgement, getModelIdentifiers(models))
  const tone = BADGE_TONE[outcome] ?? BADGE_TONE.draw
  const label = getWinnerLabel(outcome, models)
  const score1 = battle.judgement.solution_1.score
  const score2 = battle.judgement.solution_2.score
  const timestamp = new Date(battle.createdAt).toLocaleString()
  const delayStyle = { animationDelay: `${Math.min(index, 6) * 40}ms` }

  const handleDelete = () => {
    setConfirmOpen(false)
    setExpanded(false)
    onDelete(battle.id)
  }

  return (
    <article className="animate-arena-fade-in @container" style={delayStyle}>
      <div className="w-full rounded-xl bg-surface-container shadow-md overflow-hidden border border-outline-variant/40">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className={[
            'w-full flex flex-col gap-space-sm p-space-md text-left',
            'transition-colors hover:bg-surface-container-high',
            '@md:flex-row @md:items-center @md:justify-between @md:gap-space-md',
          ].join(' ')}
        >
          <div className="flex min-w-0 flex-col gap-space-xs @md:flex-row @md:items-center @md:gap-space-md">
            <div className="flex items-center justify-between gap-space-sm @md:justify-start">
              <Badge tone={tone} icon="emoji_events">
                {label}
              </Badge>
              <span className="font-body text-label-sm text-on-surface-variant @md:hidden">
                {timestamp}
              </span>
            </div>
            <span className="min-w-0 font-display text-body-lg text-on-surface truncate @md:text-headline-md">
              {battle.problem}
            </span>
          </div>

          <div className="flex items-center justify-between gap-space-sm @md:shrink-0 @md:justify-end">
            <div className="flex items-center gap-space-xs">
              <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded bg-primary/10 text-primary font-display text-label-caps font-bold uppercase tracking-[0.12em]">
                {score1} / {MAX_SCORE}
              </span>
              <span className="inline-flex items-center whitespace-nowrap px-2 py-0.5 rounded bg-secondary/10 text-secondary font-display text-label-caps font-bold uppercase tracking-[0.12em]">
                {score2} / {MAX_SCORE}
              </span>
            </div>
            <span className="hidden whitespace-nowrap font-body text-label-sm text-on-surface-variant @md:inline">
              {timestamp}
            </span>
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[18px] text-on-surface-variant"
            >
              {expanded ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </button>

        {expanded && (
          <div className="flex flex-col gap-space-md p-space-md pt-0 animate-arena-fade-in">
            <p className="font-body text-body-md text-on-surface-variant border-l-2 border-outline-variant pl-space-sm">
              {battle.problem}
            </p>
            <ResultView battle={battle} outcome={outcome} models={models} compact />
            <div className="flex flex-wrap items-center gap-space-sm">
              <Button
                variant="ghost"
                size="sm"
                icon="restart_alt"
                onClick={() => onRerun(battle.problem)}
              >
                Re-run this problem
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon="delete"
                onClick={() => setConfirmOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmPopover
        open={confirmOpen}
        message="Remove this battle from the session log? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </article>
  )
}

export default BattleCard
