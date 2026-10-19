import { PROBLEM_MAX_CHARS, PROBLEM_WARN_THRESHOLD } from '../lib/constants'

/**
 * Console-style problem statement input with animated focus glow and a
 * character counter that warns near the limit. Fully controlled.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {(value: string) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {number} [props.maxChars=PROBLEM_MAX_CHARS]
 * @param {number} [props.warnAt=PROBLEM_WARN_THRESHOLD]
 * @param {boolean} [props.disabled=false]
 * @param {number} [props.rows=4]
 * @param {string} [props.id]
 * @param {string} [props.label='ENTER THE ARENA // COMBAT DISPATCH']
 * @param {(value: string) => void} [props.onSubmit] Fired on Ctrl/Cmd+Enter.
 * @param {string} [props.className]
 */
function ProblemTextarea({
  value,
  onChange,
  placeholder = 'Drop a coding challenge, proof verification, or adversarial prompt for both LLM gladiators...',
  maxChars = PROBLEM_MAX_CHARS,
  warnAt = PROBLEM_WARN_THRESHOLD,
  disabled = false,
  rows = 4,
  id = 'arena-problem',
  label = 'ENTER THE ARENA // COMBAT DISPATCH',
  onSubmit,
  className = '',
}) {
  const length = value.length
  const nearLimit = length >= warnAt

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      onSubmit?.(value)
    }
  }

  return (
    <div className={`flex flex-col gap-space-sm ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <label
          htmlFor={id}
          className="flex items-center gap-space-sm font-display text-headline-md text-on-surface uppercase tracking-wide"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-tertiary text-[20px]">
            sports_mma
          </span>
          {label}
        </label>
        <span
          aria-live="polite"
          className={[
            'self-start sm:self-auto px-space-sm py-0.5 rounded',
            'font-body text-body-code font-semibold tabular-nums',
            'bg-surface-container-high',
            nearLimit ? 'text-error' : 'text-primary',
          ].join(' ')}
        >
          {length.toLocaleString()} / {maxChars.toLocaleString()} CHARS
        </span>
      </div>

      <div className="relative w-full group">
        <textarea
          id={id}
          value={value}
          rows={rows}
          maxLength={maxChars}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value.slice(0, maxChars))}
          onKeyDown={handleKeyDown}
          className={[
            'w-full p-space-md rounded-lg resize-none',
            'bg-surface-container-lowest text-on-surface font-body text-body-code',
            'placeholder:text-on-surface-variant/70 shadow-inner',
            'outline-none transition-all duration-200',
            'focus:ring-2 focus:ring-primary-container focus:shadow-[0_0_12px_rgba(34,211,238,0.2)]',
            disabled ? 'opacity-60 cursor-not-allowed' : 'border border-outline-variant/40',
          ].join(' ')}
        />
        <div
          aria-hidden="true"
          className="absolute right-3 bottom-3 flex items-center gap-1 text-on-surface-variant opacity-60 pointer-events-none"
        >
          <span className="material-symbols-outlined text-[16px]">terminal</span>
          <span className="font-display text-label-sm font-semibold uppercase tracking-[0.08em]">
            STAGED
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProblemTextarea
