import { Game } from '../components/gauge/types'

const STEAMSPY_API = 'https://steamspy.com/api.php'
const CORS_PROXY = 'https://api.allorigins.win/raw?url='

interface SteamSpyGame {
  appid: number
  name: string
  developer: string
  publisher: string
  score_rank: string
  positive: number
  negative: number
  userscore: number
  owners: string
  average_forever: number
  average_2weeks: number
  median_forever: number
  median_2weeks: number
  price: string
  initialprice: string
  discount: string
  ccu: number
}

function convertSteamSpyGame(game: SteamSpyGame): Game {
  const totalReviews = game.positive + game.negative
  const steamScore = totalReviews > 0 
    ? Math.round((game.positive / totalReviews) * 100)
    : 0

  return {
    id: game.appid,
    steamId: game.appid,
    name: game.name,
    coverUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`,
    steamScore,
    owners: game.owners,
    averagePlayers2Weeks: game.average_2weeks,
    totalReviews
  }
}

async function getSteamSpyGames(request: string): Promise<Game[]> {
  try {
    const encodedUrl = encodeURIComponent(`${STEAMSPY_API}?request=${request}`)
    const response = await fetch(`${CORS_PROXY}${encodedUrl}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const text = await response.text()
    console.log('Raw API response received, length:', text.length)
    
    const data = JSON.parse(text)
    console.log('Number of games in response:', Object.keys(data).length)
    
    // Convert the object of games into an array
    const gamesArray = Object.values(data) as SteamSpyGame[]
    
    // Convert and filter valid games
    const validGames = gamesArray
      .map(convertSteamSpyGame)
      .filter(game => 
        game.steamScore > 0 && 
        game.totalReviews && game.totalReviews > 500 && // Only include games with sufficient reviews
        game.name && // Ensure game has a name
        game.steamId // Ensure game has an ID
      )
    
    console.log('Number of valid games after filtering:', validGames.length)
    return validGames
  } catch (error) {
    console.error('Error fetching from SteamSpy:', error)
    throw error
  }
}

async function getRandomGames(): Promise<Game[]> {
  try {
    // Get all top games and return the full list
    return await getSteamSpyGames('top100in2weeks')
  } catch (error) {
    console.error('Error getting random games:', error)
    throw error
  }
}

export const gaugeApi = {
  getRandomGames
}