// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { getModels, runBattle } from '../lib/api.js'

vi.mock('../lib/api.js', () => ({
  runBattle: vi.fn(),
  getModels: vi.fn(),
}))

const MOCK_DELAY_MS = 11000

const MODELS = {
  solution_1: { model: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'Groq' },
  solution_2: { model: 'command-a-03-2025', name: 'Command A', provider: 'Cohere' },
  judge: { model: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', provider: 'Google' },
}

const buildResult = (problem) => ({
  problem,
  solution_1: 'Solution one',
  solution_2: 'Solution two',
  judgement: {
    solution_1: { score: 8, feedback: 'Sharp and complete.' },
    solution_2: { score: 6, feedback: 'Works, but skips edge cases.' },
    winner: 'Fighter 1',
  },
})

/** Failure kind applied to the next mocked battle call. */
let failureMode = 'none'

// jsdom has no matchMedia; report reduced motion so animated fallbacks are used
// and canvas-confetti never tries to draw on a stub canvas.
beforeAll(() => {
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
})

beforeEach(() => {
  vi.useFakeTimers()
  sessionStorage.clear()
  failureMode = 'none'

  getModels.mockReset()
  getModels.mockReturnValue(new Promise(() => {})) // keep generic labels

  runBattle.mockReset()
  runBattle.mockImplementation(
    (problem) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          if (failureMode === 'none') {
            resolve(buildResult(problem))
            return
          }
          const error = new Error(`mock failure: ${failureMode}`)
          error.kind = failureMode
          reject(error)
        }, MOCK_DELAY_MS)
      }),
  )
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const typeProblem = (value) =>
  fireEvent.change(screen.getByLabelText(/ENTER THE ARENA/), { target: { value } })

const pressFight = () => fireEvent.click(screen.getByRole('button', { name: /FIGHT!/ }))

const advance = (ms) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms)
  })

/** Drives the simulated phases plus the mocked response and the reduced-motion reveal. */
const playFullBattle = async () => {
  await advance(1800) // countdown -> generating
  await advance(8000) // generating -> judging
  await advance(1200) // response lands (11s total)
  await advance(400) // reduced-motion reveal completion
}

describe('App battle flow', () => {
  it('renders the empty arena shell', () => {
    render(<App />)

    expect(screen.getByText(/AI Battle Arena/i)).toBeTruthy()
    expect(screen.getByText(/Throw the first problem into the arena/i)).toBeTruthy()
    expect(screen.getByText(/this browser session/i)).toBeTruthy()
  })

  it('uses real model names in the arena when /models resolves', async () => {
    getModels.mockResolvedValue(MODELS)
    render(<App />)

    await act(async () => {
      await Promise.resolve()
    })

    typeProblem('Write a debounce function')
    pressFight()
    await advance(1800)

    expect(screen.getByText('GPT-OSS 20B')).toBeTruthy()
    expect(screen.getByText('Command A')).toBeTruthy()
    expect(screen.getByText('Gemini 3.1 Flash Lite')).toBeTruthy()
  })

  it('keeps the generic fighter labels when /models is unavailable', async () => {
    getModels.mockRejectedValue(new Error('offline'))
    render(<App />)

    typeProblem('Write a debounce function')
    pressFight()
    await advance(1800)

    expect(screen.getByText('FIGHTER 1')).toBeTruthy()
    expect(screen.getByText('FIGHTER 2')).toBeTruthy()
  })

  it('keeps FIGHT disabled until the problem has real content', () => {
    render(<App />)

    const button = screen.getByRole('button', { name: /FIGHT!/ })
    expect(button.disabled).toBe(true)

    typeProblem('   ')
    expect(button.disabled).toBe(true)

    typeProblem('Write a debounce function')
    expect(button.disabled).toBe(false)
  })

  it('walks submitting -> generating -> judging -> done and records history', async () => {
    render(<App />)
    typeProblem('Write a debounce function with trailing edge')
    pressFight()

    expect(screen.getByText('Round 1 starting.')).toBeTruthy()

    await advance(1800)
    expect(screen.getByText('Fighters are generating.')).toBeTruthy()

    await advance(8000)
    expect(screen.getByText('Judge is deliberating.')).toBeTruthy()

    await advance(1200)
    await advance(400)
    expect(screen.getByText('Battle complete.')).toBeTruthy()
    expect(screen.getByText(/Winner:/)).toBeTruthy()

    // The console moved the log behind the session-count trigger; the counter moved.
    expect(screen.getByRole('button', { name: /Battles:\s*01/i })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Battles:\s*01/i }))
    expect(screen.getAllByText(/Write a debounce function/).length).toBeGreaterThan(0)

    // IndexedDB is missing in jsdom, so the non-blocking notice appears.
    expect(screen.getByText(/will not survive a refresh/i)).toBeTruthy()

    // Input unlocked again after the battle.
    expect(screen.getByRole('button', { name: /FIGHT!/ }).disabled).toBe(false)
  })

  it('shows the knocked-out error with a Retry that keeps the input', async () => {
    failureMode = 'network'
    render(<App />)
    typeProblem('Fix my broken build')
    pressFight()

    await advance(11000)

    expect(screen.getByText(/Connection lost/)).toBeTruthy()
    expect(screen.getByText(/THE ARENA HAS CRASHED/i)).toBeTruthy()
    // The persisted problem is still shown on the failed round.
    expect(screen.getByText(/PHASE: ROUND FAILED/)).toBeTruthy()

    const textarea = screen.getByLabelText(/ENTER THE ARENA/)
    expect(textarea.value).toBe('Fix my broken build')

    // Failed battles never reach history.
    fireEvent.click(screen.getByRole('button', { name: /Battles:\s*00/i }))
    expect(screen.getByText(/NO BATTLES YET/i)).toBeTruthy()

    failureMode = 'none'
    fireEvent.click(screen.getByRole('button', { name: /REBOOT BENCHMARK/ }))
    expect(screen.getByText('Round 1 starting.')).toBeTruthy()

    await playFullBattle()
    expect(screen.getByText('Battle complete.')).toBeTruthy()
  })
})
