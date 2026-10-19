import FighterAvatar from './FighterAvatar'
import JudgeAvatar from './JudgeAvatar'
import VsEmblem from './VsEmblem'

/**
 * Calm pre-battle tableau: idle fighters, VS emblem, judge overhead.
 */
function IdleStage() {
  return (
    <div className="flex flex-col items-center gap-space-lg py-space-lg">
      <JudgeAvatar variant="idle" size="md" label="THE ARBITER" />
      <div className="flex w-full items-center justify-center gap-space-md sm:gap-space-xl">
        <FighterAvatar side="1" variant="idle" size="md" name="FIGHTER 1" />
        <VsEmblem label="MATCH READY" size="md" />
        <FighterAvatar side="2" variant="idle" size="md" name="FIGHTER 2" />
      </div>
    </div>
  )
}

export default IdleStage
