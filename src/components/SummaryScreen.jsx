import { useState, useRef, useCallback } from 'react'
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
  if (totalScore >= 4500) return { grade: 'S', label: 'Commander', color: 'text-cyan' }
  if (totalScore >= 3500) return { grade: 'A', label: 'Colonel', color: 'text-green-score' }
  if (totalScore >= 2500) return { grade: 'B', label: 'Captain', color: 'text-gold' }
  if (totalScore >= 1500) return { grade: 'C', label: 'Lieutenant', color: 'text-orange-score' }
  return { grade: 'D', label: 'Recruit', color: 'text-red-score' }
}

function generateShareText(totalScore, results, streak, challenges) {
  const indicators = results.map(r => {
    if (r.totalScore >= 900) return '++++'
    if (r.totalScore >= 700) return '+++'
    if (r.totalScore >= 500) return '++'
    if (r.totalScore >= 300) return '+'
    return '-'
  }).join(' | ')

  return `[EVENTPIN] Mission Report — ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}

${indicators}
Score: ${totalScore.toLocaleString()} / 5,000
${streak > 0 ? `${streak} day ops streak\n` : ''}
eventpin.app`
}

export default function SummaryScreen() {
  const goHome = useGameStore((s) => s.goHome)
  const resetGame = useGameStore((s) => s.resetGame)
  const totalScore = useGameStore((s) => s.totalScore)
  const challengeResults = useGameStore((s) => s.challengeResults)
  const challenges = useGameStore((s) => s.challenges)
  const streak = useGameStore((s) => s.streak)
  const [shared, setShared] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const shareCardRef = useRef(null)

  const grade = getOverallGrade(totalScore)

  const handleShare = useCallback(async () => {
    const text = generateShareText(totalScore, challengeResults, streak, challenges)

    if (navigator.share) {
      try {
        await navigator.share({ text })
        setShared(true)
        return
      } catch (e) {
        // fallthrough to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch (e) {
      // fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }, [totalScore, challengeResults, streak, challenges])

  const handleShareCard = useCallback(async () => {
    setShowShareCard(true)
    // Give time for the card to render
    setTimeout(async () => {
      try {
        const html2canvas = (await import('html2canvas-pro')).default
        const canvas = await html2canvas(shareCardRef.current, {
          backgroundColor: '#0a0e1a',
          scale: 2,
          useCORS: true,
        })
        canvas.toBlob(async (blob) => {
          if (navigator.share && navigator.canShare) {
            const file = new File([blob], 'eventpin-results.png', { type: 'image/png' })
            const shareData = { files: [file], text: 'eventpin.app' }
            if (navigator.canShare(shareData)) {
              try {
                await navigator.share(shareData)
              } catch (e) { /* user cancelled */ }
              return
            }
          }
          // Fallback: download
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = 'eventpin-results.png'
          a.click()
          URL.revokeObjectURL(url)
        }, 'image/png')
      } catch (e) {
        console.error('Share card generation failed', e)
      } finally {
        setShowShareCard(false)
      }
    }, 100)
  }, [])

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-dark-bg px-4 py-6 topo-bg">
      {/* Header */}
      <div className="text-center mb-6 animate-glitch-reveal">
        <p className="text-parchment-dark text-[10px] mb-3 uppercase tracking-[0.2em]">Mission Complete</p>
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

      {/* Streak */}
      {streak > 0 && (
        <div className="text-center mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <span className="inline-flex items-center gap-2 bg-dark-surface border border-dark-border rounded-lg px-4 py-2">
            <span className="text-cyan readout font-bold">{streak}</span>
            <span className="text-parchment-dark text-xs uppercase tracking-wider">day ops streak</span>
          </span>
        </div>
      )}

      {/* Round Results */}
      <div className="bg-dark-surface border border-dark-border rounded-lg p-4 mb-4 animate-slide-up tactical-card" style={{ animationDelay: '0.2s' }}>
        <div className="tactical-card-inner">
          <h3 className="text-cyan font-semibold mb-3 text-sm uppercase tracking-wider">Phase Breakdown</h3>
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
                      <span className="text-[10px] text-parchment-dark readout">{result.distance.toLocaleString()} km</span>
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
      <div className="space-y-3 mb-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={handleShare}
          className="w-full py-4 rounded-lg bg-cyan/10 border border-cyan text-cyan font-bold text-sm btn-tactical flex items-center justify-center gap-2"
        >
          {shared ? 'Transmitted' : 'Transmit Report'}
        </button>
        <button
          onClick={handleShareCard}
          className="w-full py-3 rounded-lg bg-dark-surface border border-dark-border text-gold font-semibold text-sm btn-tactical flex items-center justify-center gap-2"
        >
          Export Intel Card
        </button>
      </div>

      <button
        onClick={goHome}
        className="w-full py-3 text-parchment-dark text-xs mb-2 uppercase tracking-wider"
      >
        Return to Base
      </button>

      <button
        onClick={resetGame}
        className="w-full py-3 rounded-lg border border-red-score/30 text-red-score text-xs font-bold uppercase tracking-wider btn-tactical mb-4"
      >
        Reset Operations
      </button>

      <p className="text-center text-parchment-dark/30 text-[10px] mb-2 uppercase tracking-[0.2em]">New ops available at 0000 UTC</p>

      {/* Hidden share card for image generation */}
      {showShareCard && (
        <div className="fixed left-[-9999px] top-0">
          <div ref={shareCardRef} style={{ width: 400, padding: 24, background: '#0a0e1a', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#22d3ee', marginBottom: 4, letterSpacing: '0.2em' }}>EVENTPIN</div>
              <div style={{ fontSize: 10, color: '#8899aa', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Tactical History Operations</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {challengeResults.map((r, i) => (
                <div key={i} style={{
                  width: 48, height: 48, borderRadius: 4,
                  background: r.totalScore >= 700 ? 'rgba(16, 185, 129, 0.2)' : r.totalScore >= 400 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  border: `1px solid ${r.totalScore >= 700 ? '#10b981' : r.totalScore >= 400 ? '#f59e0b' : '#ef4444'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: r.totalScore >= 700 ? '#10b981' : r.totalScore >= 400 ? '#f59e0b' : '#ef4444',
                  fontSize: 14, fontWeight: 'bold'
                }}>
                  {r.totalScore}
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 36, fontWeight: 'bold', color: '#e8c96a' }}>{totalScore.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#8899aa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>of 5,000 points</div>
            </div>
            {streak > 0 && (
              <div style={{ textAlign: 'center', fontSize: 12, color: '#22d3ee', marginBottom: 12 }}>
                {streak} day ops streak
              </div>
            )}
            <div style={{ textAlign: 'center', fontSize: 9, color: '#4a5568', marginTop: 12, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              eventpin.app
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
