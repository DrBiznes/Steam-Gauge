import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import './HomeMenu.css'

const GAMES = [
  {
    id: 1,
    name: "Steam Gauge",
    path: "/steam-gauge",
    description: "Dive deep into your Steam library analytics. Track your gaming habits, discover insights about your playtime, and understand your gaming preferences through detailed statistics and visualizations."
  },
  {
    id: 2,
    name: "Steam Guess",
    path: "/steam-guess",
    description: "Test your knowledge of Steam games in this engaging quiz game. Challenge yourself with questions about release dates, genres, developers, and more while learning about new titles."
  },
  {
    id: 3,
    name: "About",
    path: "/about",
    description: "Learn more about our Steam tools project, its development, and the technology behind it. Find out how we use the Steam API to bring you these unique gaming experiences."
  },
]

export function GameList() {
  const navigate = useNavigate()

  return (
    <>
      <div className="menu-header">
        <h2 className="font-black text-6xl text-white">Gaming is Good</h2>
        <p className="text-lg font-medium text-white/90 leading-relaxed mt-4">
          Welcome to our collection of innovative Steam tools and games. We've created these applications to enhance your Steam experience, helping you explore your gaming habits and discover new titles in unique ways.
        </p>
      </div>
      
      <div className="menu-list">
        {GAMES.map((game) => (
          <div key={game.id} className="menu-item">
            <Button
              variant="ghost"
              className="menu-button"
              onClick={() => navigate(game.path)}
            >
              <h3 className="menu-title">
                {game.name}
              </h3>
              <p className="menu-description">
                {game.description}
              </p>
            </Button>
          </div>
        ))}
      </div>
    </>
  )
} 