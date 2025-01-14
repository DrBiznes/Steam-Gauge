import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GameMode, GaugeStore, GameModeStates, GameState, Game } from './types'
import { GameEngine } from './engine/gameEngine'
import { gaugeApi } from '../services/GaugeAPI'

const INITIAL_GAME_STATE: GameState = {
  leftGame: null,
  rightGame: null,
  revealed: false,
  isTransitioning: false
}

const createInitialModeState = () => ({
  gamePool: [] as Game[],
  usedGameIds: new Set<number>(),
  currentScore: 0,
  highScore: 0,
  currentState: { ...INITIAL_GAME_STATE }
})

export const useGaugeStore = create<GaugeStore>()(
  persist(
    (set, get) => ({
      currentMode: null,
      currentGenre: null,
      isLoading: false,
      gameModeStates: {} as GameModeStates,

      setGameMode: (mode: GameMode, genre?: string) => {
        const currentStore = get()
        const modeKey = mode === 'genre' ? `genre-${genre}` : mode
        
        // Don't reset if we're already on this mode
        if (currentStore.currentMode === mode && currentStore.currentGenre === genre) {
          return
        }

        // Create or get existing mode state
        const existingState = currentStore.gameModeStates[modeKey]
        const newModeState = existingState || createInitialModeState()

        // Only set loading if we need to fetch games
        const needsGames = !existingState || !newModeState.gamePool || newModeState.gamePool.length === 0

        set({
          currentMode: mode,
          currentGenre: genre || null,
          isLoading: needsGames,
          gameModeStates: {
            ...currentStore.gameModeStates,
            [modeKey]: newModeState
          }
        })
      },

      async makeGuess(position: 'left' | 'right') {
        const store = get()
        const modeKey = store.currentMode === 'genre' 
          ? `genre-${store.currentGenre}` 
          : store.currentMode!

        const modeState = store.gameModeStates[modeKey]
        if (!modeState || !modeState.gamePool || modeState.currentState.isTransitioning) return

        // Create engine with current state
        const engine = new GameEngine(modeState.gamePool)
        engine.usedGameIds = modeState.usedGameIds
        const isCorrect = engine.checkGuess(position, modeState.currentState)

        // Update score
        const newScore = isCorrect ? modeState.currentScore + 1 : 0
        const newHighScore = Math.max(modeState.highScore || 0, newScore)

        // Start transition
        const updatedState = {
          ...modeState,
          currentScore: newScore,
          highScore: newHighScore,
          currentState: {
            ...modeState.currentState,
            revealed: true,
            isTransitioning: true
          }
        }

        set(state => ({
          gameModeStates: {
            ...state.gameModeStates,
            [modeKey]: updatedState
          }
        }))

        // Wait for reveal animation
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Select new games using the same engine instance
        const newState = engine.selectNewGames()

        set(state => ({
          gameModeStates: {
            ...state.gameModeStates,
            [modeKey]: {
              ...updatedState,
              usedGameIds: engine.usedGameIds,
              currentState: {
                ...newState,
                isTransitioning: false
              }
            }
          }
        }))
      },

      async loadInitialGames() {
        const store = get()
        if (!store.currentMode) return

        const modeKey = store.currentMode === 'genre' 
          ? `genre-${store.currentGenre}` 
          : store.currentMode

        const modeState = store.gameModeStates[modeKey]
        if (!modeState || !modeState.gamePool || modeState.gamePool.length === 0) {
          set({ isLoading: true })
          
          try {
            const games = await gaugeApi.getGamesByMode(
              store.currentMode, 
              store.currentGenre || undefined
            )
            
            const engine = new GameEngine(games)
            const initialState = engine.selectNewGames()

            // Preserve existing scores if they exist
            const existingState = store.gameModeStates[modeKey]
            const currentScore = existingState?.currentScore || 0
            const highScore = existingState?.highScore || 0

            set(state => ({
              isLoading: false,
              gameModeStates: {
                ...state.gameModeStates,
                [modeKey]: {
                  ...createInitialModeState(),
                  gamePool: games,
                  usedGameIds: engine.usedGameIds,
                  currentScore,
                  highScore,
                  currentState: initialState
                }
              }
            }))
          } catch (error) {
            console.error('Failed to load games:', error)
            set({ isLoading: false })
          }
        }
      },

      resetCurrentMode() {
        const store = get()
        const modeKey = store.currentMode === 'genre' 
          ? `genre-${store.currentGenre}` 
          : store.currentMode!

        // Preserve the high score when resetting
        const existingState = store.gameModeStates[modeKey]
        const highScore = existingState?.highScore || 0

        set(state => ({
          gameModeStates: {
            ...state.gameModeStates,
            [modeKey]: {
              ...createInitialModeState(),
              highScore
            }
          }
        }))
      }
    }),
    {
      name: 'gauge-game-storage',
      partialize: (state) => ({
        gameModeStates: Object.fromEntries(
          Object.entries(state.gameModeStates).map(([key, value]) => [
            key,
            {
              highScore: value.highScore || 0,
              currentScore: value.currentScore || 0
            }
          ])
        )
      })
    }
  )
)