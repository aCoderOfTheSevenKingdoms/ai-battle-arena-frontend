import { useState } from 'react'
import ArenaInputZone from '../components/ArenaInputZone.jsx'
import BattleHistory from '../components/BattleHistory.jsx'
import BattleStage from '../components/BattleStage.jsx'
import Header from '../components/Header.jsx'
import HudChip from '../components/HudChip.jsx'
import { useBattle } from '../hooks/useBattle.js'
import { useBattleHistory } from '../hooks/useBattleHistory.js'
import { useSession } from '../hooks/useSession.js'
import { normalizeWinner } from '../lib/normalizeWinner.js'

function App() {
  const { sessionReady } = useSession()
  const { battles, storageAvailable, addBattle, deleteBattle, clearAll } =
    useBattleHistory(sessionReady)

  const [problem, setProblem] = useState('')
  const live = useBattle({ onBattleComplete: addBattle })

  // The judge's raw verdict is untrusted; resolve it once per battle.
  const outcome = live.battle ? normalizeWinner(live.battle.judgement) : 'draw'

  const handleSubmit = () => {
    live.submit(problem)
  }

  const handleRerun = (nextProblem) => {
    setProblem(nextProblem)
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest arena-grid-bg">
      <Header battleCount={battles.length} />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-space-xl px-gutter py-space-lg">
        <ArenaInputZone
          value={problem}
          onChange={setProblem}
          onSubmit={handleSubmit}
          disabled={live.inputLocked}
          loading={live.isActive}
        />

        <BattleStage
          phase={live.phase}
          problem={live.problem}
          battle={live.battle}
          error={live.error}
          outcome={outcome}
          onRevealComplete={live.finishReveal}
          onRetry={live.retry}
          onAbort={live.reset}
        />

        {!storageAvailable && (
          <HudChip tone="error" icon="cloud_off">
            History storage is blocked — battles will not survive a refresh.
          </HudChip>
        )}

        <BattleHistory
          battles={battles}
          onRerun={handleRerun}
          onDelete={deleteBattle}
          onClearAll={clearAll}
        />
      </main>

      <footer className="border-t border-outline-variant px-gutter py-space-md text-center">
        <p className="text-body-md text-on-surface-variant">
          Battles live only in this browser session — closing the tab wipes the log.
        </p>
      </footer>
    </div>
  )
}

export default App
