import { useEffect, useState } from "react"
import { GameCard } from "./GameCard"
import { useGaugeGameStore } from "./store"
import { gaugeApi } from "./api"
import { Loader2 } from "lucide-react"

export function GaugePage() {
  const { currentGames, score, highScore, setGames, incrementScore, resetGame, loading, setLoading } = useGaugeGameStore()
  const [revealed, setRevealed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNewGames = async () => {
    try {
      setLoading(true)
      setError(null)
      const games = await gaugeApi.getRandomGames()
      setGames([games[0], games[1]])
    } catch (err) {
      setError('Failed to fetch games. Please try again.')
      console.error('Error fetching games:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNewGames()
  }, [])

  const handleGuess = (index: number) => {
    if (revealed || !currentGames[0] || !currentGames[1]) return

    setRevealed(true)
    const game1Score = currentGames[0].steamScore || 0
    const game2Score = currentGames[1].steamScore || 0
    
    if ((index === 0 && game1Score > game2Score) || 
        (index === 1 && game2Score > game1Score)) {
      incrementScore()
    }

    setTimeout(() => {
      setRevealed(false)
      fetchNewGames()
    }, 2000)
  }

  return (
    <div className="flex flex-col items-center gap-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Steam Score Gauge</h1>
        <div className="text-xl">
          Score: {score} | High Score: {highScore}
        </div>
      </div>

      {error && (
        <div className="text-red-500 font-medium text-center">
          {error}
        </div>
      )}

      <div className="flex gap-8 items-center justify-center min-h-[400px]">
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading games...</span>
          </div>
        ) : (
          <>
            <GameCard
              game={currentGames[0]}
              revealed={revealed}
              onClick={() => handleGuess(0)}
            />
            <div className="text-2xl font-bold">VS</div>
            <GameCard
              game={currentGames[1]}
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
