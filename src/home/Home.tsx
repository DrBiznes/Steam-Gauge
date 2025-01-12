import { GameList } from "./HomeMenu"
import { GameCarousel, POPULAR_GAMES_1, POPULAR_GAMES_2 } from "./GameCarousel"
import './Home.css'

export function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="content-glass">
          <div className="flex gap-8">
            <div className="flex-1">
              <GameList />
            </div>
            <div className="flex gap-4">
              <GameCarousel games={POPULAR_GAMES_1} direction="up" />
              <GameCarousel games={POPULAR_GAMES_2} direction="down" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}