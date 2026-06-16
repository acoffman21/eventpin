import type { Round } from '../types'
import { getCourse } from '../data/courses'
import { calcGameResult, playerTotals } from './scoring'

/**
 * Aggregates completed rounds into leaderboard rows. Pure + memo-friendly.
 *
 * ⚠️ FUTURE EXPANSION: when a backend lands, this aggregation can move
 * server-side or be cached; for the MVP we recompute from localStorage rounds.
 */

export interface LeaderboardRow {
  playerId: string
  name: string
  rounds: number
  moneyNet: number
  wins: number
  winRate: number // 0–1
  avgGross: number
  avgNet: number
  bestGross: number | null
}

export type LeaderboardScope = 'all' | 'season' | string // courseId for "by course"

/** Start of the current calendar year (simple "season" definition for MVP). */
function seasonStart(): number {
  const now = new Date()
  return new Date(now.getFullYear(), 0, 1).getTime()
}

export function buildLeaderboard(
  rounds: Round[],
  groupId: string,
  scope: LeaderboardScope,
): LeaderboardRow[] {
  const completed = rounds.filter(
    (r) => r.status === 'completed' && r.groupId === groupId,
  )

  const filtered = completed.filter((r) => {
    if (scope === 'all') return true
    if (scope === 'season') return (r.completedAt ?? r.createdAt) >= seasonStart()
    return r.courseId === scope // by course
  })

  const acc: Record<
    string,
    {
      name: string
      rounds: number
      moneyNet: number
      wins: number
      grossSum: number
      netSum: number
      bestGross: number | null
    }
  > = {}

  for (const round of filtered) {
    const course = getCourse(round.courseId)
    if (!course) continue
    const result = calcGameResult(round, course)
    // Determine round "winner(s)" by most money won (for win-rate fun stat).
    const maxNet = Math.max(...result.money.map((m) => m.net))

    for (const p of round.players) {
      const totals = playerTotals(p, course)
      if (totals.holesPlayed === 0) continue
      const money = result.money.find((m) => m.playerId === p.id)?.net ?? 0
      const row =
        acc[p.id] ??
        (acc[p.id] = {
          name: p.name,
          rounds: 0,
          moneyNet: 0,
          wins: 0,
          grossSum: 0,
          netSum: 0,
          bestGross: null,
        })
      row.rounds += 1
      row.moneyNet += money
      row.grossSum += totals.grossTotal
      row.netSum += totals.netTotal
      if (maxNet > 0 && money === maxNet) row.wins += 1
      row.bestGross =
        row.bestGross == null
          ? totals.grossTotal
          : Math.min(row.bestGross, totals.grossTotal)
    }
  }

  return Object.entries(acc)
    .map(([playerId, r]) => ({
      playerId,
      name: r.name,
      rounds: r.rounds,
      moneyNet: r.moneyNet,
      wins: r.wins,
      winRate: r.rounds ? r.wins / r.rounds : 0,
      avgGross: r.rounds ? r.grossSum / r.rounds : 0,
      avgNet: r.rounds ? r.netSum / r.rounds : 0,
      bestGross: r.bestGross,
    }))
    .sort((a, b) => b.moneyNet - a.moneyNet)
}

export interface HeadToHead {
  aName: string
  bName: string
  aMoney: number
  bMoney: number
}

/** Top rivalry by combined money swing between the two biggest names. */
export function topRivalry(rows: LeaderboardRow[]): HeadToHead | null {
  if (rows.length < 2) return null
  const [a, b] = rows
  return {
    aName: a.name,
    bName: b.name,
    aMoney: a.moneyNet,
    bMoney: b.moneyNet,
  }
}
