import { useState } from 'react'
import BattleCard from './BattleCard'
import Button from './Button'
import ConfirmPopover from './ConfirmPopover'
import EmptyState from './EmptyState'
import HudChip from './HudChip'

/**
 * Session battle log: header with record count and a guarded "Clear all",
 * a list of BattleCard entries (newest first), and an empty state.
 *
 * @param {object} props
 * @param {import('../lib/types.js').Battle[]} props.battles Newest first.
 * @param {(problem: string) => void} props.onRerun
 * @param {(id: string) => void} props.onDelete
 * @param {() => void} props.onClearAll
 * @param {string} [props.className='']
 */
function BattleHistory({ battles, onRerun, onDelete, onClearAll, className = '' }) {
  const [confirmClear, setConfirmClear] = useState(false)
  const count = battles.length

  const handleClearAll = () => {
    setConfirmClear(false)
    onClearAll()
  }

  return (
    <section
      aria-label="Battle history"
      className={['w-full flex flex-col gap-space-md', className].filter(Boolean).join(' ')}
    >
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <div className="flex min-w-0 items-center gap-space-sm">
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-tertiary text-[22px]"
          >
            history
          </span>
          <h2 className="font-display text-label-caps text-on-surface uppercase tracking-wide">
            BATTLE LOG
          </h2>
          <HudChip tone="judge">{String(count).padStart(2, '0')}</HudChip>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon="delete_sweep"
          disabled={count === 0}
          onClick={() => setConfirmClear(true)}
        >
          Clear all
        </Button>
      </div>

      {count === 0 ? (
        <EmptyState title="NO BATTLES YET" message="Throw the first problem into the arena." />
      ) : (
        <ul className="flex flex-col gap-space-sm list-none p-0 m-0">
          {battles.map((battle, i) => (
            <li key={battle.id}>
              <BattleCard
                battle={battle}
                index={i}
                onRerun={onRerun}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}

      <ConfirmPopover
        open={confirmClear}
        title="Clear all battles?"
        message="Wipe every battle from this session? This cannot be undone."
        confirmLabel="Clear all"
        onConfirm={handleClearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </section>
  )
}

export default BattleHistory
