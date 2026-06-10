import { useGameStore } from '../store/gameStore'

export default function HomeScreen() {
  const startChallenge = useGameStore((s) => s.startChallenge)
  const isDailyComplete = useGameStore((s) => s.isDailyComplete)
  const getProgress = useGameStore((s) => s.getProgress)
  const streak = useGameStore((s) => s.streak)
  const totalScore = useGameStore((s) => s.totalScore)
  const currentChallengeIndex = useGameStore((s) => s.currentChallengeIndex)
  const challengeResults = useGameStore((s) => s.challengeResults)
  const goToSummary = useGameStore((s) => s.goToSummary)
  const allTimeScores = useGameStore((s) => s.allTimeScores)
  const gamesPlayed = useGameStore((s) => s.gamesPlayed)
  const complete = isDailyComplete()

  const bestScore = allTimeScores.length > 0
    ? Math.max(...allTimeScores.map(s => s.score))
    : 0

  return (
    <div className="flex-1 flex flex-col px-4 py-6 safe-top topo-bg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" className="opacity-80">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="2" x2="12" y2="6"/>
            <line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="6" y2="12"/>
            <line x1="18" y1="12" x2="22" y2="12"/>
            <circle cx="12" cy="12" r="3" fill="#22d3ee" opacity="0.3"/>
          </svg>
          <h1 className="text-3xl font-bold text-cyan tracking-[0.2em] uppercase">EventPin</h1>
        </div>
        <div className="flex items-center justify-center gap-2 text-parchment-dark text-xs tracking-[0.15em] uppercase">
          <span className="w-8 h-px bg-cyan-dim opacity-50"></span>
          <span>Pin the Past to the Map</span>
          <span className="w-8 h-px bg-cyan-dim opacity-50"></span>
        </div>
      </div>

      {/* Daily Progress Card */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-5 mb-4 tactical-card">
        <div className="tactical-card-inner">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-cyan font-semibold text-sm tracking-[0.1em] uppercase">Today's Challenge</h2>
            <span className="text-gold readout text-sm font-bold">[{getProgress()}]</span>
          </div>

          {/* Progress indicators */}
          <div className="flex justify-center gap-3 mb-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold readout transition-all border ${
                    i < challengeResults.length
                      ? 'bg-green-accent/20 border-green-accent text-green-accent glow-cyan'
                      : i === currentChallengeIndex && !complete
                      ? 'bg-cyan/10 border-cyan text-cyan pulse-cyan'
                      : 'bg-dark-card border-dark-border text-parchment-dark'
                  }`}
                >
                  {i < challengeResults.length ? (
                    <span className="text-xs">{challengeResults[i].totalScore}</span>
                  ) : (
                    <span className="text-xs opacity-60">{String(i + 1).padStart(2, '0')}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Score Display */}
          {challengeResults.length > 0 && (
            <div className="text-center mb-4">
              <p className="text-parchment-dark text-xs uppercase tracking-[0.15em] mb-1">Today's Score</p>
              <p className="text-2xl font-bold text-gold-light readout">{totalScore.toLocaleString()}</p>
            </div>
          )}

          {/* Action Button */}
          {complete ? (
            <button
              onClick={goToSummary}
              className="w-full py-4 rounded-lg bg-green-accent/20 border border-green-accent text-green-accent font-bold text-sm btn-tactical"
            >
              View Results
            </button>
          ) : (
            <button
              onClick={startChallenge}
              className="w-full py-4 rounded-lg bg-cyan/10 border border-cyan text-cyan font-bold text-sm btn-tactical glow-cyan"
            >
              {currentChallengeIndex === 0 ? 'Start Playing' : 'Keep Going'}
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-dark-surface border border-dark-border rounded-lg p-3 text-center tactical-card">
          <p className="text-2xl font-bold text-cyan readout">{streak}</p>
          <p className="text-[10px] text-parchment-dark mt-1 uppercase tracking-wider">Streak</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-3 text-center tactical-card">
          <p className="text-2xl font-bold text-cyan readout">{gamesPlayed}</p>
          <p className="text-[10px] text-parchment-dark mt-1 uppercase tracking-wider">Played</p>
        </div>
        <div className="bg-dark-surface border border-dark-border rounded-lg p-3 text-center tactical-card">
          <p className="text-2xl font-bold text-gold readout">{bestScore.toLocaleString()}</p>
          <p className="text-[10px] text-parchment-dark mt-1 uppercase tracking-wider">Best</p>
        </div>
      </div>

      {/* Recent Scores */}
      {allTimeScores.length > 0 && (
        <div className="bg-dark-surface border border-dark-border rounded-lg p-4 tactical-card">
          <div className="tactical-card-inner">
            <h3 className="text-cyan font-semibold mb-3 text-sm uppercase tracking-wider">Recent Scores</h3>
            <div className="space-y-0 max-h-48 overflow-y-auto">
              {[...allTimeScores].reverse().slice(0, 7).map((s, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-dark-border/50 last:border-b-0">
                  <span className="text-parchment-dark readout text-xs">{s.date}</span>
                  <span className="text-gold-light font-bold readout text-xs">{s.score.toLocaleString()} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* How to Play */}
      <div className="mt-4 bg-dark-surface border border-dark-border rounded-lg p-4 tactical-card">
        <div className="tactical-card-inner">
          <h3 className="text-cyan font-semibold mb-3 text-sm uppercase tracking-wider">How to Play</h3>
          <div className="space-y-3 text-sm text-parchment-dark">
            <div className="flex gap-3 items-start">
              <span className="text-cyan readout text-xs font-bold mt-0.5 w-6 shrink-0">[01]</span>
              <p className="font-sans">Read the clue about a historical event</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-cyan readout text-xs font-bold mt-0.5 w-6 shrink-0">[02]</span>
              <p className="font-sans">Drop your pin where you think it happened</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-cyan readout text-xs font-bold mt-0.5 w-6 shrink-0">[03]</span>
              <p className="font-sans">See how close you got and learn the story</p>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-cyan readout text-xs font-bold mt-0.5 w-6 shrink-0">[04]</span>
              <p className="font-sans">Play all 5 rounds daily. Keep your streak alive!</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-parchment-dark/30 text-[10px] mt-4 mb-2 uppercase tracking-[0.2em]">EventPin v1.0 // Know Where History Happened</p>
    </div>
  )
}
