import { describe, it, expect } from 'vitest'
import { normalizeWinner } from './normalizeWinner.js'

/**
 * Build a minimal Judgement. Defaults produce equal scores so any non-draw
 * result must come from an alias/model match, not the score fallback.
 * @param {{ winner?: unknown, score1?: unknown, score2?: unknown, noScores?: boolean }} [fields]
 */
function makeJudgement({ winner = 'solution_1', score1 = 5, score2 = 5, noScores = false } = {}) {
  if (noScores) return { winner }
  return {
    winner,
    solution_1: { score: score1, feedback: 'fb1' },
    solution_2: { score: score2, feedback: 'fb2' },
  }
}

describe('normalizeWinner — alias matching', () => {
  it("maps 'solution_1' and 'solution_2' to their sides", () => {
    expect(normalizeWinner(makeJudgement({ winner: 'solution_1' }))).toBe('fighter1')
    expect(normalizeWinner(makeJudgement({ winner: 'solution_2' }))).toBe('fighter2')
  })

  it('is case-insensitive for fighter aliases', () => {
    expect(normalizeWinner(makeJudgement({ winner: 'Fighter 1' }))).toBe('fighter1')
    expect(normalizeWinner(makeJudgement({ winner: 'Fighter 2' }))).toBe('fighter2')
  })

  it("matches 'P1' / 'p2'", () => {
    expect(normalizeWinner(makeJudgement({ winner: 'P1' }))).toBe('fighter1')
    expect(normalizeWinner(makeJudgement({ winner: 'p2' }))).toBe('fighter2')
  })

  it('tolerates leading/trailing whitespace, punctuation, and separators', () => {
    expect(normalizeWinner(makeJudgement({ winner: ' Solution_2!! ' }))).toBe('fighter2')
    expect(normalizeWinner(makeJudgement({ winner: '---fighter.1---' }))).toBe('fighter1')
  })

  it('lets an explicit match beat an equal-score tie', () => {
    expect(normalizeWinner(makeJudgement({ winner: 'Fighter 2', score1: 8, score2: 8 }))).toBe(
      'fighter2',
    )
  })
})

describe('normalizeWinner — model names', () => {
  it('matches names.model2 regardless of case and separators', () => {
    const judgement = makeJudgement({ winner: 'NEURACORE-X' })
    expect(normalizeWinner(judgement, { model2: 'Neuracore-X' })).toBe('fighter2')
  })

  it('matches names.model1 regardless of case and separators', () => {
    const judgement = makeJudgement({ winner: 'Orbit-X' })
    expect(normalizeWinner(judgement, { model1: 'ORBIT X' })).toBe('fighter1')
  })

  it('prefers the score fallback when both model names match (ambiguous)', () => {
    const judgement = makeJudgement({ winner: 'Tiebreak', score1: 6, score2: 2 })
    expect(normalizeWinner(judgement, { model1: 'Tiebreak', model2: 'Tiebreak' })).toBe('fighter1')
  })
})

describe('normalizeWinner — score fallback', () => {
  it("falls back to the higher score for an unmatchable winner ('the people')", () => {
    const judgement = makeJudgement({ winner: 'the people', score1: 7, score2: 9 })
    expect(normalizeWinner(judgement)).toBe('fighter2')
  })

  it('returns a draw for an unmatchable winner with equal scores', () => {
    const judgement = makeJudgement({ winner: 'the people', score1: 8, score2: 8 })
    expect(normalizeWinner(judgement)).toBe('draw')
  })

  it('falls back to scores when the winner contains both sides (ambiguous)', () => {
    const judgement = makeJudgement({ winner: 'Fighter 1 defeats Fighter 2', score1: 9, score2: 4 })
    expect(normalizeWinner(judgement)).toBe('fighter1')
  })

  it('treats non-numeric scores as 0', () => {
    const judgement = makeJudgement({ winner: 'nobody', score1: 'high', score2: 7 })
    expect(normalizeWinner(judgement)).toBe('fighter2')
  })

  it('returns a draw when scores are missing entirely', () => {
    expect(normalizeWinner(makeJudgement({ winner: 'nobody', noScores: true }))).toBe('draw')
    expect(normalizeWinner({ winner: 'nobody' })).toBe('draw')
  })
})

describe('normalizeWinner — malformed input never throws', () => {
  it('returns a draw for null or undefined judgement', () => {
    expect(normalizeWinner(null)).toBe('draw')
    expect(normalizeWinner(undefined)).toBe('draw')
  })

  it('returns a draw for a non-object judgement', () => {
    expect(normalizeWinner('solution_1')).toBe('draw')
    expect(normalizeWinner(42)).toBe('draw')
  })

  it('falls back to scores when the winner is not a string', () => {
    expect(normalizeWinner(makeJudgement({ winner: 1, score1: 3, score2: 6 }))).toBe('fighter2')
    expect(normalizeWinner(makeJudgement({ winner: null, score1: 4, score2: 4 }))).toBe('draw')
  })
})
