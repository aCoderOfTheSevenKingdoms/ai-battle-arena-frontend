import { useEffect, useState } from 'react'
import { ROUND_COUNTDOWN_MS } from '../lib/constants.js'

const STEPS = ['3', '2', '1', 'FIGHT!']
const STEP_MS = ROUND_COUNTDOWN_MS / STEPS.length

/**
 * The brief "ROUND 1 — 3... 2... 1... FIGHT!" flash before loading phases.
 * Purely cosmetic; it unmounts when the battle moves to the generating phase.
 */
function RoundCountdown() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined

    const timers = STEPS.slice(1).map((_, index) =>
      setTimeout(() => setStep(index + 1), STEP_MS * (index + 1)),
    )
    return () => timers.forEach((timer) => clearTimeout(timer))
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-space-md py-space-xl">
      <span className="font-display text-label-caps uppercase tracking-[0.3em] text-judge">
        ROUND 1
      </span>
      <p
        aria-hidden="true"
        className={`font-display uppercase text-glow-fighter-1 ${
          STEPS[step] === 'FIGHT!'
            ? 'text-display-hero-mobile sm:text-display-hero text-judge text-glow-judge'
            : 'text-headline-lg-mobile sm:text-headline-lg text-on-surface'
        }`}
      >
        {STEPS[step]}
      </p>
    </div>
  )
}

export default RoundCountdown
