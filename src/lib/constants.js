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

/**
 * Battle flow state machine phases.
 * idle -> submitting -> generating -> judging -> revealing -> done, plus error.
 */
export const BATTLE_PHASES = Object.freeze({
  IDLE: 'idle',
  SUBMITTING: 'submitting',
  GENERATING: 'generating',
  JUDGING: 'judging',
  REVEALING: 'revealing',
  DONE: 'done',
  ERROR: 'error',
})

/** Top-level page views: the pre-battle landing vs. the arena console. */
export const ARENA_VIEWS = Object.freeze({
  LANDING: 'landing',
  ARENA: 'arena',
})

/** Phases in which a battle request is in flight and the input stays locked. */
export const ACTIVE_PHASES = Object.freeze([
  BATTLE_PHASES.SUBMITTING,
  BATTLE_PHASES.GENERATING,
  BATTLE_PHASES.JUDGING,
])

/** Duration (ms) of the "3... 2... 1... FIGHT!" round-start countdown. */
export const ROUND_COUNTDOWN_MS = 1800

/** Simulated duration (ms) of loading Phase A ("fighters generating"). */
export const GENERATING_PHASE_MS = 8000

/** Elapsed wait (ms) before the "this can take a moment" reassurance appears. */
export const REASSURANCE_AFTER_MS = 20000

/** Elapsed wait (ms) before the longer "still working" message appears. */
export const STILL_WORKING_AFTER_MS = 45000

/** Total duration (ms) of the skippable result reveal sequence. */
export const REVEAL_DURATION_MS = 5000

/** Network request timeout (ms) for the battle call. */
export const REQUEST_TIMEOUT_MS = 120000

/** Shorter timeout (ms) for the read-only model roster lookup. */
export const MODELS_TIMEOUT_MS = 8000

/** API origin used when `VITE_API_BASE_URL` is not configured. */
export const DEFAULT_API_BASE_URL = 'http://localhost:3000'

/** Example problems offered as clickable chips under the textarea. */
export const EXAMPLE_PROBLEMS = Object.freeze([
  'Debounce a function in JavaScript with trailing edge and cancel support',
  'Explain the difference between a stack and a queue, with a real use case each',
  'Write a SQL query to find the second highest salary per department',
  'Design a rate limiter for a public API and justify your choices',
])
