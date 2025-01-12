import { useEffect, useState } from "react"
import { GameCard } from "./GameCard"
import { useGaugeGameStore } from "./store"
import { Loader2 } from "lucide-react"
import { useGaugeQueries } from "./hooks/useGaugeQueries"
import { GameFilters } from "./GameFilters"

export function GaugePage() {
  const { 
    games, 
    score, 
    highScore, 
    incrementScore, 
    loading, 
    setLoading,
    resetCurrentGames 
  } = useGaugeGameStore()
  
  const [revealed, setRevealed] = useState(false)
  const { gamesQuery, getNewGames } = useGaugeQueries()

  // Initial load
  useEffect(() => {
    console.log('Initial load effect')
    if (gamesQuery.data && (!games[0] || !games[1])) {
      console.log('Loading initial games')
      getNewGames()
    } else if (!gamesQuery.data) {
      console.log('Fetching initial data')
      setLoading(true)
      gamesQuery.refetch()
    }
  }, [gamesQuery.data])

  const handleGuess = (index: number) => {
    if (revealed || !games[0] || !games[1]) return

    setRevealed(true)
    const game1Score = games[0].steamScore || 0
    const game2Score = games[1].steamScore || 0
    
    if ((index === 0 && game1Score > game2Score) || 
        (index === 1 && game2Score > game1Score)) {
      incrementScore()
    }

    // Show the result for a moment, then get new games
    setTimeout(() => {
      console.log('Time to show new games')
      setRevealed(false)
      resetCurrentGames() // Clear current games
      getNewGames() // Select new ones from cache
    }, 2000)
  }

  // Show loading state if either global loading or query loading is true
  const isLoading = loading || gamesQuery.isLoading || !games[0] || !games[1]

  return (
    <div className="flex flex-col items-center gap-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Steam Score Gauge</h1>
        <div className="text-xl">
          Score: {score} | High Score: {highScore}
        </div>
      </div>

      <GameFilters />

      <div className="flex gap-8 items-center justify-center min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading games...</span>
          </div>
        ) : (
          <>
            <GameCard
              game={games[0]}
              revealed={revealed}
              onClick={() => handleGuess(0)}
            />
            <div className="text-2xl font-bold">VS</div>
            <GameCard
              game={games[1]}
              revealed={revealed}
              onClick={() => handleGuess(1)}
            />
          </>
        )}
      </div>

      <div className="text-center mt-4">
        <p className="text-lg">
          Click on the game you think has a higher Steam user review score!
        </p>
      </div>
    </div>
  )
}