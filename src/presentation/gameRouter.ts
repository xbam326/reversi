import express from 'express'
import { GameService } from '../application/gameService'

export const gameRouter = express.Router()


gameRouter.post('/api/games', async (req, res) => {

  const gameService = new GameService()
  await gameService.startNewGame()

  res.status(201).end()
})