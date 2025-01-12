import './GameCarousel.css'
import { useEffect, useRef } from 'react'

interface Game {
  id: number
  title: string
  coverUrl: string
}

interface GameCarouselProps {
  games: Game[]
  speed?: number
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
  },
  {
    id: 9,
    title: "Baldur's Gate 3",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900.jpg"
  },
  {
    id: 10,
    title: "Lethal Company",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1966720/library_600x900.jpg"
  },
  {
    id: 11,
    title: "Palworld",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1623730/library_600x900.jpg"
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
  },
  {
    id: 12,
    title: "Starfield",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/library_600x900.jpg"
  },
  {
    id: 13,
    title: "Hogwarts Legacy",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/990080/library_600x900.jpg"
  },
  {
    id: 14,
    title: "Sea of Thieves",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1172620/library_600x900.jpg"
  }
]

function GameCarousel({ games, speed = 0.5 }: GameCarouselProps) {
  const columnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (columnRef.current) {
        const rect = columnRef.current.parentElement?.getBoundingClientRect()
        if (!rect) return

        // Only apply parallax when the parent is in view
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const parentTop = rect.top
          const scrollProgress = -parentTop * speed
          columnRef.current.style.transform = `translateY(${scrollProgress}px)`
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div className="game-carousel" ref={columnRef}>
      {games.map((game, index) => (
        <div 
          key={`${game.id}-${index}`}
          className="game-item"
        >
          <div className="game-cover">
            <img
              src={game.coverUrl}
              alt={game.title}
              loading="lazy"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export { GameCarousel, POPULAR_GAMES_1, POPULAR_GAMES_2 } 