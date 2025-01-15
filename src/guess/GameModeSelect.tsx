// src/guess/GameModeSelect.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { useGuessStore } from "./store"
import { GameMode } from "./types"
import { Eye, Trophy, Gamepad2, Clock } from "lucide-react"
import Marquee from "react-fast-marquee"
import { motion } from "framer-motion"
import "./guess.css"

const POPULAR_GENRES = [
  { value: "Action", label: "Action" },
  { value: "CO-OP", label: "Co-op" },
  { value: "Indie", label: "Indie" },
  { value: "MMO", label: "MMO" },
  { value: "RPG", label: "RPG" },
  { value: "Simulation", label: "Simulation" },
  { value: "Strategy", label: "Strategy" }
]

interface ModeCardProps {
  title: string
  description: string
  icon: React.ReactNode
  mode: GameMode
  variant: 'recent' | 'alltime' | 'genre'
  genre?: string
  currentScore?: number
  highScore?: number
  onSelect: () => void
  index: number
}

function ModeCard({ 
  title, 
  description, 
  icon, 
  variant, 
  currentScore, 
  highScore, 
  onSelect,
  index 
}: ModeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`card ${variant} cursor-pointer`} onClick={onSelect}>
        <CardHeader className="card-header">
          <div className="flex items-center justify-between">
            <div className="marquee-container flex-1">
              <Marquee
                gradient={false}
                speed={40}
                delay={2}
                pauseOnHover={false}
              >
                <CardTitle className="card-title whitespace-nowrap">{title}</CardTitle>
                <span className="mx-8 text-white/90">•</span>
                <CardTitle className="card-title whitespace-nowrap">{title}</CardTitle>
                <span className="mx-8 text-white/90">•</span>
              </Marquee>
            </div>
            <motion.div 
              className="icon-gradient ml-4"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {icon}
            </motion.div>
          </div>
          <CardDescription className="card-description">{description}</CardDescription>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex flex-col h-full">
            <motion.button 
              className="play-button mt-auto"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
            >
              Play Game
            </motion.button>
            <div className="scores-container mt-8">
              <div className="flex items-center gap-3 text-muted-foreground mb-2">
                <Trophy className="w-6 h-6" />
                <span>High Score: {highScore || 0}</span>
              </div>
              {variant !== 'genre' && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Gamepad2 className="w-6 h-6" />
                  <span>Current Score: {currentScore || 0}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function GameModeSelect() {
  const navigate = useNavigate()
  const { 
    setGameMode,
    gameModeStates
  } = useGuessStore()

  const handleModeSelect = (mode: GameMode, genre?: string) => {
    setGameMode(mode, genre)
    if (genre) {
      navigate(`/artfuscation/genre/${genre}`)
    } else {
      navigate(`/artfuscation/${mode}`)
    }
  }

  const getScores = (mode: GameMode, genre?: string) => {
    const key = mode === 'genre' && genre ? `genre-${genre}` : mode
    const modeState = gameModeStates[key]
    return {
      currentScore: modeState?.currentScore || 0,
      highScore: modeState?.highScore || 0
    }
  }

  return (
    <motion.div 
      className="game-mode-select flex flex-col items-center gap-8 py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        className="title-highlight"
      >
        Artfuscation Challenge
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        className="subtitle-highlight"
      >
        Can you identify these pixelated Steam games? Get more hints as you guess!
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModeCard
          title="Recent Releases"
          description="Test your knowledge of the latest Steam hits"
          icon={<Clock className="w-6 h-6" />}
          mode="top100in2weeks"
          variant="recent"
          {...getScores('top100in2weeks')}
          onSelect={() => handleModeSelect('top100in2weeks')}
          index={0}
        />
        
        <ModeCard
          title="Classic Games"
          description="How well do you know gaming history?"
          icon={<Trophy className="w-6 h-6" />}
          mode="top100forever"
          variant="alltime"
          {...getScores('top100forever')}
          onSelect={() => handleModeSelect('top100forever')}
          index={1}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="card genre">
            <CardHeader className="card-header">
              <div className="flex items-center justify-between">
                <div className="marquee-container flex-1">
                  <Marquee
                    gradient={false}
                    speed={40}
                    delay={2}
                    pauseOnHover={false}
                  >
                    <CardTitle className="card-title whitespace-nowrap">By Genre</CardTitle>
                    <span className="mx-8 text-white/90">•</span>
                    <CardTitle className="card-title whitespace-nowrap">By Genre</CardTitle>
                    <span className="mx-8 text-white/90">•</span>
                  </Marquee>
                </div>
                <motion.div 
                  className="icon-gradient ml-4"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="w-6 h-6" />
                </motion.div>
              </div>
              <CardDescription className="card-description">
                Test your genre expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                onValueChange={(genre) => {
                  setGameMode('genre', genre)
                  navigate(`/artfuscation/genre/${genre}`)
                }}
              >
                <SelectTrigger className="select-trigger">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent className="select-content">
                  {POPULAR_GENRES.map((genre) => (
                    <SelectItem 
                      key={genre.value} 
                      value={genre.value}
                      className="select-item"
                    >
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="score-list">
                {POPULAR_GENRES.map((genre, index) => {
                  const { highScore } = getScores('genre', genre.value)
                  return (
                    <motion.div 
                      key={genre.value} 
                      className="score-list-item flex items-center justify-between text-muted-foreground"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <span>{genre.label}</span>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        <span>{highScore || 0}</span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}