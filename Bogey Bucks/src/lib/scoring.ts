import type {
  Course,
  GameConfig,
  GameResult,
  PlayerMoneyResult,
  Round,
  RoundPlayer,
  Settlement,
} from '../types'

/**
 * Bogey Bucks scoring + betting engine.
 *
 * All money calculations are intentionally pure functions so they can be unit
 * tested and reused on a future server. Handicaps use a simplified
 * "course handicap === handicap index" model for the MVP — when GHIN/slope
 * integration lands, compute course handicap as:
 *   round(handicapIndex * slope / 113) + (rating - par)
 */

// ---------------------------------------------------------------------------
// Stroke allocation
// ---------------------------------------------------------------------------

/**
 * Returns an 18-length array of strokes received per hole for a given course
 * handicap, allocated by stroke index (hardest holes first).
 */
export function strokesByHole(courseHandicap: number, course: Course): number[] {
  const strokes = new Array(18).fill(0)
  const ch = Math.max(0, Math.round(courseHandicap))
  for (let i = 0; i < ch; i++) {
    // Each "pass" gives a stroke to holes in stroke-index order.
    const targetIndex = (i % 18) + 1
    const hole = course.holes.find((h) => h.strokeIndex === targetIndex)
    if (hole) strokes[hole.number - 1] += 1
  }
  return strokes
}

/** Course handicap for the MVP (simplified). See note above. */
export function courseHandicap(player: RoundPlayer): number {
  return Math.round(player.handicapIndex)
}

/** Net score on a single hole for a player, or null if not entered. */
export function netForHole(
  player: RoundPlayer,
  holeIndex: number,
  course: Course,
): number | null {
  const gross = player.scores[holeIndex]
  if (gross == null) return null
  const allocation = strokesByHole(courseHandicap(player), course)
  return gross - allocation[holeIndex]
}

export interface PlayerTotals {
  playerId: string
  name: string
  grossTotal: number
  netTotal: number
  holesPlayed: number
  toPar: number // gross strokes relative to par for holes played
}

export function playerTotals(
  player: RoundPlayer,
  course: Course,
): PlayerTotals {
  const allocation = strokesByHole(courseHandicap(player), course)
  let gross = 0
  let net = 0
  let played = 0
  let parPlayed = 0
  player.scores.forEach((s, i) => {
    if (s == null) return
    gross += s
    net += s - allocation[i]
    parPlayed += course.holes[i].par
    played += 1
  })
  return {
    playerId: player.id,
    name: player.name,
    grossTotal: gross,
    netTotal: net,
    holesPlayed: played,
    toPar: gross - parPlayed,
  }
}

// ---------------------------------------------------------------------------
// Effective per-hole score for a game (respects gross vs net scoring mode)
// ---------------------------------------------------------------------------

function effectiveHoleScore(
  player: RoundPlayer,
  holeIndex: number,
  course: Course,
  mode: GameConfig['scoringMode'],
): number | null {
  const gross = player.scores[holeIndex]
  if (gross == null) return null
  if (mode === 'gross') return gross
  const allocation = strokesByHole(courseHandicap(player), course)
  return gross - allocation[holeIndex]
}

// ---------------------------------------------------------------------------
// SKINS
// ---------------------------------------------------------------------------

/**
 * Skins: lowest unique score wins the hole's skin pot. Ties carry over
 * (push) and the pot rolls to the next hole. Payouts are funded by all other
 * players paying the winner `betAmount` per skin won.
 */
export function calcSkins(
  players: RoundPlayer[],
  course: Course,
  game: GameConfig,
): GameResult {
  const skinsWon: Record<string, number> = {}
  players.forEach((p) => (skinsWon[p.id] = 0))

  let carry = 0
  const lines: string[] = []

  for (let h = 0; h < 18; h++) {
    const scores = players.map((p) => ({
      id: p.id,
      name: p.name,
      score: effectiveHoleScore(p, h, course, game.scoringMode),
    }))
    // Only settle the hole once everyone has a score.
    if (scores.some((s) => s.score == null)) continue

    const min = Math.min(...scores.map((s) => s.score as number))
    const winners = scores.filter((s) => s.score === min)
    const potThisHole = 1 + carry
    if (winners.length === 1) {
      skinsWon[winners[0].id] += potThisHole
      if (carry > 0) {
        lines.push(
          `Hole ${h + 1}: ${winners[0].name} grabbed ${potThisHole} skins 🤑`,
        )
      }
      carry = 0
    } else {
      carry = potThisHole // push — rolls over
    }
  }

  if (carry > 0) lines.push(`${carry} skin(s) pushed to the bar tab 🍺`)

  // Money: each skin is worth betAmount, paid by every *other* player.
  const others = players.length - 1
  const money: PlayerMoneyResult[] = players.map((p) => {
    // amount this player receives from others for skins they won
    const earned = skinsWon[p.id] * game.betAmount * others
    // amount this player pays for everyone else's skins
    const paid = players
      .filter((o) => o.id !== p.id)
      .reduce((sum, o) => sum + skinsWon[o.id] * game.betAmount, 0)
    return { playerId: p.id, name: p.name, net: earned - paid }
  })

  const skinSummary = players
    .map((p) => `${p.name} ${skinsWon[p.id]}`)
    .join(' · ')
  lines.unshift(`Skins won — ${skinSummary}`)

  return { type: 'skins', summaryLines: lines, money }
}

// ---------------------------------------------------------------------------
// MATCH PLAY (2 players) — hole-by-hole, 1 up etc.
// ---------------------------------------------------------------------------

/**
 * Match play for exactly 2 players. Winner of the match takes `betAmount`.
 * For >2 players we fall back to a round-robin of 1-on-1 matches.
 */
export function calcMatch(
  players: RoundPlayer[],
  course: Course,
  game: GameConfig,
): GameResult {
  const money: Record<string, number> = {}
  players.forEach((p) => (money[p.id] = 0))
  const lines: string[] = []

  const pairs: [RoundPlayer, RoundPlayer][] = []
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      pairs.push([players[i], players[j]])
    }
  }

  for (const [a, b] of pairs) {
    let upForA = 0
    let holesDecided = 0
    for (let h = 0; h < 18; h++) {
      const sa = effectiveHoleScore(a, h, course, game.scoringMode)
      const sb = effectiveHoleScore(b, h, course, game.scoringMode)
      if (sa == null || sb == null) continue
      holesDecided++
      if (sa < sb) upForA++
      else if (sb < sa) upForA--
    }
    if (holesDecided === 0) continue
    if (upForA > 0) {
      money[a.id] += game.betAmount
      money[b.id] -= game.betAmount
      lines.push(`${a.name} beat ${b.name} ${upForA} up`)
    } else if (upForA < 0) {
      money[b.id] += game.betAmount
      money[a.id] -= game.betAmount
      lines.push(`${b.name} beat ${a.name} ${-upForA} up`)
    } else {
      lines.push(`${a.name} & ${b.name} halved the match 🤝`)
    }
  }

  const moneyResult: PlayerMoneyResult[] = players.map((p) => ({
    playerId: p.id,
    name: p.name,
    net: money[p.id],
  }))

  return { type: 'match', summaryLines: lines, money: moneyResult }
}

// ---------------------------------------------------------------------------
// NASSAU — front 9 / back 9 / total 18, each worth betAmount.
// ---------------------------------------------------------------------------

/**
 * Nassau for 2 players (classic). For >2 players we run a round-robin and sum
 * the three segment bets per pairing. Presses are a simplified toggle for MVP;
 * full press tracking is a future expansion.
 */
export function calcNassau(
  players: RoundPlayer[],
  course: Course,
  game: GameConfig,
): GameResult {
  const money: Record<string, number> = {}
  players.forEach((p) => (money[p.id] = 0))
  const lines: string[] = []

  const segments: { label: string; start: number; end: number }[] = [
    { label: 'Front', start: 0, end: 9 },
    { label: 'Back', start: 9, end: 18 },
    { label: 'Total', start: 0, end: 18 },
  ]

  const pairs: [RoundPlayer, RoundPlayer][] = []
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      pairs.push([players[i], players[j]])
    }
  }

  for (const [a, b] of pairs) {
    for (const seg of segments) {
      let sumA = 0
      let sumB = 0
      let complete = true
      for (let h = seg.start; h < seg.end; h++) {
        const sa = effectiveHoleScore(a, h, course, game.scoringMode)
        const sb = effectiveHoleScore(b, h, course, game.scoringMode)
        if (sa == null || sb == null) {
          complete = false
          break
        }
        sumA += sa
        sumB += sb
      }
      if (!complete) continue
      if (sumA < sumB) {
        money[a.id] += game.betAmount
        money[b.id] -= game.betAmount
        lines.push(`${seg.label}: ${a.name} over ${b.name}`)
      } else if (sumB < sumA) {
        money[b.id] += game.betAmount
        money[a.id] -= game.betAmount
        lines.push(`${seg.label}: ${b.name} over ${a.name}`)
      } else {
        lines.push(`${seg.label}: ${a.name} & ${b.name} tied`)
      }
    }
  }

  const moneyResult: PlayerMoneyResult[] = players.map((p) => ({
    playerId: p.id,
    name: p.name,
    net: money[p.id],
  }))

  return { type: 'nassau', summaryLines: lines, money: moneyResult }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function calcGameResult(round: Round, course: Course): GameResult {
  switch (round.game.type) {
    case 'skins':
      return calcSkins(round.players, course, round.game)
    case 'nassau':
      return calcNassau(round.players, course, round.game)
    case 'match':
      return calcMatch(round.players, course, round.game)
  }
}

// ---------------------------------------------------------------------------
// Settlement minimization ("who owes who")
// ---------------------------------------------------------------------------

/**
 * Greedy min-cash-flow settlement: repeatedly match the biggest debtor with
 * the biggest creditor. Produces a near-minimal set of transfers.
 */
export function minimalSettlements(money: PlayerMoneyResult[]): Settlement[] {
  const balances = money.map((m) => ({ ...m }))
  const settlements: Settlement[] = []
  const EPS = 0.01

  // Work on a copy so we can mutate net balances.
  const debtors = () => balances.filter((b) => b.net < -EPS)
  const creditors = () => balances.filter((b) => b.net > EPS)

  let guard = 0
  while (debtors().length > 0 && creditors().length > 0 && guard < 1000) {
    guard++
    const debtor = debtors().sort((a, b) => a.net - b.net)[0]
    const creditor = creditors().sort((a, b) => b.net - a.net)[0]
    const amount = Math.min(-debtor.net, creditor.net)
    settlements.push({
      fromPlayerId: debtor.playerId,
      fromName: debtor.name,
      toPlayerId: creditor.playerId,
      toName: creditor.name,
      amount: Math.round(amount * 100) / 100,
    })
    debtor.net += amount
    creditor.net -= amount
  }

  return settlements
}

// ---------------------------------------------------------------------------
// Display helpers
// ---------------------------------------------------------------------------

export function formatToPar(toPar: number): string {
  if (toPar === 0) return 'E'
  return toPar > 0 ? `+${toPar}` : `${toPar}`
}

export function formatMoney(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  const sign = rounded < 0 ? '-' : ''
  return `${sign}$${Math.abs(rounded).toFixed(2)}`
}

/** Golf term for a hole result relative to par (used for fun labels). */
export function scoreLabel(strokes: number, par: number): string {
  const diff = strokes - par
  if (strokes === 1) return 'Ace'
  if (diff <= -3) return 'Albatross'
  if (diff === -2) return 'Eagle'
  if (diff === -1) return 'Birdie'
  if (diff === 0) return 'Par'
  if (diff === 1) return 'Bogey'
  if (diff === 2) return 'Double'
  if (diff === 3) return 'Triple'
  return `+${diff}`
}
