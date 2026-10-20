import { useState } from 'react'
import ArenaLanding from '../components/ArenaLanding.jsx'
import BattleStage from '../components/BattleStage.jsx'
import Sidebar from '../components/Sidebar.jsx'
import { useBattle } from '../hooks/useBattle.js'
import { useBattleHistory } from '../hooks/useBattleHistory.js'
import { useModels } from '../hooks/useModels.js'
import { ARENA_VIEWS } from '../lib/constants.js'
import { getModelIdentifiers } from '../lib/models.js'
import { normalizeWinner } from '../lib/normalizeWinner.js'

function App() {
  const { battles, storageAvailable, persistBattle, addBattle, deleteBattle, clearAll } =
    useBattleHistory()

  const [problem, setProblem] = useState('')
  // Landing until the first battle starts; then the input + log move to the sidebar.
  const [view, setView] = useState(ARENA_VIEWS.LANDING)
  // Model names are optional metadata; generic labels remain until they load.
  const models = useModels()

  // Persist the problem at submit and mark failed rounds; list only completed battles.
  const live = useBattle({ onBattleComplete: addBattle, onBattleUpdate: persistBattle })

  // The judge's raw verdict is untrusted; resolve it once per battle.
  const outcome = live.battle
    ? normalizeWinner(live.battle.judgement, getModelIdentifiers(models))
    : 'draw'

  const handleSubmit = () => {
    if (live.submit(problem)) setView(ARENA_VIEWS.ARENA)
  }

  const handleRerun = (nextProblem) => {
    setProblem(nextProblem)
    setView(ARENA_VIEWS.ARENA)
  }

  const consoleProps = {
    battles,
    models,
    onRerun: handleRerun,
    onDelete: deleteBattle,
    onClearAll: clearAll,
    storageAvailable,
    value: problem,
    onChange: setProblem,
    onSubmit: handleSubmit,
    inputDisabled: live.inputLocked,
    inputLoading: live.isActive,
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest arena-grid-bg">
      {view === ARENA_VIEWS.LANDING ? (
        <ArenaLanding {...consoleProps} />
      ) : (
        <div className="flex flex-1 flex-col lg:flex-row">
          <Sidebar {...consoleProps} className="order-2 lg:order-1" />

          <main className="order-1 flex flex-1 flex-col gap-space-lg px-gutter py-space-lg lg:order-2">
            <BattleStage
              phase={live.phase}
              problem={live.problem}
              battle={live.battle}
              error={live.error}
              outcome={outcome}
              models={models}
              onRevealComplete={live.finishReveal}
              onRetry={live.retry}
              onAbort={live.reset}
            />
          </main>
        </div>
      )}

      <footer className="border-t border-outline-variant px-gutter py-space-md text-center">
        <p className="text-body-md text-on-surface-variant">
          Battles live only in this browser session — closing the tab wipes the log.
        </p>
      </footer>
    </div>
  )
}

export default App
