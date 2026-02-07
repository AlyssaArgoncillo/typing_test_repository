const toAverage = (rounds) => {
  if (!rounds?.length) return 0
  const total = rounds.reduce((sum, value) => sum + value, 0)
  return Math.round(total / rounds.length)
}

const buildRankedPlayers = (players) => {
  return players
    .map((player) => ({
      ...player,
      avgWpm: toAverage(player.wpmRounds),
      avgAccuracy: toAverage(player.accuracyRounds),
    }))
    .sort((a, b) => b.avgWpm - a.avgWpm)
}

const addPlaceholders = (players, totalRows) => {
  const placeholdersNeeded = Math.max(0, totalRows - players.length)
  const placeholders = Array.from({ length: placeholdersNeeded }, (_, index) => ({
    id: `placeholder-${index}`,
    name: '--',
    team: '--',
    avgWpm: 0,
    avgAccuracy: 0,
    isPlaceholder: true,
  }))

  return [...players, ...placeholders]
}

const getMaxAverageAccuracy = (players) => {
  return Math.max(
    ...players.filter((player) => !player.isPlaceholder).map((player) => player.avgAccuracy),
    1,
  )
}

const getLeaderboardRows = (players, topCount, totalRows) => {
  const ranked = buildRankedPlayers(players)
  const topPlayers = ranked.slice(0, topCount)
  const rows = addPlaceholders(topPlayers, totalRows)
  return {
    rows,
    maxAvgAccuracy: getMaxAverageAccuracy(rows),
  }
}

const getRankedPlayers = (players) => {
  return buildRankedPlayers(players)
}

const getRankLabel = (index) => {
  if (index === 0) return '1st'
  if (index === 1) return '2nd'
  if (index === 2) return '3rd'
  return `${index + 1}th`
}

export default {
  getLeaderboardRows,
  getRankLabel,
  getRankedPlayers,
  getMaxAverageAccuracy,
}
