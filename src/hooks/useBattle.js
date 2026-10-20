/**
 * Battle flow state machine:
 * idle -> submitting -> generating -> judging -> revealing -> done, plus error.
 * The network call goes through `lib/api.js`; the loading phases stay simulated.
 * @module hooks/useBattle
 */

import { useEffect, useReducer, useRef } from 'react'
import { runBattle } from '../lib/api.js'
import {
  ACTIVE_PHASES,
  BATTLE_PHASES,
  GENERATING_PHASE_MS,
  REQUEST_TIMEOUT_MS,
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

/** Placeholder judgement for records persisted before the response lands. */
const EMPTY_JUDGEMENT = {
  solution_1: { score: 0, feedback: '' },
  solution_2: { score: 0, feedback: '' },
  winner: '',
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
        message: `The round timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. The models took too long to answer.`,
      }
    case 'invalid':
      return {
        kind: 'unknown',
        message: 'The server sent an answer the arena could not read. Nobody won this round.',
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
 * Every milestone (problem submitted, response, failure) is handed to the
 * persistence callbacks immediately, so a crash or refresh cannot lose data.
 *
 * @param {object} [options]
 * @param {(battle: import('../lib/types.js').Battle) => void} [options.onBattleUpdate]
 *   Called at submit (`in_progress`) and on failure (`failed`) — persisted, not listed.
 * @param {(battle: import('../lib/types.js').Battle) => void} [options.onBattleComplete]
 *   Called once per successful response (`complete`), before the reveal starts.
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
export function useBattle({ onBattleComplete, onBattleUpdate } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const timersRef = useRef([])
  const stateRef = useRef(state)
  const onCompleteRef = useRef(onBattleComplete)
  const onUpdateRef = useRef(onBattleUpdate)
  // One record per round: a retry rewrites the same id instead of orphaning it.
  const recordRef = useRef(null)

  useEffect(() => {
    stateRef.current = state
    onCompleteRef.current = onBattleComplete
    onUpdateRef.current = onBattleUpdate
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

    if (current.phase !== ERROR || !recordRef.current) {
      recordRef.current = { id: crypto.randomUUID(), createdAt: Date.now() }
    }
    const record = recordRef.current

    // Persist the problem before any network work starts.
    onUpdateRef.current?.({
      ...record,
      problem: trimmed,
      solution_1: '',
      solution_2: '',
      judgement: EMPTY_JUDGEMENT,
      status: 'in_progress',
    })

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
          ...record,
          ...result,
          status: 'complete',
        }
        onCompleteRef.current?.(battle)
        dispatch({ type: 'RESOLVE', battle })
      })
      .catch((failure) => {
        clearTimers()
        if (failure?.kind === 'aborted') return
        onUpdateRef.current?.({
          ...record,
          problem: trimmed,
          solution_1: '',
          solution_2: '',
          judgement: EMPTY_JUDGEMENT,
          status: 'failed',
        })
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
