/**
 * Bogey Bucks — core domain types.
 *
 * These types are intentionally backend-agnostic so they can be reused when a
 * real backend is added later (see future-expansion notes throughout the app):
 *   - Firebase / Supabase persistence (swap localStorage store for cloud sync)
 *   - Real course API (replace hardcoded course data in src/data/courses.ts)
 *   - GHIN integration (populate Player.ghin + derive handicapIndex)
 */

// ---------------------------------------------------------------------------
// Courses
// ---------------------------------------------------------------------------

export interface HoleInfo {
  /** Hole number 1–18 */
  number: number
  /** Par for the hole (3, 4, or 5) */
  par: number
  /**
   * Stroke index / handicap rating 1–18.
   * Lower = harder hole = stroke given first for net scoring.
   */
  strokeIndex: number
  /** Optional yardage placeholder for future tee/yardage expansion. */
  yards?: number
}

export interface Course {
  id: string
  /** Facility name, e.g. "Keene Trace" */
  facility: string
  /** Specific course/nine name, e.g. "Champions Trace" */
  name: string
  par: number
  /** Course rating placeholder — replace with real rating from a course API. */
  rating?: number
  /** Slope placeholder — replace with real slope from a course API. */
  slope?: number
  holes: HoleInfo[]
}

// ---------------------------------------------------------------------------
// Groups & Players
// ---------------------------------------------------------------------------

export interface Group {
  id: string
  name: string
  /** Emoji or short tag used for the group avatar. */
  emoji: string
  createdAt: number
}

/** A reusable player profile that lives at the group/global level. */
export interface PlayerProfile {
  id: string
  name: string
  handicapIndex: number
  /** GHIN number placeholder — wire up real GHIN lookups later. */
  ghin?: string
}

/** A player participating in a specific round (snapshot of profile + scores). */
export interface RoundPlayer {
  id: string
  name: string
  handicapIndex: number
  ghin?: string
  /**
   * Per-hole gross strokes. Index 0 === hole 1. `null` === not yet entered.
   * Always length 18.
   */
  scores: (number | null)[]
  /** Optional per-hole putts. Length 18. */
  putts: (number | null)[]
  /** Optional per-hole fairway-in-regulation. Length 18. */
  fir: (boolean | null)[]
  /** Optional per-hole green-in-regulation. Length 18. */
  gir: (boolean | null)[]
}

// ---------------------------------------------------------------------------
// Games / Bets
// ---------------------------------------------------------------------------

export type GameType = 'skins' | 'nassau' | 'match'

export type ScoringMode = 'gross' | 'net'

export interface GameConfig {
  type: GameType
  /**
   * Dollar amount. Meaning depends on game type:
   *  - skins: $ per skin
   *  - nassau: $ per segment (front / back / total)
   *  - match: $ for the match
   */
  betAmount: number
  scoringMode: ScoringMode
  /** Nassau/Match: allow presses (simplified flag for MVP). */
  pressEnabled: boolean
}

// ---------------------------------------------------------------------------
// Rounds
// ---------------------------------------------------------------------------

export type RoundStatus = 'active' | 'completed'

export interface Round {
  id: string
  groupId: string
  courseId: string
  game: GameConfig
  players: RoundPlayer[]
  /** Current hole being scored (1–18) for resuming an active round. */
  currentHole: number
  status: RoundStatus
  createdAt: number
  completedAt?: number
}

// ---------------------------------------------------------------------------
// Settlement / results
// ---------------------------------------------------------------------------

/** Net money result for one player across a round's game. */
export interface PlayerMoneyResult {
  playerId: string
  name: string
  /** Positive = won money, negative = lost money. Sums to ~0 across players. */
  net: number
}

/** A single suggested "who owes who" transfer. */
export interface Settlement {
  fromPlayerId: string
  fromName: string
  toPlayerId: string
  toName: string
  amount: number
}

export interface GameResult {
  type: GameType
  /** Human-readable summary lines, e.g. "Skins: Andy 3, Jare 1 (2 pushed)". */
  summaryLines: string[]
  money: PlayerMoneyResult[]
}
