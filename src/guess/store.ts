// src/guess/store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  GameMode, 
  GuessStore, 
  GameModeStates, 
  GameState, 
  Game,
  PixelationLevel
} from './types'
import { GuessEngine } from './engine/guessEngine'
import { toast } from '../components/ui/use-toast'
import { guessApi, prepareGameHints } from '../services/GuessAPI'

const INITIAL_GAME_STATE: GameState = {
  currentGame: null,
  pixelationLevel: 1,
  hints: [],
  availableHints: [],
  revealed: false,
  isLoading: false,
  hasError: false,
  hasStoreData: false
}

const createInitialModeState = () => ({
  gamePool: [] as Game[],
  usedGameIds: new Set<number>(),
  currentScore: 0,
  highScore: 0,
  currentState: { ...INITIAL_GAME_STATE }
})

export const useGuessStore = create<GuessStore>()(
  persist(
    (set, get) => ({
      currentMode: null,
      currentGenre: null,
      isLoading: false,
      gameModeStates: {} as GameModeStates,

      setGameMode: (mode: GameMode, genre?: string) => {
        const currentStore = get()
        const modeKey = mode === 'genre' ? `genre-${genre}` : mode
        
        if (currentStore.currentMode === mode && currentStore.currentGenre === genre) {
          return
        }

        const existingState = currentStore.gameModeStates[modeKey]
        const newModeState = existingState || createInitialModeState()
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

      async makeGuess(guess: string) {
        const store = get()
        const modeKey = store.currentMode === 'genre' 
            ? `genre-${store.currentGenre}` 
            : store.currentMode!
    
        const modeState = store.gameModeStates[modeKey]
        if (!modeState?.currentState.currentGame) return false
    
        const engine = new GuessEngine(modeState.gamePool)
        engine.usedGameIds = modeState.usedGameIds
    
        const isCorrect = engine.checkGuess(guess, modeState.currentState.currentGame)
        
        if (isCorrect) {
          // Handle correct guess
          const newScore = modeState.currentScore + 1
          const newHighScore = Math.max(modeState.highScore, newScore)

          if (newScore > modeState.highScore) {
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

          // First reveal the current game
          set(state => ({
            gameModeStates: {
              ...state.gameModeStates,
              [modeKey]: {
                ...modeState,
                currentScore: newScore,
                highScore: newHighScore,
                currentState: {
                  ...modeState.currentState,
                  revealed: true
                }
              }
            }
          }))

          // Wait for reveal animation
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Get next game and prepare its hints
          const nextGame = engine.selectNewGame()
          const { hints, hasStoreData } = await prepareGameHints(nextGame)
          
          // Then transition to the next game with updated state
          set(state => ({
            gameModeStates: {
              ...state.gameModeStates,
              [modeKey]: {
                ...modeState,
                usedGameIds: engine.usedGameIds,
                currentScore: newScore,
                highScore: newHighScore,
                currentState: {
                  currentGame: nextGame,
                  pixelationLevel: 1,
                  hints: hints,
                  availableHints: hints,
                  revealed: false,
                  isLoading: false,
                  hasError: false,
                  hasStoreData
                }
              }
            }
          }))

          return true
        } else {
          // Handle wrong guess
          const currentState = modeState.currentState
          const newPixelationLevel = (currentState.pixelationLevel < 6 
            ? currentState.pixelationLevel + 1 
            : currentState.pixelationLevel) as PixelationLevel

          // Reveal next hint based on current pixelation level
          const updatedHints = currentState.hints.map((hint, index) => {
            if (index < newPixelationLevel) {
              return { ...hint, revealed: true }
            }
            return hint
          })

          // Check if this was the last guess
          const isLastGuess = newPixelationLevel === 6

          if (isLastGuess) {
            // First reveal the current game
            set(state => ({
              gameModeStates: {
                ...state.gameModeStates,
                [modeKey]: {
                  ...modeState,
                  currentScore: 0,
                  currentState: {
                    ...currentState,
                    pixelationLevel: newPixelationLevel,
                    hints: updatedHints,
                    revealed: true
                  }
                }
              }
            }))

            if (!currentState.currentGame) {
              console.warn('No current game available')
              return false
            }

            toast({
              title: 'Game Over!',
              description: `The game was: ${currentState.currentGame.name}`,
              className: store.currentMode === 'genre'
                ? 'bg-[rgba(34,197,94,0.3)] text-[rgb(134,239,172)] border-[rgba(34,197,94,0.3)]'
                : store.currentMode === 'top100in2weeks'
                ? 'bg-[rgba(59,130,246,0.3)] text-[rgb(147,197,253)] border-[rgba(59,130,246,0.3)]'
                : 'bg-[rgba(239,68,68,0.3)] text-[rgb(252,165,165)] border-[rgba(239,68,68,0.3)]'
            })

            // Wait for reveal animation
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Get next game and prepare its hints
            const nextGame = engine.selectNewGame()
            const { hints, hasStoreData } = await prepareGameHints(nextGame)
            
            // Then transition to the next game
            set(state => ({
              gameModeStates: {
                ...state.gameModeStates,
                [modeKey]: {
                  ...modeState,
                  usedGameIds: engine.usedGameIds,
                  currentScore: 0,
                  currentState: {
                    currentGame: nextGame,
                    pixelationLevel: 1,
                    hints: hints,
                    availableHints: hints,
                    revealed: false,
                    isLoading: false,
                    hasError: false,
                    hasStoreData
                  }
                }
              }
            }))
          } else {
            // Just update pixelation and hints for non-final guesses
            set(state => ({
              gameModeStates: {
                ...state.gameModeStates,
                [modeKey]: {
                  ...modeState,
                  currentState: {
                    ...currentState,
                    pixelationLevel: newPixelationLevel,
                    hints: updatedHints
                  }
                }
              }
            }))
          }

          return false
        }
      },

      revealHint() {
        const store = get()
        const modeKey = store.currentMode === 'genre' 
          ? `genre-${store.currentGenre}` 
          : store.currentMode!

        const modeState = store.gameModeStates[modeKey]
        if (!modeState?.currentState.currentGame) return

        const currentState = modeState.currentState
        const unrevealedHints = currentState.availableHints.filter(h => !h.revealed)
        if (unrevealedHints.length === 0) return

        const nextHint = unrevealedHints[0]
        const updatedHints = currentState.hints.map(hint => 
          hint === nextHint ? { ...hint, revealed: true } : hint
        )

        set(state => ({
          gameModeStates: {
            ...state.gameModeStates,
            [modeKey]: {
              ...modeState,
              currentState: {
                ...currentState,
                hints: updatedHints
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
            const games = await guessApi.getGamesByMode(
              store.currentMode, 
              store.currentGenre || undefined
            )
            
            const engine = new GuessEngine(games)
            const initialGame = engine.selectNewGame()
            const { hints, hasStoreData } = await prepareGameHints(initialGame)

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
                  currentState: {
                    currentGame: initialGame,
                    pixelationLevel: 1,
                    hints: hints,
                    availableHints: hints,
                    revealed: false,
                    isLoading: false,
                    hasError: false,
                    hasStoreData
                  }
                }
              }
            }))

          } catch (error) {
            console.error('Failed to load games:', error)
            set({ isLoading: false })
          }
        }
      },

      async skipGame() {
        const store = get()
        const modeKey = store.currentMode === 'genre' 
          ? `genre-${store.currentGenre}` 
          : store.currentMode!

        const modeState = store.gameModeStates[modeKey]
        if (!modeState || !modeState.gamePool) return

        const engine = new GuessEngine(modeState.gamePool)
        engine.usedGameIds = modeState.usedGameIds

        const currentGame = modeState.currentState.currentGame
        if (currentGame) {
          toast({
            title: 'Game Skipped',
            description: `The game was: ${currentGame.name}`
          })
        }

        // Get next game and prepare its hints
        const nextGame = engine.selectNewGame()
        const { hints, hasStoreData } = await prepareGameHints(nextGame)
        
        set(state => ({
          gameModeStates: {
            ...state.gameModeStates,
            [modeKey]: {
              ...modeState,
              currentScore: 0,
              usedGameIds: engine.usedGameIds,
              currentState: {
                currentGame: nextGame,
                pixelationLevel: 1,
                hints: hints,
                availableHints: hints,
                revealed: false,
                isLoading: false,
                hasError: false,
                hasStoreData
              }
            }
          }
        }))
      },

      resetCurrentMode() {
        const store = get()
        const modeKey = store.currentMode === 'genre' 
          ? `genre-${store.currentGenre}` 
          : store.currentMode!

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
      name: 'guess-game-storage',
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