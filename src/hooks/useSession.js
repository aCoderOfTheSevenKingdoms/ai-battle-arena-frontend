/**
 * Session marker for history lifetime (PROJECT_SCOPE 6.3).
 * `sessionStorage` survives refreshes but dies with the tab, so a missing
 * marker on startup means "fresh session" → wipe the battles store.
 * @module hooks/useSession
 */

import { useEffect, useState } from 'react'
import { clearBattles } from '../lib/db.js'

/** Key survives refreshes; removed automatically when the tab closes. */
const SESSION_KEY = 'arena-session-active'

/**
 * Runs the session-marker check once at startup.
 * @returns {{ sessionReady: boolean, freshSession: boolean }}
 *   `sessionReady` flips true after the (possible) wipe finished, so history
 *   loading must wait for it. `freshSession` reports that history was cleared.
 */
export function useSession() {
  const [sessionReady, setSessionReady] = useState(false)
  const [freshSession, setFreshSession] = useState(false)

  useEffect(() => {
    let cancelled = false

    const isReturnVisit = (() => {
      try {
        return sessionStorage.getItem(SESSION_KEY) === '1'
      } catch {
        return false // storage blocked: treat as fresh, the wipe below will fail soft
      }
    })()

    const init = async () => {
      if (!isReturnVisit) {
        try {
          await clearBattles()
        } catch {
          // IndexedDB unavailable — useBattleHistory falls back to memory.
        }
        try {
          sessionStorage.setItem(SESSION_KEY, '1')
        } catch {
          // Session storage blocked: marker cannot persist, nothing else to do.
        }
        if (!cancelled) setFreshSession(true)
      }
      if (!cancelled) setSessionReady(true)
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  return { sessionReady, freshSession }
}
