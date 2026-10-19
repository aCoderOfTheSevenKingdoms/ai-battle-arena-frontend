/**
 * Pure winner normalization for the AI judge's raw verdict string.
 * The judge output is untrusted and free-form, so it is matched exactly
 * against known aliases after normalization; anything else falls back to scores.
 */

/** Aliases that identify Fighter 1 (solution_1), before normalization. */
const FIGHTER_1_ALIASES = [
  'solution 1',
  'solution1',
  'fighter 1',
  'fighter1',
  'p1',
  'player 1',
  'side 1',
  'left',
]

/** Aliases that identify Fighter 2 (solution_2), before normalization. */
const FIGHTER_2_ALIASES = [
  'solution 2',
  'solution2',
  'fighter 2',
  'fighter2',
  'p2',
  'player 2',
  'side 2',
  'right',
]

/**
 * Canonical form of a candidate string: lowercased, separators turned into
 * spaces, remaining punctuation dropped, whitespace collapsed. Matching on
 * this form makes comparisons immune to case, spacing, and punctuation drift.
 * @param {string} value
 * @returns {string}
 */
function normalizeKey(value) {
  return value
    .toLowerCase()
    .replace(/[_\-./]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Coerce a score to a finite number; anything non-numeric counts as 0.
 * @param {unknown} value
 * @returns {number}
 */
function toScore(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

/**
 * Resolve the judge's raw verdict string into a display outcome.
 * Exact match against normalized aliases wins; unmatchable or ambiguous
 * verdicts fall back to the higher score, equal scores mean a draw.
 *
 * @param {import('./types.js').Judgement | null | undefined} judgement
 * @param {{ model1?: string, model2?: string }} [names] Optional real model names (Phase 3).
 * @returns {import('./types.js').Outcome} 'fighter1' | 'fighter2' | 'draw'
 */
export function normalizeWinner(judgement, names = {}) {
  if (judgement === null || typeof judgement !== 'object') return 'draw'

  const winner = typeof judgement.winner === 'string' ? normalizeKey(judgement.winner) : ''
  const model1 = typeof names.model1 === 'string' ? normalizeKey(names.model1) : ''
  const model2 = typeof names.model2 === 'string' ? normalizeKey(names.model2) : ''

  const isFighter1 = FIGHTER_1_ALIASES.some((alias) => normalizeKey(alias) === winner)
  const isFighter2 = FIGHTER_2_ALIASES.some((alias) => normalizeKey(alias) === winner)

  const matches1 = isFighter1 || (model1 !== '' && model1 === winner)
  const matches2 = isFighter2 || (model2 !== '' && model2 === winner)

  if (matches1 && !matches2) return 'fighter1'
  if (matches2 && !matches1) return 'fighter2'

  const score1 = toScore(judgement.solution_1?.score)
  const score2 = toScore(judgement.solution_2?.score)
  if (score1 > score2) return 'fighter1'
  if (score2 > score1) return 'fighter2'
  return 'draw'
}
