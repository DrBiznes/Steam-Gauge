// src/guess/store.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  GameMode, 
  GuessStore, 
  GameModeStates, 
  GameState, 
  Game,
  Hint,
  PixelationLevel
} from './types'
import { GuessEngine } from './engine/guessEngine'
import { toast } from '../components/ui/use-toast'
import { guessApi } from '../services/GuessAPI'

const INITIAL_GAME_STATE: GameState = {
  currentGame: null,
  pixelationLevel: 1,
  hints: [],
  revealed: false,
  isLoading: false,
  hasError: false
}

const createInitialModeState = () => ({
  gamePool: [] as Game[],
  usedGameIds: new Set<number>(),
  currentScore: 0,
  highScore: 0,
  currentState: { ...INITIAL_GAME_STATE }
})

function generateHint(game: Game): Hint | null {
  if (!game.storeDetails) return null

  const availableHints: Hint[] = []

  // Release year hint (always first)
  if (game.storeDetails.release_date?.date) {
    const year = new Date(game.storeDetails.release_date.date).getFullYear()
    availableHints.push({
      type: 'releaseYear',
      text: `This game was released in ${year}`
    })
  }

  // Developer hint
  if (game.storeDetails.developers?.[0]) {
    availableHints.push({
      type: 'developer',
      text: `This game was developed by ${game.storeDetails.developers[0]}`
    })
  }

  // Genre hint
  if (game.storeDetails.genres?.[0]) {
    availableHints.push({
      type: 'genre',
      text: `This is a ${game.storeDetails.genres[0].description} game`
    })
  }

  // Popular tag hint
  if (game.storeDetails.tags?.[0]) {
    availableHints.push({
      type: 'tag',
      text: `This game's most popular tag is "${game.storeDetails.tags[0].name}"`
    })
  }

  // Metacritic hint
  if (game.storeDetails.metacritic?.score) {
    availableHints.push({
      type: 'metacritic',
      text: `This game has a Metacritic score of ${game.storeDetails.metacritic.score}`
    })
  }

  return availableHints.length > 0 
    ? availableHints[0] // Return first available hint
    : null
}

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
              description: `You've reached ${newScore} points!`
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
          
          // Get next game
          const nextGame = engine.selectNewGame()
          
          // Then transition to the next game with updated state
          set(state => ({
            gameModeStates: {
              ...state.gameModeStates,
              [modeKey]: {
                ...modeState,
                gamePool: modeState.gamePool,
                usedGameIds: engine.usedGameIds,
                currentScore: newScore,
                highScore: newHighScore,
                currentState: {
                  currentGame: nextGame,
                  pixelationLevel: 1,
                  hints: [],
                  revealed: false,
                  isLoading: false,
                  hasError: false
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

          // Generate new hint if available
          const newHint = currentState.currentGame ? generateHint(currentState.currentGame) : null
          const updatedHints = newHint 
            ? [...currentState.hints, newHint]
            : currentState.hints

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

            toast({
              title: 'Game Over!',
              description: `The game was: ${currentState.currentGame?.name}. Your score has been reset.`
            })

            // Wait for reveal animation
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // Get next game
            const nextGame = engine.selectNewGame()
            
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
                    hints: [],
                    revealed: false,
                    isLoading: false,
                    hasError: false
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

        const newHint = generateHint(modeState.currentState.currentGame)
        if (!newHint) return

        set(state => ({
          gameModeStates: {
            ...state.gameModeStates,
            [modeKey]: {
              ...modeState,
              currentState: {
                ...modeState.currentState,
                hints: [...modeState.currentState.hints, newHint]
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

            // Generate first hint
            const firstHint = initialGame ? generateHint(initialGame) : null
            const initialHints = firstHint ? [firstHint] : []

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
                    hints: initialHints,
                    revealed: false,
                    isLoading: false,
                    hasError: false
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

        // Reset score on skip
        const currentGame = modeState.currentState.currentGame
        if (currentGame) {
          toast({
            title: 'Game Skipped',
            description: `The game was: ${currentGame.name}`
          })
        }

        // Get next game
        const nextGame = engine.selectNewGame()
        
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
                hints: [],
                revealed: false,
                isLoading: false,
                hasError: false
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