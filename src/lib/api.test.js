// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getModels, runBattle } from './api.js'
import { REQUEST_TIMEOUT_MS } from './constants.js'

const jsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => payload,
})

const BATTLE_STATE = {
  problem: 'Fix it',
  solution_1: 'solution one',
  solution_2: 'solution two',
  judgement: {
    solution_1: { score: 8, feedback: 'good' },
    solution_2: { score: 6, feedback: 'ok' },
    winner: 'Fighter 1',
  },
}

const MODELS_PAYLOAD = {
  fighters: {
    solution_1: { model: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', provider: 'Groq' },
    solution_2: { model: 'command-a-03-2025', name: 'Command A', provider: 'Cohere' },
  },
  judge: { model: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', provider: 'Google' },
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('runBattle', () => {
  it('posts the problem and unwraps the graph result envelope', async () => {
    fetch.mockResolvedValue(jsonResponse({ result: BATTLE_STATE }))

    const result = await runBattle('Fix it')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/use-graph'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ problem: 'Fix it' }) }),
    )
    expect(result).toEqual(BATTLE_STATE)
  })

  it('maps non-2xx responses to a server error with the status', async () => {
    fetch.mockResolvedValue(jsonResponse({ error: 'nope' }, 502))

    await expect(runBattle('Fix it')).rejects.toMatchObject({ kind: 'server', status: 502 })
  })

  it('maps a rejected fetch to a network error', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(runBattle('Fix it')).rejects.toMatchObject({ kind: 'network' })
  })

  it('rejects a response with a malformed judgement', async () => {
    fetch.mockResolvedValue(
      jsonResponse({ result: { ...BATTLE_STATE, judgement: { winner: 'Fighter 1' } } }),
    )

    await expect(runBattle('Fix it')).rejects.toMatchObject({ kind: 'invalid' })
  })

  it('maps a request that exceeds the timeout to a timeout error', async () => {
    vi.useFakeTimers()
    fetch.mockImplementation(
      (url, options) =>
        new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () => {
            const error = new Error('aborted')
            error.name = 'AbortError'
            reject(error)
          })
        }),
    )

    const pending = runBattle('Slow').catch((error) => error)
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS)

    expect((await pending).kind).toBe('timeout')
  })
})

describe('getModels', () => {
  it('parses the fighter and judge roster', async () => {
    fetch.mockResolvedValue(jsonResponse(MODELS_PAYLOAD))

    const models = await getModels()

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/models'),
      expect.objectContaining({ method: 'GET' }),
    )
    expect(models.solution_1.name).toBe('GPT-OSS 20B')
    expect(models.solution_2.model).toBe('command-a-03-2025')
    expect(models.judge.provider).toBe('Google')
  })

  it('rejects a roster without both fighters', async () => {
    fetch.mockResolvedValue(jsonResponse({ fighters: { solution_1: MODELS_PAYLOAD.fighters.solution_1 } }))

    await expect(getModels()).rejects.toMatchObject({ kind: 'invalid' })
  })
})
