import { TONES, FIGHTER_SIDES } from './constants'

/**
 * Shared Tailwind class maps derived from the Stitch "Cybernetic Arena HUD"
 * theme. Components pick a tone and read consistent classes from here
 * instead of scattering raw colors.
 *
 * @typedef {'fighter1' | 'fighter2' | 'judge' | 'neutral' | 'error'} Tone
 */

/** @type {Record<Tone, Record<string, string>>} */
export const TONE = {
  [TONES.FIGHTER_1]: {
    text: 'text-primary',
    solid: 'bg-primary text-on-primary',
    solidStrong: 'bg-primary-container text-on-primary',
    soft: 'bg-primary/10 text-primary',
    border: 'border-primary/40',
    fill: 'bg-primary',
    glowShadow: 'shadow-[0_0_8px_rgba(34,211,238,0.6)]',
    panelGlow: 'glow-fighter-1',
    ring: 'ring-primary-container',
  },
  [TONES.FIGHTER_2]: {
    text: 'text-secondary',
    solid: 'bg-secondary text-on-secondary',
    solidStrong: 'bg-secondary-container text-on-secondary-container',
    soft: 'bg-secondary/10 text-secondary',
    border: 'border-secondary/40',
    fill: 'bg-secondary',
    glowShadow: 'shadow-[0_0_8px_rgba(255,176,207,0.6)]',
    panelGlow: 'glow-fighter-2',
    ring: 'ring-secondary-container',
  },
  [TONES.JUDGE]: {
    text: 'text-tertiary',
    solid: 'bg-tertiary text-on-tertiary',
    solidStrong: 'bg-tertiary-container text-on-tertiary-container',
    soft: 'bg-tertiary/10 text-tertiary',
    border: 'border-tertiary/40',
    fill: 'bg-tertiary',
    glowShadow: 'shadow-[0_0_8px_rgba(255,214,167,0.6)]',
    panelGlow: 'glow-judge',
    ring: 'ring-tertiary-container',
  },
  [TONES.NEUTRAL]: {
    text: 'text-on-surface-variant',
    solid: 'bg-surface-container-high text-on-surface',
    solidStrong: 'bg-surface-container-high text-on-surface',
    soft: 'bg-surface-container text-on-surface-variant',
    border: 'border-outline-variant',
    fill: 'bg-surface-variant',
    glowShadow: '',
    panelGlow: '',
    ring: 'ring-outline',
  },
  [TONES.ERROR]: {
    text: 'text-error',
    solid: 'bg-error text-on-error',
    solidStrong: 'bg-error-container text-on-error-container',
    soft: 'bg-error-container/40 text-error',
    border: 'border-error/50',
    fill: 'bg-error',
    glowShadow: 'shadow-[0_0_8px_rgba(255,180,171,0.5)]',
    panelGlow: '',
    ring: 'ring-error',
  },
}

/**
 * Map a fighter side ("1" | "2") to its tone key.
 * @param {string} side
 * @returns {Tone}
 */
export function toneForSide(side) {
  return side === FIGHTER_SIDES.TWO ? TONES.FIGHTER_2 : TONES.FIGHTER_1
}
