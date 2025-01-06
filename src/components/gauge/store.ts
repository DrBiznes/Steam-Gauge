import { create } from 'zustand'

interface Game {
  id: number
  name: string
  coverUrl: string
  steamScore?: number
}

interface GaugeGameState {
  currentGames: [Game | null, Game | null]
  score: number
  highScore: number
  loading: boolean
  setGames: (games: [Game, Game]) => void
  incrementScore: () => void
  resetGame: () => void
  setLoading: (loading: boolean) => void
}

export const useGaugeGameStore = create<GaugeGameState>((set) => ({
  currentGames: [null, null],
  score: 0,
  highScore: 0,
  loading: false,
  setGames: (games) => set({ currentGames: games }),
  incrementScore: () => 
    set((state) => ({ 
      score: state.score + 1,
      highScore: Math.max(state.score + 1, state.highScore)
    })),
  resetGame: () => set({ score: 0, currentGames: [null, null] }),
  setLoading: (loading) => set({ loading })
})) 