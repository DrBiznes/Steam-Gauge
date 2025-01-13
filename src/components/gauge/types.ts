export interface Game {
  id: number
  name: string
  coverUrl: string
  steamScore: number
  steamId: number
  owners: string
  averagePlayers2Weeks: number
  totalReviews?: number
  genre?: string[]
}

export type GameMode = 'top100in2weeks' | 'top100forever' | 'genre'

export interface GameState {
  leftGame: Game | null
  rightGame: Game | null
  revealed: boolean
  isTransitioning: boolean
}

export interface GameModeState {
  gamePool: Game[]
  usedGameIds: Set<number>
  currentScore: number
  highScore: number
  currentState: GameState
}

export interface ScoreState {
  currentScore: number
  highScore: number
}

export type GameModeStates = {
  [key: string]: GameModeState
}

export interface GaugeStore {
  // Current game state
  currentMode: GameMode | null
  currentGenre: string | null
  isLoading: boolean
  
  // Game mode states
  gameModeStates: GameModeStates
  
  // Actions
  setGameMode: (mode: GameMode, genre?: string) => void
  makeGuess: (position: 'left' | 'right') => Promise<void>
  loadInitialGames: () => Promise<void>
  resetCurrentMode: () => void
} 