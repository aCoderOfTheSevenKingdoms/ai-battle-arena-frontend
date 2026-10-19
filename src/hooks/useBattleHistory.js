/**
 * Battle history: React state backed by IndexedDB (`lib/db.js`).
 * Falls back to in-memory state and reports `storageAvailable = false`
 * whenever IndexedDB cannot be reached (PROJECT_SCOPE 6.4).
 *
 * Data lives until the user deletes a battle or clears the list — nothing is
 * wiped on tab close, so history survives across sessions.
 * @module hooks/useBattleHistory
 */

import { useCallback, useEffect, useState } from 'react'
import { deleteBattle as dbDelete, getBattles, saveBattle, clearBattles } from '../lib/db.js'

/** Only fully judged battles belong in the history list. */
const isComplete = (battle) => (battle.status ?? 'complete') === 'complete'

/**
 * @returns {{
 *   battles: import('../lib/types.js').Battle[],
 *   storageAvailable: boolean,
 *   persistBattle: (battle: import('../lib/types.js').Battle) => Promise<void>,
 *   addBattle: (battle: import('../lib/types.js').Battle) => Promise<void>,
 *   deleteBattle: (id: string) => Promise<void>,
 *   clearAll: () => Promise<void>,
 * }}
 */
export function useBattleHistory() {
  const [battles, setBattles] = useState([])
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    let cancelled = false

    getBattles()
      .then((list) => {
        if (!cancelled) setBattles(list.filter(isComplete))
      })
      .catch(() => {
        if (!cancelled) {
          setBattles([])
          setStorageAvailable(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  /** Write-through only: used for in-progress and failed records. */
  const persistBattle = useCallback(async (battle) => {
    try {
      await saveBattle(battle)
    } catch {
      setStorageAvailable(false)
    }
  }, [])

  const addBattle = useCallback(
    async (battle) => {
      setBattles((prev) => [battle, ...prev.filter((b) => b.id !== battle.id)])
      await persistBattle(battle)
    },
    [persistBattle],
  )

  const deleteBattle = useCallback(async (id) => {
    setBattles((prev) => prev.filter((b) => b.id !== id))
    try {
      await dbDelete(id)
    } catch {
      setStorageAvailable(false)
    }
  }, [])

  const clearAll = useCallback(async () => {
    setBattles([])
    try {
      await clearBattles()
    } catch {
      setStorageAvailable(false)
    }
  }, [])

  return { battles, storageAvailable, persistBattle, addBattle, deleteBattle, clearAll }
}
