import { useEffect, useRef, useState } from 'react'
import ArenaInputZone from './ArenaInputZone'
import BattleHistory from './BattleHistory'
import BrandMark from './BrandMark'
import HudChip from './HudChip'

/**
 * Arena console sidebar. Shown once a battle has started: it carries the app
 * wordmark, a session battle-count trigger that drops down the full battle log,
 * and the problem dispatch input. Presentational — all data and handlers come
 * from the parent.
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
function Sidebar({
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
  const [logOpen, setLogOpen] = useState(false)
  const logRef = useRef(null)
  const paddedCount = String(battles.length).padStart(2, '0')

  useEffect(() => {
    if (!logOpen) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setLogOpen(false)
    }
    const onPointerDown = (event) => {
      if (!logRef.current?.contains(event.target)) setLogOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('mousedown', onPointerDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [logOpen])

  const handleRerun = (problem) => {
    setLogOpen(false)
    onRerun(problem)
  }

  return (
    <aside
      aria-label="Arena console"
      className={[
        'relative z-30 flex w-full shrink-0 flex-col gap-space-lg p-gutter',
        'bg-surface-container-lowest/85 lg:sticky lg:top-0 lg:w-80 lg:self-start',
        'lg:border-r lg:border-outline-variant',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <BrandMark size="sm" showTagline={false} />

      <div ref={logRef} className="relative">
        <button
          type="button"
          aria-expanded={logOpen}
          aria-controls="battle-log-menu"
          onClick={() => setLogOpen((open) => !open)}
          className={[
            'inline-flex w-full items-center justify-between gap-space-sm',
            'rounded-md border border-outline-variant/60 bg-surface-container-low px-space-md py-space-sm',
            'font-display text-label-caps font-bold uppercase tracking-[0.12em] text-on-surface',
            'transition-colors hover:border-on-surface hover:bg-surface-container',
          ].join(' ')}
        >
          <span className="inline-flex items-center gap-space-sm">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[18px] leading-none text-tertiary"
            >
              history
            </span>
            {`Battles: ${paddedCount}`}
          </span>
          <span
            aria-hidden="true"
            className="material-symbols-outlined text-[18px] leading-none text-on-surface-variant"
          >
            {logOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {logOpen && (
          <div
            id="battle-log-menu"
            role="region"
            aria-label="Battle history menu"
            className={[
              'absolute left-0 top-full z-40 mt-space-sm w-[min(90vw,24rem)]',
              'max-h-[70vh] overflow-y-auto arena-scroll rounded-xl',
              'border border-outline-variant bg-surface-container-high p-space-md shadow-2xl animate-arena-fade-in',
            ].join(' ')}
          >
            <BattleHistory
              battles={battles}
              models={models}
              onRerun={handleRerun}
              onDelete={onDelete}
              onClearAll={onClearAll}
            />
          </div>
        )}
      </div>

      <ArenaInputZone
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        disabled={inputDisabled}
        loading={inputLoading}
        compact
      />

      {!storageAvailable && (
        <HudChip tone="error" icon="cloud_off">
          History storage is blocked — battles will not survive a refresh.
        </HudChip>
      )}
    </aside>
  )
}

export default Sidebar
