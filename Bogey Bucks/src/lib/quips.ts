import { scoreLabel } from './scoring'

/**
 * Humorous, golf/betting-themed notification text. Pure helpers so the UI can
 * fire fun toasts. Extend freely — a future "AI highlights" feature could
 * generate these dynamically (and even Suno parody audio 🎵).
 */

const BIRDIE_QUIPS = [
  '%s just dropped a birdie bomb 🐦💥',
  '%s is printing money 💸',
  '%s went hunting and bagged a birdie 🎯',
]

const BOGEY_QUIPS = [
  '%s just dropped a bogey bomb 💣',
  '%s donated to the pot 🫡',
  '%s found the bogey train 🚂',
]

const EAGLE_QUIPS = [
  '%s soared with an EAGLE 🦅🔥',
  '%s is built different — eagle! 🦅',
]

const BLOWUP_QUIPS = [
  '%s had a little adventure out there 🌲⛳️',
  '%s is feeding the gators 🐊',
  '%s might need a mulligan 😬',
]

function pick(arr: string[], name: string): string {
  const t = arr[Math.floor(Math.random() * arr.length)]
  return t.replace('%s', name)
}

/** Returns a fun quip for a score, or null if it's an unremarkable par. */
export function scoreQuip(
  name: string,
  strokes: number,
  par: number,
): string | null {
  const label = scoreLabel(strokes, par)
  if (label === 'Ace') return `${name} made a HOLE IN ONE! 🕳️⛳️🤯`
  if (label === 'Albatross') return `${name} carded an ALBATROSS 🤯🦅`
  if (label === 'Eagle') return pick(EAGLE_QUIPS, name)
  if (label === 'Birdie') return pick(BIRDIE_QUIPS, name)
  if (label === 'Bogey') return pick(BOGEY_QUIPS, name)
  if (strokes - par >= 3) return pick(BLOWUP_QUIPS, name)
  return null
}
