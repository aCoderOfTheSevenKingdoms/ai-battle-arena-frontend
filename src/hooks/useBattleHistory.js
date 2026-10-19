/**
 * Battle history: React state backed by IndexedDB (`lib/db.js`).
 * Falls back to in-memory state and reports `storageAvailable = false`
 * whenever IndexedDB cannot be reached (PROJECT_SCOPE 6.4).
 * @module hooks/useBattleHistory
 */

import { useCallback, useEffect, useState } from 'react'
import { deleteBattle as dbDelete, getBattles, saveBattle, clearBattles } from '../lib/db.js'

/**
 * @param {boolean} sessionReady Gate from `useSession` — history loads only
 *   after the session-marker wipe has run.
 * @returns {{
 *   battles: import('../lib/types.js').Battle[],
 *   storageAvailable: boolean,
 *   addBattle: (battle: import('../lib/types.js').Battle) => Promise<void>,
 *   deleteBattle: (id: string) => Promise<void>,
 *   clearAll: () => Promise<void>,
 * }}
 */
export function useBattleHistory(sessionReady) {
  const [battles, setBattles] = useState([])
  const [storageAvailable, setStorageAvailable] = useState(true)

  useEffect(() => {
    if (!sessionReady) return undefined
    let cancelled = false

    getBattles()
      .then((list) => {
        if (!cancelled) setBattles(list)
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
  }, [sessionReady])

  const addBattle = useCallback(async (battle) => {
    setBattles((prev) => [battle, ...prev.filter((b) => b.id !== battle.id)])
    try {
      await saveBattle(battle)
    } catch {
      setStorageAvailable(false)
    }
  }, [])

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

  return { battles, storageAvailable, addBattle, deleteBattle, clearAll }
}
