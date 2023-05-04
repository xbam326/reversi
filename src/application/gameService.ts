import { connectMySQL } from '../infrastructure/connection'
import { GameGateway } from '../infrastructure/gameGateway'
import { Game } from '../domain/model/game/game'
import { GameRepository } from '../domain/model/game/gameRepository'
import { firstTurn } from '../domain/model/turn/turn'
import { TurnRepository } from '../domain/model/turn/turnRepository'

const gameGateway = new GameGateway()

const gameRepository = new GameRepository()
const turnRepository = new TurnRepository()

export class GameService {
  async startNewGame() {
    const now = new Date()
    const conn = await connectMySQL()

    try {
      await conn.beginTransaction()

      const game = await gameRepository.save(conn, new Game(undefined, now))
      if (!game.id) {
        throw new Error('game.id is not exist')
      }
      const turn = firstTurn(game.id, now)
      await turnRepository.save(conn, turn)
      await conn.commit()
    } finally {
      await conn.end()
    }
  }
}