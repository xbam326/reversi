import mysql from 'mysql2/promise'

import { SquareGateway } from '../../../infrastructure/squareGateway'
import { TurnGateway } from '../../../infrastructure/turnGateway'
import { GameGateway } from '../../../infrastructure/gameGateway'
import { MoveGateway } from '../../../infrastructure/moveGateway'
import { Board } from './board'
import { Turn } from './turn'
import { toDisc } from './disc'
import { Point } from './point'
import { Move } from './move'

const gameGateway = new GameGateway()
const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

export class TurnRepository {
  async findForGameIdAndTurnCount(
    conn: mysql.Connection,
    gameId: number,
    turnCount: number
  ): Promise<Turn> {

    const gameRecord = await gameGateway.findLatest(conn)
    if (!gameRecord) {
      throw new Error('Latest game not found')
    }
    const turnRecord = await turnGateway.findForGameIdAndTurnCount(conn, gameId, turnCount)
    if (!turnRecord) {
      throw new Error('Supecified turn not found')
    }

    const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id)
    const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
    squareRecords.forEach((s) => {
      board[s.y][s.x] = s.disc
    })

    const moveRecord = await moveGateway.findForTurnId(conn, turnRecord.id)
    let move: Move | undefined
    if (moveRecord) {
      move = new Move(
        toDisc(moveRecord.disc),
        new Point(moveRecord.x, moveRecord.y)
      )
    }

    return new Turn(
      gameId,
      turnCount,
      toDisc(turnRecord.nextDisc),
      move,
      new Board(board),
      turnRecord.endAt
    )
  }

  async save(
    conn: mysql.Connection,
    turn: Turn
  ) {

    // ターンを保存する
    const turnRecord = await turnGateway.insert(conn, turn.gameId, turn.turnCount, turn.nextDisc, turn.endAt)

    await squareGateway.insertAll(conn, turnRecord.id, turn.board.discs)
    if (turn.move) {
      await moveGateway.insert(conn, turnRecord.id, turn.move.disc, turn.move.point.x, turn.move.point.y)
    }

  }
}