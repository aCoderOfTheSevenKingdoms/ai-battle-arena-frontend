import ErrorMessage from './ErrorMessage'
import FighterAvatar from './FighterAvatar'

/**
 * Knocked-out error tableau with Retry + Abort (PROJECT_SCOPE 4.6).
 * The problem text stays in the input, owned by App — this view never touches it.
 *
 * @param {object} props
 * @param {import('../lib/types.js').BattleError} props.error
 * @param {() => void} props.onRetry Resubmits the same problem.
 * @param {() => void} props.onAbort Returns the stage to idle.
 */
function ErrorStage({ error, onRetry, onAbort }) {
  const codeLabel = {
    network: '[EXCEPTION: NETWORK]',
    server: '[EXCEPTION: HTTP]',
    timeout: '[EXCEPTION: TIMEOUT_120S]',
    unknown: '[EXCEPTION: UNKNOWN]',
  }[error.kind]

  return (
    <div className="flex flex-col items-center gap-space-lg py-space-md">
      <div className="flex w-full items-center justify-center gap-space-md sm:gap-space-xl">
        <FighterAvatar side="1" variant="knockedOut" size="md" name="FIGHTER 1" />
        <FighterAvatar side="2" variant="knockedOut" size="md" name="FIGHTER 2" />
      </div>
      <ErrorMessage
        message={error.message}
        codeLabel={codeLabel}
        onRetry={onRetry}
        onAbort={onAbort}
      />
    </div>
  )
}

export default ErrorStage
