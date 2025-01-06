import { Card } from "@/components/ui/card"
import { Game } from "./types"

interface GameCardProps {
  game: Game | null
  revealed?: boolean
  onClick?: () => void
}

export function GameCard({ game, revealed = false, onClick }: GameCardProps) {
  if (!game) {
    return (
      <Card className="w-[300px] h-[400px] flex items-center justify-center text-muted-foreground">
        No game loaded
      </Card>
    )
  }

  return (
    <Card
      className="w-[300px] h-[400px] relative cursor-pointer hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <img
          src={game.coverUrl}
          alt={game.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://placehold.co/300x400?text=No+Image'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h3 className="text-xl font-bold mb-2">{game.name}</h3>
        {revealed && game.steamScore !== undefined && (
          <div className="text-lg font-semibold">
            Steam Score: {game.steamScore}%
          </div>
        )}
        {revealed && game.genres && (
          <div className="text-sm opacity-75 mt-1">
            {game.genres.join(' • ')}
          </div>
        )}
      </div>
    </Card>
  )
} 