import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const GAMES = [
  {
    id: 1,
    name: "Steam Gauge",
    path: "/steam-gauge",
  },
  {
    id: 2,
    name: "Steam Guess",
    path: "/steam-guess",
  },
  {
    id: 3,
    name: "About",
    path: "/about",
  },
]

export function GameList() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <h2 className="font-black text-5xl text-white">Steam Tools</h2>
        <p className="text-lg font-medium text-white/80">
          A collection of tools and games built around the Steam platform. 
          Analyze your gaming habits, test your knowledge, and discover new games.
        </p>
      </div>
      
      <div className="flex flex-col gap-2">
        {GAMES.map((game) => (
          <Button
            key={game.id}
            variant="ghost"
            className="justify-start text-xl font-bold text-white hover:bg-white/10"
            onClick={() => navigate(game.path)}
          >
            {game.name}
          </Button>
        ))}
      </div>
    </div>
  )
} 