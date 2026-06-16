import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getCourse } from '../data/courses'
import { Button, Card, Pill, SectionTitle } from '../components/ui'
import { useToast } from '../components/Toast'
import {
  calcGameResult,
  formatMoney,
  formatToPar,
  minimalSettlements,
  playerTotals,
  strokesByHole,
  courseHandicap,
} from '../lib/scoring'

/**
 * Round Summary / Settlement:
 *  - Hole-by-hole scores table vs par (gross), gross/net totals
 *  - Game result summary
 *  - "Who owes who" minimal settlements
 *  - Share (Web Share API w/ text recap fallback) + Save Round
 */
export default function RoundSummary() {
  const { roundId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const round = useStore((s) => s.rounds.find((r) => r.id === roundId))
  const groups = useStore((s) => s.groups)
  const completeRound = useStore((s) => s.completeRound)

  const course = round ? getCourse(round.courseId) : undefined

  const result = useMemo(() => {
    if (!round || !course) return null
    return calcGameResult(round, course)
  }, [round, course])

  const settlements = useMemo(
    () => (result ? minimalSettlements(result.money) : []),
    [result],
  )

  if (!round || !course || !result) {
    return (
      <div className="pt-10 text-center text-fairway-300">
        Round not found.
        <div className="mt-4">
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const group = groups.find((g) => g.id === round.groupId)
  const totals = round.players.map((p) => playerTotals(p, course))

  // Leader = lowest net total (with at least one hole)
  const ranked = [...totals]
    .filter((t) => t.holesPlayed > 0)
    .sort((a, b) => a.netTotal - b.netTotal)
  const champ = ranked[0]
  const moneyLeader = [...result.money].sort((a, b) => b.net - a.net)[0]

  const front = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  const back = [9, 10, 11, 12, 13, 14, 15, 16, 17]

  function buildShareText(): string {
    const lines: string[] = []
    lines.push(`⛳️ Bogey Bucks — ${group?.name ?? 'Round'} @ ${course!.name}`)
    lines.push('')
    ranked.forEach((t, i) => {
      const medal = ['🥇', '🥈', '🥉'][i] ?? '  '
      lines.push(
        `${medal} ${t.name}: ${t.grossTotal} (${formatToPar(t.toPar)}) · net ${t.netTotal}`,
      )
    })
    lines.push('')
    lines.push(`💸 ${round!.game.type.toUpperCase()} results:`)
    ;[...result!.money]
      .sort((a, b) => b.net - a.net)
      .forEach((m) => lines.push(`   ${m.name}: ${formatMoney(m.net)}`))
    if (settlements.length) {
      lines.push('')
      lines.push('🤝 Settle up:')
      settlements.forEach((s) =>
        lines.push(`   ${s.fromName} → ${s.toName} ${formatMoney(s.amount)}`),
      )
    }
    lines.push('')
    lines.push('Track the bets. Settle the scores. Own the crew.')
    return lines.join('\n')
  }

  // One-tap share. Uses the Web Share API where available; otherwise copies a
  // text recap to the clipboard. FUTURE: generate a branded recap image/PDF.
  async function handleShare() {
    const text = buildShareText()
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Bogey Bucks Recap', text })
        return
      }
    } catch {
      // user cancelled or share failed — fall through to clipboard
    }
    try {
      await navigator.clipboard.writeText(text)
      toast.push('Recap copied to clipboard 📋')
    } catch {
      toast.push('Could not share automatically — screenshot it! 📸')
    }
  }

  function handleSave() {
    // Round is marked completed when finishing scoring; ensure it's persisted
    // (idempotent) and head to the leaderboard.
    completeRound(round!.id)
    toast.push('Round saved — leaderboards updated 🏆')
    navigate(`/leaderboard/${round!.groupId}`)
  }

  return (
    <div className="space-y-5 pt-4">
      {/* Hero recap */}
      <Card glow className="overflow-hidden animate-pop">
        <div className="relative bg-gradient-to-br from-gold-500/25 via-fairway-700/40 to-fairway-800 px-5 py-7 text-center">
          <div className="pointer-events-none absolute -right-6 -top-8 text-[120px] opacity-[0.08] select-none">
            🏆
          </div>
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">
              Final Recap
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-white">
              {group?.emoji} {group?.name}
            </h1>
            <p className="text-sm text-fairway-200/80">
              {course.facility} · {course.name}
            </p>
            {champ && (
              <div className="ring-grad mt-4 rounded-2xl bg-fairway-950/50 p-4">
                <p className="text-xs text-fairway-300/70">Low Net Champ 🏆</p>
                <p className="font-display text-xl font-extrabold text-metal-gold">
                  {champ.name}
                </p>
                <p className="mt-0.5 text-sm text-white">
                  {champ.grossTotal} gross ({formatToPar(champ.toPar)}) ·{' '}
                  {champ.netTotal} net
                </p>
              </div>
            )}
            {moneyLeader && moneyLeader.net > 0 && (
              <p className="mt-3 text-sm font-semibold text-cash-up">
                💰 {moneyLeader.name} ran off with {formatMoney(moneyLeader.net)}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Scorecard table */}
      <section>
        <SectionTitle>Scorecard</SectionTitle>
        <Card className="overflow-x-auto p-3">
          <ScoreTable
            holes={front}
            label="OUT"
            round={round}
            course={course}
          />
          <div className="my-2 h-px bg-white/8" />
          <ScoreTable holes={back} label="IN" round={round} course={course} />
          <div className="my-2 h-px bg-white/8" />
          {/* Totals row */}
          <table className="w-full text-sm">
            <tbody>
              {totals.map((t) => (
                <tr key={t.playerId}>
                  <td className="py-1 pr-2 font-display font-bold text-white">
                    {t.name}
                  </td>
                  <td className="py-1 text-right text-fairway-300/80">
                    Gross{' '}
                    <span className="font-bold text-white">
                      {t.grossTotal}
                    </span>
                  </td>
                  <td className="py-1 text-right text-fairway-300/80">
                    Net{' '}
                    <span className="font-bold text-gold-300">
                      {t.netTotal}
                    </span>
                  </td>
                  <td className="py-1 text-right">
                    <Pill
                      tone={
                        t.toPar < 0 ? 'up' : t.toPar > 0 ? 'down' : 'neutral'
                      }
                    >
                      {formatToPar(t.toPar)}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Game results */}
      <section>
        <SectionTitle>
          {round.game.type.toUpperCase()} Results
        </SectionTitle>
        <Card className="space-y-2 p-4">
          {result.summaryLines.map((line, i) => (
            <p key={i} className="text-sm text-fairway-200">
              {line}
            </p>
          ))}
          <div className="mt-2 space-y-1 border-t border-white/8 pt-3">
            {[...result.money]
              .sort((a, b) => b.net - a.net)
              .map((m) => (
                <div
                  key={m.playerId}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-white">{m.name}</span>
                  <span
                    className={`text-sm font-bold ${
                      m.net > 0
                        ? 'text-cash-up'
                        : m.net < 0
                          ? 'text-cash-down'
                          : 'text-fairway-300/70'
                    }`}
                  >
                    {formatMoney(m.net)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </section>

      {/* Settlement */}
      <section>
        <SectionTitle>Who Owes Who 🤝</SectionTitle>
        <Card className="p-4">
          {settlements.length === 0 ? (
            <p className="text-center text-sm text-fairway-300/70">
              All square — nobody owes a dime. 🍻
            </p>
          ) : (
            <div className="space-y-2">
              {settlements.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-black/25 px-3.5 py-3 ring-1 ring-inset ring-white/8"
                >
                  <span className="text-sm">
                    <span className="font-bold text-cash-down">
                      {s.fromName}
                    </span>
                    <span className="text-fairway-300/60"> pays </span>
                    <span className="font-bold text-cash-up">{s.toName}</span>
                  </span>
                  <span className="font-bold text-gold-300">
                    {formatMoney(s.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={handleShare}>
          📤 Share Recap
        </Button>
        <Button variant="gold" className="flex-1" onClick={handleSave}>
          Save Round
        </Button>
      </div>
      <button
        onClick={() => navigate(`/round/${round.id}`)}
        className="w-full text-center text-xs text-fairway-300/50"
      >
        ← Back to scoring
      </button>
    </div>
  )
}

function ScoreTable({
  holes,
  label,
  round,
  course,
}: {
  holes: number[]
  label: string
  round: import('../types').Round
  course: import('../types').Course
}) {
  return (
    <table className="w-full border-collapse text-center text-xs">
      <thead>
        <tr className="text-fairway-300/60">
          <th className="px-1 py-1 text-left font-semibold">{label}</th>
          {holes.map((h) => (
            <th key={h} className="px-1 py-1 font-semibold">
              {h + 1}
            </th>
          ))}
        </tr>
        <tr className="text-gold-300/70">
          <td className="px-1 py-0.5 text-left">Par</td>
          {holes.map((h) => (
            <td key={h} className="px-1 py-0.5">
              {course.holes[h].par}
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {round.players.map((p) => {
          const allocation = strokesByHole(courseHandicap(p), course)
          return (
            <tr key={p.id}>
              <td className="px-1 py-1 text-left font-bold text-white">
                {p.name.split(' ')[0]}
              </td>
              {holes.map((h) => {
                const s = p.scores[h]
                if (s == null)
                  return (
                    <td key={h} className="px-1 py-1 text-fairway-300/30">
                      –
                    </td>
                  )
                const diff = s - course.holes[h].par
                const tone =
                  diff < 0
                    ? 'text-cash-up font-bold'
                    : diff > 1
                      ? 'text-cash-down'
                      : 'text-white'
                const hasStroke = allocation[h] > 0
                return (
                  <td key={h} className={`px-1 py-1 ${tone}`}>
                    {s}
                    {hasStroke && (
                      <sup className="text-[8px] text-gold-400">•</sup>
                    )}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
