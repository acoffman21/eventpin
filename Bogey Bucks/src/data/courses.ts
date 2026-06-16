import type { Course } from '../types'

/**
 * Hardcoded course data for the MVP.
 *
 * ⚠️ FUTURE EXPANSION: Replace these approximate values with real data.
 *   - Par values for Keene Trace are accurate (both are Par 72 layouts).
 *   - Stroke indexes below are *approximations* using a standard Par 72
 *     allocation pattern (odd indexes on the front nine, even on the back,
 *     hardest holes weighted toward par 4s/5s). Swap in the official
 *     scorecard handicap ratings when available.
 *   - Yardages are placeholders (0) — wire up per-tee yardage later.
 *
 * Real data sources to integrate later: course's official scorecard,
 * a course API, or GHIN course/tee tables.
 */

// Helper to build an 18-hole array from compact tuples: [par, strokeIndex]
function buildHoles(
  rows: [par: number, strokeIndex: number][],
): Course['holes'] {
  return rows.map(([par, strokeIndex], i) => ({
    number: i + 1,
    par,
    strokeIndex,
    yards: 0, // placeholder — replace with real per-tee yardage
  }))
}

// --- Keene Trace · Keene Run (Par 72) ---------------------------------------
// Approximate stroke-index allocation (replace with official scorecard).
const keeneRunHoles = buildHoles([
  // Front nine                       // Back nine
  [4, 7], //  1                       [4, 4]  -> set below
  [5, 3], //  2
  [4, 11], // 3
  [3, 17], // 4
  [4, 1], //  5  (signature tough par 4)
  [4, 13], // 6
  [5, 5], //  7
  [3, 15], // 8
  [4, 9], //  9
  // Back nine
  [4, 4], // 10
  [4, 10], // 11
  [5, 2], // 12
  [3, 16], // 13
  [4, 6], // 14
  [4, 12], // 15
  [3, 18], // 16
  [5, 8], // 17
  [4, 14], // 18
])

// --- Keene Trace · Champions Trace (Par 72) ---------------------------------
// Home of past Champions Tour events; tougher routing.
// Approximate stroke-index allocation (replace with official scorecard).
const championsTraceHoles = buildHoles([
  // Front nine
  [4, 5], //  1
  [4, 9], //  2
  [5, 1], //  3  (reachable but penal par 5)
  [3, 15], // 4
  [4, 7], //  5
  [4, 3], //  6
  [3, 17], // 7
  [5, 11], // 8
  [4, 13], // 9
  // Back nine
  [4, 2], // 10
  [3, 18], // 11
  [4, 8], // 12
  [5, 6], // 13
  [4, 10], // 14
  [4, 4], // 15
  [3, 16], // 16
  [4, 12], // 17
  [5, 14], // 18
])

export const COURSES: Course[] = [
  {
    id: 'keene-run',
    facility: 'Keene Trace',
    name: 'Keene Run',
    par: 72,
    rating: 73.0, // placeholder
    slope: 135, // placeholder
    holes: keeneRunHoles,
  },
  {
    id: 'champions-trace',
    facility: 'Keene Trace',
    name: 'Champions Trace',
    par: 72,
    rating: 74.5, // placeholder
    slope: 142, // placeholder
    holes: championsTraceHoles,
  },
]

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id)
}
