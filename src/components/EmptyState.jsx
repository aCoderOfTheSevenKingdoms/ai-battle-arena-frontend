/**
 * Friendly empty placeholder (e.g. when battle history has no entries yet).
 *
 * @param {object} props
 * @param {string} [props.icon='sports_mma'] Material Symbols icon name.
 * @param {string} props.title
 * @param {string} props.message
 * @param {React.ReactNode} [props.action] Optional button/action node.
 * @param {string} [props.className]
 */
function EmptyState({
  icon = 'sports_mma',
  title,
  message,
  action,
  className = '',
}) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center gap-space-sm',
        'p-space-xl rounded-xl bg-surface-container border border-outline-variant/60 panel-inset',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        aria-hidden="true"
        className="material-symbols-outlined text-[40px] text-outline-variant"
      >
        {icon}
      </span>
      <h3 className="font-display text-headline-md text-on-surface uppercase tracking-wide">
        {title}
      </h3>
      <p className="font-body text-body-md text-on-surface-variant max-w-md">{message}</p>
      {action && <div className="mt-space-xs">{action}</div>}
    </div>
  )
}

export default EmptyState
