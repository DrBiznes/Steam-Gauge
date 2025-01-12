import { GameList } from "./HomeMenu"
import { GameCarousel, POPULAR_GAMES_1, POPULAR_GAMES_2 } from "./GameCarousel"
import './Home.css'

export function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="content-glass">
          <div className="flex-1 relative z-10">
            <GameList />
          </div>
        </div>
        <div className="absolute top-0 right-0 lg:right-0 xl:right-0 hidden md:flex gap-6 z-0 h-full">
          <GameCarousel games={POPULAR_GAMES_1} speed={0.3} />
          <GameCarousel games={POPULAR_GAMES_2} speed={0.5} />
        </div>
      </div>
    </div>
  )
}