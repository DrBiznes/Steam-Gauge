// src/guess/GuessHints.tsx

import { motion } from "framer-motion"
import { Hint } from "./types"
import { Eye, Users, Star, AlignLeft, Calendar, Tags, Gamepad } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import "./guess.css"

interface GuessHintsProps {
  hints: Hint[]
}

// Helper function to get icon for hint type
function getHintIcon(hint: Hint) {
  switch (hint.type) {
    case 'reviewScore':
      return <Star className="w-4 h-4" />
    case 'playerCount':
      return <Users className="w-4 h-4" />
    case 'developer':
      return <Gamepad className="w-4 h-4" />
    case 'genre':
      return <Tags className="w-4 h-4" />
    case 'releaseDate':
      return <Calendar className="w-4 h-4" />
    case 'firstLetter':
    case 'secondLetter':
      return <AlignLeft className="w-4 h-4" />
    default:
      return <Eye className="w-4 h-4" />
  }
}

// Helper function to get hint class based on type
function getHintClass(hint: Hint) {
  // Base classes
  const baseClasses = "hint-card transition-all duration-300"
  
  if (!hint.revealed) {
    return `${baseClasses} placeholder`
  }

  // Add specific classes based on hint source and type
  if (hint.source === 'steamstore') {
    return `${baseClasses} enhanced`
  }
  
  return `${baseClasses} basic`
}

export function GuessHints({ hints }: GuessHintsProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [activeHint, setActiveHint] = useState(0)
  const hintsListRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!isMobile || !hintsListRef.current) return

    const handleScroll = () => {
      const container = hintsListRef.current
      if (!container) return

      const scrollLeft = container.scrollLeft
      const cardWidth = container.offsetWidth * 0.85 // 85% of container width
      const newActiveHint = Math.round(scrollLeft / cardWidth)
      setActiveHint(newActiveHint)
    }

    const container = hintsListRef.current
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  // Sort hints by order
  const sortedHints = [...hints].sort((a, b) => a.order - b.order)

  return (
    <div className="guess-hints-container">
      <div className="hints-header">
        <h3 className="hints-title">Hints</h3>
        <span className="hints-count">
          {hints.filter(h => h.revealed).length} / {hints.length}
        </span>
      </div>
      
      <div className="hints-list" ref={hintsListRef}>
        {sortedHints.map((hint, index) => (
          <motion.div
            key={`${hint.type}-${index}`}
            className={getHintClass(hint)}
            initial={isMobile ? { opacity: 1 } : { opacity: 0, height: 0 }}
            animate={isMobile 
              ? { opacity: 1 } 
              : { opacity: 1, height: "auto" }
            }
            transition={{ 
              duration: isMobile ? 0 : 0.3,
              delay: isMobile ? 0 : index * 0.05
            }}
          >
            {hint.revealed ? (
              <div className="hint-content">
                <div className="hint-header">
                  <div className="hint-icon">
                    {getHintIcon(hint)}
                  </div>
                  <div className="hint-type">
                    {hint.type === 'firstLetter' || hint.type === 'secondLetter' 
                      ? 'Letter Reveal' 
                      : hint.type.charAt(0).toUpperCase() + hint.type.slice(1)}
                  </div>
                </div>
                <div className="hint-text">{hint.text}</div>
              </div>
            ) : (
              <div className="hint-content placeholder">
                <div className="hint-placeholder">???</div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {isMobile && hints.length > 1 && (
        <div className="hints-scroll-indicator">
          {sortedHints.map((_, index) => (
            <div 
              key={index}
              className={`scroll-dot ${index === activeHint ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}