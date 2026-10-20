/**
 * The only module allowed to talk to the backend.
 * Wraps `POST /use-graph` and the read-only `GET /models`, applies a timeout,
 * forwards caller cancellation, and maps every failure to a typed ApiError
 * (`network`, `server`, `timeout`, `invalid`, `aborted`).
 * @module lib/api
 */

import {
  DEFAULT_API_BASE_URL,
  MODELS_TIMEOUT_MS,
  REQUEST_TIMEOUT_MS,
} from './constants.js'

/** Low-level failure raised by the API layer. */
export class ApiError extends Error {
  /**
   * @param {'network' | 'server' | 'timeout' | 'invalid' | 'aborted'} kind
   * @param {string} message
   * @param {{ status?: number }} [details]
   */
  constructor(kind, message, { status } = {}) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    if (status !== undefined) this.status = status
  }
}

/**
 * API origin from the environment, without a trailing slash.
 * @returns {string}
 */
function apiBaseUrl() {
  const configured = import.meta.env?.VITE_API_BASE_URL
  return (configured || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
}

/**
 * Perform a JSON request with a timeout and optional external cancellation.
 * @param {string} path
 * @param {{
 *   method?: string,
 *   body?: object,
 *   signal?: AbortSignal,
 *   timeoutMs?: number,
 * }} [options]
 * @returns {Promise<Response>}
 */
async function request(path, { method = 'GET', body, signal, timeoutMs = REQUEST_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)

  const forwardAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', forwardAbort, { once: true })
  }

  try {
    return await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    if (signal?.aborted) throw new ApiError('aborted', 'The request was cancelled.')
    if (timedOut) throw new ApiError('timeout', 'The arena request timed out.')
    throw new ApiError('network', 'The arena could not reach the server.')
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', forwardAbort)
  }
}

/** @param {Response} response */
function assertOk(response) {
  if (!response.ok) {
    throw new ApiError('server', `The server rejected the request (HTTP ${response.status}).`, {
      status: response.status,
    })
  }
}

/** @param {Response} response */
async function readJson(response) {
  try {
    return await response.json()
  } catch {
    throw new ApiError('invalid', 'The server returned a response the arena could not read.')
  }
}

/** @param {unknown} value */
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * @param {unknown} value
 * @returns {import('./types.js').JudgeResult | null}
 */
function parseJudgeResult(value) {
  if (!isRecord(value)) return null
  if (typeof value.score !== 'number' || !Number.isFinite(value.score)) return null
  if (typeof value.feedback !== 'string') return null
  return { score: value.score, feedback: value.feedback }
}

/**
 * Accept both the real `{ result: state }` envelope and a bare final state.
 * @param {unknown} payload
 * @returns {{ problem: string, solution_1: string, solution_2: string, judgement: import('./types.js').Judgement }}
 */
function parseBattleResult(payload) {
  const result = isRecord(payload) && isRecord(payload.result) ? payload.result : payload

  if (!isRecord(result) || typeof result.problem !== 'string') {
    throw new ApiError('invalid', 'The server returned an unexpected battle result.')
  }
  if (typeof result.solution_1 !== 'string' || typeof result.solution_2 !== 'string') {
    throw new ApiError('invalid', 'The server returned an unexpected battle result.')
  }

  const judgement = result.judgement
  if (!isRecord(judgement) || typeof judgement.winner !== 'string') {
    throw new ApiError('invalid', 'The server returned an unexpected battle judgement.')
  }

  const solution_1 = parseJudgeResult(judgement.solution_1)
  const solution_2 = parseJudgeResult(judgement.solution_2)
  if (!solution_1 || !solution_2) {
    throw new ApiError('invalid', 'The server returned an unexpected battle judgement.')
  }

  return {
    problem: result.problem,
    solution_1: result.solution_1,
    solution_2: result.solution_2,
    judgement: { solution_1, solution_2, winner: judgement.winner },
  }
}

/**
 * @param {unknown} value
 * @returns {import('./types.js').ModelInfo | null}
 */
function parseModelInfo(value) {
  if (!isRecord(value)) return null
  const model = typeof value.model === 'string' ? value.model.trim() : ''
  if (!model) return null

  const name = typeof value.name === 'string' && value.name.trim() ? value.name.trim() : model
  const provider = typeof value.provider === 'string' ? value.provider.trim() : ''
  return { model, name, provider }
}

/**
 * Accept both `{ fighters, judge }` and a flat `{ solution_1, solution_2, judge }`.
 * @param {unknown} payload
 * @returns {import('./types.js').ModelRoster}
 */
function parseModelRoster(payload) {
  const root = isRecord(payload) && isRecord(payload.models) ? payload.models : payload
  const fighters = isRecord(root) && isRecord(root.fighters) ? root.fighters : root

  const solution_1 = isRecord(fighters) ? parseModelInfo(fighters.solution_1) : null
  const solution_2 = isRecord(fighters) ? parseModelInfo(fighters.solution_2) : null
  if (!solution_1 || !solution_2) {
    throw new ApiError('invalid', 'The server returned an unexpected model roster.')
  }

  const judge = isRecord(root) ? parseModelInfo(root.judge) : null
  return { solution_1, solution_2, judge }
}

/**
 * Run one battle through the LangGraph backend.
 *
 * @param {string} problem
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ problem: string, solution_1: string, solution_2: string, judgement: import('./types.js').Judgement }>}
 * @throws {ApiError}
 */
export async function runBattle(problem, { signal } = {}) {
  const response = await request('/use-graph', {
    method: 'POST',
    body: { problem },
    signal,
  })
  assertOk(response)
  return parseBattleResult(await readJson(response))
}

/**
 * Fetch the fighter and judge model metadata.
 *
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<import('./types.js').ModelRoster>}
 * @throws {ApiError}
 */
export async function getModels({ signal } = {}) {
  const response = await request('/models', { signal, timeoutMs: MODELS_TIMEOUT_MS })
  assertOk(response)
  return parseModelRoster(await readJson(response))
}
