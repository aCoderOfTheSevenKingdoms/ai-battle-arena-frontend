import { useEffect, useRef } from 'react'
import Button from './Button'

/**
 * Centered confirm dialog used before destructive actions ("Clear all",
 * delete a battle). Esc cancels; focus lands on the confirm button.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {string} [props.title='Are you sure?']
 * @param {string} props.message
 * @param {string} [props.confirmLabel='Confirm']
 * @param {string} [props.cancelLabel='Cancel']
 * @param {'danger' | 'primary'} [props.tone='danger']
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
function ConfirmPopover({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    confirmRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-space-md bg-background/75 backdrop-blur-[12px]"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className={[
          'w-full max-w-md p-space-lg rounded-xl bg-surface-container-high',
          'border-2 border-outline-variant shadow-2xl',
          'flex flex-col gap-space-md animate-arena-fade-in',
        ].join(' ')}
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-title"
          className="font-display text-headline-md text-on-surface uppercase tracking-wide"
        >
          {title}
        </h2>
        <p id="confirm-message" className="font-body text-body-md text-on-surface-variant">
          {message}
        </p>
        <div className="flex items-center justify-end gap-space-sm">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button ref={confirmRef} variant={tone} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmPopover
