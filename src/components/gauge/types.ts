export interface Game {
  id: number
  name: string
  coverUrl: string
  steamScore: number
  steamId: number
  owners: string
  averagePlayers2Weeks: number
  totalReviews?: number
} 