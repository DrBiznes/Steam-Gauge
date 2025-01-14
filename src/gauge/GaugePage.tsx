import { useEffect } from "react"
import { useParams, useLocation } from "react-router-dom"
import { GameCard } from "./GameCard"
import { useGaugeStore } from "./store"
import LoadingGauge from "./LoadingGauge"
import { GameModeSelect } from "./GameModeSelect"
import { GameMode } from "./types"
import { motion, AnimatePresence } from "framer-motion"

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
        <motion.div 
          className="text-center mb-8 flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={`text-4xl font-bold text-white px-4 py-2 ${
            currentMode === 'top100in2weeks' ? 'bg-[#2563eb]' :
            currentMode === 'top100forever' ? 'bg-[#dc2626]' :
            currentMode === 'genre' ? 'bg-[#059669]' :
            'bg-[#F74843]'
          }`}>{pageTitle}</h1>
          <div className="text-xl text-white px-4 py-2 bg-[#2F2F2F]">
            Score: {currentScore} | High Score: {highScore}
          </div>
        </motion.div>

        <div className="flex gap-8 items-center justify-center min-h-[400px] w-full overflow-visible mt-16">
          {isLoading || !gameState ? (
            <div className="w-full h-full flex items-center justify-center overflow-visible relative -mt-8">
              <LoadingGauge />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${gameState.leftGame?.id}-${gameState.rightGame?.id}`}
                className="flex gap-8 items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <GameCard
                    game={gameState.leftGame}
                    revealed={gameState.revealed}
                    onClick={() => handleGuess('left')}
                  />
                </motion.div>
                
                <motion.div
                  className="text-2xl font-bold text-white"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  VS
                </motion.div>
                
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <GameCard
                    game={gameState.rightGame}
                    revealed={gameState.revealed}
                    onClick={() => handleGuess('right')}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        <motion.div 
          className="text-center mt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className="text-lg text-white px-4 py-2 bg-[#2F2F2F] inline-block">
            Click on the game you think has a higher Steam user review score!
          </p>
          <AnimatePresence mode="wait">
            {gameState?.revealed && gameState.leftGame && gameState.rightGame && (
              <motion.p 
                className="text-lg mt-2 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                Steam Scores: {gameState.leftGame.name}: {gameState.leftGame.steamScore}% vs {gameState.rightGame.name}: {gameState.rightGame.steamScore}%
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}