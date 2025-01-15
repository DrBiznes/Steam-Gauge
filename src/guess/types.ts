// src/guess/types.ts

export interface SteamStoreDetails {
  name: string
  detailed_description: string
  short_description: string
  about_the_game: string
  release_date: {
    coming_soon: boolean
    date: string
  }
  developers: string[]
  publishers: string[]
  platforms: {
    windows: boolean
    mac: boolean
    linux: boolean
  }
  categories: Array<{
    id: number
    description: string
  }>
  genres: Array<{
    id: string
    description: string
  }>
  tags: Array<{
    name: string
    count: number
  }>
  metacritic?: {
    score: number
    url: string
  }
}

export interface Game {
  id: number
  steamId: number
  name: string
  coverUrl: string
  steamScore: number
  owners: string
  averagePlayers2Weeks: number
  totalReviews?: number
  genre?: string[]
  storeDetails?: SteamStoreDetails
}

export type GameMode = 'top100in2weeks' | 'top100forever' | 'genre'

// Pixelation levels from most pixelated (1) to clear (6)
export type PixelationLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface Hint {
  type: 'genre' | 'releaseYear' | 'developer' | 'tag' | 'metacritic'
  text: string
}

export interface GameState {
  currentGame: Game | null
  pixelationLevel: PixelationLevel
  hints: Hint[]
  revealed: boolean
  isLoading: boolean
  hasError: boolean
}

export interface GameModeState {
  gamePool: Game[]
  usedGameIds: Set<number>
  currentScore: number
  highScore: number
  currentState: GameState
}

export type GameModeStates = {
  [key: string]: GameModeState
}

export interface GuessStore {
  // Current game state
  currentMode: GameMode | null
  currentGenre: string | null
  isLoading: boolean
  
  // Game mode states
  gameModeStates: GameModeStates
  
  // Actions
  setGameMode: (mode: GameMode, genre?: string) => void
  makeGuess: (guess: string) => Promise<boolean>
  revealHint: () => void
  loadInitialGames: () => Promise<void>
  resetCurrentMode: () => void
  skipGame: () => Promise<void>
}