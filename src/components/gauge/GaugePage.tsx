import { useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import { GameCard } from "./GameCard"
import { useGaugeStore } from "./store"
import LoadingGauge from "./LoadingGauge"
import { GameModeSelect } from "./GameModeSelect"
import { GameMode } from "./types"

const getPageTitle = (mode: GameMode | null, genre: string | null) => {
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
    currentMode,
    currentGenre,
    isLoading,
    gameModeStates,
    setGameMode,
    makeGuess,
    loadInitialGames
  } = useGaugeStore()

  // Determine if we're on the mode selection screen
  const isSelectingMode = location.pathname === '/gauge'

  // Get current game mode state
  const modeKey = currentMode === 'genre' ? `genre-${currentGenre}` : currentMode || ''
  const currentModeState = gameModeStates[modeKey]
  
  // Get current game state
  const gameState = currentModeState?.currentState
  const currentScore = currentModeState?.currentScore || 0
  const highScore = currentModeState?.highScore || 0

  // Get dynamic page title
  const pageTitle = getPageTitle(currentMode, genre || null)

  // Initial load
  useEffect(() => {
    if (isSelectingMode) return
    
    // Extract mode from URL
    const urlParts = location.pathname.split('/')
    const mode = urlParts[2] as GameMode
    const urlGenre = urlParts[3]

    // Set mode if different
    if (mode !== currentMode || urlGenre !== currentGenre) {
      setGameMode(mode, urlGenre)
    }

    // Load initial games if needed
    if (currentMode && (!gameState?.leftGame || !gameState?.rightGame)) {
      loadInitialGames()
    }
  }, [location.pathname, currentMode, currentGenre, gameState])

  const handleGuess = async (position: 'left' | 'right') => {
    if (!gameState || gameState.revealed || gameState.isTransitioning) return
    await makeGuess(position)
  }

  if (isSelectingMode) {
    return <GameModeSelect />
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 text-white">{pageTitle}</h1>
          <div className="text-xl text-white">
            Score: {currentScore} | High Score: {highScore}
          </div>
        </div>

        <div className="flex gap-8 items-center justify-center min-h-[400px]">
          {isLoading || !gameState ? (
            <LoadingGauge />
          ) : (
            <>
              <GameCard
                game={gameState.leftGame}
                revealed={gameState.revealed}
                onClick={() => handleGuess('left')}
              />
              <div className="text-2xl font-bold text-white">VS</div>
              <GameCard
                game={gameState.rightGame}
                revealed={gameState.revealed}
                onClick={() => handleGuess('right')}
              />
            </>
          )}
        </div>

        <div className="text-center mt-4">
          <p className="text-lg text-white">
            Click on the game you think has a higher Steam user review score!
          </p>
          {gameState?.revealed && gameState.leftGame && gameState.rightGame && (
            <p className="text-lg mt-2 text-white">
              Steam Scores: {gameState.leftGame.name}: {gameState.leftGame.steamScore}% vs {gameState.rightGame.name}: {gameState.rightGame.steamScore}%
            </p>
          )}
        </div>
      </div>
    </div>
  )
}