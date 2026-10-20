/**
 * Loads the model roster from the backend once per app session.
 * Any failure is non-fatal: the arena keeps the generic FIGHTER 1 / FIGHTER 2
 * labels and simply omits the real model names.
 * @module hooks/useModels
 */

import { useEffect, useState } from 'react'
import { getModels } from '../lib/api.js'
import { EMPTY_MODEL_ROSTER } from '../lib/models.js'

/**
 * @returns {import('../lib/types.js').ModelRoster}
 */
export function useModels() {
  const [models, setModels] = useState(EMPTY_MODEL_ROSTER)

  useEffect(() => {
    const controller = new AbortController()

    getModels({ signal: controller.signal })
      .then((roster) => {
        if (!controller.signal.aborted) setModels(roster)
      })
      .catch(() => {
        // Graceful fallback: generic fighter labels remain.
      })

    return () => controller.abort()
  }, [])

  return models
}
