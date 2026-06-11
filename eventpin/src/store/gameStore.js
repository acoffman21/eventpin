import { create } from 'zustand'
import events from '../data/events.json'

const DAILY_LIMIT = 5
const MAX_DISTANCE_KM = 5000
const MAX_SCORE = 1000
const MAX_DAILY_SCORE = DAILY_LIMIT * MAX_SCORE
const PERFECT_THRESHOLD_KM = 50

function getUTCDateString() {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

function seedRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  return function () {
    h |= 0; h = h + 0x6D2B79F5 | 0
    let t = Math.imul(h ^ h >>> 15, 1 | h)
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t
    return ((t ^ t >>> 14) >>> 0) / 4294967296
  }
}

function getDailyChallenges(dateStr) {
  const rng = seedRandom(dateStr + '-eventpin-v1')
  const shuffled = [...events].sort(() => rng() - 0.5)
  return shuffled.slice(0, DAILY_LIMIT)
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const toRad = (deg) => deg * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function calculateScore(distanceKm, timeMs, streak, difficulty) {
  let baseScore = 0
  if (distanceKm <= PERFECT_THRESHOLD_KM) {
    baseScore = MAX_SCORE
  } else if (distanceKm >= MAX_DISTANCE_KM) {
    baseScore = 0
  } else {
    baseScore = Math.round(MAX_SCORE * (1 - (distanceKm - PERFECT_THRESHOLD_KM) / (MAX_DISTANCE_KM - PERFECT_THRESHOLD_KM)))
  }

  let speedMultiplier = 0.85
  if (timeMs < 10000) speedMultiplier = 1.0
  else if (timeMs < 20000) speedMultiplier = 0.95
  else if (timeMs < 30000) speedMultiplier = 0.90

  const difficultyMultiplier = difficulty === 'hard' ? 1.3 : difficulty === 'medium' ? 1.1 : 1.0
  const streakMultiplier = 1 + Math.min(streak, 10) * 0.05

  return {
    baseScore,
    speedMultiplier,
    difficultyMultiplier,
    streakMultiplier,
    totalScore: Math.min(MAX_SCORE, Math.round(baseScore * speedMultiplier * difficultyMultiplier * streakMultiplier))
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('eventpin-state')
    if (!saved) return null
    return JSON.parse(saved)
  } catch { return null }
}

function saveState(state) {
  const toSave = {
    currentDate: state.currentDate,
    challengeResults: state.challengeResults,
    currentChallengeIndex: state.currentChallengeIndex,
    streak: state.streak,
    lastPlayedDate: state.lastPlayedDate,
    totalScore: state.totalScore,
    allTimeScores: state.allTimeScores,
    gamesPlayed: state.gamesPlayed,
  }
  localStorage.setItem('eventpin-state', JSON.stringify(toSave))
}

const today = getUTCDateString()
const saved = loadState()

function getInitialState() {
  if (saved && saved.currentDate === today) {
    return {
      ...saved,
      challenges: getDailyChallenges(today),
      screen: saved.currentChallengeIndex >= DAILY_LIMIT ? 'summary' : 'home',
    }
  }

  let streak = 0
  if (saved) {
    const yesterday = new Date()
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayStr = `${yesterday.getUTCFullYear()}-${String(yesterday.getUTCMonth() + 1).padStart(2, '0')}-${String(yesterday.getUTCDate()).padStart(2, '0')}`
    if (saved.lastPlayedDate === yesterdayStr && saved.currentChallengeIndex >= DAILY_LIMIT) {
      streak = saved.streak
    }
  }

  return {
    currentDate: today,
    challenges: getDailyChallenges(today),
    challengeResults: [],
    currentChallengeIndex: 0,
    streak,
    lastPlayedDate: saved?.lastPlayedDate || null,
    totalScore: 0,
    allTimeScores: saved?.allTimeScores || [],
    gamesPlayed: saved?.gamesPlayed || 0,
    screen: 'home',
  }
}

export const useGameStore = create((set, get) => ({
  ...getInitialState(),
  screen: getInitialState().screen,
  pinPosition: null,
  challengeStartTime: null,
  showingResult: false,
  lastResult: null,

  startChallenge: () => {
    set({
      screen: 'challenge',
      pinPosition: null,
      challengeStartTime: Date.now(),
      showingResult: false,
      lastResult: null,
    })
  },

  setPin: (lat, lng) => {
    set({ pinPosition: { lat, lng } })
  },

  submitGuess: () => {
    const state = get()
    if (!state.pinPosition) return

    const challenge = state.challenges[state.currentChallengeIndex]
    const distance = haversineDistance(
      state.pinPosition.lat, state.pinPosition.lng,
      challenge.lat, challenge.lng
    )
    const timeMs = Date.now() - state.challengeStartTime
    const scoreResult = calculateScore(distance, timeMs, state.streak, challenge.difficulty)

    const result = {
      eventId: challenge.id,
      distance: Math.round(distance * 0.621371),
      timeMs,
      ...scoreResult,
      pinPosition: state.pinPosition,
      actualPosition: { lat: challenge.lat, lng: challenge.lng },
    }

    const newResults = [...state.challengeResults, result]
    const newTotalScore = Math.min(MAX_DAILY_SCORE, state.totalScore + result.totalScore)

    set({
      showingResult: true,
      lastResult: result,
      challengeResults: newResults,
      totalScore: newTotalScore,
      screen: 'result',
    })

    saveState({ ...get() })
  },

  nextChallenge: () => {
    const state = get()
    const nextIndex = state.currentChallengeIndex + 1

    if (nextIndex >= DAILY_LIMIT) {
      const newStreak = state.streak + 1
      const newAllTime = [...state.allTimeScores, { date: state.currentDate, score: state.totalScore }].slice(-30)
      set({
        currentChallengeIndex: nextIndex,
        streak: newStreak,
        lastPlayedDate: state.currentDate,
        allTimeScores: newAllTime,
        gamesPlayed: state.gamesPlayed + 1,
        screen: 'summary',
      })
    } else {
      set({
        currentChallengeIndex: nextIndex,
        lastPlayedDate: state.currentDate,
        screen: 'challenge',
        pinPosition: null,
        challengeStartTime: Date.now(),
        showingResult: false,
        lastResult: null,
      })
    }

    saveState({ ...get() })
  },

  goHome: () => {
    set({ screen: 'home' })
  },

  resetGame: () => {
    localStorage.removeItem('eventpin-state')
    const freshState = {
      currentDate: today,
      challenges: getDailyChallenges(today),
      challengeResults: [],
      currentChallengeIndex: 0,
      streak: 0,
      lastPlayedDate: null,
      totalScore: 0,
      allTimeScores: [],
      gamesPlayed: 0,
      screen: 'home',
      pinPosition: null,
      challengeStartTime: null,
      showingResult: false,
      lastResult: null,
    }
    set(freshState)
  },

  goToSummary: () => {
    set({ screen: 'summary' })
  },

  getCurrentChallenge: () => {
    const state = get()
    return state.challenges[state.currentChallengeIndex] || null
  },

  isDailyComplete: () => {
    return get().currentChallengeIndex >= DAILY_LIMIT
  },

  getProgress: () => {
    const state = get()
    return `${Math.min(state.currentChallengeIndex, DAILY_LIMIT)}/${DAILY_LIMIT}`
  },
}))
