import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { Slash, ChevronDown } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useGaugeStore } from "../../gauge/store"
import { useGuessStore } from "../../guess/store"

const POPULAR_GENRES = [
  { value: "Action", label: "Action" },
  { value: "CO-OP", label: "Co-op" },
  { value: "Indie", label: "Indie" },
  { value: "MMO", label: "MMO" },
  { value: "RPG", label: "RPG" },
  { value: "Simulation", label: "Simulation" },
  { value: "Strategy", label: "Strategy" }
]

export function Header() {
  const location = useLocation()
  const { setGameMode: setGaugeMode } = useGaugeStore()
  const { setGameMode: setGuessMode } = useGuessStore()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const getDisplayName = (segment: string) => {
    if (segment === 'gauge') return 'Gauge'
    if (segment === 'artfuscation') return 'Artfuscation'
    if (segment === 'top100in2weeks') return 'Recent Top 100'
    if (segment === 'top100forever') return 'All-Time Top 100'
    if (segment === 'genre') return 'Genre'
    return segment.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getSegmentStyle = (segment: string, path: string[]) => {
    // First check if we're in the artfuscation or gauge path
    const isArtfuscation = path[0] === 'artfuscation'
    const isGauge = path[0] === 'gauge'

    // Base styles for different segments
    if (segment === 'top100in2weeks') {
      return 'bg-[#2563eb] hover:bg-[#1d4ed8]'
    }
    if (segment === 'top100forever') {
      return 'bg-[#dc2626] hover:bg-[#b91c1c]'
    }
    if (segment === 'genre') {
      return 'bg-[#059669] hover:bg-[#047857]'
    }
    if (segment === 'gauge') {
      return 'bg-[#F74843] hover:bg-[#ff5a55]'
    }
    if (segment === 'artfuscation') {
      return 'bg-[#9333ea] hover:bg-[#7c3aed]'  // Purple for artfuscation
    }
    return 'bg-[#2F2F2F] hover:bg-[#404040]'
  }

  const handleGenreSelect = (genre: string) => {
    // Determine which game we're in and set the mode accordingly
    if (pathSegments[0] === 'gauge') {
      setGaugeMode('genre', genre)
      window.location.href = `/gauge/genre/${genre}`
    } else if (pathSegments[0] === 'artfuscation') {
      setGuessMode('genre', genre)
      window.location.href = `/artfuscation/genre/${genre}`
    }
  }

  const currentGenre = pathSegments[2] === 'genre' ? pathSegments[3] : null

  return (
    <header className="absolute top-0 left-0 right-0 z-50 border-transparent">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        <Breadcrumb>
          <BreadcrumbList className="flex items-center text-xl font-black leading-none">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link 
                  to="/"
                  className={`bg-[#F74843] hover:bg-[#ff5a55] text-white transition-colors px-4 py-2 leading-none`}
                >
                  Steam-Gauge
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>

            {pathSegments.map((segment, index) => {
              // Skip the last segment if it's a genre value
              if (pathSegments[2] === 'genre' && index === pathSegments.length - 1) return null;

              return (
                <React.Fragment key={index}>
                  <BreadcrumbSeparator>
                    <Slash className="h-6 w-6 text-white/80" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {segment === 'genre' ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger className={`${getSegmentStyle('genre', pathSegments)} flex items-center gap-2 px-4 py-2 text-white/90`}>
                          Genre
                          <ChevronDown className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-[#1a1a1a] border-[#059669]">
                          {POPULAR_GENRES.map((genre) => (
                            <DropdownMenuItem
                              key={genre.value}
                              className="text-[#00ffa3] hover:bg-[#059669]/20 focus:bg-[#059669]/20"
                              onClick={() => handleGenreSelect(genre.value)}
                            >
                              {genre.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : segment === pathSegments[pathSegments.length - 1] ? (
                      <BreadcrumbPage className={`${getSegmentStyle(segment, pathSegments)} text-white/90 px-4 py-2 leading-none`}>
                        {getDisplayName(segment)}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link 
                          to={`/${pathSegments.slice(0, index + 1).join('/')}`}
                          className={`${getSegmentStyle(segment, pathSegments)} text-white/90 transition-colors px-4 py-2 leading-none`}
                        >
                          {getDisplayName(segment)}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              );
            })}

            {/* Show current genre if we're in a genre route */}
            {pathSegments[2] === 'genre' && currentGenre && (
              <>
                <BreadcrumbSeparator>
                  <Slash className="h-6 w-6 text-white/80" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className={`${getSegmentStyle('genre', pathSegments)} text-white/90 px-4 py-2 leading-none`}>
                    {currentGenre}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}