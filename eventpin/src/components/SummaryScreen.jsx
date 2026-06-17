import { useState, useCallback } from 'react'
import { useGameStore } from '../store/gameStore'

function getScoreColor(score) {
  if (score >= 900) return 'text-cyan'
  if (score >= 600) return 'text-green-score'
  if (score >= 300) return 'text-orange-score'
  return 'text-red-score'
}

function getScoreBar(score) {
  return Math.min(100, (score / 1000) * 100)
}

function getOverallGrade(totalScore) {
  if (totalScore >= 4500) return { grade: 'S', label: 'History Buff', color: 'text-cyan' }
  if (totalScore >= 3500) return { grade: 'A', label: 'Scholar', color: 'text-green-score' }
  if (totalScore >= 2500) return { grade: 'B', label: 'Explorer', color: 'text-gold' }
  if (totalScore >= 1500) return { grade: 'C', label: 'Tourist', color: 'text-orange-score' }
  return { grade: 'D', label: 'Lost', color: 'text-red-score' }
}

function formatTime(ms) {
  const totalSeconds = Math.round(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function generateShareText(totalScore, results, streak) {
  const indicators = results.map(r => {
    if (r.totalScore >= 900) return '🟢'
    if (r.totalScore >= 700) return '🟢'
    if (r.totalScore >= 500) return '🟡'
    if (r.totalScore >= 300) return '🟠'
    return '🔴'
  }).join('')

  const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const maxScore = results.length * 1000
  const totalTimeMs = results.reduce((sum, r) => sum + r.timeMs, 0)
  const avgDistance = Math.round(results.reduce((sum, r) => sum + r.distance, 0) / results.length)

  let text = `Pin the Event - ${date}\n\n${indicators}\nScore: ${totalScore.toLocaleString()} / ${maxScore.toLocaleString()}\nTime: ${formatTime(totalTimeMs)}\nAvg. Distance: ${avgDistance.toLocaleString()} mi\n\npintheevent.com`
  if (streak > 0) {
    text += `\n${streak} Day Streak`
  }
  return text
}

export default function SummaryScreen() {
  const goHome = useGameStore((s) => s.goHome)
  const totalScore = useGameStore((s) => s.totalScore)
  const challengeResults = useGameStore((s) => s.challengeResults)
  const challenges = useGameStore((s) => s.challenges)
  const streak = useGameStore((s) => s.streak)
  const [shared, setShared] = useState(false)

  const grade = getOverallGrade(totalScore)

  const handleShare = useCallback(async () => {
    const shareText = generateShareText(totalScore, challengeResults, streak)

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText })
        setShared(true)
        return
      } catch (e) {
        // fallthrough to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareText)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = shareText
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }, [totalScore, challengeResults, streak])

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-dark-bg px-4 py-6 topo-bg">
      {/* Header */}
      <div className="text-center mb-6 animate-glitch-reveal">
        <p className="text-parchment-dark text-[10px] mb-3 uppercase tracking-[0.2em]">All Done!</p>
        <div className={`text-6xl font-bold ${grade.color} readout mb-1`}>{grade.grade}</div>
        <p className="text-gold text-sm uppercase tracking-wider">{grade.label}</p>
      </div>

      {/* Total Score */}
      <div className="text-center mb-6 animate-slide-up">
        <p className="text-parchment-dark text-[10px] uppercase tracking-[0.2em] mb-1">Aggregate Score</p>
        <p className="text-4xl font-bold text-gold-light readout">{totalScore.toLocaleString()}</p>
        <p className="text-parchment-dark text-[10px] mt-1 uppercase tracking-wider">of 5,000</p>
        <div className="mt-3 mx-auto w-48 h-1.5 bg-dark-card rounded-sm overflow-hidden border border-dark-border">
          <div
            className="h-full bg-gradient-to-r from-cyan-dim to-cyan rounded-sm transition-all duration-1000 animate-bar-fill"
            style={{ width: `${(totalScore / 5000) * 100}%` }}
          />
        </div>
      </div>

      {/* Total Time */}
      <div className="text-center mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <span className="inline-flex items-center gap-2 bg-dark-surface border border-dark-border rounded-lg px-4 py-2">
          <span className="text-cyan readout font-bold">{formatTime(challengeResults.reduce((sum, r) => sum + r.timeMs, 0))}</span>
          <span className="text-parchment-dark text-xs uppercase tracking-wider">total time</span>
        </span>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="text-center mb-4 animate-slide-up" style={{ animationDelay: '0.15s' }}>
          <span className="inline-flex items-center gap-2 bg-dark-surface border border-dark-border rounded-lg px-4 py-2">
            <span className="text-cyan readout font-bold">{streak}</span>
            <span className="text-parchment-dark text-xs uppercase tracking-wider">day streak</span>
          </span>
        </div>
      )}

      {/* Round Results */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-4 animate-slide-up tactical-card" style={{ animationDelay: '0.25s' }}>
        <div className="tactical-card-inner">
          <h3 className="text-cyan font-semibold mb-3 text-sm uppercase tracking-wider">Round Breakdown</h3>
          <div className="space-y-3">
            {challengeResults.map((result, i) => {
              const event = challenges[i]
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-dark-card border border-dark-border flex items-center justify-center text-[10px] text-parchment-dark font-bold readout shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-parchment text-sm truncate font-sans">{event.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-dark-card rounded-sm overflow-hidden">
                        <div
                          className={`h-full rounded-sm ${
                            result.totalScore >= 700 ? 'bg-green-score' :
                            result.totalScore >= 400 ? 'bg-orange-score' : 'bg-red-score'
                          }`}
                          style={{ width: `${getScoreBar(result.totalScore)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-parchment-dark readout">{result.distance.toLocaleString()} mi</span>
                    </div>
                  </div>
                  <span className={`text-sm font-bold shrink-0 readout ${getScoreColor(result.totalScore)}`}>
                    {result.totalScore}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-3 mb-4 animate-slide-up" style={{ animationDelay: '0.35s' }}>
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-lg bg-cyan/10 border border-cyan text-cyan font-bold text-sm btn-tactical flex items-center justify-center gap-2"
        >
          {shared ? 'Copied!' : 'Share Score'}
        </button>
      </div>

      <button
        onClick={goHome}
        className="w-full py-3 text-parchment-dark text-xs mb-2 uppercase tracking-wider"
      >
        Back to Home
      </button>

      <p className="text-center text-parchment-dark/30 text-[10px] mb-2 uppercase tracking-[0.2em]">New challenges at midnight UTC</p>
    </div>
  )
}
