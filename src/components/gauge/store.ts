import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Game } from './types'

interface GaugeGameStore {
  games: [Game | null, Game | null]
  loading: boolean
  selectedGenre: string | null
  selectedYear: number | null
  shownGameIds: Set<number>
  score: number
  highScore: number
  setGames: (games: [Game | null, Game | null]) => void
  setLoading: (loading: boolean) => void
  setSelectedGenre: (genre: string | null) => void
  setSelectedYear: (year: number | null) => void
  addShownGames: (games: Game[]) => void
  resetShownGames: () => void
  incrementScore: () => void
  resetGame: () => void
  resetCurrentGames: () => void
}

export const useGaugeGameStore = create<GaugeGameStore>()(
  persist(
    (set) => ({
      games: [null, null],
      loading: false,
      selectedGenre: null,
      selectedYear: null,
      shownGameIds: new Set<number>(),
      score: 0,
      highScore: 0,
      setGames: (games) => set({ games }),
      setLoading: (loading) => set({ loading }),
      setSelectedGenre: (genre) => set({ 
        selectedGenre: genre, 
        selectedYear: null,
        shownGameIds: new Set() // Reset shown games when changing genre
      }),
      setSelectedYear: (year) => set({ 
        selectedYear: year, 
        selectedGenre: null,
        shownGameIds: new Set() // Reset shown games when changing year
      }),
      addShownGames: (games) => set((state) => ({
        shownGameIds: new Set([...Array.from(state.shownGameIds), ...games.map(g => g.id)])
      })),
      resetShownGames: () => set({ shownGameIds: new Set() }),
      incrementScore: () => set((state) => ({ 
        score: state.score + 1,
        highScore: Math.max(state.score + 1, state.highScore)
      })),
      resetGame: () => set({ 
        score: 0, 
        games: [null, null],
        selectedGenre: null,
        selectedYear: null,
        shownGameIds: new Set()
      }),
      resetCurrentGames: () => set({ games: [null, null] })
    }),
    {
      name: 'gauge-game-storage',
      partialize: (state) => ({ 
        highScore: state.highScore 
      })
    }
  )
)