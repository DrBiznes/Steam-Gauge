// src/guess/GuessHints.tsx

import { motion } from "framer-motion"
import { Hint } from "./types"
import { Eye, Users, Star, AlignLeft, Calendar, Tags, Gamepad, ChevronLeft, ChevronRight } from "lucide-react"
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
  const revealedCount = hints.filter(h => h.revealed).length
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-advance to newly revealed hint
  useEffect(() => {
    if (isMobile && revealedCount > 0) {
      setActiveHint(revealedCount - 1)
      scrollToHint(revealedCount - 1)
    }
  }, [revealedCount, isMobile])

  const scrollToHint = (index: number) => {
    if (!hintsListRef.current) return
    const cardWidth = 300 // Match the CSS width
    const scrollPosition = index * (cardWidth + 16) // 16px for gap
    hintsListRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    })
  }

  const handleNavigation = (direction: 'prev' | 'next') => {
    const revealedHints = hints.filter(h => h.revealed)
    const maxIndex = revealedHints.length - 1
    let newIndex = direction === 'next' ? activeHint + 1 : activeHint - 1

    if (newIndex < 0) newIndex = maxIndex
    if (newIndex > maxIndex) newIndex = 0

    setActiveHint(newIndex)
    scrollToHint(newIndex)
  }

  // Sort hints by order
  const sortedHints = [...hints].sort((a, b) => a.order - b.order)
  const revealedHints = sortedHints.filter(h => h.revealed)

  return (
    <div className="guess-hints-container">
      <div className="hints-header">
        <h3 className="hints-title">Hints</h3>
        <span className="hints-count">
          {revealedCount} / {hints.length}
        </span>
      </div>
      
      {isMobile ? (
        <>
          <div className="hints-list" ref={hintsListRef}>
            {sortedHints.map((hint, index) => (
              <motion.div
                key={`${hint.type}-${index}`}
                className={getHintClass(hint)}
                initial={{ opacity: 0 }}
                animate={{ opacity: hint.revealed ? 1 : 0.3 }}
                transition={{ duration: 0.3 }}
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

          {revealedHints.length > 1 && (
            <div className="hints-navigation">
              <button 
                className="hint-nav-button hint-nav-prev"
                onClick={() => handleNavigation('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="hints-scroll-indicator">
                {revealedHints.map((_, index) => (
                  <div 
                    key={index}
                    className={`scroll-dot ${index === activeHint ? 'active' : ''}`}
                    onClick={() => {
                      setActiveHint(index)
                      scrollToHint(index)
                    }}
                  />
                ))}
              </div>
              <button 
                className="hint-nav-button hint-nav-next"
                onClick={() => handleNavigation('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="hints-list">
          {sortedHints.map((hint, index) => (
            <motion.div
              key={`${hint.type}-${index}`}
              className={getHintClass(hint)}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05
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
      )}
    </div>
  )
}