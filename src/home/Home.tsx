import { GameList } from "./HomeMenu"
import { GameCarousel, POPULAR_GAMES_1, POPULAR_GAMES_2 } from "./GameCarousel"
import { useLayoutEffect } from 'react'
import './Home.css'

export function Home() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="content-glass">
          <GameList />
        </div>
        <div className="carousel-container">
          <GameCarousel games={POPULAR_GAMES_1} speed={0.15} />
          <GameCarousel games={POPULAR_GAMES_2} speed={0.25} />
        </div>
      </div>
    </div>
  )
}