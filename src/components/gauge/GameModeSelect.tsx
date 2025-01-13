import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNavigate } from "react-router-dom"
import { useGaugeGameStore } from "./store"
import { GameMode } from "./types"
import { Trophy, Clock, Gamepad2 } from "lucide-react"
import Marquee from "react-fast-marquee"

const POPULAR_GENRES = [
  { value: "Indie", label: "Indie" },
  { value: "Action", label: "Action" },
  { value: "Strategy", label: "Strategy" },
  { value: "RPG", label: "RPG" },
  { value: "Adventure", label: "Adventure" },
  { value: "Sports", label: "Sports" },
  { value: "Simulation", label: "Simulation" },
  { value: "Early+Access", label: "Early Access" },
  { value: "Free+to+Play", label: "Free to Play" },
  { value: "Racing", label: "Racing" }
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
}

function ModeCard({ title, description, icon, variant, currentScore, highScore, onSelect }: ModeCardProps) {
  return (
    <Card className={`card ${variant} cursor-pointer`} onClick={onSelect}>
      <CardHeader className="card-header">
        <div className="flex items-center justify-between">
          <div className="marquee-container flex-1">
            <Marquee
              gradient={false}
              speed={40}
              delay={2}
              pauseOnHover={true}
            >
              <CardTitle className="card-title whitespace-nowrap">{title}</CardTitle>
              <span className="mx-8 text-white/90">•</span>
              <CardTitle className="card-title whitespace-nowrap">{title}</CardTitle>
              <span className="mx-8 text-white/90">•</span>
            </Marquee>
          </div>
          <div className="icon-gradient ml-4">{icon}</div>
        </div>
        <CardDescription className="card-description">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {highScore !== undefined && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Trophy className="w-6 h-6" />
              <span>High Score: {highScore}</span>
            </div>
          )}
          {currentScore !== undefined && currentScore > 0 && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Gamepad2 className="w-6 h-6" />
              <span>Current Score: {currentScore}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function GameModeSelect() {
  const navigate = useNavigate()
  const { 
    setSelectedGameMode, 
    setSelectedGenre,
    scores,
    setLoading 
  } = useGaugeGameStore()

  const handleModeSelect = (mode: GameMode, genre?: string) => {
    setLoading(true)
    setSelectedGameMode(mode)
    if (genre) {
      setSelectedGenre(genre)
      navigate(`/gauge/genre/${genre}`)
    } else {
      navigate(`/gauge/${mode}`)
    }
  }

  const getScores = (mode: GameMode, genre?: string) => {
    const key = mode === 'genre' && genre ? `genre-${genre}` : mode
    return scores[key] || { currentScore: 0, highScore: 0 }
  }

  return (
    <div className="game-mode-select flex flex-col items-center gap-8 py-12">
      <h1>Choose Your Challenge</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ModeCard
          title="Top 100 Recent"
          description="Compare the most played games from the last two weeks"
          icon={<Clock className="w-6 h-6" />}
          mode="top100in2weeks"
          variant="recent"
          {...getScores('top100in2weeks')}
          onSelect={() => handleModeSelect('top100in2weeks')}
        />
        
        <ModeCard
          title="All-Time Top 100"
          description="Compare the most played games since 2009"
          icon={<Trophy className="w-6 h-6" />}
          mode="top100forever"
          variant="alltime"
          {...getScores('top100forever')}
          onSelect={() => handleModeSelect('top100forever')}
        />
        
        <Card className="card genre">
          <CardHeader className="card-header">
            <div className="flex items-center justify-between">
              <div className="marquee-container flex-1">
                <Marquee
                  gradient={false}
                  speed={40}
                  delay={2}
                  pauseOnHover={true}
                >
                  <CardTitle className="card-title whitespace-nowrap">By Genre</CardTitle>
                  <span className="mx-8 text-white/90">•</span>
                  <CardTitle className="card-title whitespace-nowrap">By Genre</CardTitle>
                  <span className="mx-8 text-white/90">•</span>
                </Marquee>
              </div>
              <div className="icon-gradient ml-4">
                <Gamepad2 className="w-6 h-6" />
              </div>
            </div>
            <CardDescription className="card-description">Compare games from your favorite genre</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              onValueChange={(genre) => handleModeSelect('genre', genre)}
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
              {POPULAR_GENRES.map((genre) => {
                const { highScore } = getScores('genre', genre.value)
                if (highScore > 0) {
                  return (
                    <div key={genre.value} className="score-list-item flex items-center justify-between text-muted-foreground">
                      <span>{genre.label}</span>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        <span>{highScore}</span>
                      </div>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 