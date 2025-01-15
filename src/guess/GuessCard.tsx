import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Game, Hint } from "./types"
import { motion, AnimatePresence } from "framer-motion"
import "./guess.css"
import { GuessHints } from "./GuessHints"

// Utility function to pixelate image
const pixelateImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  pixelSize: number
) => {
  const w = canvas.width
  const h = canvas.height

  // Draw original image
  ctx.drawImage(image, 0, 0, w, h)

  // Apply pixelation if needed
  if (pixelSize > 1) {
    const scaledW = w / pixelSize
    const scaledHeight = h / pixelSize

    // Create temporary canvas for pixelation
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')
    tempCanvas.width = w
    tempCanvas.height = h

    if (tempCtx) {
      // Draw original to temp
      tempCtx.drawImage(ctx.canvas, 0, 0)
      
      // Clear original canvas
      ctx.clearRect(0, 0, w, h)
      
      // Draw scaled down
      ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, scaledW, scaledHeight)
      
      // Draw scaled up
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(canvas, 0, 0, scaledW, scaledHeight, 0, 0, w, h)
    }
  }
}

interface GuessCardProps {
  game: Game | null
  pixelationLevel: number
  revealed?: boolean
  hints?: Hint[]
  onLoad?: () => void
}

export function GuessCard({ 
  game, 
  pixelationLevel, 
  revealed = false, 
  hints = [],
  onLoad 
}: GuessCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [currentGameId, setCurrentGameId] = useState<number | null>(null)

  // Calculate pixel size based on pixelation level (1-6)
  // Level 1 = most pixelated (32px), Level 6 = original image (1px)
  const getPixelSize = (level: number) => {
    return Math.max(1, 32 / level) // This gives us: 32, 16, 8, 4, 2, 1
  }

  // Reset state when game changes
  useEffect(() => {
    if (game?.id !== currentGameId) {
      setImageLoaded(false)
      setCurrentGameId(game?.id || null)
    }
  }, [game?.id])

  useEffect(() => {
    if (game && onLoad) {
      onLoad()
    }
  }, [game, onLoad])

  // Apply pixelation effect when image loads or level changes
  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 300
    canvas.height = 450

    // Apply pixelation effect
    pixelateImage(ctx, imageRef.current, canvas, getPixelSize(pixelationLevel))
  }, [imageLoaded, pixelationLevel])

  if (!game) {
    return (
      <Card className="guess-card-container flex items-center justify-center text-muted-foreground">
        No game loaded
      </Card>
    )
  }

  return (
    <motion.div
      key={game.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="guess-card-container">
        <div className="guess-content-wrapper">
          {/* Hints Section */}
          <GuessHints hints={hints} />

          {/* Cover Image Section */}
          <div className="guess-cover-container">
            {/* Hidden image for loading */}
            <img
              ref={imageRef}
              key={game.id}
              src={game.coverUrl}
              alt="Game cover"
              className="hidden"
              onLoad={() => {
                setImageLoaded(true)
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/300x450?text=No+Image'
                setImageLoaded(true)
              }}
            />
            
            {/* Canvas for pixelation effect */}
            <AnimatePresence mode="wait">
              <motion.canvas
                key={`canvas-${game.id}`}
                ref={canvasRef}
                className="game-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              />
            </AnimatePresence>

            {/* Game Info Overlay */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  className="reveal-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <motion.h2
                    className="game-title"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {game.name}
                  </motion.h2>

                  {game.steamScore !== undefined && (
                    <motion.div
                      className="game-stats"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div>Steam Score: {game.steamScore}%</div>
                      <div>Total Reviews: {game.totalReviews?.toLocaleString()}</div>
                      <div>Recent Players: {game.averagePlayers2Weeks.toLocaleString()}</div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}