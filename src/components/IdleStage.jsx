import FighterAvatar from './FighterAvatar'
import JudgeAvatar from './JudgeAvatar'
import VsEmblem from './VsEmblem'
import { fighterName, judgeName } from '../lib/models.js'

/**
 * Calm pre-battle tableau: idle fighters, VS emblem, judge overhead.
 *
 * @param {object} props
 * @param {import('../lib/types.js').ModelRoster} props.models Real model names, with generic fallbacks.
 */
function IdleStage({ models }) {
  return (
    <div className="flex flex-col items-center gap-space-lg py-space-lg">
      <JudgeAvatar variant="idle" size="md" label={judgeName(models)} />
      <div className="flex w-full items-center justify-center gap-space-md sm:gap-space-xl">
        <FighterAvatar side="1" variant="idle" size="md" name={fighterName(models, '1')} />
        <VsEmblem label="MATCH READY" size="md" />
        <FighterAvatar side="2" variant="idle" size="md" name={fighterName(models, '2')} />
      </div>
    </div>
  )
}

export default IdleStage
