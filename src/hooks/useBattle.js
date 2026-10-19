/**
 * Battle flow state machine:
 * idle -> submitting -> generating -> judging -> revealing -> done, plus error.
 * Runs against the mock `runBattle` until Phase 3 swaps in `lib/api.js`.
 * @module hooks/useBattle
 */

import { useEffect, useReducer, useRef } from 'react'
import { runBattle } from '../mocks/runBattle.js'
import {
  ACTIVE_PHASES,
  BATTLE_PHASES,
  GENERATING_PHASE_MS,
  ROUND_COUNTDOWN_MS,
} from '../lib/constants.js'

const { IDLE, SUBMITTING, GENERATING, JUDGING, REVEALING, DONE, ERROR } = BATTLE_PHASES

/** @type {{ phase: string, problem: string, battle: import('../lib/types.js').Battle | null, error: import('../lib/types.js').BattleError | null }} */
const initialState = {
  phase: IDLE,
  problem: '',
  battle: null,
  error: null,
}

/**
 * Guarded transitions: late timers or stale responses can never rewind a phase.
 * @param {typeof initialState} state
 * @param {{ type: string, problem?: string, battle?: object, error?: object }} action
 */
function reducer(state, action) {
  switch (action.type) {
    case 'SUBMIT':
      return {
        phase: SUBMITTING,
        problem: action.problem,
        battle: null,
        error: null,
      }
    case 'GENERATING':
      return state.phase === SUBMITTING ? { ...state, phase: GENERATING } : state
    case 'JUDGING':
      return state.phase === GENERATING ? { ...state, phase: JUDGING } : state
    case 'RESOLVE':
      return [SUBMITTING, GENERATING, JUDGING].includes(state.phase)
        ? { ...state, phase: REVEALING, battle: action.battle }
        : state
    case 'FAIL':
      return [SUBMITTING, GENERATING, JUDGING].includes(state.phase)
        ? { ...state, phase: ERROR, error: action.error, battle: null }
        : state
    case 'REVEAL_DONE':
      return state.phase === REVEALING ? { ...state, phase: DONE } : state
    case 'RESET':
      return { ...initialState, problem: action.problem ?? state.problem }
    default:
      return state
  }
}

/**
 * Map a low-level failure onto the display error the arena shows (PROJECT_SCOPE 4.6).
 * @param {{ kind?: string, status?: number, message?: string }} failure
 * @returns {import('../lib/types.js').BattleError}
 */
function toBattleError(failure) {
  switch (failure?.kind) {
    case 'network':
      return {
        kind: 'network',
        message: 'Connection lost — the arena could not reach the server. Nobody won this round.',
      }
    case 'timeout':
      return {
        kind: 'timeout',
        message: 'The round timed out after 120 seconds. The models took too long to answer.',
      }
    case 'server':
      return {
        kind: 'server',
        status: failure.status,
        message: `The server dropped the round${
          failure.status ? ` (HTTP ${failure.status})` : ''
        }. Nobody won this round.`,
      }
    default:
      return { kind: 'unknown', message: 'The arena crashed. Nobody won this round.' }
  }
}

/**
 * Owns the live battle lifecycle. Exactly one battle at a time.
 *
 * @param {object} [options]
 * @param {(battle: import('../lib/types.js').Battle) => void} [options.onBattleComplete]
 *   Called once per successful response, before the reveal starts — App persists it.
 * @returns {{
 *   phase: string,
 *   problem: string,
 *   battle: import('../lib/types.js').Battle | null,
 *   error: import('../lib/types.js').BattleError | null,
 *   isActive: boolean,
 *   inputLocked: boolean,
 *   submit: (problem: string) => boolean,
 *   retry: () => boolean,
 *   finishReveal: () => void,
 *   reset: () => void,
 * }}
 */
export function useBattle({ onBattleComplete } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const timersRef = useRef([])
  const stateRef = useRef(state)
  const onCompleteRef = useRef(onBattleComplete)

  useEffect(() => {
    stateRef.current = state
    onCompleteRef.current = onBattleComplete
  })

  // Never leave timers behind on unmount.
  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current = []
    },
    [],
  )

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current = []
  }

  const schedule = (fn, ms) => {
    timersRef.current.push(setTimeout(fn, ms))
  }

  /**
   * @param {string} problem
   * @returns {boolean} false when the submit was rejected
   */
  const submit = (problem) => {
    const trimmed = problem.trim()
    const current = stateRef.current
    if (!trimmed) return false
    if (ACTIVE_PHASES.includes(current.phase) || current.phase === REVEALING) return false

    clearTimers()
    dispatch({ type: 'SUBMIT', problem: trimmed })

    // Simulated phases: cosmetic only, they never reflect real server progress.
    schedule(() => dispatch({ type: 'GENERATING' }), ROUND_COUNTDOWN_MS)
    schedule(
      () => dispatch({ type: 'JUDGING' }),
      ROUND_COUNTDOWN_MS + GENERATING_PHASE_MS,
    )

    runBattle(trimmed)
      .then((result) => {
        clearTimers()
        const battle = {
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          ...result,
        }
        onCompleteRef.current?.(battle)
        dispatch({ type: 'RESOLVE', battle })
      })
      .catch((failure) => {
        clearTimers()
        if (failure?.kind === 'aborted') return
        dispatch({ type: 'FAIL', error: toBattleError(failure) })
      })

    return true
  }

  const retry = () => {
    const { problem, phase } = stateRef.current
    return phase === ERROR ? submit(problem) : false
  }

  const finishReveal = () => dispatch({ type: 'REVEAL_DONE' })

  const reset = () => {
    clearTimers()
    dispatch({ type: 'RESET' })
  }

  const isActive = ACTIVE_PHASES.includes(state.phase)

  return {
    ...state,
    isActive,
    // Input stays locked through the reveal so only one battle plays at a time.
    inputLocked: isActive || state.phase === REVEALING,
    submit,
    retry,
    finishReveal,
    reset,
  }
}
