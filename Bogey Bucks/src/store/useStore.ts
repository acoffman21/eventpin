import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  GameConfig,
  Group,
  PlayerProfile,
  Round,
  RoundPlayer,
} from '../types'
import { SEED_GROUPS, SEED_PLAYERS } from '../data/seed'

/**
 * Global app store with full localStorage persistence (zustand `persist`).
 *
 * ⚠️ FUTURE EXPANSION: Swap `createJSONStorage(() => localStorage)` for a
 * cloud-backed storage adapter (Firebase/Supabase) to sync rounds, groups, and
 * leaderboards across devices and crew members.
 */

function uid(prefix = ''): string {
  return (
    prefix +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 8)
  )
}

function emptyHoleArray<T>(value: T): T[] {
  return new Array(18).fill(value)
}

export function createRoundPlayer(profile: PlayerProfile): RoundPlayer {
  return {
    id: profile.id,
    name: profile.name,
    handicapIndex: profile.handicapIndex,
    ghin: profile.ghin,
    scores: emptyHoleArray<number | null>(null),
    putts: emptyHoleArray<number | null>(null),
    fir: emptyHoleArray<boolean | null>(null),
    gir: emptyHoleArray<boolean | null>(null),
  }
}

interface StoreState {
  groups: Group[]
  players: PlayerProfile[]
  rounds: Round[]
  /** The id of the round currently being scored, if any. */
  activeRoundId: string | null

  // --- group / player management ---
  addGroup: (name: string, emoji: string) => Group
  addPlayerProfile: (
    name: string,
    handicapIndex: number,
    ghin?: string,
  ) => PlayerProfile

  // --- round lifecycle ---
  startRound: (input: {
    groupId: string
    courseId: string
    game: GameConfig
    players: RoundPlayer[]
  }) => Round
  setScore: (
    roundId: string,
    playerId: string,
    holeIndex: number,
    strokes: number | null,
  ) => void
  setStat: (
    roundId: string,
    playerId: string,
    holeIndex: number,
    stat: 'putts' | 'fir' | 'gir',
    value: number | boolean | null,
  ) => void
  setCurrentHole: (roundId: string, hole: number) => void
  completeRound: (roundId: string) => void
  deleteRound: (roundId: string) => void

  getRound: (roundId: string) => Round | undefined
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      groups: SEED_GROUPS,
      players: SEED_PLAYERS,
      rounds: [],
      activeRoundId: null,

      addGroup: (name, emoji) => {
        const group: Group = {
          id: uid('grp_'),
          name,
          emoji: emoji || '⛳️',
          createdAt: Date.now(),
        }
        set((s) => ({ groups: [...s.groups, group] }))
        return group
      },

      addPlayerProfile: (name, handicapIndex, ghin) => {
        const profile: PlayerProfile = {
          id: uid('plr_'),
          name,
          handicapIndex,
          ghin: ghin || undefined,
        }
        set((s) => ({ players: [...s.players, profile] }))
        return profile
      },

      startRound: ({ groupId, courseId, game, players }) => {
        const round: Round = {
          id: uid('rnd_'),
          groupId,
          courseId,
          game,
          players,
          currentHole: 1,
          status: 'active',
          createdAt: Date.now(),
        }
        set((s) => ({
          rounds: [round, ...s.rounds],
          activeRoundId: round.id,
        }))
        return round
      },

      setScore: (roundId, playerId, holeIndex, strokes) => {
        set((s) => ({
          rounds: s.rounds.map((r) => {
            if (r.id !== roundId) return r
            return {
              ...r,
              players: r.players.map((p) => {
                if (p.id !== playerId) return p
                const scores = [...p.scores]
                scores[holeIndex] = strokes
                return { ...p, scores }
              }),
            }
          }),
        }))
      },

      setStat: (roundId, playerId, holeIndex, stat, value) => {
        set((s) => ({
          rounds: s.rounds.map((r) => {
            if (r.id !== roundId) return r
            return {
              ...r,
              players: r.players.map((p) => {
                if (p.id !== playerId) return p
                const arr = [...(p[stat] as (number | boolean | null)[])]
                arr[holeIndex] = value
                return { ...p, [stat]: arr }
              }),
            }
          }),
        }))
      },

      setCurrentHole: (roundId, hole) => {
        set((s) => ({
          rounds: s.rounds.map((r) =>
            r.id === roundId ? { ...r, currentHole: hole } : r,
          ),
        }))
      },

      completeRound: (roundId) => {
        set((s) => ({
          activeRoundId: s.activeRoundId === roundId ? null : s.activeRoundId,
          rounds: s.rounds.map((r) =>
            r.id === roundId
              ? { ...r, status: 'completed', completedAt: Date.now() }
              : r,
          ),
        }))
      },

      deleteRound: (roundId) => {
        set((s) => ({
          rounds: s.rounds.filter((r) => r.id !== roundId),
          activeRoundId:
            s.activeRoundId === roundId ? null : s.activeRoundId,
        }))
      },

      getRound: (roundId) => get().rounds.find((r) => r.id === roundId),
    }),
    {
      name: 'bogey-bucks-store-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
)
