import { connectMySQL } from '../../infrastructure/connection'
import { GameGateway } from '../../infrastructure/repository/game/gameGateway'
import { Game } from '../../domain/model/game/game'
import { firstTurn } from '../../domain/model/turn/turn'
import { GameRepository } from '../../domain/model/game/gameRepository'
import { TurnRepository } from '../../domain/model/turn/turnRepository'

const gameGateway = new GameGateway()

export class GameService {
  constructor(
    private _gameRepository: GameRepository,
    private _turnRepository: TurnRepository
  ) { }

  async startNewGame() {
    const now = new Date()
    const conn = await connectMySQL()

    try {
      await conn.beginTransaction()

      const game = await this._gameRepository.save(conn, new Game(undefined, now))
      if (!game.id) {
        throw new Error('game.id is not exist')
      }
      const turn = firstTurn(game.id, now)
      await this._turnRepository.save(conn, turn)
      await conn.commit()
    } finally {
      await conn.end()
    }
  }
}