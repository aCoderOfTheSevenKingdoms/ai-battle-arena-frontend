import FighterAvatar from './FighterAvatar'
import SpeechBubble from './SpeechBubble'

/**
 * One fighter's column during loading: avatar pose plus either the
 * charging typing-dots bubble or a short idle emote reaction.
 *
 * @param {object} props
 * @param {'1' | '2'} props.side
 * @param {'charging' | 'waiting'} props.variant Avatar pose for the current phase.
 * @param {string | null} [props.emote=null] Active emote line, if any.
 * @param {() => void} props.onReact Idle click reaction.
 */
function FighterLoadingColumn({ side, variant, emote = null, onReact }) {
  const tone = side === '1' ? 'fighter1' : 'fighter2'

  return (
    <div className="flex flex-1 flex-col items-center gap-space-sm">
      <FighterAvatar
        side={side}
        variant={variant}
        size="md"
        name={side === '1' ? 'FIGHTER 1' : 'FIGHTER 2'}
        onClick={onReact}
      />
      {emote ? (
        <SpeechBubble text={emote} tone={tone} mode="fade" />
      ) : (
        <SpeechBubble text="" tone={tone} typing />
      )}
    </div>
  )
}

export default FighterLoadingColumn
