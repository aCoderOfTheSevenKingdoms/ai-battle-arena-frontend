import { useEffect, useRef, useState } from 'react'
import { TONE } from '../lib/tones'

/**
 * Copies `text` to the clipboard and flashes a "Copied!" confirmation.
 *
 * @param {object} props
 * @param {string} props.text
 * @param {string} [props.label='Copy']
 * @param {string} [props.copiedLabel='Copied!']
 * @param {'neutral' | 'fighter1' | 'fighter2' | 'judge' | 'error'} [props.tone='neutral']
 * @param {'sm' | 'md'} [props.size='sm']
 * @param {string} [props.className]
 */
function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  tone = 'neutral',
  size = 'sm',
  className = '',
}) {
  const t = TONE[tone]
  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const SIZES = {
    sm: 'px-space-sm py-1 text-label-caps gap-1',
    md: 'px-space-md py-2 text-label-caps gap-1.5',
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={[
        'inline-flex items-center rounded',
        'font-display font-bold uppercase tracking-[0.12em]',
        'transition-all active:scale-95',
        copied ? `${t.fill} ${tone === 'neutral' ? 'text-on-surface' : 'text-background'}` : 'bg-surface-container-high text-on-surface hover:bg-surface-bright',
        SIZES[size],
        className,
      ].join(' ')}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-[14px] leading-none">
        {copied ? 'check' : 'content_copy'}
      </span>
      {copied ? copiedLabel : label}
    </button>
  )
}

export default CopyButton
