import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { GameMode, GaugeStore, GameModeStates, GameState, Game } from './types'
import { GameEngine } from './engine/gameEngine'
import { gaugeApi } from '../services/GaugeAPI'
import { toast } from '../components/ui/use-toast'

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
  hasShownHighScoreToast: false,
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

        // Get current score before updating
        const currentScore = modeState.currentScore

        // Update score
        const newScore = isCorrect ? currentScore + 1 : 0
        const prevHighScore = modeState.highScore || 0
        const newHighScore = Math.max(prevHighScore, newScore)

        // Show toast based on result
        if (isCorrect) {
          if (newScore > prevHighScore && !modeState.hasShownHighScoreToast) {
            toast({
              title: 'New High Score! 🎉',
              description: `You've reached ${newScore} points!`,
              className: store.currentMode === 'genre' 
                ? 'bg-[rgba(34,197,94,0.3)] text-[rgb(134,239,172)] border-[rgba(34,197,94,0.3)]'
                : store.currentMode === 'top100in2weeks'
                ? 'bg-[rgba(59,130,246,0.3)] text-[rgb(147,197,253)] border-[rgba(59,130,246,0.3)]'
                : 'bg-[rgba(239,68,68,0.3)] text-[rgb(252,165,165)] border-[rgba(239,68,68,0.3)]'
            })
          }
        } else if (currentScore > 2) {
          // Show game over toast using the current score before reset
          toast({
            title: 'Game Over!',
            description: `Final Score: ${currentScore}`,
            className: store.currentMode === 'genre'
              ? 'bg-[rgba(34,197,94,0.3)] text-[rgb(134,239,172)] border-[rgba(34,197,94,0.3)]'
              : store.currentMode === 'top100in2weeks'
              ? 'bg-[rgba(59,130,246,0.3)] text-[rgb(147,197,253)] border-[rgba(59,130,246,0.3)]'
              : 'bg-[rgba(239,68,68,0.3)] text-[rgb(252,165,165)] border-[rgba(239,68,68,0.3)]'
          })
        }

        // Start transition
        const updatedState = {
          ...modeState,
          currentScore: newScore,
          highScore: newHighScore,
          hasShownHighScoreToast: isCorrect && newScore > prevHighScore ? true : false,
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
              highScore,
              hasShownHighScoreToast: false
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