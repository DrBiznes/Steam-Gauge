import { Game, GameMode } from '../gauge/types'
import { toast } from '../components/ui/use-toast'

const STEAMSPY_API = 'https://steamspy.com/api.php'
const CORS_PROXY = 'https://api.allorigins.win/raw?url='
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

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

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response
  } catch (error) {
    if (retries > 0) {
      await delay(RETRY_DELAY)
      return fetchWithRetry(url, retries - 1)
    }
    throw error
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
    
    const response = await fetchWithRetry(url)
    const data = await response.json()
    
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

    if (validGames.length === 0) {
      throw new Error('No valid games found in the response')
    }
    
    // Cache the results
    cache[cacheKey] = {
      data: validGames,
      timestamp: Date.now()
    }

    return validGames
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    toast({
      title: 'Error fetching games',
      description: errorMessage,
      className: 'bg-[rgba(239,68,68,0.3)] text-[rgb(252,165,165)] border-[rgba(239,68,68,0.3)]'
    })
    throw error
  }
}

async function getGamesFromLocalDB(genre: string): Promise<Game[]> {
  try {
    const response = await fetchWithRetry(`/src/genreDB/${genre.toLowerCase()}.json`)
    const data = await response.json()
    const gamesArray = Object.values(data) as SteamSpyGame[]
    
    const validGames = gamesArray
      .map(convertSteamSpyGame)
      .filter(game => 
        game.steamScore > 0 && 
        game.totalReviews && game.totalReviews > 500 &&
        game.name &&
        game.steamId
      )
      .sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))

    if (validGames.length === 0) {
      throw new Error(`No valid games found for genre: ${genre}`)
    }

    return validGames
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    toast({
      title: `Error loading ${genre} games`,
      description: errorMessage,
      className: 'bg-[rgba(239,68,68,0.3)] text-[rgb(252,165,165)] border-[rgba(239,68,68,0.3)]'
    })
    throw error
  }
}

async function getGamesByMode(mode: GameMode, genre?: string): Promise<Game[]> {
  try {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const toastClass = mode === 'genre'
      ? 'bg-[rgba(34,197,94,0.3)] text-[rgb(134,239,172)] border-[rgba(34,197,94,0.3)]'
      : mode === 'top100in2weeks'
      ? 'bg-[rgba(59,130,246,0.3)] text-[rgb(147,197,253)] border-[rgba(59,130,246,0.3)]'
      : 'bg-[rgba(239,68,68,0.3)] text-[rgb(252,165,165)] border-[rgba(239,68,68,0.3)]'
    
    toast({
      title: 'Failed to load games',
      description: errorMessage,
      className: toastClass
    })
    throw error
  }
}

export const gaugeApi = {
  getGamesByMode
}