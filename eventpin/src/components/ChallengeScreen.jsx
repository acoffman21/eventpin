import { useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { useGameStore } from '../store/gameStore'

const userPinIcon = L.divIcon({
  className: 'pin-marker',
  html: `<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 28 16 28s16-16 16-28C32 7.16 24.84 0 16 0z" fill="#22d3ee" opacity="0.9"/>
    <circle cx="16" cy="16" r="7" fill="#0a0e1a"/>
    <circle cx="16" cy="16" r="4" fill="#22d3ee"/>
    <line x1="16" y1="6" x2="16" y2="10" stroke="#22d3ee" stroke-width="1"/>
    <line x1="16" y1="22" x2="16" y2="26" stroke="#22d3ee" stroke-width="1"/>
    <line x1="6" y1="16" x2="10" y2="16" stroke="#22d3ee" stroke-width="1"/>
    <line x1="22" y1="16" x2="26" y2="16" stroke="#22d3ee" stroke-width="1"/>
  </svg>`,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
})

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function ChallengeScreen() {
  const getCurrentChallenge = useGameStore((s) => s.getCurrentChallenge)
  const setPin = useGameStore((s) => s.setPin)
  const submitGuess = useGameStore((s) => s.submitGuess)
  const pinPosition = useGameStore((s) => s.pinPosition)
  const currentChallengeIndex = useGameStore((s) => s.currentChallengeIndex)
  const goHome = useGameStore((s) => s.goHome)

  const [clueExpanded, setClueExpanded] = useState(true)
  const challenge = getCurrentChallenge()

  const handleMapClick = useCallback((lat, lng) => {
    setPin(lat, lng)
    setClueExpanded(false)
  }, [setPin])

  if (!challenge) return null

  const yearDisplay = challenge.year < 0
    ? `${Math.abs(challenge.year)} BC`
    : `${challenge.year} AD`

  return (
    <div className="flex-1 flex flex-col h-[100svh] overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-dark-surface border-b border-dark-border z-20">
        <button onClick={goHome} className="text-parchment-dark p-2 -ml-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-cyan font-bold text-sm readout uppercase tracking-wider">Round {currentChallengeIndex + 1}/5</span>
          <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold border ${
            challenge.difficulty === 'hard' ? 'border-red-score/40 text-red-score bg-red-score/10' :
            challenge.difficulty === 'medium' ? 'border-orange-score/40 text-orange-score bg-orange-score/10' :
            'border-green-score/40 text-green-score bg-green-score/10'
          }`}>
            {challenge.difficulty}
          </span>
        </div>
        <div className="w-10" />
      </div>

      {/* Clue panel - collapsible */}
      <div
        className={`bg-dark-surface border-b border-dark-border z-10 transition-all duration-300 overflow-hidden ${
          clueExpanded ? 'max-h-[500px]' : 'max-h-12'
        }`}
      >
        <button
          onClick={() => setClueExpanded(!clueExpanded)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-left"
        >
          <span className="text-cyan text-xs font-bold truncate pr-2 uppercase tracking-wider">
            {clueExpanded ? '// Drop your pin on the map' : `Clue: ${challenge.clue.slice(0, 50)}...`}
          </span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-cyan shrink-0 transition-transform ${clueExpanded ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {clueExpanded && (
          <div className="px-4 pb-3">
            {/* Clue text */}
            <p className="text-parchment text-sm leading-relaxed font-sans">{challenge.clue}</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative" style={{ minHeight: '300px' }}>
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={2}
          maxZoom={18}
          zoomControl={true}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          worldCopyJump={true}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {pinPosition && (
            <Marker position={[pinPosition.lat, pinPosition.lng]} icon={userPinIcon} />
          )}
        </MapContainer>

        {/* Tap to place pin footer */}
        {!pinPosition && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none z-[500]">
            <div className="flex items-center gap-2 bg-dark-bg/80 border border-cyan/20 px-3 py-1.5 rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="2" x2="12" y2="6"/>
                <line x1="12" y1="18" x2="12" y2="22"/>
                <line x1="2" y1="12" x2="6" y2="12"/>
                <line x1="18" y1="12" x2="22" y2="12"/>
              </svg>
              <span className="text-cyan text-[10px] font-bold uppercase tracking-[0.15em]">Tap to Place Pin</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="px-4 py-3 bg-dark-surface border-t border-dark-border safe-bottom">
        <button
          onClick={submitGuess}
          disabled={!pinPosition}
          className={`w-full py-4 rounded-lg font-bold text-sm btn-tactical transition-all ${
            pinPosition
              ? 'bg-cyan/10 border border-cyan text-cyan glow-cyan'
              : 'bg-dark-card border border-dark-border text-parchment-dark/50 cursor-not-allowed'
          }`}
        >
          {pinPosition ? 'Lock In Guess' : 'Place Your Pin...'}
        </button>
      </div>
    </div>
  )
}
