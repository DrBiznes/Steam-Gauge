export interface Game {
  id: number
  name: string
  coverUrl: string
  steamScore?: number
  steamId: number
  genres?: string[]
  releaseDate?: string
  metacritic?: number
} 