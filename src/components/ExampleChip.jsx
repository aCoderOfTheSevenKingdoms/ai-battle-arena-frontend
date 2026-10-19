import { TONE, toneForSide } from '../lib/tones'

/**
 * Small clickable preset chip that fills the problem textarea.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.emoji] Optional leading emoji/glyph.
 * @param {boolean} [props.selected=false]
 * @param {'neutral' | '1' | '2'} [props.tone='neutral'] Tone, or a fighter side.
 * @param {boolean} [props.disabled=false]
 * @param {() => void} [props.onClick]
 * @param {string} [props.className]
 */
function ExampleChip({
  label,
  emoji,
  selected = false,
  tone = 'neutral',
  disabled = false,
  onClick,
  className = '',
}) {
  const toneKey = tone === '1' || tone === '2' ? toneForSide(tone) : tone
  const t = TONE[toneKey]

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1 px-space-sm py-1 rounded font-display text-label-sm font-semibold',
        'transition-all duration-150 active:scale-95',
        disabled
          ? 'bg-surface-container-high text-outline cursor-not-allowed'
          : selected
            ? `${t.solid} font-bold shadow-sm`
            : 'bg-surface-container-high text-on-surface hover:bg-surface-bright',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {emoji && (
        <span aria-hidden="true" className="text-[13px] leading-none">
          {emoji}
        </span>
      )}
      {label}
      {selected && (
        <span aria-hidden="true" className="material-symbols-outlined text-[14px] leading-none">
          check
        </span>
      )}
    </button>
  )
}

export default ExampleChip
