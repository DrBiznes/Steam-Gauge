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

export const POPULAR_GAMES_1: Game[] = [
  {
    id: 1,
    title: "Counter-Strike 2",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/library_600x900.jpg"
  },
  {
    id: 2,
    title: "Half-Life 2",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/220/library_600x900.jpg"
  },
  {
    id: 3,
    title: "Portal 2",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/620/library_600x900.jpg"
  },
  {
    id: 4,
    title: "Team Fortress 2",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/440/library_600x900.jpg"
  },
  {
    id: 5,
    title: "Civilization V",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/8930/library_600x900.jpg"
  }
]

export const POPULAR_GAMES_2: Game[] = [
  {
    id: 6,
    title: "Garry's Mod",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/4000/library_600x900.jpg"
  },
  {
    id: 7,
    title: "PAYDAY: The Heist",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/24240/library_600x900.jpg"
  },
  {
    id: 8,
    title: "Terraria",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/105600/library_600x900.jpg"
  },
  {
    id: 9,
    title: "Super Meat Boy",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/40800/library_600x900.jpg"
  },
  {
    id: 10,
    title: "Grand Theft Auto V",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/271590/library_600x900.jpg"
  }
]

export function GameCarousel({ games, speed = 0.5 }: GameCarouselProps) {
  const columnRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = columnRef.current
    if (!element) return

    const handleScroll = () => {
      const scrolled = window.scrollY
      const yPos = -(scrolled * speed)
      element.style.transform = `translate3d(0, ${yPos}px, 0)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial position

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