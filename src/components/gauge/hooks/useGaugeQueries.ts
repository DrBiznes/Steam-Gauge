import { useQuery } from "@tanstack/react-query"
import { gaugeApi } from "../api"
import { useGaugeGameStore } from "../store"

export function useGaugeQueries() {
  const { setGames, setLoading, selectedGenre, selectedYear } = useGaugeGameStore()

  // Query for available genres
  const genresQuery = useQuery({
    queryKey: ["gauge", "genres"],
    queryFn: gaugeApi.getAvailableGenres,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  })

  // Query for random games
  const gamesQuery = useQuery({
    queryKey: ["gauge", "games", { genre: selectedGenre, year: selectedYear }],
    queryFn: async () => {
      try {
        let games;
        if (selectedGenre) {
          games = await gaugeApi.getGamesByGenre(selectedGenre)
        } else if (selectedYear) {
          games = await gaugeApi.getGamesByYear(selectedYear)
        } else {
          games = await gaugeApi.getRandomGames()
        }

        if (!games || games.length < 2) {
          throw new Error("Failed to fetch enough games")
        }

        // Ensure we have valid games with required data
        const validGames = games.filter(game => 
          game && 
          game.steamScore !== undefined && 
          game.steamScore > 0 && 
          game.coverUrl
        )

        if (validGames.length < 2) {
          throw new Error("Not enough valid games with required data")
        }

        setGames([validGames[0], validGames[1]])
        return validGames
      } catch (error) {
        console.error('Error in games query:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    refetchOnWindowFocus: false
  })

  return {
    genresQuery,
    gamesQuery,
    getGamesByGenre: (genre: string) => {
      setLoading(true)
      gamesQuery.refetch()
    },
    getGamesByYear: (year: number) => {
      setLoading(true)
      gamesQuery.refetch()
    }
  }
} 