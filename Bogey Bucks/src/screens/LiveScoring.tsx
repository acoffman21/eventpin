import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getCourse } from '../data/courses'
import { Button, Card, Pill } from '../components/ui'
import { useToast } from '../components/Toast'
import { scoreQuip } from '../lib/quips'
import {
  calcGameResult,
  formatMoney,
  formatToPar,
  playerTotals,
  scoreLabel,
  strokesByHole,
  courseHandicap,
} from '../lib/scoring'
import type { RoundPlayer } from '../types'

/**
 * Live Scoring screen:
 *  - Hole-by-hole nav (1–18) + progress bar
 *  - Par + stroke index for current hole
 *  - Per-player score input (+/- buttons + number pad) and quick stats
 *  - Live game leaderboard + money tracker
 */
export default function LiveScoring() {
  const { roundId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const round = useStore((s) => s.rounds.find((r) => r.id === roundId))
  const setScore = useStore((s) => s.setScore)
  const setStat = useStore((s) => s.setStat)
  const setCurrentHole = useStore((s) => s.setCurrentHole)
  const completeRound = useStore((s) => s.completeRound)

  const [statsOpenFor, setStatsOpenFor] = useState<string | null>(null)

  const course = round ? getCourse(round.courseId) : undefined

  const hole = round?.currentHole ?? 1
  const holeIndex = hole - 1
  const holeInfo = course?.holes[holeIndex]

  const liveResult = useMemo(() => {
    if (!round || !course) return null
    return calcGameResult(round, course)
  }, [round, course])

  if (!round || !course || !holeInfo) {
    return (
      <div className="pt-10 text-center text-fairway-300">
        Round not found.
        <div className="mt-4">
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const holesCompleted = round.players.every(
    (p) => p.scores[holeIndex] != null,
  )
  const totalEntered = Math.max(
    ...round.players.map((p) => p.scores.filter((s) => s != null).length),
    0,
  )

  function changeScore(player: RoundPlayer, delta: number) {
    const current = player.scores[holeIndex]
    const par = holeInfo!.par
    const base = current ?? par // default first tap to par
    const next = Math.max(1, Math.min(15, base + delta))
    commitScore(player, next)
  }

  function setScoreDirect(player: RoundPlayer, value: number) {
    commitScore(player, value)
  }

  function commitScore(player: RoundPlayer, value: number) {
    const prev = player.scores[holeIndex]
    setScore(round!.id, player.id, holeIndex, value)
    // Fire a fun quip when a *new* notable score is entered.
    if (prev !== value) {
      const quip = scoreQuip(player.name, value, holeInfo!.par)
      if (quip) toast.push(quip)
    }
  }

  function goHole(n: number) {
    const clamped = Math.max(1, Math.min(18, n))
    setCurrentHole(round!.id, clamped)
    setStatsOpenFor(null)
  }

  function finish() {
    completeRound(round!.id)
    navigate(`/round/${round!.id}/summary`, { replace: true })
  }

  return (
    <div className="space-y-4 pt-3">
      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-fairway-300/70">
          <span className="font-semibold">{totalEntered}/18 holes scored</span>
          <span>
            {course.name} · Par {course.par}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/30 ring-1 ring-inset ring-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fairway-400 to-gold-400 transition-all"
            style={{ width: `${(totalEntered / 18) * 100}%` }}
          />
        </div>
      </div>

      {/* Hole header */}
      <Card glow className="flex items-center justify-between p-4">
        <button
          onClick={() => goHole(hole - 1)}
          disabled={hole === 1}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/25 text-xl font-bold text-white ring-1 ring-inset ring-white/10 transition disabled:opacity-30 active:scale-90"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-fairway-300/70">
            Hole
          </p>
          <p className="font-display text-5xl font-extrabold text-white leading-none">
            {hole}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Pill tone="gold">Par {holeInfo.par}</Pill>
            <Pill>SI {holeInfo.strokeIndex}</Pill>
          </div>
        </div>
        <button
          onClick={() => goHole(hole + 1)}
          disabled={hole === 18}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/25 text-xl font-bold text-white ring-1 ring-inset ring-white/10 transition disabled:opacity-30 active:scale-90"
        >
          ›
        </button>
      </Card>

      {/* Hole strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {course.holes.map((h) => {
          const allScored = round.players.every(
            (p) => p.scores[h.number - 1] != null,
          )
          return (
            <button
              key={h.number}
              onClick={() => goHole(h.number)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-90 ${
                h.number === hole
                  ? 'bg-gradient-to-b from-gold-400 to-gold-600 text-fairway-950 shadow-lg shadow-gold-500/30 ring-2 ring-gold-400/40'
                  : allScored
                    ? 'bg-fairway-600/80 text-white ring-1 ring-inset ring-white/10'
                    : 'bg-black/25 text-fairway-300/60 ring-1 ring-inset ring-white/5'
              }`}
            >
              {h.number}
            </button>
          )
        })}
      </div>

      {/* Player score cards */}
      <div className="space-y-3">
        {round.players.map((p) => {
          const score = p.scores[holeIndex]
          const allocation = strokesByHole(courseHandicap(p), course)
          const strokesHere = allocation[holeIndex]
          const totals = playerTotals(p, course)
          const statsOpen = statsOpenFor === p.id
          return (
            <Card key={p.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-white">
                    {p.name}
                    {strokesHere > 0 && (
                      <span className="ml-1.5 text-xs text-gold-400">
                        {'•'.repeat(strokesHere)} stroke
                        {strokesHere > 1 ? 's' : ''}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-fairway-300/60">
                    {totals.holesPlayed > 0
                      ? `${formatToPar(totals.toPar)} thru ${totals.holesPlayed}`
                      : 'Yet to tee off'}
                  </p>
                </div>
                {score != null && (
                  <Pill
                    tone={
                      score - holeInfo.par < 0
                        ? 'up'
                        : score - holeInfo.par > 0
                          ? 'down'
                          : 'neutral'
                    }
                  >
                    {scoreLabel(score, holeInfo.par)}
                  </Pill>
                )}
              </div>

              {/* +/- control */}
              <div className="mt-3 flex items-center justify-center gap-5">
                <button
                  onClick={() => changeScore(p, -1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black/25 text-2xl font-bold text-white ring-1 ring-inset ring-white/10 transition active:scale-90"
                >
                  −
                </button>
                <div className="min-w-16 text-center">
                  <span className="font-display text-5xl font-extrabold text-white">
                    {score ?? '–'}
                  </span>
                </div>
                <button
                  onClick={() => changeScore(p, 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-fairway-400 to-fairway-600 text-2xl font-bold text-fairway-950 shadow-lg shadow-fairway-500/30 transition active:scale-90"
                >
                  +
                </button>
              </div>

              {/* Quick number pad */}
              <div className="mt-3 grid grid-cols-7 gap-1.5">
                {[2, 3, 4, 5, 6, 7, 8].map((v) => (
                  <button
                    key={v}
                    onClick={() => setScoreDirect(p, v)}
                    className={`rounded-xl py-2.5 text-sm font-bold transition-all active:scale-95 ${
                      score === v
                        ? 'bg-gradient-to-b from-gold-400 to-gold-600 text-fairway-950 shadow-lg shadow-gold-500/20'
                        : 'bg-black/25 text-fairway-200 ring-1 ring-inset ring-white/8'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              {/* Quick stats toggle */}
              <button
                onClick={() => setStatsOpenFor(statsOpen ? null : p.id)}
                className="mt-3 text-xs font-semibold text-fairway-300/70"
              >
                {statsOpen ? '− Hide stats' : '+ Quick stats (putts, FIR, GIR)'}
              </button>

              {statsOpen && (
                <div className="mt-2 flex flex-wrap items-center gap-3 rounded-xl bg-black/25 p-3 ring-1 ring-inset ring-white/8 animate-pop">
                  <label className="flex items-center gap-2">
                    <span className="text-xs text-fairway-300/70">Putts</span>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={p.putts[holeIndex] ?? ''}
                      onChange={(e) =>
                        setStat(
                          round.id,
                          p.id,
                          holeIndex,
                          'putts',
                          e.target.value === ''
                            ? null
                            : Number(e.target.value),
                        )
                      }
                      className="w-14 rounded-lg bg-black/30 px-2 py-1.5 text-center text-white ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-gold-500/60 focus:outline-none"
                    />
                  </label>
                  <StatToggle
                    label="FIR"
                    active={p.fir[holeIndex] === true}
                    disabled={holeInfo.par === 3}
                    onClick={() =>
                      setStat(
                        round.id,
                        p.id,
                        holeIndex,
                        'fir',
                        p.fir[holeIndex] === true ? null : true,
                      )
                    }
                  />
                  <StatToggle
                    label="GIR"
                    active={p.gir[holeIndex] === true}
                    onClick={() =>
                      setStat(
                        round.id,
                        p.id,
                        holeIndex,
                        'gir',
                        p.gir[holeIndex] === true ? null : true,
                      )
                    }
                  />
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Live money tracker */}
      {liveResult && (
        <Card glow className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wide text-fairway-300/80">
              💸 Live {round.game.type} ·{' '}
              <span className="text-gold-400">{round.game.scoringMode}</span>
            </p>
            <span className="text-xs text-fairway-300/50">
              {formatMoney(round.game.betAmount)} stakes
            </span>
          </div>
          <div className="space-y-1.5">
            {[...liveResult.money]
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
                    {m.net > 0 ? '▲ ' : m.net < 0 ? '▼ ' : ''}
                    {formatMoney(m.net)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Next / finish */}
      <div className="flex gap-3">
        {hole < 18 ? (
          <Button
            className="flex-1"
            variant={holesCompleted ? 'primary' : 'secondary'}
            onClick={() => goHole(hole + 1)}
          >
            Next Hole →
          </Button>
        ) : (
          <Button variant="gold" className="flex-1" onClick={finish}>
            Finish & Settle Up 💰
          </Button>
        )}
      </div>

      {hole < 18 && totalEntered >= 1 && (
        <button
          onClick={finish}
          className="w-full text-center text-xs text-fairway-300/50"
        >
          Finish early & settle up →
        </button>
      )}
    </div>
  )
}

function StatToggle({
  label,
  active,
  onClick,
  disabled,
}: {
  label: string
  active: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-30 ${
        active
          ? 'bg-gradient-to-b from-fairway-400 to-fairway-600 text-fairway-950'
          : 'bg-black/25 text-fairway-200 ring-1 ring-inset ring-white/10'
      }`}
    >
      {label} {active ? '✓' : ''}
    </button>
  )
}
