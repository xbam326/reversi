import mysql from 'mysql2/promise'

export async function connectMySQL() {
  return mysql.createConnection({
    host: 'localhost',
    database: 'reversi',
    user: 'reversi',
    password: 'password'
  })
}
