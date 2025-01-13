import { useQuery } from "@tanstack/react-query"
import { gaugeApi } from "../../../services/GaugeAPI"
import { useGaugeGameStore } from "../store"
import { useCallback } from "react"
import { Game } from "../types"

export function useGaugeQueries() {
  const { 
    setGames, 
    setLoading, 
    selectedGameMode,
    selectedGenre,
    shownGameIds,
    addShownGames,
    resetShownGames
  } = useGaugeGameStore()

  const selectRandomGames = useCallback((allGames: Game[]) => {
    console.log('Full game pool size:', allGames.length)
    
    // Filter out previously shown games
    const validGames = allGames.filter(game => !shownGameIds.has(game.id))
    console.log('Unshown games available:', validGames.length)

    // If we've shown most games, reset the tracking
    if (validGames.length < 2) {
      console.log('Resetting shown games tracking - starting fresh')
      resetShownGames()
      // Get two random games from the full pool
      const shuffled = [...allGames].sort(() => Math.random() - 0.5)
      const selected = [shuffled[0], shuffled[1]] as [Game, Game]
      console.log('Selected after reset:', selected.map(g => g.name))
      setGames(selected)
      addShownGames(selected)
      return
    }

    // Get two random unshown games
    const shuffled = [...validGames].sort(() => Math.random() - 0.5)
    const selected = [shuffled[0], shuffled[1]] as [Game, Game]
    console.log('Selected new games:', selected.map(g => g.name))
    setGames(selected)
    addShownGames(selected)
  }, [setGames, shownGameIds, addShownGames, resetShownGames])

  const gamesQuery = useQuery({
    queryKey: ["gauge", "games", { mode: selectedGameMode, genre: selectedGenre }],
    queryFn: async () => {
      if (!selectedGameMode) return []
      
      try {
        const games = await gaugeApi.getGamesByMode(
          selectedGameMode, 
          selectedGenre || undefined
        )
        console.log('Fetched total games:', games.length)
        return games
      } catch (error) {
        console.error('Error in games query:', error)
        throw error
      } finally {
        setLoading(false)
      }
    },
    enabled: !!selectedGameMode,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })

  return {
    gamesQuery,
    getNewGames: useCallback(() => {
      if (gamesQuery.data) {
        console.log('Getting new games from cached data pool')
        selectRandomGames(gamesQuery.data)
      } else {
        console.log('No cached data available')
      }
    }, [gamesQuery.data, selectRandomGames])
  }
}