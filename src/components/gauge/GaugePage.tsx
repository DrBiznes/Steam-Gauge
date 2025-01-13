import { useEffect, useState } from "react"
import { GameCard } from "./GameCard"
import { useGaugeGameStore } from "./store"
import { Loader2 } from "lucide-react"
import { useGaugeQueries } from "./hooks/useGaugeQueries"

export function GaugePage() {
  const { 
    games, 
    score, 
    highScore, 
    incrementScore,
    resetScore, 
    loading, 
    setLoading,
    resetCurrentGames 
  } = useGaugeGameStore()
  
  const [revealed, setRevealed] = useState(false)
  const { gamesQuery, getNewGames } = useGaugeQueries()

  // Initial load
  useEffect(() => {
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
    
    const isCorrect = (index === 0 && game1Score > game2Score) || 
                     (index === 1 && game2Score > game1Score)

    if (isCorrect) {
      incrementScore()
    } else {
      resetScore()
    }

    setTimeout(() => {
      console.log('Time to show new games')
      setRevealed(false)
      resetCurrentGames()
      getNewGames()
    }, 2000)
  }

  const isLoading = loading || gamesQuery.isLoading || !games[0] || !games[1]

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">Steam Score Gauge</h1>
          <div className="text-xl text-white">
            Score: {score} | High Score: {highScore}
          </div>
        </div>

        <div className="flex gap-8 items-center justify-center min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center gap-2 text-white">
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
              <div className="text-2xl font-bold text-white">VS</div>
              <GameCard
                game={games[1]}
                revealed={revealed}
                onClick={() => handleGuess(1)}
              />
            </>
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-lg text-white">
            Click on the game you think has a higher Steam user review score!
          </p>
          {revealed && (
            <p className="text-lg mt-2 text-white">
              Steam Scores: {games[0]?.name}: {games[0]?.steamScore}% vs {games[1]?.name}: {games[1]?.steamScore}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}