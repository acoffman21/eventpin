import type { Group, PlayerProfile } from '../types'

/**
 * Initial seed data for first launch. Persisted to localStorage on first run,
 * then fully user-editable. Replace/remove once real account + group sync
 * (Firebase/Supabase) lands.
 */

export const SEED_GROUPS: Group[] = [
  {
    id: 'jare-bears',
    name: 'Jare Bears Crew',
    emoji: '🐻',
    createdAt: Date.now(),
  },
  {
    id: 'coffman-family',
    name: 'Coffman Family Golf',
    emoji: '⛳️',
    createdAt: Date.now(),
  },
]

/**
 * Seed player profiles. handicapIndex defaults are placeholders — when GHIN
 * integration lands, derive these from the player's official index.
 */
export const SEED_PLAYERS: PlayerProfile[] = [
  { id: 'andy', name: 'Andy', handicapIndex: 12 },
  { id: 'jare-bear', name: 'Jare Bear', handicapIndex: 8 },
  { id: 'big-tony', name: 'Big Tony', handicapIndex: 18 },
  { id: 'smooth-sam', name: 'Smooth Sam', handicapIndex: 4 },
  { id: 'jim-bob', name: 'Jim Bob', handicapIndex: 24 },
]
