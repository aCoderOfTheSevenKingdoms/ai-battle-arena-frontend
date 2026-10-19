/**
 * Shared constants for AI Battle Arena.
 * Single source of truth — never hard-code these values in components.
 */

/** Max score a fighter can receive from the AI judge (0..MAX_SCORE scale). */
export const MAX_SCORE = 10

/** Number of discrete segments rendered in a ScoreMeter bar. */
export const SCORE_METER_SEGMENTS = 10

/** Max characters allowed in the problem textarea. */
export const PROBLEM_MAX_CHARS = 2000

/** Character count at which the counter switches to the warning/error color. */
export const PROBLEM_WARN_THRESHOLD = 1800

/** Fighter side identifiers (map to solution_1 / solution_2). */
export const FIGHTER_SIDES = Object.freeze({ ONE: '1', TWO: '2' })

/** Visual variant tones shared across chips, badges, and meters. */
export const TONES = Object.freeze({
  FIGHTER_1: 'fighter1',
  FIGHTER_2: 'fighter2',
  JUDGE: 'judge',
  NEUTRAL: 'neutral',
  ERROR: 'error',
})

/** Default delay (ms) between StatusTicker lines. */
export const STATUS_TICKER_INTERVAL_MS = 2600

/** Delay (ms) for a single count-up tick on ScoreMeter. */
export const SCORE_COUNTUP_DURATION_MS = 1400
