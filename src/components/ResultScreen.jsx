import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useGameStore } from '../store/gameStore'

const userPinIcon = L.divIcon({
  className: 'pin-marker',
  html: `<svg width="28" height="40" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#22d3ee" opacity="0.9"/>
    <circle cx="16" cy="16" r="7" fill="#0a0e1a"/>
    <circle cx="16" cy="16" r="3" fill="#22d3ee"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
})

const correctPinIcon = L.divIcon({
  className: 'pin-marker',
  html: `<svg width="28" height="40" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#10b981"/>
    <circle cx="16" cy="16" r="7" fill="#fff"/>
    <path d="M11 16l3 3 7-7" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
})

function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length >= 2) {
      const bounds = L.latLngBounds(positions)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 })
    }
  }, [map, positions])
  return null
}

function getScoreColor(score) {
  if (score >= 900) return 'text-cyan'
  if (score >= 600) return 'text-green-score'
  if (score >= 300) return 'text-orange-score'
  return 'text-red-score'
}

function getScoreLabel(score) {
  if (score >= 900) return 'Direct Hit'
  if (score >= 700) return 'On Target'
  if (score >= 500) return 'Solid Intel'
  if (score >= 300) return 'Partial Intel'
  if (score >= 100) return 'Off Course'
  return 'Mission Failed'
}

function getScoreIndicator(score) {
  if (score >= 900) return '[+++]'
  if (score >= 700) return '[++]'
  if (score >= 500) return '[+]'
  if (score >= 300) return '[~]'
  return '[!]'
}

export default function ResultScreen() {
  const lastResult = useGameStore((s) => s.lastResult)
  const getCurrentChallenge = useGameStore((s) => s.getCurrentChallenge)
  const nextChallenge = useGameStore((s) => s.nextChallenge)
  const currentChallengeIndex = useGameStore((s) => s.currentChallengeIndex)
  const challenges = useGameStore((s) => s.challenges)

  const [showScore, setShowScore] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)

  const challenge = challenges[currentChallengeIndex]

  useEffect(() => {
    const t1 = setTimeout(() => setShowScore(true), 400)
    const t2 = setTimeout(() => setShowDetails(true), 800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (!showScore || !lastResult) return
    const target = lastResult.totalScore
    const duration = 800
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setAnimatedScore(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [showScore, lastResult])

  if (!lastResult || !challenge) return null

  const positions = [
    [lastResult.pinPosition.lat, lastResult.pinPosition.lng],
    [lastResult.actualPosition.lat, lastResult.actualPosition.lng],
  ]

  const isLast = currentChallengeIndex >= 4

  return (
    <div className="flex-1 flex flex-col h-[100svh] overflow-hidden">
      {/* Result map */}
      <div style={{ height: '40vh', position: 'relative' }}>
        <MapContainer
          center={[lastResult.actualPosition.lat, lastResult.actualPosition.lng]}
          zoom={4}
          zoomControl={false}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          scrollWheelZoom={false}
          dragging={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <FitBounds positions={positions} />
          <Marker position={positions[0]} icon={userPinIcon} />
          <Marker position={positions[1]} icon={correctPinIcon} />
          <Polyline
            positions={positions}
            color="#22d3ee"
            weight={2}
            dashArray="8 8"
            opacity={0.6}
          />
        </MapContainer>

        {/* Distance badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-dark-bg/90 border border-cyan-dim px-4 py-2 rounded-lg">
          <span className="text-cyan font-bold readout">{lastResult.distance.toLocaleString()} KM</span>
          <span className="text-parchment-dark text-xs ml-2 uppercase tracking-wider">deviation</span>
        </div>
      </div>

      {/* Score & details */}
      <div className="flex-1 overflow-y-auto bg-dark-bg">
        {/* Score section */}
        <div className={`text-center py-5 ${showScore ? 'animate-glitch-reveal' : 'opacity-0'}`}>
          <p className="text-parchment-dark text-xs mb-1 readout">{getScoreIndicator(lastResult.totalScore)} {getScoreLabel(lastResult.totalScore)}</p>
          <p className={`text-5xl font-bold readout ${getScoreColor(lastResult.totalScore)}`}>
            {animatedScore}
          </p>
          <p className="text-parchment-dark text-[10px] mt-1 uppercase tracking-[0.15em]">points</p>
        </div>

        {/* Score breakdown */}
        {showScore && (
          <div className="mx-4 mb-4 bg-dark-surface border border-dark-border rounded-lg p-3 animate-slide-up tactical-card">
            <div className="tactical-card-inner">
              <div className="flex justify-between text-sm py-1.5 border-b border-dark-border/30">
                <span className="text-parchment-dark text-xs uppercase tracking-wider">Distance Score</span>
                <span className="text-gold readout font-bold">{lastResult.baseScore}</span>
              </div>
              {lastResult.speedBonus > 0 && (
                <div className="flex justify-between text-sm py-1.5 border-b border-dark-border/30">
                  <span className="text-parchment-dark text-xs uppercase tracking-wider">Speed Bonus</span>
                  <span className="text-cyan readout font-bold">+{lastResult.speedBonus}</span>
                </div>
              )}
              {lastResult.difficultyMultiplier > 1 && (
                <div className="flex justify-between text-sm py-1.5 border-b border-dark-border/30">
                  <span className="text-parchment-dark text-xs uppercase tracking-wider">Difficulty Mult</span>
                  <span className="text-gold readout font-bold">x{lastResult.difficultyMultiplier.toFixed(1)}</span>
                </div>
              )}
              {lastResult.streakMultiplier > 1 && (
                <div className="flex justify-between text-sm py-1.5">
                  <span className="text-parchment-dark text-xs uppercase tracking-wider">Streak Mult</span>
                  <span className="text-gold readout font-bold">x{lastResult.streakMultiplier.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Event details */}
        {showDetails && (
          <div className="mx-4 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="bg-dark-surface border border-dark-border rounded-lg p-4 tactical-card">
              <div className="tactical-card-inner">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[8px] uppercase tracking-[0.2em] text-cyan/50 font-bold border border-cyan/20 px-1.5 py-0.5 rounded-sm">Declassified</span>
                </div>
                <h3 className="text-gold font-bold text-lg mb-1 font-sans">{challenge.title}</h3>
                <p className="text-gold-dark text-xs readout mb-3">{challenge.year < 0 ? `${Math.abs(challenge.year)} BC` : `${challenge.year} AD`}</p>
                <p className="text-parchment text-sm leading-relaxed mb-3 font-sans">{challenge.description}</p>
                {challenge.facts && (
                  <div className="space-y-2 border-t border-dark-border/30 pt-2">
                    {challenge.facts.map((fact, i) => (
                      <div key={i} className="flex gap-2 text-xs text-parchment-dark">
                        <span className="text-cyan shrink-0 readout">[{String(i + 1).padStart(2, '0')}]</span>
                        <span className="font-sans">{fact}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action */}
      <div className="px-4 py-3 bg-dark-surface border-t border-dark-border safe-bottom">
        <button
          onClick={nextChallenge}
          className="w-full py-4 rounded-lg bg-cyan/10 border border-cyan text-cyan font-bold text-sm btn-tactical"
        >
          {isLast ? 'View Mission Report' : `Next Phase [${currentChallengeIndex + 1}/5]`}
        </button>
      </div>
    </div>
  )
}
