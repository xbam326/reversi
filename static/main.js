const gameTableBodyElement = document.getElementById('games-table-body')

async function showGames(){
  const response = await fetch('/api/games')
  const responseBody = await response.json()
  console.log(responseBody.games)
  const games = responseBody.games

  while(gameTableBodyElement.firstChild){
    gameTableBodyElement.removeChild(gameTableBodyElement.firstChild)
  }

  games.forEach( game => {
    const trElement = document.createElement('tr')

    const appendTdElement = (innerText) => {
      const tdElement = document.createElement('td')
      tdElement.innerText = innerText
      trElement.appendChild(tdElement)
    }

    appendTdElement(game.darkMoveCount)
    appendTdElement(game.lightMoveCount)
    appendTdElement(game.winnerDisc)
    appendTdElement(game.startedAt)
    appendTdElement(game.endAt)

    gameTableBodyElement.appendChild(trElement)
  });

}

showGames()