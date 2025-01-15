import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lightbulb, SkipForward } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Game } from "./types"
import { cn } from "@/lib/utils"

interface GuessInputProps {
  onSubmit: (guess: string) => Promise<void>
  onSkip: () => Promise<void>
  onHint: () => void
  isSubmitting: boolean
  isRevealed: boolean
  gamePool: Game[]
}

export function GuessInput({ 
  onSubmit, 
  onSkip, 
  onHint, 
  isSubmitting, 
  isRevealed,
  gamePool 
}: GuessInputProps) {
  const [guess, setGuess] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (!guess.trim()) {
      setSuggestions([])
      return
    }

    const normalizedInput = guess.toLowerCase().trim()
    const filtered = gamePool
      .map(game => game.name)
      .filter(name => 
        name.toLowerCase().includes(normalizedInput) ||
        name.toLowerCase().split(' ').some(word => word.startsWith(normalizedInput))
      )
      .slice(0, 5) // Limit to 5 suggestions

    setSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
    setSelectedIndex(-1)
  }, [guess, gamePool])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guess.trim() || isSubmitting) return

    await onSubmit(guess)
    setGuess("")
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex > -1) {
          setGuess(suggestions[selectedIndex])
          setShowSuggestions(false)
          setSelectedIndex(-1)
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="w-full max-w-2xl space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter game name..."
            value={guess}
            onChange={(e) => {
              setGuess(e.target.value)
              setShowSuggestions(true)
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-[#2F2F2F] text-white border-none"
            disabled={isSubmitting || isRevealed}
            autoComplete="off"
          />
          <Button 
            type="submit"
            className="bg-[#F74843] hover:bg-[#ff5a55] text-white"
            disabled={isSubmitting || isRevealed}
          >
            Guess
          </Button>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 mt-1 bg-[#2F2F2F] border border-[#3F3F3F] rounded-md overflow-hidden z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className={cn(
                      "px-3 py-2 cursor-pointer hover:bg-[#3F3F3F] text-white",
                      selectedIndex === index && "bg-[#3F3F3F]"
                    )}
                    onClick={() => {
                      setGuess(suggestion)
                      setShowSuggestions(false)
                      inputRef.current?.focus()
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            className="bg-[#2F2F2F] text-white border-none hover:bg-[#404040]"
            onClick={onHint}
            disabled={isSubmitting || isRevealed}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Hint
          </Button>
          <Button
            type="button"
            variant="outline"
            className="bg-[#2F2F2F] text-white border-none hover:bg-[#404040]"
            onClick={onSkip}
            disabled={isSubmitting}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip Game
          </Button>
        </div>
      </form>
    </div>
  )
} 