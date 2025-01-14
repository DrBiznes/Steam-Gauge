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
  apiAttempts: number // Track number of API attempts
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

async function getTop100Fallback(): Promise<Game[]> {
  console.log('Attempting to load fallback data...')
  try {
    const response = await fetchWithRetry('/src/genreDB/top100fallback.json')
    const data = await response.json()
    const gamesArray = Object.values(data) as SteamSpyGame[]
    
    console.log('Successfully loaded fallback data file')
    
    const validGames = gamesArray
      .map(convertSteamSpyGame)
      .filter(game => 
        game.steamScore > 0 && 
        game.totalReviews && game.totalReviews > 500 &&
        game.name &&
        game.steamId
      )
      .sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))

    console.log(`Found ${validGames.length} valid games in fallback data`)

    if (validGames.length === 0) {
      throw new Error('No valid games found in fallback data')
    }

    return validGames
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Fallback data loading failed:', errorMessage)
    
    toast({
      title: 'Error loading fallback data',
      description: errorMessage,
      className: 'bg-[rgba(239,68,68,0.3)] text-[rgb(252,165,165)] border-[rgba(239,68,68,0.3)]'
    })
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

  console.log(`Attempting to fetch ${request} data from SteamSpy API...`)
  try {
    // Build URL with parameters
    const queryParams = new URLSearchParams({ request, ...params })
    const steamspyUrl = `${STEAMSPY_API}?${queryParams}`
    const encodedUrl = encodeURIComponent(steamspyUrl)
    const url = `${CORS_PROXY}${encodedUrl}`
    
    const response = await fetchWithRetry(url)
    const data = await response.json()
    
    console.log(`Successfully fetched ${request} data from API`)
    
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

    console.log(`Found ${validGames.length} valid games from API response`)

    if (validGames.length === 0) {
      throw new Error('No valid games found in the response')
    }
    
    // Cache the results with reset API attempts
    cache[cacheKey] = {
      data: validGames,
      timestamp: Date.now(),
      apiAttempts: 0
    }

    return validGames
  } catch (error) {
    // Get current attempts from cache or start at 0
    const currentAttempts = (cached?.apiAttempts || 0) + 1
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    
    console.error(`API attempt ${currentAttempts} failed:`, errorMessage)
    console.log(`${MAX_RETRIES - currentAttempts} retries remaining`)

    // Update cache with attempt count
    cache[cacheKey] = {
      ...(cached || { data: [], timestamp: Date.now() }),
      apiAttempts: currentAttempts
    }

    // Show toast for the error
    toast({
      title: 'Error fetching games',
      description: errorMessage,
      className: 'bg-[rgba(239,68,68,0.3)] text-[rgb(252,165,165)] border-[rgba(239,68,68,0.3)]'
    })

    // If we still have retries left, throw to let fetchWithRetry try again
    if (currentAttempts < MAX_RETRIES) {
      console.log('Retrying API call...')
      throw error
    }

    // If we've exhausted all retries, try fallback
    console.log('All API attempts exhausted, switching to fallback data')
    return getTop100Fallback()
  }
}

async function getGamesFromLocalDB(genre: string): Promise<Game[]> {
  console.log(`Attempting to load ${genre} games from local DB...`)
  try {
    const response = await fetchWithRetry(`/src/genreDB/${genre.toLowerCase()}.json`)
    const data = await response.json()
    const gamesArray = Object.values(data) as SteamSpyGame[]
    
    console.log(`Successfully loaded ${genre} data file`)
    
    const validGames = gamesArray
      .map(convertSteamSpyGame)
      .filter(game => 
        game.steamScore > 0 && 
        game.totalReviews && game.totalReviews > 500 &&
        game.name &&
        game.steamId
      )
      .sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))

    console.log(`Found ${validGames.length} valid games for ${genre}`)

    if (validGames.length === 0) {
      throw new Error(`No valid games found for genre: ${genre}`)
    }

    return validGames
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Error loading ${genre} games:`, errorMessage)
    
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