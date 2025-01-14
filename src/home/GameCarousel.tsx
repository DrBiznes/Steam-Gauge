import './GameCarousel.css'
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

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
  const ref = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -500 * speed])

  return (
    <motion.div 
      className="game-carousel" 
      ref={ref}
      style={{ y }}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      {games.map((game, index) => (
        <motion.div 
          key={`${game.id}-${index}`}
          className="game-item"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5,
            delay: index * 0.1,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            scale: 1.05,
            transition: { duration: 0.2 }
          }}
        >
          <motion.div 
            className="game-cover"
            whileHover={{ 
              rotateY: 10,
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)"
            }}
          >
            <img
              src={game.coverUrl}
              alt={game.title}
              loading="lazy"
            />
          </motion.div>
        </motion.div>
      ))}
    </motion.div>
  )
}