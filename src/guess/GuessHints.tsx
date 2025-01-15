import { motion, AnimatePresence } from "framer-motion"
import { Hint } from "./types"
import "./guess.css"

interface GuessHintsProps {
  hints: Hint[]
}

export function GuessHints({ hints }: GuessHintsProps) {
  return (
    <div className="guess-hints-container">
      <div className="hints-header">
        <h3 className="hints-title">Hints</h3>
        <span className="hints-count">{hints.length} / 5</span>
      </div>
      
      <AnimatePresence>
        <div className="hints-list">
          {hints.map((hint, index) => (
            <motion.div
              key={`${hint.type}-${index}`}
              className="hint-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="hint-content">
                <div className="hint-type">{hint.type}</div>
                <div className="hint-text">{hint.text}</div>
              </div>
            </motion.div>
          ))}
          
          {/* Placeholder hints */}
          {Array.from({ length: Math.max(0, 5 - hints.length) }).map((_, index) => (
            <div 
              key={`placeholder-${index}`} 
              className="hint-card placeholder"
            >
              <div className="hint-content">
                <div className="hint-placeholder">???</div>
              </div>
            </div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  )
} 