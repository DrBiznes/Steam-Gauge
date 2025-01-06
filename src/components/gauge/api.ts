import { Game } from './types'

// IGDB API endpoints
const IGDB_API = 'https://api.igdb.com/v4'
const TWITCH_AUTH = 'https://id.twitch.tv/oauth2/token'

// Steam API endpoint for reviews
const STEAM_API_BASE = 'https://store.steampowered.com/api'

interface IGDBGame {
  id: number
  name: string
  cover: { url: string }
  genres: Array<{ name: string }>
  first_release_date: number
  rating: number
  slug: string
  external_games: Array<{
    category: number // 1 for Steam
    uid: string // Steam AppID
  }>
}

// Cache for auth token
let authToken: string | null = null
let tokenExpiry: number = 0

const FALLBACK_GENRES = [
  "Action",
  "Adventure",
  "RPG",
  "Strategy",
  "FPS",
  "Sports",
  "Racing",
  "Simulation",
  "Indie",
  "Free to Play"
]

async function getIGDBToken(): Promise<string> {
  if (authToken && Date.now() < tokenExpiry) {
    return authToken
  }

  const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID
  const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing Twitch API credentials')
  }

  try {
    const response = await fetch(TWITCH_AUTH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    })

    const data = await response.json()
    if (!data.access_token) {
      throw new Error('Failed to get access token')
    }
    
    authToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in * 1000)
    return authToken
  } catch (error) {
    console.error('Error getting IGDB token:', error)
    throw error
  }
}

async function queryIGDB(endpoint: string, query: string): Promise<any> {
  const token = await getIGDBToken()

  const response = await fetch(`${IGDB_API}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': process.env.VITE_TWITCH_CLIENT_ID!,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: query
  })

  return response.json()
}

async function getSteamScore(appId: string): Promise<number> {
  try {
    const response = await fetch(
      `${STEAM_API_BASE}/appreviews/${appId}?json=1&language=all`
    )
    const data = await response.json()
    const { total_positive, total_negative } = data.query_summary
    const total = total_positive + total_negative
    return total > 0 ? Math.round((total_positive / total) * 100) : 0
  } catch (error) {
    console.error('Error fetching Steam reviews:', error)
    return 0
  }
}

async function getRandomGames(): Promise<Game[]> {
  try {
    // Get random games from IGDB with Steam IDs
    const query = `
      fields name, cover.url, genres.name, first_release_date, rating, external_games.*, slug;
      where external_games.category = 1 & rating != null & cover != null;
      sort rating desc;
      limit 50;
    `
    const games: IGDBGame[] = await queryIGDB('games', query)
    
    // Shuffle and get 2 random games
    const shuffled = games
      .filter(game => game.external_games?.length > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    // Convert to our Game type and fetch Steam scores
    const result = await Promise.all(shuffled.map(async game => {
      const steamId = game.external_games[0].uid
      const steamScore = await getSteamScore(steamId)
      
      return {
        id: game.id,
        steamId: parseInt(steamId),
        name: game.name,
        coverUrl: game.cover.url.replace('thumb', 'cover_big'),
        steamScore,
        genres: game.genres.map(g => g.name),
        releaseDate: new Date(game.first_release_date * 1000).toISOString(),
        metacritic: Math.round(game.rating)
      }
    }))

    return result
  } catch (error) {
    console.error('Error getting random games:', error)
    throw error
  }
}

async function getGamesByGenre(genre: string): Promise<Game[]> {
  try {
    // Get games by genre from IGDB
    const query = `
      fields name, cover.url, genres.name, first_release_date, rating, external_games.*, slug;
      where external_games.category = 1 & rating != null & cover != null & genres.name = "${genre}";
      sort rating desc;
      limit 50;
    `
    const games: IGDBGame[] = await queryIGDB('games', query)
    
    // Shuffle and get 2 random games
    const shuffled = games
      .filter(game => game.external_games?.length > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    // Convert to our Game type and fetch Steam scores
    const result = await Promise.all(shuffled.map(async game => {
      const steamId = game.external_games[0].uid
      const steamScore = await getSteamScore(steamId)
      
      return {
        id: game.id,
        steamId: parseInt(steamId),
        name: game.name,
        coverUrl: game.cover.url.replace('thumb', 'cover_big'),
        steamScore,
        genres: game.genres.map(g => g.name),
        releaseDate: new Date(game.first_release_date * 1000).toISOString(),
        metacritic: Math.round(game.rating)
      }
    }))

    return result.length >= 2 ? result : getRandomGames()
  } catch (error) {
    console.error('Error getting games by genre:', error)
    return getRandomGames()
  }
}

async function getGamesByYear(year: number): Promise<Game[]> {
  try {
    // Get games by year from IGDB
    const startDate = Math.floor(new Date(`${year}-01-01`).getTime() / 1000)
    const endDate = Math.floor(new Date(`${year}-12-31`).getTime() / 1000)
    
    const query = `
      fields name, cover.url, genres.name, first_release_date, rating, external_games.*, slug;
      where external_games.category = 1 & rating != null & cover != null & 
            first_release_date >= ${startDate} & first_release_date <= ${endDate};
      sort rating desc;
      limit 50;
    `
    const games: IGDBGame[] = await queryIGDB('games', query)
    
    // Shuffle and get 2 random games
    const shuffled = games
      .filter(game => game.external_games?.length > 0)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    // Convert to our Game type and fetch Steam scores
    const result = await Promise.all(shuffled.map(async game => {
      const steamId = game.external_games[0].uid
      const steamScore = await getSteamScore(steamId)
      
      return {
        id: game.id,
        steamId: parseInt(steamId),
        name: game.name,
        coverUrl: game.cover.url.replace('thumb', 'cover_big'),
        steamScore,
        genres: game.genres.map(g => g.name),
        releaseDate: new Date(game.first_release_date * 1000).toISOString(),
        metacritic: Math.round(game.rating)
      }
    }))

    return result.length >= 2 ? result : getRandomGames()
  } catch (error) {
    console.error('Error getting games by year:', error)
    return getRandomGames()
  }
}

async function getAvailableGenres(): Promise<string[]> {
  try {
    const query = `
      fields name;
      sort name asc;
      limit 50;
    `
    const genres = await queryIGDB('genres', query)
    return genres.map((g: { name: string }) => g.name)
  } catch (error) {
    console.error('Error getting genres:', error)
    return FALLBACK_GENRES
  }
}

export const gaugeApi = {
  getRandomGames,
  getGamesByGenre,
  getGamesByYear,
  getAvailableGenres
} 