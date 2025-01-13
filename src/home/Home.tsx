import { GameList } from "./HomeMenu"
import { GameCarousel, POPULAR_GAMES_1, POPULAR_GAMES_2 } from "./GameCarousel"
import './Home.css'

export function Home() {
  return (
    <div className="home-wrapper">
      <div className="home-background" /> {/* Separate background div */}
      <div className="home-container">
        <div className="home-content">
          <div className="content-glass">
            <GameList />
          </div>
          <div className="carousel-container">
            <GameCarousel games={POPULAR_GAMES_1} speed={0.3} />
            <GameCarousel games={POPULAR_GAMES_2} speed={0.5} />
          </div>
        </div>
      </div>
    </div>
  )
}