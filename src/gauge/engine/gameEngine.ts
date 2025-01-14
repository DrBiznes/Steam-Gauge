import { Game, GameState } from '../types'

export class GameEngine {
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

  private getRandomUnusedGames(): [Game, Game] {
    const availableGames = this.gamePool.filter(game => !this._usedGameIds.has(game.id))
    
    if (availableGames.length < 2) {
      // Reset used games if we're running low
      this._usedGameIds.clear()
      return this.getRandomPair(this.gamePool)
    }
    
    return this.getRandomPair(availableGames)
  }

  private getRandomPair(games: Game[]): [Game, Game] {
    const shuffled = [...games].sort(() => Math.random() - 0.5)
    return [shuffled[0], shuffled[1]]
  }

  public selectNewGames(): GameState {
    const [leftGame, rightGame] = this.getRandomUnusedGames()
    
    // Mark these games as used
    this._usedGameIds.add(leftGame.id)
    this._usedGameIds.add(rightGame.id)

    return {
      leftGame,
      rightGame,
      revealed: false,
      isTransitioning: false
    }
  }

  public checkGuess(position: 'left' | 'right', state: GameState): boolean {
    if (!state.leftGame || !state.rightGame) return false

    const leftScore = state.leftGame.steamScore
    const rightScore = state.rightGame.steamScore

    return (position === 'left' && leftScore > rightScore) ||
           (position === 'right' && rightScore > leftScore)
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