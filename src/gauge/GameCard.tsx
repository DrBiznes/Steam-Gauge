import { Card } from "@/components/ui/card"
import { Game } from "./types"
import { motion, AnimatePresence } from "framer-motion"
import "./gauge.css"

interface GameCardProps {
  game: Game | null
  revealed?: boolean
  onClick?: () => void
}

export function GameCard({ game, revealed = false, onClick }: GameCardProps) {
  const getPlaceholderImage = () => {
    if (window.innerWidth <= 768) {
      return 'https://placehold.co/400x225?text=No+Image'
    }
    return 'https://placehold.co/800x343?text=No+Image'
  }

  if (!game) {
    return (
      <Card className="game-card flex items-center justify-center text-muted-foreground">
        No game loaded
      </Card>
    )
  }

  const getReviewStatus = (score: number) => {
    if (score >= 70) return "positive"
    if (score >= 50) return "mixed"
    return "negative"
  }

  const reviewStatus = game.steamScore ? getReviewStatus(game.steamScore) : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card 
        className="game-card" 
        onClick={onClick}
        data-revealed={revealed}
      >
        <motion.img
          src={game.coverUrl}
          alt={game.name}
          className="game-card-image"
          onError={(e) => {
            e.currentTarget.src = getPlaceholderImage()
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        <motion.div 
          className="game-card-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        />
        
        <div className="game-card-content">
          <AnimatePresence mode="wait">
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {game.steamScore !== undefined && (
                  <motion.div 
                    className={`review-score ${reviewStatus}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <span>{game.steamScore}%</span>
                    <span>•</span>
                    <span>{reviewStatus} reviews</span>
                  </motion.div>
                )}
                <motion.h3 
                  className="game-card-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                >
                  {game.name}
                </motion.h3>
                <motion.div 
                  className="game-metadata"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
                >
                  {game.totalReviews && (
                    <div>Total Reviews: {game.totalReviews.toLocaleString()}</div>
                  )}
                  <div className="opacity-75">
                    Owners: {game.owners}
                  </div>
                  <div className="opacity-75">
                    Average Players (2 weeks): {game.averagePlayers2Weeks.toLocaleString()}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Mobile Info */}
      <AnimatePresence mode="wait">
        {revealed && (
          <motion.div 
            className="mobile-game-info"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {game.steamScore !== undefined && (
              <motion.div 
                className={`review-score ${reviewStatus}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <span>{game.steamScore}%</span>
                <span>•</span>
                <span>{reviewStatus} reviews</span>
              </motion.div>
            )}
            <motion.h3 
              className="game-card-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            >
              {game.name}
            </motion.h3>
            <motion.div 
              className="game-metadata"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            >
              {game.totalReviews && (
                <div>Total Reviews: {game.totalReviews.toLocaleString()}</div>
              )}
              <div className="opacity-75">
                Owners: {game.owners}
              </div>
              <div className="opacity-75">
                Average Players (2 weeks): {game.averagePlayers2Weeks.toLocaleString()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 