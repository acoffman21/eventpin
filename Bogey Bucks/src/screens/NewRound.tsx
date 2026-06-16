import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore, createRoundPlayer } from '../store/useStore'
import { COURSES } from '../data/courses'
import type { GameConfig, GameType, RoundPlayer, ScoringMode } from '../types'
import { Button, Card, Pill, SectionTitle } from '../components/ui'

/**
 * Start New Round flow (4 steps):
 *   1. Group
 *   2. Course (+ tee placeholder)
 *   3. Players (2–4, name / handicap / GHIN placeholder)
 *   4. Game type + rules (bet amount, press toggle, gross/net)
 */
type Step = 1 | 2 | 3 | 4

interface DraftPlayer {
  id: string
  name: string
  handicapIndex: number
  ghin: string
}

const GAME_META: Record<
  GameType,
  { label: string; emoji: string; blurb: string; betLabel: string }
> = {
  skins: {
    label: 'Skins',
    emoji: '💀',
    blurb: 'Lowest score wins the hole. Ties carry over.',
    betLabel: '$ per skin',
  },
  nassau: {
    label: 'Nassau',
    emoji: '🤝',
    blurb: 'Three bets: Front 9, Back 9, and Total 18.',
    betLabel: '$ per segment',
  },
  match: {
    label: 'Match Play',
    emoji: '⚔️',
    blurb: 'Hole-by-hole. Most holes won takes the match.',
    betLabel: '$ for the match',
  },
}

export default function NewRound() {
  const navigate = useNavigate()
  const groups = useStore((s) => s.groups)
  const startRound = useStore((s) => s.startRound)

  const [step, setStep] = useState<Step>(1)
  const [groupId, setGroupId] = useState<string>(groups[0]?.id ?? '')
  const [courseId, setCourseId] = useState<string>(COURSES[0].id)
  const [players, setPlayers] = useState<DraftPlayer[]>([
    { id: 'p1', name: '', handicapIndex: 12, ghin: '' },
    { id: 'p2', name: '', handicapIndex: 12, ghin: '' },
  ])
  const [gameType, setGameType] = useState<GameType>('skins')
  const [betAmount, setBetAmount] = useState<number>(5)
  const [scoringMode, setScoringMode] = useState<ScoringMode>('net')
  const [pressEnabled, setPressEnabled] = useState<boolean>(false)

  const validPlayers = players.filter((p) => p.name.trim().length > 0)
  const canStart = groupId && courseId && validPlayers.length >= 2

  function updatePlayer(id: string, patch: Partial<DraftPlayer>) {
    setPlayers((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function addPlayer() {
    if (players.length >= 4) return
    setPlayers((ps) => [
      ...ps,
      {
        id: 'p' + (ps.length + 1) + Date.now(),
        name: '',
        handicapIndex: 12,
        ghin: '',
      },
    ])
  }

  function removePlayer(id: string) {
    setPlayers((ps) => (ps.length > 2 ? ps.filter((p) => p.id !== id) : ps))
  }

  function handleStart() {
    const roundPlayers: RoundPlayer[] = validPlayers.map((p) =>
      createRoundPlayer({
        id: 'plr_' + p.id,
        name: p.name.trim(),
        handicapIndex: p.handicapIndex,
        ghin: p.ghin.trim() || undefined,
      }),
    )
    const game: GameConfig = {
      type: gameType,
      betAmount,
      scoringMode,
      pressEnabled,
    }
    const round = startRound({ groupId, courseId, game, players: roundPlayers })
    navigate(`/round/${round.id}`, { replace: true })
  }

  return (
    <div className="space-y-5 pt-4">
      <StepBar step={step} />

      {step === 1 && (
        <StepGroup
          groups={groups}
          groupId={groupId}
          onSelect={setGroupId}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepCourse
          courseId={courseId}
          onSelect={setCourseId}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <StepPlayers
          players={players}
          validCount={validPlayers.length}
          onUpdate={updatePlayer}
          onAdd={addPlayer}
          onRemove={removePlayer}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}
      {step === 4 && (
        <StepGame
          gameType={gameType}
          betAmount={betAmount}
          scoringMode={scoringMode}
          pressEnabled={pressEnabled}
          setGameType={setGameType}
          setBetAmount={setBetAmount}
          setScoringMode={setScoringMode}
          setPressEnabled={setPressEnabled}
          canStart={!!canStart}
          onBack={() => setStep(3)}
          onStart={handleStart}
        />
      )}
    </div>
  )
}

function StepBar({ step }: { step: Step }) {
  const labels = ['Group', 'Course', 'Players', 'Game']
  return (
    <div className="ring-grad glass flex items-center gap-1 rounded-2xl px-3 py-3">
      {labels.map((label, i) => {
        const n = (i + 1) as Step
        const active = n === step
        const done = n < step
        return (
          <div key={label} className="flex flex-1 items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold font-display transition-all ${
                  active
                    ? 'bg-gradient-to-b from-gold-400 to-gold-600 text-fairway-950 shadow-lg shadow-gold-500/30 ring-2 ring-gold-400/40'
                    : done
                      ? 'bg-gradient-to-b from-fairway-400 to-fairway-600 text-fairway-950'
                      : 'bg-black/30 text-fairway-300/70 ring-1 ring-inset ring-white/10'
                }`}
              >
                {done ? '✓' : n}
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wide ${
                  active ? 'text-gold-300' : 'text-fairway-300/50'
                }`}
              >
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div
                className={`mb-4 h-0.5 flex-1 rounded-full transition-colors ${
                  done ? 'bg-gradient-to-r from-fairway-400 to-gold-400' : 'bg-white/8'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function StepGroup({
  groups,
  groupId,
  onSelect,
  onNext,
}: {
  groups: { id: string; name: string; emoji: string }[]
  groupId: string
  onSelect: (id: string) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4 animate-slide-up">
      <SectionTitle>Pick your crew</SectionTitle>
      <div className="space-y-3">
        {groups.map((g) => {
          const selected = groupId === g.id
          return (
            <Card
              key={g.id}
              glow={selected}
              onClick={() => onSelect(g.id)}
              className={`flex items-center gap-3 p-4 transition-all ${
                selected ? 'ring-2 ring-gold-400/70' : ''
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-fairway-600 to-fairway-800 text-2xl ring-1 ring-inset ring-white/10">
                {g.emoji}
              </div>
              <span className="font-display font-bold text-white">{g.name}</span>
              {selected && (
                <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-gold-500 text-xs text-fairway-950">
                  ✓
                </span>
              )}
            </Card>
          )
        })}
      </div>
      <Button className="w-full" disabled={!groupId} onClick={onNext}>
        Next: Course
      </Button>
    </div>
  )
}

function StepCourse({
  courseId,
  onSelect,
  onBack,
  onNext,
}: {
  courseId: string
  onSelect: (id: string) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4 animate-slide-up">
      <SectionTitle>Choose your course</SectionTitle>
      <div className="space-y-3">
        {COURSES.map((c) => {
          const selected = courseId === c.id
          return (
            <Card
              key={c.id}
              glow={selected}
              onClick={() => onSelect(c.id)}
              className={`p-4 transition-all ${selected ? 'ring-2 ring-gold-400/70' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-white">{c.name}</p>
                  <p className="text-sm text-fairway-300/70">{c.facility}</p>
                </div>
                <Pill tone="gold">Par {c.par}</Pill>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="rounded-lg bg-black/20 px-2.5 py-1 text-xs font-medium text-fairway-200 ring-1 ring-inset ring-white/5">
                  Rating {c.rating}
                </span>
                <span className="rounded-lg bg-black/20 px-2.5 py-1 text-xs font-medium text-fairway-200 ring-1 ring-inset ring-white/5">
                  Slope {c.slope}
                </span>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Tee selection placeholder — future yardage expansion */}
      <Card className="p-4 opacity-70">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Tees</p>
            <p className="text-xs text-fairway-300/60">
              Blue · White · Gold (yardages coming soon)
            </p>
          </div>
          <Pill>Soon</Pill>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button className="flex-1" onClick={onNext}>
          Next: Players
        </Button>
      </div>
    </div>
  )
}

function StepPlayers({
  players,
  validCount,
  onUpdate,
  onAdd,
  onRemove,
  onBack,
  onNext,
}: {
  players: DraftPlayer[]
  validCount: number
  onUpdate: (id: string, patch: Partial<DraftPlayer>) => void
  onAdd: () => void
  onRemove: (id: string) => void
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4 animate-slide-up">
      <SectionTitle
        action={
          <span className="text-xs text-fairway-300/60">{players.length}/4</span>
        }
      >
        Add players (2–4)
      </SectionTitle>

      <div className="space-y-3">
        {players.map((p, i) => (
          <Card key={p.id} className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-fairway-300/70">
                Player {i + 1}
              </span>
              {players.length > 2 && (
                <button
                  onClick={() => onRemove(p.id)}
                  className="text-xs text-cash-down/80"
                >
                  Remove
                </button>
              )}
            </div>
            <input
              value={p.name}
              onChange={(e) => onUpdate(p.id, { name: e.target.value })}
              placeholder="Name (e.g. Jare Bear)"
              className="w-full rounded-xl bg-black/25 px-3.5 py-3 text-white ring-1 ring-inset ring-white/10 transition placeholder:text-fairway-300/40 focus:ring-2 focus:ring-gold-500/60 focus:outline-none"
            />
            <div className="flex gap-3">
              <label className="flex-1">
                <span className="mb-1.5 block text-xs font-semibold text-fairway-300/70">
                  Handicap Index
                </span>
                <input
                  type="number"
                  min={0}
                  max={36}
                  value={p.handicapIndex}
                  onChange={(e) =>
                    onUpdate(p.id, {
                      handicapIndex: clamp(Number(e.target.value), 0, 36),
                    })
                  }
                  className="w-full rounded-xl bg-black/25 px-3.5 py-3 text-white ring-1 ring-inset ring-white/10 transition focus:ring-2 focus:ring-gold-500/60 focus:outline-none"
                />
              </label>
              <label className="flex-1">
                <span className="mb-1.5 block text-xs font-semibold text-fairway-300/70">
                  GHIN #{' '}
                  <span className="text-fairway-300/40">(optional)</span>
                </span>
                <input
                  value={p.ghin}
                  onChange={(e) => onUpdate(p.id, { ghin: e.target.value })}
                  placeholder="Coming soon"
                  className="w-full rounded-xl bg-black/25 px-3.5 py-3 text-white ring-1 ring-inset ring-white/10 transition placeholder:text-fairway-300/30 focus:ring-2 focus:ring-gold-500/60 focus:outline-none"
                />
              </label>
            </div>
          </Card>
        ))}
      </div>

      {players.length < 4 && (
        <Button variant="secondary" className="w-full" onClick={onAdd}>
          + Add Player
        </Button>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={validCount < 2}
          onClick={onNext}
        >
          Next: Game
        </Button>
      </div>
    </div>
  )
}

function StepGame({
  gameType,
  betAmount,
  scoringMode,
  pressEnabled,
  setGameType,
  setBetAmount,
  setScoringMode,
  setPressEnabled,
  canStart,
  onBack,
  onStart,
}: {
  gameType: GameType
  betAmount: number
  scoringMode: ScoringMode
  pressEnabled: boolean
  setGameType: (g: GameType) => void
  setBetAmount: (n: number) => void
  setScoringMode: (m: ScoringMode) => void
  setPressEnabled: (b: boolean) => void
  canStart: boolean
  onBack: () => void
  onStart: () => void
}) {
  const meta = GAME_META[gameType]
  const games = useMemo(
    () => Object.entries(GAME_META) as [GameType, (typeof GAME_META)[GameType]][],
    [],
  )

  return (
    <div className="space-y-4 animate-slide-up">
      <SectionTitle>Pick the game</SectionTitle>

      <div className="grid grid-cols-3 gap-2">
        {games.map(([type, m]) => {
          const selected = gameType === type
          return (
            <button
              key={type}
              onClick={() => setGameType(type)}
              className={`rounded-2xl p-3 text-center transition-all active:scale-95 ${
                selected
                  ? 'bg-gradient-to-b from-gold-400/20 to-gold-600/10 ring-2 ring-gold-400/60 shadow-lg shadow-gold-500/10'
                  : 'glass ring-1 ring-inset ring-white/10'
              }`}
            >
              <div className="text-2xl">{m.emoji}</div>
              <div
                className={`mt-1 text-sm font-bold font-display ${
                  selected ? 'text-gold-200' : 'text-white'
                }`}
              >
                {m.label}
              </div>
            </button>
          )
        })}
      </div>

      <Card className="space-y-4 p-4">
        <p className="text-sm text-fairway-300/80">{meta.blurb}</p>

        {/* Bet amount */}
        <div>
          <span className="mb-1 block text-xs font-semibold text-fairway-300/70">
            {meta.betLabel}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gold-400">$</span>
            <input
              type="number"
              min={0}
              step={1}
              value={betAmount}
              onChange={(e) =>
                setBetAmount(clamp(Number(e.target.value), 0, 10000))
              }
              className="w-full rounded-xl bg-black/25 px-3.5 py-3 text-lg font-bold font-display text-white ring-1 ring-inset ring-white/10 transition focus:ring-2 focus:ring-gold-500/60 focus:outline-none"
            />
            <div className="flex gap-1">
              {[1, 5, 10, 20].map((v) => (
                <button
                  key={v}
                  onClick={() => setBetAmount(v)}
                  className="rounded-lg bg-black/25 px-2.5 py-1.5 text-xs font-bold text-fairway-200 ring-1 ring-inset ring-white/10 transition active:scale-95"
                >
                  ${v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gross vs Net */}
        <div>
          <span className="mb-1 block text-xs font-semibold text-fairway-300/70">
            Scoring
          </span>
          <div className="grid grid-cols-2 gap-2">
            {(['net', 'gross'] as ScoringMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setScoringMode(m)}
                className={`rounded-xl py-2.5 text-sm font-bold capitalize transition-all active:scale-95 ${
                  scoringMode === m
                    ? 'bg-fairway-400/20 text-fairway-100 ring-2 ring-fairway-400/50'
                    : 'bg-black/25 text-fairway-300/70 ring-1 ring-inset ring-white/10'
                }`}
              >
                {m}
                {m === 'net' && (
                  <span className="ml-1 text-[10px] opacity-70">(handicapped)</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Press toggle */}
        <button
          onClick={() => setPressEnabled(!pressEnabled)}
          className="flex w-full items-center justify-between rounded-xl bg-black/25 px-3.5 py-3 ring-1 ring-inset ring-white/10 transition active:scale-[0.99]"
        >
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Allow Presses</p>
            <p className="text-xs text-fairway-300/60">
              Double down when you're losing 😤
            </p>
          </div>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              pressEnabled ? 'bg-gold-500' : 'bg-fairway-700'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                pressEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>
      </Card>

      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="gold"
          className="flex-1"
          disabled={!canStart}
          onClick={onStart}
        >
          Tee Off ⛳️
        </Button>
      </div>
    </div>
  )
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min
  return Math.min(max, Math.max(min, n))
}
