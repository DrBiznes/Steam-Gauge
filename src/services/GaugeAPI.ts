import { Game, GameMode } from '../gauge/types'

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
  genre?: string[]
}

// Cache structure to store game data for 24 hours
interface CacheEntry {
  data: Game[]
  timestamp: number
}

const cache: Record<string, CacheEntry> = {}
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

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
    totalReviews,
    genre: game.genre
  }
}

async function getSteamSpyGames(request: string, params: Record<string, string> = {}): Promise<Game[]> {
  // Create cache key based on request and params
  const cacheKey = JSON.stringify({ request, params })
  
  // Check cache first
  const cached = cache[cacheKey]
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Returning cached data for:', request)
    return cached.data
  }

  try {
    // Build URL with parameters
    const queryParams = new URLSearchParams({ request, ...params })
    const steamspyUrl = `${STEAMSPY_API}?${queryParams}`
    const encodedUrl = encodeURIComponent(steamspyUrl)
    const url = `${CORS_PROXY}${encodedUrl}`
    console.log('Fetching from URL:', url)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      console.error('Response not OK:', response.status, response.statusText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('Successfully parsed JSON data')
    
    // Convert the object of games into an array
    const gamesArray = Object.values(data) as SteamSpyGame[]
    console.log('Number of games in response:', gamesArray.length)
    
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

    // Cache the results
    cache[cacheKey] = {
      data: validGames,
      timestamp: Date.now()
    }

    return validGames
  } catch (error) {
    console.error('Error fetching from SteamSpy:', error)
    throw error
  }
}

async function getGamesFromLocalDB(genre: string): Promise<Game[]> {
  try {
    const response = await fetch(`/src/genreDB/${genre.toLowerCase()}.json`)
    if (!response.ok) {
      throw new Error(`Failed to load ${genre} database`)
    }
    
    const data = await response.json()
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
      // Sort by review count but don't limit to 100
      .sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))

    return validGames
  } catch (error) {
    console.error(`Error loading ${genre} database:`, error)
    throw error
  }
}

async function getGamesByMode(mode: GameMode, genre?: string): Promise<Game[]> {
  switch (mode) {
    case 'top100in2weeks':
      return getSteamSpyGames('top100in2weeks')
    case 'top100forever':
      return getSteamSpyGames('top100forever')
    case 'genre':
      if (!genre) throw new Error('Genre is required for genre mode')
      return getGamesFromLocalDB(genre)
    default:
      throw new Error('Invalid game mode')
  }
}

export const gaugeApi = {
  getGamesByMode
}