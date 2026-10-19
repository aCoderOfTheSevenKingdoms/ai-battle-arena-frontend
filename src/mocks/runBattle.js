/**
 * Fake `runBattle` used until Phase 3 replaces it with `lib/api.js`.
 * Resolves after a delay with sample data; can be toggled to fail for
 * testing the error state (via `setMockFailure` or `?mock=network|server|timeout|fail`).
 * @module mocks/runBattle
 */

import { createMockResult } from './mockBattles.js'

/** Total mock latency (ms): covers countdown + generating + judging phases. */
const MOCK_DELAY_MS = 11000

/** Failure mode currently applied to every call. */
let failureMode = 'none'

/** Extra delay override (ms); `null` keeps MOCK_DELAY_MS. */
let delayOverride = null

/**
 * Force mock failures for error-state testing.
 * @param {'none' | 'network' | 'server' | 'timeout' | 'fail'} mode
 */
export function setMockFailure(mode) {
  failureMode = mode ?? 'none'
}

/**
 * Override the mock latency, e.g. to test the 20s/45s waiting messages.
 * @param {number | null} ms Pass `null` to restore the default.
 */
export function setMockDelay(ms) {
  delayOverride = ms
}

// URL toggle: ?mock=network | server | timeout | fail
if (typeof window !== 'undefined') {
  const mode = new URLSearchParams(window.location.search).get('mock')
  if (mode) setMockFailure(mode === 'fail' ? 'network' : mode)
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Mock battle call with the same contract as the future `lib/api.js`.
 * Rejects with an error carrying `.kind` so `useBattle` can map it to a BattleError.
 *
 * @param {string} problem
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<ReturnType<typeof createMockResult>>}
 */
export async function runBattle(problem, options = {}) {
  const { signal } = options
  const error = new Error(`mock failure: ${failureMode}`)
  error.kind =
    failureMode === 'none' ? 'unknown' : failureMode === 'fail' ? 'network' : failureMode

  await wait(delayOverride ?? MOCK_DELAY_MS)

  if (signal?.aborted) {
    const abortError = new Error('mock battle aborted')
    abortError.kind = 'aborted'
    throw abortError
  }

  if (failureMode !== 'none') throw error

  return createMockResult(problem)
}
