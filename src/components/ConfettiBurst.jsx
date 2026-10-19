import { useEffect } from 'react'
import confetti from 'canvas-confetti'

/**
 * One-shot confetti burst in arena colors. No-ops under
 * prefers-reduced-motion; fires once when `fire` is true.
 *
 * Currently hard-disabled: the burst white-screened the whole app at the
 * moment of the winner reveal. Re-enable once the crash is diagnosed.
 */
const CONFETTI_ENABLED = false

/**
 * @param {object} props
 * @param {boolean} [props.fire=true]
 * @param {string[]} [props.colors] Burst colors (arena fighter/judge palette).
 * @param {number} [props.particleCount=140]
 */
function ConfettiBurst({
  fire = true,
  colors = ['#22d3ee', '#d10183', '#ffb147', '#8aebff', '#ffb0cf'],
  particleCount = 140,
}) {
  useEffect(() => {
    if (!CONFETTI_ENABLED) return
    if (!fire) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const cleanup = confetti({
      particleCount,
      spread: 70,
      origin: { y: 0.6 },
      colors,
      disableForReducedMotion: true,
      scalar: 0.9,
    })

    return cleanup
  }, [fire, colors, particleCount])

  return null
}

export default ConfettiBurst
