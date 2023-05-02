import express from 'express'
import { connectMySQL } from '../dataaccess/connection'
import { SquareGateway } from '../dataaccess/squareGateway'
import { TurnGateway } from '../dataaccess/turnGateway'
import { GameGateway } from '../dataaccess/gameGateway'
import { DARK, LIGHT } from '../application/constants'
import { MoveGateway } from '../dataaccess/moveGateway'

export const turnRouter = express.Router()

const gameGateway = new GameGateway()
const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()


turnRouter.get('/api/games/latest/turns/:turnCount', async (req, res) => {
  const turnCount = parseInt(req.params.turnCount)

  const conn = await connectMySQL()

  try {

    const gameRecord = await gameGateway.findLatest(conn)
    if (!gameRecord) {
      throw new Error('Latest game not found')
    }
    const turnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, turnCount)
    if (!turnRecord) {
      throw new Error('Supecified turn not found')
    }

    const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id)
    const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc
    })
    const responseBody = {
      turnCount,
      board,
      nextDisc: turnRecord.nextDisc,
      // TODO 決着がついている場合、game_resultテーブルから取得する
      winnerDisc: null
    }
    res.json(responseBody)
  } finally {
    await conn.end()
  }

})

turnRouter.post('/api/games/latest/turns/', async (req, res) => {
  const turnCount = parseInt(req.body.turnCount)
  const disc = parseInt(req.body.move.disc)
  const x = parseInt(req.body.move.x)
  const y = parseInt(req.body.move.y)

  const conn = await connectMySQL()

  try {
    // 1つ前のターンを取得する
    const gameRecord = await gameGateway.findLatest(conn)
    if (!gameRecord) {
      throw new Error('Latest game not found')
    }
    const previousTurnCount = turnCount - 1
    const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameRecord.id, previousTurnCount)
    if (!previousTurnRecord) {
      throw new Error('Supecified turn not found')
    }

    const squareRecords = await squareGateway.findForTurnId(conn, previousTurnRecord.id)
    const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc
    })
    // 盤面に置けるかチェックする

    // 石を置く
    board[y][x] = disc
    console.log(board)

    // ひっくり返す

    // ターンを保存する
    const nextDisc = disc === DARK ? LIGHT : DARK
    const now = new Date()
    const turnRecord = await turnGateway.insert(conn, gameRecord.id, turnCount, nextDisc, now)

    await squareGateway.insertAll(conn, turnRecord.id, board)

    await moveGateway.insert(conn, turnRecord.id, disc, x, y)

    await conn.commit()
  } finally {
    await conn.end()
  }



  res.status(201).end()
})
