import { useEffect, useState } from 'react'
import Button from './Button'
import ExampleChip from './ExampleChip'
import ProblemTextarea from './ProblemTextarea'
import { EXAMPLE_PROBLEMS } from '../lib/constants'

const TYPEWRITER_TYPE_MS = 45
const TYPEWRITER_HOLD_MS = 2200
const TYPEWRITER_CLEAR_MS = 350
const MAX_EXAMPLE_CHIPS = 4

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
 * Problem dispatch zone: combat textarea with a cycling typewriter placeholder,
 * preset chips that fill it, and the gated FIGHT trigger. Fully controlled —
 * submission only ever reaches the parent through `onSubmit`.
 *
 * @param {object} props
 * @param {string} props.value Controlled textarea content.
 * @param {(value: string) => void} props.onChange
 * @param {() => void} props.onSubmit Fired only when submission is allowed.
 * @param {boolean} [props.disabled=false] Locks the whole zone while a battle is in flight.
 * @param {boolean} [props.loading=false] Puts the FIGHT button in its loading state.
 * @param {string[]} [props.examples=EXAMPLE_PROBLEMS] Presets; the first 4 become chips.
 * @param {boolean} [props.compact=false] Narrow-container layout: stacks vertically and
 *   drops the preset chips (they overflow a sidebar).
 * @param {string} [props.className]
 */
function ArenaInputZone({
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  examples = EXAMPLE_PROBLEMS,
  compact = false,
  className = '',
}) {
  const [typed, setTyped] = useState('')

  const reducedMotion = prefersReducedMotion()
  const locked = disabled || loading
  const canSubmit = !locked && value.trim().length > 0
  const staticPlaceholder = examples[0] ?? ''
  const active = value.length === 0 && !locked && !reducedMotion && examples.length > 0

  // Drop stale typewriter text while it is hidden so the next run starts clean.
  if (!active && typed !== '') setTyped('')

  useEffect(() => {
    if (!active) return undefined

    let cancelled = false
    let timerId = 0
    let exampleIndex = 0
    let charIndex = 0
    let holding = false

    function tick() {
      if (cancelled) return
      if (holding) {
        holding = false
        exampleIndex = (exampleIndex + 1) % examples.length
        charIndex = 0
        setTyped('')
        timerId = setTimeout(tick, TYPEWRITER_CLEAR_MS)
        return
      }
      charIndex += 1
      setTyped(examples[exampleIndex].slice(0, charIndex))
      if (charIndex >= examples[exampleIndex].length) {
        holding = true
        timerId = setTimeout(tick, TYPEWRITER_HOLD_MS)
      } else {
        timerId = setTimeout(tick, TYPEWRITER_TYPE_MS)
      }
    }

    timerId = setTimeout(tick, TYPEWRITER_TYPE_MS)

    return () => {
      cancelled = true
      clearTimeout(timerId)
    }
  }, [active, examples])

  const submit = () => {
    if (canSubmit) onSubmit()
  }

  return (
    <section
      className={[
        'w-full max-w-4xl mx-auto flex flex-col gap-space-md',
        'rounded-xl bg-surface-container-low shadow-xl',
        compact ? 'p-space-md' : 'p-space-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <ProblemTextarea
        value={value}
        onChange={onChange}
        onSubmit={submit}
        placeholder={active ? typed : staticPlaceholder}
        disabled={locked}
      />

      <div
        className={
          compact
            ? 'flex flex-col items-stretch gap-space-md'
            : 'flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md'
        }
      >
        {!compact && (
          <div className="flex flex-wrap items-center gap-space-xs">
            <span className="font-display text-label-caps text-on-surface-variant uppercase mr-1">
              LOAD PRESET:
            </span>
            {examples.slice(0, MAX_EXAMPLE_CHIPS).map((example) => (
              <ExampleChip
                key={example}
                label={example}
                disabled={locked}
                onClick={() => onChange(example)}
              />
            ))}
          </div>
        )}

        <div
          className={
            compact
              ? 'flex flex-col items-stretch gap-space-sm'
              : 'flex flex-col items-stretch lg:items-end gap-space-sm shrink-0 w-full lg:w-auto'
          }
        >
          <Button
            variant="fight"
            size="lg"
            icon="swords"
            className={compact ? 'w-full' : 'w-full lg:w-auto'}
            loading={loading}
            disabled={!canSubmit}
            onClick={submit}
          >
            FIGHT!
          </Button>
          {value.trim().length === 0 && (
            <p className="font-display text-label-sm text-outline">
              Awaiting dispatch — enter a problem to start the round.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export default ArenaInputZone
