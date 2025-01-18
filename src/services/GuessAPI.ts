import { 
  Game, 
  GameMode, 
  SteamStoreDetails, 
  Hint,
  BasicHint,
  EnhancedHint 
} from '../guess/types'
import { toast } from '../components/ui/use-toast'
import top100FallbackData from '../genreDB/top100fallback.json'

const STEAMSPY_API = 'https://steamspy.com/api.php'
const STEAM_STORE_API = 'https://store.steampowered.com/api/appdetails'
const CORS_PROXY = 'https://api.allorigins.win/raw?url='
const MAX_RETRIES = 3
const RETRY_DELAY = 2000
const API_TIMEOUT = 5000

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

// Hint Generation Functions
function generateBasicHints(game: Game): BasicHint[] {
  const hints: BasicHint[] = []

  // Initial hint - Review Score (always shown)
  hints.push({
    type: 'reviewScore',
    text: `This game has a Steam review score of ${game.steamScore}%`,
    source: 'steamspy',
    revealed: true,
    order: 0
  })

  // Player Count hint
  hints.push({
    type: 'playerCount',
    text: `This game had an average of ${game.averagePlayers2Weeks.toLocaleString()} players in the last 2 weeks`,
    source: 'steamspy',
    revealed: false,
    order: 1
  })

  // Developer hint
  if (game.developer) {
    hints.push({
      type: 'developer',
      text: `This game was developed by ${game.developer}`,
      source: 'steamspy',
      revealed: false,
      order: 2
    })
  }

  // First letter hint
  hints.push({
    type: 'firstLetter',
    text: `The game's name starts with '${game.name[0]}'`,
    source: 'steamspy',
    revealed: false,
    order: 3
  })

  // Second letter hint
  if (game.name.length > 1) {
    hints.push({
      type: 'secondLetter',
      text: `The second letter in the game's name is '${game.name[1]}'`,
      source: 'steamspy',
      revealed: false,
      order: 4
    })
  }

  return hints
}

function generateEnhancedHints(game: Game, storeDetails: SteamStoreDetails): EnhancedHint[] {
  const hints: EnhancedHint[] = []

  // Initial hint - Review Score (always shown)
  hints.push({
    type: 'reviewScore',
    text: `This game has a Steam review score of ${game.steamScore}%`,
    source: 'steamstore',
    revealed: true,
    order: 0
  })

  // Release Date hint
  if (storeDetails.release_date?.date) {
    const releaseDate = new Date(storeDetails.release_date.date)
    hints.push({
      type: 'releaseDate',
      text: `This game was released in ${releaseDate.getFullYear()}`,
      source: 'steamstore',
      revealed: false,
      order: 1
    })
  }

  // Developer hint (using SteamSpy data for consistency)
  if (game.developer) {
    hints.push({
      type: 'developer',
      text: `This game was developed by ${game.developer}`,
      source: 'steamstore',
      revealed: false,
      order: 2
    })
  }

  // Genre hint
  if (storeDetails.genres && storeDetails.genres.length > 0) {
    hints.push({
      type: 'genre',
      text: `This is a ${storeDetails.genres[0].description} game`,
      source: 'steamstore',
      revealed: false,
      order: 3
    })
  }

  // First letter hint (using same as basic for consistency)
  hints.push({
    type: 'firstLetter',
    text: `The game's name starts with '${game.name[0]}'`,
    source: 'steamstore',
    revealed: false,
    order: 4
  })

  return hints
}

// Helper functions for API calls (existing functions remain the same)
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

async function fetchWithRetryAndTimeout(url: string, retries = MAX_RETRIES): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response
  } catch (error: unknown) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out')
    }
    if (retries > 0) {
      await delay(RETRY_DELAY)
      return fetchWithRetryAndTimeout(url, retries - 1)
    }
    throw error
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

// Optimized Steam Store details fetching
async function fetchStoreDetails(steamId: number): Promise<SteamStoreDetails | null> {
  // Check cache first
  const cached = storeDetailsCache[steamId]
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  try {
    const url = `${STEAM_STORE_API}?appids=${steamId}&cc=us&l=english`
    const response = await fetchWithRetryAndTimeout(`${CORS_PROXY}${encodeURIComponent(url)}`)
    const data = await response.json()

    if (!data[steamId]?.success) {
      console.warn(`No store data available for game ${steamId}`)
      return null
    }

    const storeDetails = data[steamId].data as SteamStoreDetails

    // Cache the results
    storeDetailsCache[steamId] = {
      data: storeDetails,
      timestamp: Date.now()
    }

    return storeDetails
  } catch (error) {
    console.warn(`Failed to fetch store details for game ${steamId}:`, error)
    return null
  }
}

// Updated game conversion with hint generation
async function convertSteamSpyGame(game: SteamSpyGame): Promise<Game> {
  const totalReviews = game.positive + game.negative
  const steamScore = totalReviews > 0 
    ? Math.round((game.positive / totalReviews) * 100)
    : 0

  // Create base game object with SteamSpy data
  const baseGame: Game = {
    id: game.appid,
    steamId: game.appid,
    name: game.name,
    coverUrl: `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_600x900.jpg`,
    steamScore,
    owners: game.owners,
    averagePlayers2Weeks: game.average_2weeks,
    totalReviews,
    genre: game.genre,
    developer: game.developer,
    publisher: game.publisher
  }

  return baseGame
}

// Main API functions remain the same, but now use the new hint system
async function getGamesByMode(mode: GameMode, genre?: string): Promise<Game[]> {
  try {
    let games: Game[]
    switch (mode) {
      case 'top100in2weeks':
        games = await getSteamSpyGames('top100in2weeks')
        break
      case 'top100forever':
        games = await getSteamSpyGames('top100forever')
        break
      case 'genre':
        if (!genre) throw new Error('Genre is required for genre mode')
        games = await getGamesFromLocalDB(genre)
        break
      default:
        throw new Error('Invalid game mode')
    }

    return games
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    toast({
      title: 'Failed to load games',
      description: errorMessage,
    })
    throw error
  }
}

// Export the API interface with new hint generation functions
export const guessApi = {
  getGamesByMode,
  fetchStoreDetails,
  generateBasicHints,
  generateEnhancedHints
}

// Helper function to prepare hints for a game
export async function prepareGameHints(game: Game): Promise<{
  hints: Hint[],
  hasStoreData: boolean
}> {
  // Try to fetch store details
  const storeDetails = await fetchStoreDetails(game.steamId)
  
  if (storeDetails) {
    // Use enhanced hints if store data is available
    return {
      hints: generateEnhancedHints(game, storeDetails),
      hasStoreData: true
    }
  } else {
    // Fallback to basic hints
    return {
      hints: generateBasicHints(game),
      hasStoreData: false
    }
  }
}