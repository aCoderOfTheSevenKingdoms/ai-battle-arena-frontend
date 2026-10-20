/**
 * Pure helpers for the model roster returned by `GET /models`.
 * Every helper falls back to the generic arena labels, so the UI keeps
 * working when the endpoint is missing or fails.
 * @module lib/models
 */

/** Roster shape before `/models` has resolved. */
export const EMPTY_MODEL_ROSTER = Object.freeze({
  solution_1: null,
  solution_2: null,
  judge: null,
})

/**
 * Display name for one fighter, or the generic label as a fallback.
 * @param {import('./types.js').ModelRoster | null | undefined} models
 * @param {'1' | '2'} side
 * @returns {string}
 */
export function fighterName(models, side) {
  const info = side === '2' ? models?.solution_2 : models?.solution_1
  return info?.name || info?.model || (side === '2' ? 'FIGHTER 2' : 'FIGHTER 1')
}

/**
 * Display name for the judge, or "THE ARBITER" as a fallback.
 * @param {import('./types.js').ModelRoster | null | undefined} models
 * @returns {string}
 */
export function judgeName(models) {
  return models?.judge?.name || models?.judge?.model || 'THE ARBITER'
}

/**
 * Winner banner label for a normalized outcome.
 * @param {import('./types.js').Outcome} outcome
 * @param {import('./types.js').ModelRoster | null | undefined} models
 * @returns {string}
 */
export function getWinnerLabel(outcome, models) {
  if (outcome === 'fighter2') return fighterName(models, '2')
  if (outcome === 'fighter1') return fighterName(models, '1')
  return 'DRAW'
}

/**
 * Raw model identifiers used to match the judge's free-form winner string.
 * @param {import('./types.js').ModelRoster | null | undefined} models
 * @returns {{ model1?: string, model2?: string }}
 */
export function getModelIdentifiers(models) {
  return {
    model1: models?.solution_1?.model,
    model2: models?.solution_2?.model,
  }
}
