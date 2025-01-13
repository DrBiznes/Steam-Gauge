import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game, GameMode } from './types'

interface ScoreData {
  currentScore: number
  highScore: number
}

interface GaugeGameStore {
  games: [Game | null, Game | null]
  loading: boolean
  selectedGenre: string | null
  selectedGameMode: GameMode | null
  shownGameIds: Set<number>
  scores: Record<string, ScoreData>  // Key is either gameMode or gameMode-genre
  setGames: (games: [Game | null, Game | null]) => void
  setLoading: (loading: boolean) => void
  setSelectedGenre: (genre: string | null) => void
  setSelectedGameMode: (mode: GameMode | null) => void
  addShownGames: (games: Game[]) => void
  resetShownGames: () => void
  incrementScore: () => void
  resetScore: () => void
  resetGame: () => void
  resetCurrentGames: () => void
  getCurrentScore: () => number
  getHighScore: () => number
}

const getScoreKey = (state: GaugeGameStore) => {
  if (state.selectedGameMode === 'genre' && state.selectedGenre) {
    return `genre-${state.selectedGenre}`
  }
  return state.selectedGameMode || ''
}

export const useGaugeGameStore = create<GaugeGameStore>()(
  persist(
    (set, get) => ({
      games: [null, null],
      loading: false,
      selectedGenre: null,
      selectedGameMode: null,
      shownGameIds: new Set<number>(),
      scores: {},
      setGames: (games) => set({ games }),
      setLoading: (loading) => set({ loading }),
      setSelectedGenre: (genre) => set({ 
        selectedGenre: genre,
        shownGameIds: new Set()
      }),
      setSelectedGameMode: (mode) => set({ 
        selectedGameMode: mode,
        selectedGenre: null,
        shownGameIds: new Set()
      }),
      addShownGames: (games) => set((state) => ({
        shownGameIds: new Set([...Array.from(state.shownGameIds), ...games.map(g => g.id)])
      })),
      resetShownGames: () => set({ shownGameIds: new Set() }),
      incrementScore: () => set((state) => {
        const scoreKey = getScoreKey(state)
        const currentScore = (state.scores[scoreKey]?.currentScore || 0) + 1
        const highScore = Math.max(currentScore, state.scores[scoreKey]?.highScore || 0)
        
        return {
          scores: {
            ...state.scores,
            [scoreKey]: { currentScore, highScore }
          }
        }
      }),
      resetScore: () => set((state) => {
        const scoreKey = getScoreKey(state)
        return {
          scores: {
            ...state.scores,
            [scoreKey]: { 
              currentScore: 0,
              highScore: state.scores[scoreKey]?.highScore || 0
            }
          }
        }
      }),
      resetGame: () => set((state) => ({ 
        games: [null, null],
        selectedGenre: null,
        selectedGameMode: null,
        shownGameIds: new Set(),
        scores: {
          ...state.scores,
          [getScoreKey(state)]: {
            currentScore: 0,
            highScore: state.scores[getScoreKey(state)]?.highScore || 0
          }
        }
      })),
      resetCurrentGames: () => set({ games: [null, null] }),
      getCurrentScore: () => {
        const state = get()
        const scoreKey = getScoreKey(state)
        return state.scores[scoreKey]?.currentScore || 0
      },
      getHighScore: () => {
        const state = get()
        const scoreKey = getScoreKey(state)
        return state.scores[scoreKey]?.highScore || 0
      }
    }),
    {
      name: 'gauge-game-storage',
      partialize: (state) => ({ 
        scores: state.scores,
        selectedGameMode: state.selectedGameMode,
        selectedGenre: state.selectedGenre
      })
    }
  )
)