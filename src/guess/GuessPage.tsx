import { useEffect, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import { useGuessStore } from "./store"
import { GameModeSelect } from "./GameModeSelect"
import { GameMode } from "./types"
import { motion, AnimatePresence } from "framer-motion"
import { GuessCard } from "./GuessCard"
import { GuessInput } from "./GuessInput"
import LoadingGauge from "./LoadingGauge"
import "./guess.css"

const getPageTitle = (mode: GameMode | null, genre: string | null) => {
  if (!mode) return "Steam Artfuscation"
  
  switch (mode) {
    case 'top100in2weeks':
      return "Recent Releases Challenge"
    case 'top100forever':
      return "Classic Games Challenge"
    case 'genre':
      return `${genre?.replace('+', ' ')} Games Challenge`
    default:
      return "Steam Artfuscation"
  }
}

export function GuessPage() {
  const { genre } = useParams()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { 
    currentMode,
    currentGenre,
    isLoading,
    gameModeStates,
    setGameMode,
    makeGuess,
    skipGame,
    loadInitialGames
  } = useGuessStore()

  const isSelectingMode = location.pathname === '/artfuscation'
  const modeKey = currentMode === 'genre' ? `genre-${currentGenre}` : currentMode || ''
  const currentModeState = gameModeStates[modeKey]
  const gameState = currentModeState?.currentState
  const currentScore = currentModeState?.currentScore || 0
  const highScore = currentModeState?.highScore || 0

  useEffect(() => {
    if (isSelectingMode) return
    
    const urlParts = location.pathname.split('/')
    const mode = urlParts[2] as GameMode
    const urlGenre = urlParts[3]

    if (mode !== currentMode || urlGenre !== currentGenre) {
      setGameMode(mode, urlGenre)
    }

    if (currentMode && (!gameState?.currentGame)) {
      loadInitialGames()
    }
  }, [location.pathname, currentMode, currentGenre, gameState])

  const handleSubmitGuess = async (guess: string) => {
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      await makeGuess(guess)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await skipGame()
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSelectingMode) {
    return <GameModeSelect />
  }

  return (
    <div className="min-h-screen pt-16 px-2 md:px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 md:gap-8 py-8 md:py-12">
        {/* Score Header */}
        <motion.div 
          className="text-center mb-4 md:mb-8 flex flex-col items-center gap-2 md:gap-4 w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={`text-2xl md:text-4xl font-bold text-white px-4 py-2 ${
            currentMode === 'top100in2weeks' ? 'bg-[#2563eb]' :
            currentMode === 'top100forever' ? 'bg-[#dc2626]' :
            currentMode === 'genre' ? 'bg-[#059669]' :
            'bg-[#F74843]'
          }`}>{getPageTitle(currentMode, genre || null)}</h1>
          <div className="text-lg md:text-xl text-white px-4 py-2 bg-[#2F2F2F]">
            Score: {currentScore} | High Score: {highScore}
          </div>
        </motion.div>

        {/* Game Content */}
        <div className="relative w-full flex flex-col items-center">
          {isLoading || !gameState?.currentGame ? (
            <div className="absolute left-1/2 -translate-x-1/2 translate-y-1/4">
              <LoadingGauge />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                className="w-full flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Guess Card */}
                <GuessCard
                  game={gameState.currentGame}
                  pixelationLevel={gameState.pixelationLevel}
                  revealed={gameState.revealed}
                  hints={gameState.hints}
                />

                {/* Game Controls */}
                <div className="-mt-4 md:-mt-7 w-full max-w-[600px] px-2 md:px-0">
                  <GuessInput
                    onSubmit={handleSubmitGuess}
                    onSkip={handleSkip}
                    isSubmitting={isSubmitting}
                    isRevealed={gameState.revealed}
                    gamePool={currentModeState.gamePool}
                  />
                </div>

                {/* Game Progress */}
                <div className="flex justify-between items-center gap-4 md:gap-8 text-white/80 text-xs md:text-sm mt-1 w-full max-w-[600px] px-2 md:px-0">
                  <div>Lives Remaining: {6 - gameState.pixelationLevel}/5</div>
                </div>

                {/* Instructions */}
                <motion.div
                  className="text-center text-white/60 text-xs md:text-sm mt-1 px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p>Wrong guesses will reveal hints and more of the image</p>
                  <p>Skip or running out of lives will reset your score</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}