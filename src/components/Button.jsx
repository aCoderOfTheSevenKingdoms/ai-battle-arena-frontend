/**
 * Arcade HUD button. Variants cover fighter actions, the chamfered amber
 * FIGHT trigger, ghost/neutral, and destructive actions.
 *
 * @param {object} props
 * @param {'primary' | 'rival' | 'fight' | 'ghost' | 'danger'} [props.variant='primary']
 * @param {'sm' | 'md' | 'lg'} [props.size='md']
 * @param {boolean} [props.loading=false] Shows a spinner and locks the button.
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.icon] Material Symbols icon name.
 * @param {string} [props.children]
 * @param {string} [props.className]
 */
function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  className = '',
  type = 'button',
  ...rest
}) {
  const VARIANTS = {
    primary:
      'bg-primary text-on-primary hover:brightness-110 hover:shadow-[0_0_16px_rgba(34,211,238,0.5)] active:scale-95',
    rival:
      'bg-secondary text-on-secondary hover:brightness-110 hover:shadow-[0_0_16px_rgba(209,1,131,0.5)] active:scale-95',
    fight: [
      'clip-chamfer text-on-tertiary bg-gradient-to-r from-tertiary-container via-tertiary to-tertiary-fixed-dim',
      'shadow-[0_0_24px_rgba(255,177,71,0.4)] hover:shadow-[0_0_36px_rgba(255,177,71,0.7)] hover:brightness-110 active:scale-95',
    ].join(' '),
    ghost:
      'bg-surface-container border border-outline-variant text-on-surface-variant hover:border-on-surface hover:text-on-surface',
    danger:
      'bg-error text-on-error hover:brightness-110 hover:shadow-[0_0_16px_rgba(255,180,171,0.45)] active:scale-95',
  }

  const SIZES = {
    sm: 'px-space-sm py-1.5 text-label-caps rounded gap-1.5',
    md: 'px-space-md py-2.5 text-label-caps rounded-md gap-2',
    lg: 'px-space-lg py-3 text-headline-md rounded-lg gap-space-sm',
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center font-display font-bold uppercase tracking-[0.1em]',
        'transition-all duration-200 select-none',
        isDisabled
          ? 'bg-surface-container-highest text-outline cursor-not-allowed shadow-none scale-100'
          : VARIANTS[variant],
        SIZES[size],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="inline-block w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin"
        />
      ) : (
        icon && (
          <span aria-hidden="true" className="material-symbols-outlined text-[18px] leading-none">
            {icon}
          </span>
        )
      )}
      {children}
    </button>
  )
}

export default Button
