import { GameList } from "./HomeMenu"
import { GameCarousel, POPULAR_GAMES_1, POPULAR_GAMES_2 } from "./GameCarousel"
import './Home.css'

export function Home() {
  return (
    <div className="home-container">
      <div className="home-content relative min-h-[calc(100vh-88px)]">
        <div className="content-glass">
          <div className="flex-1">
            <GameList />
          </div>
        </div>
        <div className="absolute top-0 right-4 lg:right-8 xl:right-12 flex gap-6 z-10 h-full">
          <GameCarousel games={POPULAR_GAMES_1} speed={0.3} />
          <GameCarousel games={POPULAR_GAMES_2} speed={0.5} />
        </div>
      </div>
    </div>
  )
}