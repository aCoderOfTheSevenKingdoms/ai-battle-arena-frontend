import ArenaInputZone from './ArenaInputZone'
import BattleHistory from './BattleHistory'
import BrandMark from './BrandMark'
import HudChip from './HudChip'

/**
 * Pre-battle landing. Shows the wordmark, the dispatch input, and the battle
 * log stacked beneath it — so nothing has to be hunted for above the fold.
 * Once a battle starts, App swaps this for the sidebar console layout.
 *
 * @param {object} props
 * @param {import('../lib/types.js').Battle[]} props.battles Newest first.
 * @param {import('../lib/types.js').ModelRoster} [props.models] Real model names, with generic fallbacks.
 * @param {(problem: string) => void} props.onRerun Prefills the input; never submits.
 * @param {(id: string) => void} props.onDelete
 * @param {() => void} props.onClearAll
 * @param {boolean} props.storageAvailable False when IndexedDB is unreachable.
 * @param {string} props.value Controlled textarea content.
 * @param {(value: string) => void} props.onChange
 * @param {() => void} props.onSubmit
 * @param {boolean} [props.inputDisabled=false]
 * @param {boolean} [props.inputLoading=false]
 * @param {string} [props.className]
 */
function ArenaLanding({
  battles,
  models,
  onRerun,
  onDelete,
  onClearAll,
  storageAvailable,
  value,
  onChange,
  onSubmit,
  inputDisabled = false,
  inputLoading = false,
  className = '',
}) {
  return (
    <main
      className={[
        'mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-space-xl px-gutter py-space-xl',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex w-full flex-col items-center gap-space-md text-center">
        <BrandMark as="h1" className="justify-center" />
        <p className="max-w-2xl font-body text-body-lg text-on-surface-variant">
          Pit two AI fighters against each other. An AI judge scores both answers and crowns a
          winner.
        </p>
      </div>

      <ArenaInputZone
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={inputDisabled}
        loading={inputLoading}
      />

      {!storageAvailable && (
        <HudChip tone="error" icon="cloud_off">
          History storage is blocked — battles will not survive a refresh.
        </HudChip>
      )}

      <div className="w-full max-w-4xl">
        <BattleHistory
          battles={battles}
          models={models}
          onRerun={onRerun}
          onDelete={onDelete}
          onClearAll={onClearAll}
        />
      </div>
    </main>
  )
}

export default ArenaLanding
