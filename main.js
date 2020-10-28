
let initData = {}
let flagChance = 0
let getOrderList

let dice = {
    sides: 6,
    roll: function() {
        return Math.floor(Math.random() * this.sides) + 1
    } 
}

const onSubmitInitForm = () => {
    const playerNoEl = document.getElementById('playerNo')
    const playerTargetEl = document.getElementById('pointTarget')
    let totalPlayers = playerNoEl.value
    let playerTarget = playerTargetEl.value
    if(totalPlayers && playerTarget) {
        initData = {totalPlayers, playerTarget}
        Object.freeze(initData)
        let initForm = document.getElementById('initForm')
        initForm.remove()
        renderPlayerList()
        renderLeaderBoard()
    } else {
        alert('Please fill all the fields!')
    }
}

const generateOrder = () => {
    let orders = []
    for(let i=0; i<initData.totalPlayers; i++) {
        let player = {
            name: `Player-${i+1}`,
            points: 0,
            countOnes: 0
        }
        orders.push(player)
    }
    let orderList = orders.sort( () => .5 - Math.random() )
    return () => orderList
}

const onDiceRoll = () => {
    const rollValue = dice.roll()
    const playerList = getOrderList()
    playerList[flagChance]['points'] += rollValue

    //Add points
    const chanceRoll = document.getElementById('chanceRoll')
    chanceRoll.innerText = `${playerList[flagChance]['name']} rolled ${rollValue}`
    const playersListDiv = document.getElementsByClassName('player')
    let playerEl = playersListDiv[flagChance]
    const playerPoints = playerEl.querySelector('.playerPoints')
    const points = playerList[flagChance]['points']
    playerPoints.innerText = `Points: ${points}`
    if(rollValue === 1){
        playerList[flagChance]['countOnes'] += 1
        if(playerList[flagChance]['countOnes'] === 2) {
            alert('Penalty! Your next chance will be skipped. ')
        }
    } else {
        playerList[flagChance]['countOnes'] = 0
    }
    updateLeaderBoard(playerList[flagChance])

    //if target achieved or rolled 6
    if(points >= initData.playerTarget){
        alert('Congratulations! You have completed the game.')
        playerEl.classList.add('target-achieved')
    } else if(rollValue === 6) {
        alert('Yay! You got another chance')
        return
    }

    //update next player
    //skip chance if continous 2 ones are there or target is achived
    flagChance = (flagChance+1) % initData.totalPlayers
    let counter = playerList.length+1
    while(counter && (playerList[flagChance]['countOnes'] === 2 || playerList[flagChance]['points'] >= initData.playerTarget)) {
        playerList[flagChance]['countOnes'] = 0
        flagChance = (flagChance+1) % initData.totalPlayers
        --counter
    }

    //If all player have achieved the target
    if(!counter) {
        document.querySelector('.rollButton').disabled = true
        return
    }

    document.getElementById('chanceFlag').innerText = `${playerList[flagChance]['name']} it's your turn.`
    playerEl.classList.remove("selected-player")
    playerEl = playersListDiv[flagChance]
    playerEl.classList.add("selected-player")
}

const updateLeaderBoard = ({name, points}) => {
    const leaderboardList = document.getElementsByClassName('lead-player')
    let start, end
    for(let i=0; i<leaderboardList.length; i++) {
        let playerPoint = parseInt(leaderboardList[i].querySelector('.lead-points').innerText)
        let playerName = leaderboardList[i].querySelector('.lead-name').innerText
        if(isNaN(start) && playerPoint < initData.playerTarget) {
            start = i
        }
        if(playerName === name) {
            leaderboardList[i].querySelector('.lead-points').innerText = points
            end = i
            break
        }
    }

    for(let i=end; i>start;i--) {
        let playerPoint1 = parseInt(leaderboardList[i].querySelector('.lead-points').innerText)
        let playerPoint2 = parseInt(leaderboardList[i-1].querySelector('.lead-points').innerText)
        if(playerPoint1 > playerPoint2){
            leaderboardList[i].querySelector('.lead-points').innerText = playerPoint2
            leaderboardList[i-1].querySelector('.lead-points').innerText = playerPoint1

            let temp =leaderboardList[i].querySelector('.lead-name').innerText
            leaderboardList[i].querySelector('.lead-name').innerText = leaderboardList[i-1].querySelector('.lead-name').innerText
            leaderboardList[i-1].querySelector('.lead-name').innerText = temp
        } else break
    }
}

const renderPlayerList = () => {
    getOrderList = generateOrder()
    const playerList = getOrderList()
    const rootEl = document.getElementById('root')
    rootEl.style.display = 'block'

    const chanceDiv = document.createElement("div")
    chanceDiv.classList.add('chance')
    chanceDiv.id = 'chanceFlag'
    chanceDiv.innerText = `${playerList[flagChance]['name']} it's your turn`

    const chanceRoll = document.createElement('div')
    chanceRoll.classList.add('chance-roll')
    chanceRoll.id = 'chanceRoll'
    chanceRoll.innerText = 'Please Roll the Dice'

    const playersDiv = document.createElement("div")
    playersDiv.classList.add("playersList")

    for(let i=0; i<playerList.length; i++ ) {
        const playerEl = document.createElement("div")
        playerEl.classList.add("player")
        if(i === flagChance) playerEl.classList.add("selected-player")

        const playerName = document.createElement("div")
        playerName.classList.add("playerName")
        playerName.innerText = playerList[i]['name']

        const playerPoints = document.createElement("div")
        playerPoints.classList.add("playerPoints")
        playerPoints.innerText = `Points: ${playerList[i]['points']}`

        playerEl.appendChild(playerName)
        playerEl.appendChild(playerPoints)
        playersDiv.appendChild(playerEl)
    }

    const rollButton = document.createElement('button')
    rollButton.classList.add('rollButton')
    rollButton.innerText = 'ROLL'
    rollButton.addEventListener('click', onDiceRoll)
    rollButton.addEventListener('keypress', onDiceRoll)

    rootEl.appendChild(playersDiv)
    rootEl.appendChild(chanceDiv)   
    rootEl.appendChild(chanceRoll)
    rootEl.appendChild(rollButton)
}

const renderLeaderBoard = () => {
    const boardList = [...getOrderList()]
    const root = document.getElementById('root')
    const leaderBoardEl = document.createElement('div')
    leaderBoardEl.classList.add('leaderboard')

    const headerEl = document.createElement('div')
    headerEl.classList.add('lead-header')
    headerEl.innerText = 'Leaderboard'

    const headerRow = document.createElement('div')
    headerRow.classList.add('header')
    const headerRank = document.createElement('span')
    headerRank.classList.add('header-rank')
    headerRank.innerText = 'Rank'

    const headerName = document.createElement('span')
    headerName.classList.add('header-name')
    headerName.innerText = 'Player Name'

    const headerPoints = document.createElement('span')
    headerPoints.classList.add('header-points')
    headerPoints.innerText = 'Points'

    headerRow.appendChild(headerRank)
    headerRow.appendChild(headerName)
    headerRow.appendChild(headerPoints)

    leaderBoardEl.appendChild(headerRow)
    for(let i=0; i<boardList.length; i++) {
        const leadPlayerEl = document.createElement('div')
        leadPlayerEl.classList.add('lead-player')

        const playerRank = document.createElement('span')
        playerRank.classList.add('lead-rank')
        playerRank.innerText = `${i+1}. `

        const playerName = document.createElement('span')
        playerName.classList.add('lead-name')
        playerName.innerText = boardList[i]['name']

        const playerPoints = document.createElement('span')
        playerPoints.classList.add('lead-points')
        playerPoints.innerText = boardList[i]['points']

        leadPlayerEl.appendChild(playerRank)
        leadPlayerEl.appendChild(playerName)
        leadPlayerEl.appendChild(playerPoints)
        leaderBoardEl.appendChild(leadPlayerEl)
    }
    root.appendChild(leaderBoardEl)
}