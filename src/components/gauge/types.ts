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

export interface GameModeConfig {
  id: GameMode
  name: string
  description: string
  icon: string
}

export interface GenreOption {
  name: string
  value: string
} 