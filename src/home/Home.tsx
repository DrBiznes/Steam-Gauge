import { GameList } from "./HomeMenu"
import { GameCarousel, POPULAR_GAMES_1, POPULAR_GAMES_2 } from "./GameCarousel"

export function Home() {
  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <GameList />
      </div>
      <div className="flex flex-col gap-4 w-[200px]">
        <GameCarousel games={POPULAR_GAMES_1} direction="up" />
        <GameCarousel games={POPULAR_GAMES_2} direction="down" />
      </div>
    </div>
  )
}