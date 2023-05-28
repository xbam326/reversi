import express from 'express'
import { StartNewGameUseCase } from '../application/useCase/startNewGameUseCase'
import { GameMySQLRepository } from '../infrastructure/repository/game/gameMySQLRepository'
import { TurnMySQLRepository } from '../infrastructure/repository/turn/turnMySQLRepository'
import { FindLastGamesMySQLQueryService } from '../infrastructure/query/findLastGamesMySQLQueryService'
import { FindLastGamesUseCase } from '../application/useCase/findLastGamesUseCase'

export const gameRouter = express.Router()

const startNewGameUseCase = new StartNewGameUseCase(
  new GameMySQLRepository(),
  new TurnMySQLRepository()
)

const fincLastGamesUseCase = new FindLastGamesUseCase(
  new FindLastGamesMySQLQueryService
)

interface GetGamesResponseBody {
  games: {
    id: number
    darkMoveCount: number
    lightMoveCount: number
    winnerDisc: number,
    startedAt: Date
    endAt: Date
  }[]
}

gameRouter.get('/api/games', async (req, res: express.Response<GetGamesResponseBody>) => {
  const output = await fincLastGamesUseCase.run()

  const responseBodyGames = output.map((g) => {
    return {
      id: g.gameId,
      darkMoveCount: g.darkMoveCount,
      lightMoveCount: g.lightMoveCount,
      winnerDisc: g.winnerDisc,
      startedAt: g.startedAt,
      endAt: g.endAt
    }
  })

  const responseBody = {
    games: responseBodyGames
  }

  res.json(responseBody)
})

gameRouter.post('/api/games', async (req, res) => {
  await startNewGameUseCase.run()

  res.status(201).end()
})