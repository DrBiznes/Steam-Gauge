import './GameCarousel.css'
import { useEffect, useRef, useState } from 'react'

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
    title: "Dota 2",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/570/library_600x900.jpg"
  },
  {
    id: 3,
    title: "PUBG",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/578080/library_600x900.jpg"
  },
  {
    id: 9,
    title: "Baldur's Gate 3",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/library_600x900.jpg"
  }
]

export const POPULAR_GAMES_2: Game[] = [
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
    id: 12,
    title: "Starfield",
    coverUrl: "https://cdn.cloudflare.steamstatic.com/steam/apps/1716740/library_600x900.jpg"
  }
]

export function GameCarousel({ games, speed = 0.5 }: GameCarouselProps) {
  const columnRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (columnRef.current) {
        const rect = columnRef.current.getBoundingClientRect()
        const parentRect = columnRef.current.parentElement?.getBoundingClientRect()
        
        if (!parentRect) return

        // Calculate the scroll progress relative to viewport
        const viewportHeight = window.innerHeight
        const scrollPosition = window.scrollY
        const elementTop = rect.top + scrollPosition
        
        // Calculate how far we've scrolled past the element
        const relativeScroll = scrollPosition - elementTop + viewportHeight
        
        // Create a longer scroll range
        const scrollRange = parentRect.height + viewportHeight
        
        // Calculate progress as a percentage of the scroll range
        const progress = (relativeScroll / scrollRange) * 100
        
        // Limit the progress to a reasonable range
        const limitedProgress = Math.max(0, Math.min(progress, 100))
        
        // Apply non-linear easing for smoother effect
        const easedProgress = Math.pow(limitedProgress / 100, 1.5) * 100
        
        // Calculate the final transform value with increased range
        const maxTransform = viewportHeight * speed * 1.5
        const transformValue = (easedProgress / 100) * maxTransform

        // Only update if the element is in or near the viewport
        if (rect.top < viewportHeight && rect.bottom > -viewportHeight) {
          setScrollProgress(transformValue)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    // Initial calculation
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [speed])

  return (
    <div 
      className="game-carousel" 
      ref={columnRef}
      style={{
        transform: `translateY(${scrollProgress}px)`
      }}
    >
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