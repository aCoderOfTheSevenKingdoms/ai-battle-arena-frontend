/**
 * @vitest-environment jsdom
 */
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBattle } from './useBattle.js'
import { runBattle } from '../mocks/runBattle.js'

vi.mock('../mocks/runBattle.js', () => ({ runBattle: vi.fn() }))

const RESULT = {
  problem: 'Fix it',
  solution_1: 'solution one',
  solution_2: 'solution two',
  judgement: {
    solution_1: { score: 8, feedback: 'good' },
    solution_2: { score: 6, feedback: 'ok' },
    winner: 'Fighter 1',
  },
}

/** Lets the promise chain settle without touching real timers. */
const flush = () =>
  act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })

const setup = () => {
  const onBattleUpdate = vi.fn()
  const onBattleComplete = vi.fn()
  const view = renderHook(() => useBattle({ onBattleUpdate, onBattleComplete }))
  return { onBattleUpdate, onBattleComplete, ...view }
}

beforeEach(() => {
  runBattle.mockReset()
})

afterEach(cleanup)

describe('useBattle persistence', () => {
  it('writes the problem to storage the moment it is submitted', () => {
    runBattle.mockReturnValue(new Promise(() => {})) // stays in flight
    const { result, onBattleUpdate, onBattleComplete } = setup()

    act(() => {
      expect(result.current.submit('  Fix it  ')).toBe(true)
    })

    const record = onBattleUpdate.mock.calls[0][0]
    expect(record.problem).toBe('Fix it')
    expect(record.status).toBe('in_progress')
    expect(record.id).toBeTruthy()
    expect(typeof record.createdAt).toBe('number')
    expect(record.solution_1).toBe('')

    expect(onBattleComplete).not.toHaveBeenCalled()
    expect(result.current.phase).toBe('submitting')
    expect(result.current.inputLocked).toBe(true)
  })

  it('rejects empty problems and extra concurrent battles', () => {
    runBattle.mockReturnValue(new Promise(() => {}))
    const { result, onBattleUpdate } = setup()

    act(() => {
      expect(result.current.submit('   ')).toBe(false)
    })
    expect(onBattleUpdate).not.toHaveBeenCalled()

    act(() => {
      expect(result.current.submit('First')).toBe(true)
    })
    act(() => {
      expect(result.current.submit('Second')).toBe(false)
    })
    expect(onBattleUpdate).toHaveBeenCalledTimes(1)
  })

  it('stores the solutions, scores and feedback on success, then completes the reveal', async () => {
    runBattle.mockResolvedValue(RESULT)
    const { result, onBattleUpdate, onBattleComplete } = setup()

    act(() => {
      result.current.submit('Fix it')
    })
    await flush()

    expect(onBattleComplete).toHaveBeenCalledTimes(1)
    const battle = onBattleComplete.mock.calls[0][0]
    expect(battle.status).toBe('complete')
    expect(battle.solution_1).toBe('solution one')
    expect(battle.judgement.solution_1.score).toBe(8)
    // Same record across stages, so IndexedDB upserts one row instead of two.
    expect(battle.id).toBe(onBattleUpdate.mock.calls[0][0].id)
    expect(result.current.phase).toBe('revealing')

    act(() => {
      result.current.finishReveal()
    })
    expect(result.current.phase).toBe('done')
  })

  it('marks the record failed on a network error and reuses the id on retry', async () => {
    const failure = new Error('connection lost')
    failure.kind = 'network'
    runBattle.mockRejectedValue(failure)
    const { result, onBattleUpdate, onBattleComplete } = setup()

    act(() => {
      result.current.submit('Fix it')
    })
    await flush()

    expect(onBattleComplete).not.toHaveBeenCalled()
    expect(result.current.phase).toBe('error')
    expect(result.current.error.kind).toBe('network')

    const failedRecord = onBattleUpdate.mock.calls.at(-1)[0]
    expect(failedRecord.status).toBe('failed')
    expect(failedRecord.problem).toBe('Fix it')

    runBattle.mockResolvedValue(RESULT)
    act(() => {
      expect(result.current.retry()).toBe(true)
    })
    await flush()

    expect(onBattleComplete).toHaveBeenCalledTimes(1)
    expect(onBattleComplete.mock.calls[0][0].id).toBe(failedRecord.id)
  })
})
