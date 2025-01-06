import { Game } from './types.ts'

// Steam API endpoints
const STEAM_API_BASE = 'https://store.steampowered.com/api'
const STEAM_STORE_API = 'https://store.steampowered.com/api/appdetails'

interface SteamReviewResponse {
  query_summary: {
    review_score: number
    review_score_desc: string
    total_positive: number
    total_negative: number
    total_reviews: number
  }
}

interface SteamAppDetails {
  success: boolean
  data: {
    steam_appid: number
    name: string
    header_image: string
    genres: Array<{ id: string, description: string }>
    release_date: { coming_soon: boolean, date: string }
    metacritic?: { score: number }
    categories?: Array<{ id: number, description: string }>
  }
}

async function getSteamReviews(appId: number): Promise<number> {
  try {
    const response = await fetch(
      `${STEAM_API_BASE}/appreviews/${appId}?json=1&language=all`
    )
    const data: SteamReviewResponse = await response.json()
    const { total_positive, total_negative } = data.query_summary
    const total = total_positive + total_negative
    return total > 0 ? Math.round((total_positive / total) * 100) : 0
  } catch (error) {
    console.error('Error fetching Steam reviews:', error)
    return 0
  }
}

async function getAppDetails(appId: number): Promise<SteamAppDetails | null> {
  try {
    const response = await fetch(
      `${STEAM_STORE_API}?appids=${appId}&l=english`
    )
    const data = await response.json()
    return data[appId] as SteamAppDetails
  } catch (error) {
    console.error('Error fetching app details:', error)
    return null
  }
}

// Popular Steam games list (we can expand this)
const POPULAR_GAME_IDS = [
  570,    // Dota 2
  730,    // CS:GO
  440,    // Team Fortress 2
  230410, // Warframe
  252950, // Rocket League
  1091500, // Cyberpunk 2077
  1174180, // Red Dead Redemption 2
  292030, // The Witcher 3
  578080, // PUBG
  359550, // Rainbow Six Siege
  271590, // GTA V
  1245620, // Elden Ring
  1462040, // Baldur's Gate 3
  814380, // Sekiro
  582010, // Monster Hunter: World
  1172470, // Apex Legends
  346110, // ARK
  252490, // Rust
  105600, // Terraria
  238960, // Path of Exile
  // Add more games as needed
]

async function getRandomGames(): Promise<Game[]> {
  try {
    // Get two random game IDs
    const randomIds = POPULAR_GAME_IDS
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    // Fetch details and reviews for both games in parallel
    const gamesData = await Promise.all(
      randomIds.map(async (appId) => {
        const [details, steamScore] = await Promise.all([
          getAppDetails(appId),
          getSteamReviews(appId)
        ])

        if (!details?.success) {
          throw new Error(`Failed to fetch details for app ${appId}`)
        }

        return {
          id: appId,
          name: details.data.name,
          coverUrl: details.data.header_image,
          steamScore,
          steamId: appId,
          genres: details.data.genres.map(g => g.description),
          releaseDate: details.data.release_date.date,
          metacritic: details.data.metacritic?.score
        }
      })
    )

    return gamesData
  } catch (error) {
    console.error('Error fetching games:', error)
    // Return mock data if API calls fail
    return [
      {
        id: 570,
        name: "Dota 2",
        coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg",
        steamScore: 85,
        steamId: 570,
        genres: ["Action", "Free to Play", "Strategy"],
        releaseDate: "2013-07-09",
        metacritic: 90
      },
      {
        id: 730,
        name: "Counter-Strike 2",
        coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
        steamScore: 88,
        steamId: 730,
        genres: ["Action", "Free to Play"],
        releaseDate: "2012-08-21",
        metacritic: 88
      }
    ]
  }
}

// Function to get games by genre
async function getGamesByGenre(genre: string): Promise<Game[]> {
  try {
    const gamesInGenre = POPULAR_GAME_IDS.filter(async (appId) => {
      const details = await getAppDetails(appId)
      return details?.data.genres.some(g => 
        g.description.toLowerCase() === genre.toLowerCase()
      )
    })

    // Get two random games from the filtered list
    const randomIds = gamesInGenre
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    return getRandomGames() // Reuse existing function for now
  } catch (error) {
    console.error('Error fetching games by genre:', error)
    return getRandomGames() // Fallback to random games
  }
}

// Function to get games by year
async function getGamesByYear(year: number): Promise<Game[]> {
  try {
    const gamesInYear = POPULAR_GAME_IDS.filter(async (appId) => {
      const details = await getAppDetails(appId)
      const gameYear = new Date(details?.data.release_date.date || '').getFullYear()
      return gameYear === year
    })

    // Get two random games from the filtered list
    const randomIds = gamesInYear
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    return getRandomGames() // Reuse existing function for now
  } catch (error) {
    console.error('Error fetching games by year:', error)
    return getRandomGames() // Fallback to random games
  }
}

export const gaugeApi = {
  getRandomGames,
  getGamesByGenre,
  getGamesByYear
} 