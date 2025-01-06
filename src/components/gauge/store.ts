import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game } from './types'

interface GaugeGameState {
  currentGames: [Game | null, Game | null]
  score: number
  highScore: number
  loading: boolean
  selectedGenre: string | null
  selectedYear: number | null
  setGames: (games: [Game, Game]) => void
  incrementScore: () => void
  resetGame: () => void
  setLoading: (loading: boolean) => void
  setSelectedGenre: (genre: string | null) => void
  setSelectedYear: (year: number | null) => void
}

export const useGaugeGameStore = create<GaugeGameState>()(
  persist(
    (set) => ({
      currentGames: [null, null],
      score: 0,
      highScore: 0,
      loading: false,
      selectedGenre: null,
      selectedYear: null,
      setGames: (games) => set({ currentGames: games }),
      incrementScore: () => 
        set((state) => ({ 
          score: state.score + 1,
          highScore: Math.max(state.score + 1, state.highScore)
        })),
      resetGame: () => set({ 
        score: 0, 
        currentGames: [null, null],
        selectedGenre: null,
        selectedYear: null
      }),
      setLoading: (loading) => set({ loading }),
      setSelectedGenre: (genre) => set({ selectedGenre: genre }),
      setSelectedYear: (year) => set({ selectedYear: year })
    }),
    {
      name: 'gauge-game-storage',
      partialize: (state) => ({ 
        highScore: state.highScore 
      })
    }
  )
) 