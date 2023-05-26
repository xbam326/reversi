import express from 'express'
import { StartNewGameUseCase } from '../application/useCase/startNewGameUseCase'
import { GameMySQLRepository } from '../infrastructure/repository/game/gameMySQLRepository'
import { TurnMySQLRepository } from '../infrastructure/repository/turn/turnMySQLRepository'

export const gameRouter = express.Router()


gameRouter.post('/api/games', async (req, res) => {

  const startNewGameUseCase = new StartNewGameUseCase(
    new GameMySQLRepository(),
    new TurnMySQLRepository()
  )
  await startNewGameUseCase.run()

  res.status(201).end()
})