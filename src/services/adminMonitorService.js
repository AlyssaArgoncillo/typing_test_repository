const getRoundColor = (round, isCompleted) => {
  if (isCompleted) return 'var(--neon-green)'
  if (round >= 6) return '#FFD700'
  if (round >= 4) return '#FFA500'
  return 'var(--light-mint)'
}

const splitPlayers = (players) => {
  const completedPlayers = players.filter((player) => player.isCompleted)
  const activePlayers = players.filter((player) => !player.isCompleted)
  return { completedPlayers, activePlayers }
}

const getCompletedCount = (players) => {
  return players.filter((player) => player.isCompleted).length
}

const buildTeamProgress = (players) => {
  const teams = {}
  players.forEach((player) => {
    if (!teams[player.team]) {
      teams[player.team] = { total: 0, completed: 0, avgRound: 0, totalRounds: 0 }
    }
    teams[player.team].total += 1
    teams[player.team].totalRounds += player.currentRound
    if (player.isCompleted) {
      teams[player.team].completed += 1
    }
  })

  Object.keys(teams).forEach((team) => {
    teams[team].avgRound = (teams[team].totalRounds / teams[team].total).toFixed(1)
  })

  return teams
}

export default {
  getRoundColor,
  splitPlayers,
  getCompletedCount,
  buildTeamProgress,
}
