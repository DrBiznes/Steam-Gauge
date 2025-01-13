import { useEffect, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import { GameCard } from "./GameCard"
import { useGaugeGameStore } from "./store"
import { useGaugeQueries } from "./hooks/useGaugeQueries"
import LoadingGauge from "./LoadingGauge"
import { GameModeSelect } from "./GameModeSelect"

const getPageTitle = (mode: string | null, genre: string | null) => {
  if (!mode) return "Steam Score Gauge"
  
  switch (mode) {
    case 'top100in2weeks':
      return "Recent Top 100 Gauge"
    case 'top100forever':
      return "All-Time Classics Gauge"
    case 'genre':
      return `${genre?.replace('+', ' ')} Games Gauge`
    default:
      return "Steam Score Gauge"
  }
}

export function GaugePage() {
  const { genre } = useParams()
  const location = useLocation()
  const { 
    games, 
    getCurrentScore,
    getHighScore,
    incrementScore,
    resetScore, 
    loading, 
    setLoading,
    resetCurrentGames,
    selectedGameMode
  } = useGaugeGameStore()
  
  const [revealed, setRevealed] = useState(false)
  const { gamesQuery, getNewGames } = useGaugeQueries()

  // Determine if we're on the mode selection screen
  const isSelectingMode = location.pathname === '/gauge'

  // Get dynamic page title
  const pageTitle = getPageTitle(selectedGameMode, genre || null)

  // Initial load
  useEffect(() => {
    if (selectedGameMode && gamesQuery.data && (!games[0] || !games[1])) {
      console.log('Loading initial games')
      getNewGames()
    } else if (selectedGameMode && !gamesQuery.data) {
      console.log('Fetching initial data')
      setLoading(true)
      gamesQuery.refetch()
    }
  }, [gamesQuery.data, selectedGameMode])

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

  if (isSelectingMode) {
    return <GameModeSelect />
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">{pageTitle}</h1>
          <div className="text-xl text-white">
            Score: {getCurrentScore()} | High Score: {getHighScore()}
          </div>
        </div>

        <div className="flex gap-8 items-center justify-center min-h-[400px]">
          {isLoading ? (
            <LoadingGauge />
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