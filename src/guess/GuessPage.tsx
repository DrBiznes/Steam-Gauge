// src/guess/GuessPage.tsx

import { useEffect, useState } from "react"
import { useParams, useLocation } from "react-router-dom"
import { useGuessStore } from "./store"
import { GameModeSelect } from "./GameModeSelect"
import { GameMode } from "./types"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lightbulb, SkipForward } from "lucide-react"
import { GuessCard } from "./GuessCard"
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
  const [guess, setGuess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { 
    currentMode,
    currentGenre,
    isLoading,
    gameModeStates,
    setGameMode,
    makeGuess,
    revealHint,
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

  const handleSubmitGuess = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guess.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const isCorrect = await makeGuess(guess)
      if (isCorrect) {
        setGuess("")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await skipGame()
      setGuess("")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSelectingMode) {
    return <GameModeSelect />
  }

  return (
    <div className="min-h-screen pt-16 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8 py-12">
        {/* Score Header */}
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
          }`}>{getPageTitle(currentMode, genre || null)}</h1>
          <div className="text-xl text-white px-4 py-2 bg-[#2F2F2F]">
            Score: {currentScore} | High Score: {highScore}
          </div>
        </motion.div>

        {/* Game Content */}
        <div className="flex flex-col items-center gap-8 w-full">
          {isLoading || !gameState?.currentGame ? (
            <LoadingGauge />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                className="w-full flex flex-col items-center gap-6"
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
                <div className="w-full max-w-2xl space-y-6">
                  <form onSubmit={handleSubmitGuess} className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter game name..."
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        className="flex-1 bg-[#2F2F2F] text-white border-none"
                        disabled={isSubmitting || gameState.revealed}
                      />
                      <Button 
                        type="submit"
                        className="bg-[#F74843] hover:bg-[#ff5a55] text-white"
                        disabled={isSubmitting || gameState.revealed}
                      >
                        Guess
                      </Button>
                    </div>
                    
                    <div className="flex justify-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-[#2F2F2F] text-white border-none hover:bg-[#404040]"
                        onClick={revealHint}
                        disabled={isSubmitting || gameState.revealed}
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Get Hint
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-[#2F2F2F] text-white border-none hover:bg-[#404040]"
                        onClick={handleSkip}
                        disabled={isSubmitting}
                      >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip Game
                      </Button>
                    </div>
                  </form>

                  {/* Game Progress */}
                  <div className="flex justify-between items-center text-white/80 text-sm">
                    <div>Pixelation Level: {gameState.pixelationLevel}/6</div>
                    <div>Hints Used: {gameState.hints.length}</div>
                  </div>

                  {/* Instructions */}
                  <motion.div
                    className="text-center text-white/60 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p>Wrong guesses will reduce pixelation and reveal hints</p>
                    <p>Skip or incorrect final guess will reset your score</p>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  )
}