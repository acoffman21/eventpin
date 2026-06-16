import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { COURSES } from '../data/courses'
import { Button, Card, EmptyState, SectionTitle } from '../components/ui'
import {
  buildLeaderboard,
  topRivalry,
  type LeaderboardScope,
} from '../lib/leaderboard'
import { formatMoney } from '../lib/scoring'

/**
 * Group Leaderboard:
 *  - Tabs: All-Time, This Season, By Course
 *  - Columns: Player, # Rounds, Money Won/Lost, Win Rate %, Avg Gross/Net
 *  - Fun elements: top performer card, badges, rival head-to-head
 */
type Tab = 'all' | 'season' | 'course'

export default function Leaderboard() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const rounds = useStore((s) => s.rounds)
  const groups = useStore((s) => s.groups)

  const [tab, setTab] = useState<Tab>('all')
  const [courseId, setCourseId] = useState<string>(COURSES[0].id)

  const group = groups.find((g) => g.id === groupId)

  const scope: LeaderboardScope =
    tab === 'all' ? 'all' : tab === 'season' ? 'season' : courseId

  const rows = useMemo(
    () => (groupId ? buildLeaderboard(rounds, groupId, scope) : []),
    [rounds, groupId, scope],
  )

  const rivalry = useMemo(() => topRivalry(rows), [rows])

  if (!group) {
    return (
      <div className="pt-10 text-center text-fairway-300">
        Group not found.
        <div className="mt-4">
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    )
  }

  const leader = rows[0]

  return (
    <div className="space-y-5 pt-4">
      <div className="text-center">
        <p className="text-4xl animate-float">{group.emoji}</p>
        <h1 className="mt-1 font-display text-xl font-extrabold text-white">
          {group.name}
        </h1>
        <p className="text-sm text-fairway-300/70">Crew Leaderboard 🏆</p>
      </div>

      {/* Tabs */}
      <div className="ring-grad glass grid grid-cols-3 gap-1 rounded-2xl p-1.5">
        {(
          [
            ['all', 'All-Time'],
            ['season', 'This Season'],
            ['course', 'By Course'],
          ] as [Tab, string][]
        ).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-xl py-2 text-sm font-bold transition-all active:scale-95 ${
              tab === t
                ? 'bg-gradient-to-b from-gold-400 to-gold-600 text-fairway-950 shadow-lg shadow-gold-500/20'
                : 'text-fairway-300/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'course' && (
        <div className="flex gap-2">
          {COURSES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCourseId(c.id)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-95 ${
                courseId === c.id
                  ? 'bg-fairway-400/20 text-white ring-2 ring-fairway-400/50'
                  : 'bg-black/25 text-fairway-300/70 ring-1 ring-inset ring-white/10'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          emoji="📊"
          title="No completed rounds yet"
          subtitle="Finish a round to populate the leaderboard and start the trash talk."
        />
      ) : (
        <>
          {/* Top performer card */}
          {leader && (
            <Card glow className="overflow-hidden animate-pop">
              <div className="relative bg-gradient-to-br from-gold-500/25 via-fairway-700/40 to-fairway-800 p-4">
                <div className="pointer-events-none absolute -right-4 -top-6 text-[90px] opacity-[0.08] select-none">
                  🐐
                </div>
                <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">
                  Top Dog 🐐
                </p>
                <div className="relative mt-1 flex items-end justify-between">
                  <div>
                    <p className="font-display text-xl font-extrabold text-white">
                      {leader.name}
                    </p>
                    <p className="text-sm text-fairway-200/80">
                      {leader.rounds} round{leader.rounds === 1 ? '' : 's'} ·{' '}
                      {Math.round(leader.winRate * 100)}% win rate
                    </p>
                  </div>
                  <p
                    className={`text-2xl font-extrabold ${
                      leader.moneyNet >= 0 ? 'text-cash-up' : 'text-cash-down'
                    }`}
                  >
                    {formatMoney(leader.moneyNet)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Rivalry head-to-head */}
          {rivalry && (
            <Card className="p-4">
              <SectionTitle>Rivalry of the Crew ⚔️</SectionTitle>
              <div className="flex items-center justify-between">
                <RivalSide
                  name={rivalry.aName}
                  money={rivalry.aMoney}
                  align="left"
                />
                <span className="px-2 text-xs font-bold text-fairway-300/50">
                  VS
                </span>
                <RivalSide
                  name={rivalry.bName}
                  money={rivalry.bMoney}
                  align="right"
                />
              </div>
            </Card>
          )}

          {/* Full table */}
          <section>
            <SectionTitle>Standings</SectionTitle>
            <Card className="overflow-x-auto p-3">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-fairway-300/60">
                    <th className="px-1 py-2">#</th>
                    <th className="px-1 py-2">Player</th>
                    <th className="px-1 py-2 text-center">Rds</th>
                    <th className="px-1 py-2 text-right">$ Net</th>
                    <th className="px-1 py-2 text-center">Win%</th>
                    <th className="px-1 py-2 text-right">Avg G/N</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.playerId}
                      className="border-t border-white/8"
                    >
                      <td className="px-1 py-2 text-fairway-300/70">
                        {['🥇', '🥈', '🥉'][i] ?? i + 1}
                      </td>
                      <td className="px-1 py-2 font-display font-bold text-white">
                        {r.name}
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {badgesFor(r, i).map((b) => (
                            <span
                              key={b}
                              className="rounded-md bg-black/30 px-1.5 py-0.5 text-[9px] font-semibold text-gold-300 ring-1 ring-inset ring-white/8"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-1 py-2 text-center text-fairway-200">
                        {r.rounds}
                      </td>
                      <td
                        className={`px-1 py-2 text-right font-bold ${
                          r.moneyNet > 0
                            ? 'text-cash-up'
                            : r.moneyNet < 0
                              ? 'text-cash-down'
                              : 'text-fairway-300/70'
                        }`}
                      >
                        {formatMoney(r.moneyNet)}
                      </td>
                      <td className="px-1 py-2 text-center text-fairway-200">
                        {Math.round(r.winRate * 100)}%
                      </td>
                      <td className="px-1 py-2 text-right text-fairway-200">
                        {r.avgGross.toFixed(0)}/{r.avgNet.toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>
        </>
      )}

      <Button
        variant="gold"
        className="w-full"
        onClick={() => navigate('/new')}
      >
        Start New Round
      </Button>
    </div>
  )
}

function RivalSide({
  name,
  money,
  align,
}: {
  name: string
  money: number
  align: 'left' | 'right'
}) {
  return (
    <div className={align === 'right' ? 'text-right' : 'text-left'}>
      <p className="font-display font-bold text-white">{name}</p>
      <p
        className={`text-sm font-bold ${
          money >= 0 ? 'text-cash-up' : 'text-cash-down'
        }`}
      >
        {formatMoney(money)}
      </p>
    </div>
  )
}

/** Fun, derived badges based on a player's row + rank. */
function badgesFor(
  r: import('../lib/leaderboard').LeaderboardRow,
  rank: number,
): string[] {
  const badges: string[] = []
  if (rank === 0 && r.moneyNet > 0) badges.push('💰 Bankroll')
  if (r.winRate >= 0.5 && r.rounds >= 2) badges.push('🔥 Hot Hand')
  if (r.bestGross != null && r.bestGross <= 80) badges.push('🎯 Sub-80')
  if (r.moneyNet < 0) badges.push('🫡 Donor')
  return badges
}
