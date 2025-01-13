import { Card } from "@/components/ui/card"
import { Game } from "./types"
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

  const GameInfo = () => (
    <>
      {game.steamScore !== undefined && (
        <div className={`review-score ${reviewStatus}`}>
          <span>{game.steamScore}%</span>
          <span>•</span>
          <span>{reviewStatus} reviews</span>
        </div>
      )}
      <h3 className="game-card-title">{game.name}</h3>
      <div className="game-metadata">
        {game.totalReviews && (
          <div>Total Reviews: {game.totalReviews.toLocaleString()}</div>
        )}
        <div className="opacity-75">
          Owners: {game.owners}
        </div>
        <div className="opacity-75">
          Average Players (2 weeks): {game.averagePlayers2Weeks.toLocaleString()}
        </div>
      </div>
    </>
  )

  return (
    <div>
      <Card 
        className="game-card" 
        onClick={onClick}
        data-revealed={revealed}
      >
        <img
          src={game.coverUrl}
          alt={game.name}
          className="game-card-image"
          onError={(e) => {
            e.currentTarget.src = getPlaceholderImage()
          }}
        />
        <div className="game-card-overlay" />
        
        <div className="game-card-content">
          <GameInfo />
        </div>
      </Card>
      {revealed && (
        <div className="mobile-game-info">
          <GameInfo />
        </div>
      )}
    </div>
  )
} 