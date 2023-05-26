import express from 'express'
import { RegisterTurnUseCase } from '../application/useCase/registerTurnUseCase'
import { FindLatestGameTurnByTurnCountUseCase } from '../application/useCase/findLatestGameTurnByTurnCountUseCase'
import { Point } from '../domain/model/turn/point'
import { toDisc } from '../domain/model/turn/disc'
import { TurnMySQLRepository } from '../infrastructure/repository/turn/turnMySQLRepository'
import { GameMySQLRepository } from '../infrastructure/repository/game/gameMySQLRepository'
import { GameResultMySQLRepository } from '../infrastructure/repository/gameResult/gameResultMySQLRepository'

export const turnRouter = express.Router()

const registerTurnUseCase = new RegisterTurnUseCase(
  new TurnMySQLRepository,
  new GameMySQLRepository,
  new GameResultMySQLRepository

)
const findLatestGameTurnByTurnCountUseCase = new FindLatestGameTurnByTurnCountUseCase(
  new TurnMySQLRepository,
  new GameMySQLRepository,
  new GameResultMySQLRepository
)

interface TurnGetResponseBody {
  turnCount: number
  board: number[][]
  nextDisc: number | null
  winnerDisc: number | null
}

interface TurnPostRequestBody {
  turnCount: number
  move: {
    disc: number
    x: number
    y: number
  }
}

turnRouter.get('/api/games/latest/turns/:turnCount', async (req, res: express.Response<TurnGetResponseBody>) => {
  const turnCount = parseInt(req.params.turnCount)

  const output = await findLatestGameTurnByTurnCountUseCase.run(turnCount)

  const responseBody = {
    turnCount: output.turnCount,
    board: output.board,
    nextDisc: output.nextDisc ?? null,
    winnerDisc: output.winnerDisc ?? null,
  }
  res.json(responseBody)

})

turnRouter.post('/api/games/latest/turns/', async (req: express.Request<{}, {}, TurnPostRequestBody>, res) => {
  const turnCount = req.body.turnCount
  const disc = toDisc(req.body.move.disc)

  const point = new Point(req.body.move.x, req.body.move.y)
  await registerTurnUseCase.run(turnCount, disc, point)

  res.status(201).end()
})
