import { Game, GameMode, SteamStoreDetails } from '../guess/types'
import { toast } from '../components/ui/use-toast'
import top100FallbackData from '../genreDB/top100fallback.json'

const STEAMSPY_API = 'https://steamspy.com/api.php'
const STEAM_STORE_API = 'https://store.steampowered.com/api/appdetails'
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

// Cache structure
interface CacheEntry {
  data: Game[]
  timestamp: number
  apiAttempts: number
}

interface StoreDetailsCache {
  [key: number]: {
    data: SteamStoreDetails
    timestamp: number
  }
}

const gamesCache: Record<string, CacheEntry> = {}
const storeDetailsCache: StoreDetailsCache = {}
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

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

// New function to fetch Steam Store details
async function fetchStoreDetails(steamId: number): Promise<SteamStoreDetails> {
  // Check cache first
  const cached = storeDetailsCache[steamId]
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    const url = `${STEAM_STORE_API}?appids=${steamId}&cc=us&l=english`
    const response = await fetchWithRetry(`${CORS_PROXY}${encodeURIComponent(url)}`)
    const data = await response.json()

    if (!data[steamId].success) {
      throw new Error(`Failed to fetch store details for game ${steamId}`)
    }

    const storeDetails = data[steamId].data as SteamStoreDetails

    // Cache the results
    storeDetailsCache[steamId] = {
      data: storeDetails,
      timestamp: Date.now()
    }

    return storeDetails
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Failed to fetch store details for game ${steamId}:`, errorMessage)
    throw error
  }
}

async function convertSteamSpyGame(game: SteamSpyGame): Promise<Game> {
  const totalReviews = game.positive + game.negative
  const steamScore = totalReviews > 0 
    ? Math.round((game.positive / totalReviews) * 100)
    : 0

  // Create base game object
  const baseGame: Game = {
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

  try {
    // Fetch additional details from Steam Store API
    const storeDetails = await fetchStoreDetails(game.appid)
    return {
      ...baseGame,
      storeDetails
    }
  } catch (error) {
    // If store details fetch fails, return base game object
    console.warn(`Failed to fetch store details for ${game.name}, using basic info only`)
    return baseGame
  }
}

async function getSteamSpyGames(request: string, params: Record<string, string> = {}): Promise<Game[]> {
  const cacheKey = JSON.stringify({ request, params })
  
  // Check cache
  const cached = gamesCache[cacheKey]
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    const queryParams = new URLSearchParams({ request, ...params })
    const steamspyUrl = `${STEAMSPY_API}?${queryParams}`
    const url = `${CORS_PROXY}${encodeURIComponent(steamspyUrl)}`
    
    const response = await fetchWithRetry(url)
    const data = await response.json()
    
    // Convert and process games
    const gamesArray = Object.values(data) as SteamSpyGame[]
    const validGames = await Promise.all(
      gamesArray
        .filter(game => 
          game.positive + game.negative > 500 && // Sufficient reviews
          game.name && // Has name
          game.appid // Has ID
        )
        .map(convertSteamSpyGame)
    )

    if (validGames.length === 0) {
      throw new Error('No valid games found in the response')
    }
    
    // Cache results
    gamesCache[cacheKey] = {
      data: validGames,
      timestamp: Date.now(),
      apiAttempts: 0
    }

    return validGames
  } catch (error) {
    const currentAttempts = (cached?.apiAttempts || 0) + 1
    console.error(`API attempt ${currentAttempts} failed:`, error)

    // Update cache with attempt count
    gamesCache[cacheKey] = {
      ...(cached || { data: [], timestamp: Date.now() }),
      apiAttempts: currentAttempts
    }

    if (currentAttempts < MAX_RETRIES) {
      throw error
    }

    // Fallback to cached top 100 data
    return getTop100Fallback()
  }
}

async function getTop100Fallback(): Promise<Game[]> {
  try {
    const gamesArray = Object.values(top100FallbackData) as SteamSpyGame[]
    const validGames = await Promise.all(
      gamesArray
        .filter(game => 
          game.positive + game.negative > 500 &&
          game.name &&
          game.appid
        )
        .map(convertSteamSpyGame)
    )

    if (validGames.length === 0) {
      throw new Error('No valid games found in fallback data')
    }

    return validGames
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Fallback data loading failed:', errorMessage)
    throw error
  }
}

async function getGamesFromLocalDB(genre: string): Promise<Game[]> {
  try {
    const response = await fetchWithRetry(`/src/genreDB/${genre.toLowerCase()}.json`)
    const data = await response.json()
    const gamesArray = Object.values(data) as SteamSpyGame[]
    
    const validGames = await Promise.all(
      gamesArray
        .filter(game => 
          game.positive + game.negative > 500 &&
          game.name &&
          game.appid
        )
        .map(convertSteamSpyGame)
    )

    if (validGames.length === 0) {
      throw new Error(`No valid games found for genre: ${genre}`)
    }

    return validGames
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error(`Error loading ${genre} games:`, errorMessage)
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
    toast({
      title: 'Failed to load games',
      description: errorMessage,
    })
    throw error
  }
}

export const guessApi = {
  getGamesByMode,
  fetchStoreDetails
}