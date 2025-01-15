import { Game } from '../types'

export class GuessEngine {
  private gamePool: Game[]
  private _usedGameIds: Set<number>
  
  constructor(initialGames: Game[]) {
    this.gamePool = initialGames
    this._usedGameIds = new Set()
  }

  get usedGameIds(): Set<number> {
    return this._usedGameIds
  }

  set usedGameIds(ids: Set<number>) {
    this._usedGameIds = new Set(ids)
  }

  private getRandomUnusedGame(): Game {
    const availableGames = this.gamePool.filter(game => !this._usedGameIds.has(game.id))
    
    if (availableGames.length === 0) {
      // Reset used games if we're out
      this._usedGameIds.clear()
      return this.gamePool[Math.floor(Math.random() * this.gamePool.length)]
    }
    
    return availableGames[Math.floor(Math.random() * availableGames.length)]
  }

  public selectNewGame(): Game {
    const game = this.getRandomUnusedGame()
    this._usedGameIds.add(game.id)
    return game
  }

  public checkGuess(guess: string, currentGame: Game | null): boolean {
    if (!currentGame) return false;  // Early return if game is null
    
    // Normalize strings for comparison
    const normalizeString = (str: string) => {
        return str
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
    }

    const normalizedGuess = normalizeString(guess)
    const normalizedGameName = normalizeString(currentGame.name)
    // Check for exact match first
    if (normalizedGuess === normalizedGameName) {
      return true
    }

    // Check for close matches (e.g., "CS:GO" for "Counter-Strike: Global Offensive")
    // You could implement fuzzy matching or acronym matching here
    
    // Example acronym matching:
    const createAcronym = (str: string) => {
      return str
        .split(' ')
        .map(word => word[0])
        .join('')
        .toLowerCase()
    }

    const guessAcronym = createAcronym(normalizedGuess)
    const gameAcronym = createAcronym(normalizedGameName)

    if (guessAcronym.length > 1 && guessAcronym === gameAcronym) {
      return true
    }

    // For games with colons, check if the part before the colon matches
    const gameNameParts = normalizedGameName.split(':')[0].trim()
    const guessParts = normalizedGuess.split(':')[0].trim()

    if (gameNameParts === guessParts) {
      return true
    }

    return false
  }

  public getGamePoolSize(): number {
    return this.gamePool.length
  }

  public getAvailableGamesCount(): number {
    return this.gamePool.length - this._usedGameIds.size
  }

  public reset(): void {
    this._usedGameIds.clear()
  }
}