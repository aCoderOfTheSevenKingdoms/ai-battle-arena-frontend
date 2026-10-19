// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { setMockDelay, setMockFailure } from '../mocks/runBattle.js'

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
  setMockFailure('none')
  setMockDelay(null)
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

/** Drives the simulated phases plus the mock response and the reduced-motion reveal. */
const playFullBattle = async () => {
  await advance(1800) // countdown -> generating
  await advance(8000) // generating -> judging
  await advance(1200) // mock response lands (11s total)
  await advance(400) // reduced-motion reveal completion
}

describe('App battle flow', () => {
  it('renders the empty arena shell', () => {
    render(<App />)

    expect(screen.getByText(/AI Battle Arena/i)).toBeTruthy()
    expect(screen.getByText(/Throw the first problem into the arena/i)).toBeTruthy()
    expect(screen.getByText(/this browser session/i)).toBeTruthy()
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

    // Battle is in history (newest first) and the session counter moved.
    expect(screen.getAllByText(/Write a debounce function/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Battles:\s*01/i)).toBeTruthy()

    // IndexedDB is missing in jsdom, so the non-blocking notice appears.
    expect(screen.getByText(/will not survive a refresh/i)).toBeTruthy()

    // Input unlocked again after the battle.
    expect(screen.getByRole('button', { name: /FIGHT!/ }).disabled).toBe(false)
  })

  it('shows the knocked-out error with a Retry that keeps the input', async () => {
    setMockFailure('network')
    render(<App />)
    typeProblem('Fix my broken build')
    pressFight()

    await advance(11000)

    expect(screen.getByText(/Connection lost/)).toBeTruthy()
    expect(screen.getByText(/THE ARENA HAS CRASHED/i)).toBeTruthy()

    const textarea = screen.getByLabelText(/ENTER THE ARENA/)
    expect(textarea.value).toBe('Fix my broken build')

    // Failed battles never reach history.
    expect(screen.getByText(/NO BATTLES YET/i)).toBeTruthy()

    setMockFailure('none')
    fireEvent.click(screen.getByRole('button', { name: /REBOOT BENCHMARK/ }))
    expect(screen.getByText('Round 1 starting.')).toBeTruthy()

    await playFullBattle()
    expect(screen.getByText('Battle complete.')).toBeTruthy()
  })
})
