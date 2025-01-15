// src/guess/GuessCard.tsx

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Game } from "./types"
import { motion, AnimatePresence } from "framer-motion"
import "./guess.css"

// Utility function to pixelate image
const pixelateImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  pixelSize: number
) => {
  const w = canvas.width
  const h = canvas.height

  // Draw original image first
  ctx.drawImage(image, 0, 0, w, h)

  // Scale down and up to create pixelation effect
  if (pixelSize > 1) {
    const scaledW = w / pixelSize
    const scaledH = h / pixelSize

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
      ctx.drawImage(tempCanvas, 0, 0, w, h, 0, 0, scaledW, scaledH)
      
      // Draw scaled up
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(canvas, 0, 0, scaledW, scaledH, 0, 0, w, h)
    }
  }
}

interface GuessCardProps {
  game: Game | null
  pixelationLevel: number
  revealed?: boolean
  hints?: { type: string; text: string }[]
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
  const [imageError, setImageError] = useState(false)
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
      setImageError(false)
      setCurrentGameId(game?.id || null)
    }
  }, [game?.id])

  useEffect(() => {
    if (game && onLoad) {
      onLoad()
    }
  }, [game, onLoad])

  useEffect(() => {
    if (!imageLoaded || !canvasRef.current || !imageRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match desired aspect ratio
    canvas.width = 800
    canvas.height = 343

    // Apply pixelation effect
    pixelateImage(ctx, imageRef.current, canvas, getPixelSize(pixelationLevel))
  }, [imageLoaded, pixelationLevel])

  const getPlaceholderImage = () => {
    if (window.innerWidth <= 768) {
      return 'https://placehold.co/400x225?text=No+Image'
    }
    return 'https://placehold.co/800x343?text=No+Image'
  }

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
        {/* Image Container */}
        <div className="guess-image-container">
          {/* Hidden image for loading */}
          <img
            ref={imageRef}
            key={game.id}
            src={game.coverUrl}
            alt="Game cover"
            className="hidden"
            onLoad={() => {
              setImageLoaded(true)
              setImageError(false)
            }}
            onError={(e) => {
              setImageError(true)
              setImageLoaded(true)
              e.currentTarget.src = getPlaceholderImage()
            }}
          />
          
          {/* Canvas for pixelation effect */}
          <AnimatePresence mode="wait">
            <motion.canvas
              key={game.id}
              ref={canvasRef}
              className="w-full h-full object-cover"
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
                    <div className="steam-score">
                      Steam Score: {game.steamScore}%
                    </div>
                    <div className="total-reviews">
                      Total Reviews: {game.totalReviews?.toLocaleString()}
                    </div>
                    <div className="recent-players">
                      Recent Players: {game.averagePlayers2Weeks.toLocaleString()}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hints Display */}
        <AnimatePresence>
          <motion.div className="hints-container">
            {hints.map((hint, index) => (
              <motion.div
                key={`${hint.type}-${index}`}
                className="hint-item"
                style={{ backgroundColor: getHintBackground(index) }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
              >
                {hint.text}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Pixelation Level Indicator */}
        <div className="pixelation-indicator">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className={`indicator-dot ${index >= 6 - pixelationLevel ? 'active' : ''}`}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

function getHintBackground(index: number) {
  const colors = [
    'rgba(59, 130, 246, 0.1)',  // blue
    'rgba(16, 185, 129, 0.1)',  // green
    'rgba(239, 68, 68, 0.1)',   // red
    'rgba(245, 158, 11, 0.1)',  // yellow
    'rgba(139, 92, 246, 0.1)'   // purple
  ]
  return colors[index % colors.length]
}