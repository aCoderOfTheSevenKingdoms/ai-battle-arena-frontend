/**
 * Shared JSDoc type definitions for AI Battle Arena.
 * The project is JavaScript-only, so shapes are documented here instead of TypeScript.
 * Import this module for its typedefs: `import {} from './types.js'` (editor tooling).
 *
 * @typedef {Object} JudgeResult
 * @property {number} score   0..MAX_SCORE
 * @property {string} feedback
 *
 * @typedef {Object} Judgement
 * @property {JudgeResult} solution_1
 * @property {JudgeResult} solution_2
 * @property {string} winner  Raw judge verdict string (untrusted, normalize before use)
 *
 * @typedef {Object} Battle
 * @property {string} id         crypto.randomUUID()
 * @property {number} createdAt  Date.now(), indexed for sorting
 * @property {string} problem
 * @property {string} solution_1
 * @property {string} solution_2
 * @property {Judgement} judgement
 * @property {'in_progress' | 'complete' | 'failed'} [status]
 *   Lifecycle marker: written at submit (in_progress), response (complete),
 *   or failure (failed). Only `complete` battles are listed in history.
 *
 * @typedef {'fighter1' | 'fighter2' | 'draw'} Outcome
 *   Which side won after normalization; 'draw' when scores tie and nothing matches.
 *
 * @typedef {Object} BattleError
 * @property {'network' | 'server' | 'timeout' | 'unknown'} kind
 * @property {string} message  Human-readable, already mapped for display
 * @property {number} [status] HTTP status for 'server' errors
 *
 * @typedef {Object} ModelInfo
 * @property {string} model     Provider model identifier, e.g. "openai/gpt-oss-20b"
 * @property {string} name      Human-readable model name
 * @property {string} provider  Provider name, e.g. "Groq"
 *
 * @typedef {Object} ModelRoster
 * @property {ModelInfo | null} solution_1 Fighter 1 model
 * @property {ModelInfo | null} solution_2 Fighter 2 model
 * @property {ModelInfo | null} judge      Judge model
 */

export {}
