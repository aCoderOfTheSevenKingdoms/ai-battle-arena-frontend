/**
 * Sample battle payloads for the Phase 2 mock backend.
 * Mock-only: nothing outside `mocks/` may import this file.
 * @module mocks/mockBattles
 */

/**
 * Judge-style feedback lines used by the mock judge.
 * Kept short and generic so mock output never reads as a real model name.
 */
const FEEDBACK = Object.freeze({
  winner: [
    'Clear structure, handles the edge cases, and the explanation stays readable. Minor: could mention complexity where it matters.',
    'Correct and complete, with a confident implementation. The reasoning is easy to follow and the code compiles in your head.',
    'Strong answer: right abstractions, defensive where it counts, and it answers exactly what was asked.',
  ],
  loser: [
    'Works for the happy path but skips edge cases and error handling. The idea is right; the finish is missing.',
    'Mostly correct, though the explanation meanders and one assumption goes unchained. Solid draft, incomplete verdict.',
    'Readable and plausible, but it glosses over the tricky part and offers no way to verify the result.',
  ],
})

/**
 * Two different-flavoured markdown answers for an arbitrary problem.
 * @param {string} problem
 * @returns {{ solution_1: string, solution_2: string }}
 */
function buildSolutions(problem) {
  const safe = problem.trim().replace(/\s+/g, ' ')

  const solution_1 = [
    `## Straight-line answer`,
    ``,
    `Taking **${safe}** and keeping the solution small:`,
    ``,
    `1. State the contract first — inputs, outputs, failure modes.`,
    `2. Implement the core path with no hidden state.`,
    `3. Prove it with one happy-path and one edge-case test.`,
    ``,
    `\`\`\`js`,
    `export function solve(input) {`,
    `  if (input == null) throw new TypeError("input required")`,
    `  const normalized = String(input).trim()`,
    `  if (!normalized) return { ok: false, reason: "empty" }`,
    `  return { ok: true, value: normalized }`,
    `}`,
    `\`\`\``,
    ``,
    `Why this shape: the guard runs before any work, and the caller always`,
    `gets a discriminated result instead of a surprise exception.`,
  ].join('\n')

  const solution_2 = [
    `# Designing a robust approach`,
    ``,
    `For **${safe}** the interesting part is not the happy path — it is what`,
    `happens when the input lies to you. My take:`,
    ``,
    `- **Validate at the boundary.** Convert once, then treat the inside as trusted.`,
    `- **Return results, don't throw.** A result object lets callers branch without`,
    `  try/catch noise.`,
    `- **Make it testable.** Pure function in, data out, no hidden dependencies.`,
    ``,
    `\`\`\`js`,
    `export const solve = (raw) => {`,
    `  const input = normalize(raw)`,
    `  if (!input.valid) {`,
    `    return { ok: false, errors: input.errors }`,
    `  }`,
    `  return { ok: true, value: transform(input.value) }`,
    `}`,
    ``,
    `const normalize = (raw) =>`,
    `  typeof raw === "string" && raw.trim()`,
    `    ? { valid: true, value: raw.trim() }`,
    `    : { valid: false, errors: ["expected a non-empty string"] }`,
    `\`\`\``,
    ``,
    `Trade-off: slightly more code up front, but every failure mode becomes`,
    `a value you can assert on instead of an exception you have to guess about.`,
  ].join('\n')

  return { solution_1, solution_2 }
}

/**
 * Build a complete mock `/use-graph` response for a problem.
 * @param {string} problem
 * @param {{ outcome?: 'fighter1' | 'fighter2' | 'draw' }} [options]
 * @returns {{ problem: string, solution_1: string, solution_2: string, judgement: import('../lib/types.js').Judgement }}
 */
export function createMockResult(problem, options = {}) {
  const { solution_1, solution_2 } = buildSolutions(problem)
  const outcome =
    options.outcome ??
    (Math.random() < 0.15
      ? 'draw'
      : Math.random() < 0.5
        ? 'fighter1'
        : 'fighter2')

  const pick = (list) => list[Math.floor(Math.random() * list.length)]

  if (outcome === 'draw') {
    return {
      problem,
      solution_1,
      solution_2,
      judgement: {
        solution_1: { score: 8, feedback: pick(FEEDBACK.winner) },
        solution_2: { score: 8, feedback: pick(FEEDBACK.winner) },
        winner: 'Both solutions are equally strong',
      },
    }
  }

  const winnerIsOne = outcome === 'fighter1'
  const high = 8 + Math.random()
  const low = 6 + Math.random() * 1.5

  return {
    problem,
    solution_1,
    solution_2,
    judgement: {
      solution_1: {
        score: Number((winnerIsOne ? high : low).toFixed(1)),
        feedback: pick(winnerIsOne ? FEEDBACK.winner : FEEDBACK.loser),
      },
      solution_2: {
        score: Number((winnerIsOne ? low : high).toFixed(1)),
        feedback: pick(winnerIsOne ? FEEDBACK.loser : FEEDBACK.winner),
      },
      winner: winnerIsOne ? 'Fighter 1' : 'Fighter 2',
    },
  }
}
