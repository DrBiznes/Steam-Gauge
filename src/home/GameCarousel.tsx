import Marquee from 'react-fast-marquee'

interface Game {
  id: number
  title: string
  coverUrl: string
}

interface GameCarouselProps {
  games: Game[]
  direction: "up" | "down"
}

const POPULAR_GAMES_1: Game[] = [
  {
    id: 1,
    title: "Counter-Strike 2",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_600x900.jpg"
  },
  {
    id: 2,
    title: "Dota 2",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_600x900.jpg"
  },
  {
    id: 3,
    title: "PUBG",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/library_600x900.jpg"
  },
  {
    id: 4,
    title: "Apex Legends",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172470/library_600x900.jpg"
  }
]

const POPULAR_GAMES_2: Game[] = [
  {
    id: 5,
    title: "GTA V",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg"
  },
  {
    id: 6,
    title: "Elden Ring",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/library_600x900.jpg"
  },
  {
    id: 7,
    title: "Red Dead Redemption 2",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/library_600x900.jpg"
  },
  {
    id: 8,
    title: "Cyberpunk 2077",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/library_600x900.jpg"
  }
]

function GameCarousel({ games, direction }: GameCarouselProps) {
  // Duplicate the games array to ensure continuous scrolling
  const duplicatedGames = [...games, ...games, ...games]
  
  return (
    <div className="h-[calc(100vh-16rem)] bg-black/10 rounded-lg overflow-hidden">
      <Marquee
        direction={direction}
        speed={20}
        gradient={false}
        pauseOnHover={true}
      >
        {duplicatedGames.map((game, index) => (
          <div 
            key={`${game.id}-${index}`}
            className="p-2"
          >
            <div className="w-[140px] aspect-[2/3] rounded-lg overflow-hidden shadow-lg hover:scale-105 transition-transform duration-300">
              <img
                src={game.coverUrl}
                alt={game.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </Marquee>
    </div>
  )
}

export { GameCarousel, POPULAR_GAMES_1, POPULAR_GAMES_2 } 