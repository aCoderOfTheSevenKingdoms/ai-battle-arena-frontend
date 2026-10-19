import Button from './Button'

/**
 * Arena crash panel: knocked-out fighters energy, a distinct code label for
 * network/server/timeout failures, and a Retry that resubmits the problem.
 *
 * @param {object} props
 * @param {string} [props.title='THE ARENA HAS CRASHED!']
 * @param {string} props.message
 * @param {string} [props.codeLabel] e.g. "[EXCEPTION: TIMEOUT_120S]".
 * @param {string} [props.retryLabel='REBOOT BENCHMARK']
 * @param {() => void} [props.onRetry]
 * @param {string} [props.abortLabel='ABORT TO LOBBY']
 * @param {() => void} [props.onAbort]
 * @param {string} [props.className]
 */
function ErrorMessage({
  title = 'THE ARENA HAS CRASHED!',
  message,
  codeLabel = '[EXCEPTION: ARENA_FAULT]',
  retryLabel = 'REBOOT BENCHMARK',
  onRetry,
  abortLabel = 'ABORT TO LOBBY',
  onAbort,
  className = '',
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-2xl',
        'flex flex-col items-center justify-center text-center gap-space-md',
        'py-space-xl px-space-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-error-container/10 pointer-events-none" />

      <div className="relative w-24 h-24 rounded-2xl bg-surface-container-high flex items-center justify-center shadow-[0_0_30px_rgba(255,180,171,0.3)]">
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-error text-[54px] animate-pulse motion-reduce:animate-none"
        >
          dangerous
        </span>
        <span aria-hidden="true" className="absolute -top-2 -right-2 text-tertiary text-xl">
          💥
        </span>
        <span aria-hidden="true" className="absolute -bottom-2 -left-2 text-primary text-xl">
          ⚡
        </span>
      </div>

      <div className="relative flex flex-col gap-1 max-w-lg">
        <span className="font-display text-label-caps font-bold uppercase tracking-[0.12em] text-error">
          {codeLabel}
        </span>
        <h2 className="font-display text-headline-lg-mobile sm:text-headline-lg text-on-surface uppercase">
          {title}
        </h2>
        <p className="font-body text-body-md text-on-surface-variant">{message}</p>
      </div>

      <div className="relative flex flex-wrap items-center justify-center gap-space-sm mt-space-sm">
        {onRetry && (
          <Button variant="danger" size="md" icon="restart_alt" onClick={onRetry}>
            {retryLabel}
          </Button>
        )}
        {onAbort && (
          <Button variant="ghost" size="md" onClick={onAbort}>
            {abortLabel}
          </Button>
        )}
      </div>
    </div>
  )
}

export default ErrorMessage
