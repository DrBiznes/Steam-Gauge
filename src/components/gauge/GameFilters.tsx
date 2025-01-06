import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGaugeQueries } from "./hooks/useGaugeQueries"
import { useGaugeGameStore } from "./store"

// Generate years from 2000 to current year
const YEARS = Array.from(
  { length: new Date().getFullYear() - 1999 },
  (_, i) => new Date().getFullYear() - i
)

export function GameFilters() {
  const { genresQuery } = useGaugeQueries()
  const { setLoading, setSelectedGenre, setSelectedYear } = useGaugeGameStore()
  const { getGamesByGenre, getGamesByYear } = useGaugeQueries()

  const handleGenreChange = (genre: string) => {
    setLoading(true)
    setSelectedGenre(genre === "all" ? null : genre)
    getGamesByGenre(genre)
  }

  const handleYearChange = (year: string) => {
    setLoading(true)
    setSelectedYear(year === "all" ? null : parseInt(year))
    getGamesByYear(parseInt(year))
  }

  return (
    <div className="flex gap-4 items-center">
      <Select onValueChange={handleGenreChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by genre" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Genres</SelectItem>
          {genresQuery.data?.map((genre) => (
            <SelectItem key={genre} value={genre}>
              {genre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={handleYearChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {YEARS.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 