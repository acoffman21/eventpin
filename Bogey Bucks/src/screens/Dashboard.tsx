import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { getCourse } from '../data/courses'
import { Button, Card, EmptyState, Pill, SectionTitle } from '../components/ui'

/**
 * Home / Dashboard:
 *  - Hero "Start New Round" CTA
 *  - List of groups w/ quick leaderboard access
 *  - Active (resumable) rounds
 *  - Recent completed rounds
 */
export default function Dashboard() {
  const navigate = useNavigate()
  const groups = useStore((s) => s.groups)
  const rounds = useStore((s) => s.rounds)

  const activeRounds = rounds.filter((r) => r.status === 'active')
  const recent = rounds.filter((r) => r.status === 'completed').slice(0, 4)
  const totalRounds = rounds.filter((r) => r.status === 'completed').length

  return (
    <div className="space-y-7 pt-5">
      {/* Hero */}
      <Card glow className="overflow-hidden animate-slide-up">
        <div className="relative px-6 py-7">
          {/* Decorative floating ball + glow */}
          <div className="pointer-events-none absolute -right-6 -top-8 text-[120px] opacity-[0.07] select-none">
            ⛳️
          </div>
          <div className="pointer-events-none absolute right-5 top-5 h-20 w-20 rounded-full bg-gold-500/20 blur-2xl" />

          <div className="relative">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-gold-300 ring-1 ring-inset ring-gold-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-glow" />
              Track · Settle · Own the crew
            </div>
            <h1 className="font-display text-3xl font-extrabold leading-tight text-white">
              Ready to make it{' '}
              <span className="text-metal-gold">interesting?</span>
            </h1>
            <p className="mt-2 text-sm text-fairway-200/70">
              Run the bets. We'll do the math and settle the scores.
            </p>
            <Button
              variant="gold"
              size="lg"
              className="mt-5 w-full"
              onClick={() => navigate('/new')}
            >
              ⛳️ Start New Round
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick stats strip */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Crews" value={groups.length} />
        <MiniStat label="Rounds" value={totalRounds} />
        <MiniStat label="Live" value={activeRounds.length} accent />
      </div>

      {/* Active rounds */}
      {activeRounds.length > 0 && (
        <section>
          <SectionTitle>On The Course Now</SectionTitle>
          <div className="space-y-3">
            {activeRounds.map((r) => {
              const course = getCourse(r.courseId)
              const group = groups.find((g) => g.id === r.groupId)
              const holesPlayed = Math.max(
                ...r.players.map(
                  (p) => p.scores.filter((s) => s != null).length,
                ),
                0,
              )
              const onHole = Math.min(18, holesPlayed + 1 || 1)
              return (
                <Card
                  key={r.id}
                  className="overflow-hidden p-4"
                  onClick={() => navigate(`/round/${r.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fairway-700/60 text-xl ring-1 ring-inset ring-white/10">
                        {group?.emoji}
                      </div>
                      <div>
                        <p className="font-display font-bold text-white">
                          {group?.name}
                        </p>
                        <p className="text-xs text-fairway-300/70">
                          {course?.facility} · {course?.name}
                        </p>
                      </div>
                    </div>
                    <Pill tone="gold">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-glow" />
                      Hole {onHole}
                    </Pill>
                  </div>
                  {/* progress */}
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/30">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-fairway-400 to-gold-400"
                      style={{ width: `${(holesPlayed / 18) * 100}%` }}
                    />
                  </div>
                  <Button size="sm" variant="secondary" className="mt-3 w-full">
                    Resume Round →
                  </Button>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Groups */}
      <section>
        <SectionTitle>Your Crews</SectionTitle>
        <div className="space-y-3">
          {groups.map((g) => {
            const groupRounds = rounds.filter(
              (r) => r.groupId === g.id && r.status === 'completed',
            )
            return (
              <Card
                key={g.id}
                className="flex items-center gap-3 p-4"
                onClick={() => navigate(`/leaderboard/${g.id}`)}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fairway-600 to-fairway-800 text-2xl ring-1 ring-inset ring-white/10">
                  {g.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold text-white">{g.name}</p>
                  <p className="text-sm text-fairway-300/60">
                    {groupRounds.length} round
                    {groupRounds.length === 1 ? '' : 's'} played
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-gold-300 ring-1 ring-inset ring-white/10">
                  🏆
                </span>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Recent rounds */}
      <section>
        <SectionTitle>Recent Rounds</SectionTitle>
        {recent.length === 0 ? (
          <EmptyState
            emoji="🏌️"
            title="No rounds yet"
            subtitle="Start a round to begin tracking bets and bragging rights."
          />
        ) : (
          <div className="space-y-3">
            {recent.map((r) => {
              const course = getCourse(r.courseId)
              const group = groups.find((g) => g.id === r.groupId)
              return (
                <Card
                  key={r.id}
                  className="p-4"
                  onClick={() => navigate(`/round/${r.id}/summary`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-display font-semibold text-white">
                        {group?.emoji} {group?.name}
                      </p>
                      <p className="text-xs text-fairway-300/60">
                        {course?.name} ·{' '}
                        {new Date(
                          r.completedAt ?? r.createdAt,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Pill tone="green">{r.game.type.toUpperCase()}</Pill>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {r.players.map((p) => (
                      <span
                        key={p.id}
                        className="rounded-lg bg-black/20 px-2 py-1 text-xs font-medium text-fairway-200 ring-1 ring-inset ring-white/5"
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <p className="pt-1 text-center text-xs text-fairway-300/40">
        Built for the crew. Now go make it interesting. 😏
      </p>
    </div>
  )
}

function MiniStat({
  label,
  value,
  accent = false,
}: {
  label: string
  value: number
  accent?: boolean
}) {
  return (
    <div className="ring-grad glass rounded-2xl px-3 py-3 text-center">
      <p
        className={`font-display text-2xl font-extrabold ${
          accent && value > 0 ? 'text-gold-300' : 'text-white'
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-fairway-300/60">
        {label}
      </p>
    </div>
  )
}
