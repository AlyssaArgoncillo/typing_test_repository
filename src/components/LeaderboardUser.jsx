import React, { useEffect, useMemo } from 'react'
import leaderboardService from '../services/leaderboardService'
import '../styles/LeaderboardUser.css'

const EMOJIS = ['👨‍💻', '👩‍💻', '🧑‍💻', '🎮', '🎯', '🚀', '✨', '🌟', '⚡', '🎨', '🔥', '💎', '🏆', '🎭', '🎪']

const generateEmoji = (playerId) => {
  return EMOJIS[playerId % EMOJIS.length]
}

// Dummy data for UI layout only. Backend will replace this.
const samplePlayers = [
  { id: 1, name: 'Person', team: 'Team Alpha', wpmRounds: [168, 174, 169, 170, 167, 173, 171], accuracyRounds: [98, 97, 99, 98, 97, 99, 98] },
  { id: 2, name: 'Person', team: 'Team Beta', wpmRounds: [122, 128, 119, 125, 131, 120, 123], accuracyRounds: [88, 90, 87, 89, 91, 86, 88] },
  { id: 3, name: 'Person', team: 'Team Gamma', wpmRounds: [98, 104, 96, 102, 101, 100, 99], accuracyRounds: [76, 79, 75, 78, 80, 77, 76] },
  { id: 4, name: 'Person', team: 'Team Delta', wpmRounds: [86, 89, 91, 83, 88, 84, 86], accuracyRounds: [69, 70, 72, 68, 71, 69, 70] },
  { id: 5, name: 'Person', team: 'Team Echo', wpmRounds: [74, 76, 71, 78, 73, 75, 72], accuracyRounds: [62, 64, 61, 63, 65, 62, 63] },
]

export default function LeaderboardUser({ onStatusChange, onExit }) {
  useEffect(() => {
    if (!onStatusChange) return
    onStatusChange(['LEADERBOARD', 'TOP 3'])
  }, [onStatusChange])

  const { rows: rankedPlayers, maxAvgAccuracy } = useMemo(() => {
    return leaderboardService.getLeaderboardRows(samplePlayers, 3, 5)
  }, [])

  return (
    <section className="leaderboard-user">
      <button
        type="button"
        className="leaderboard-exit"
        onClick={onExit}
      >
        &lt;&lt; exit
      </button>
      <div className="leaderboard-card">
        <div className="leaderboard-header">
          <span className="leaderboard-title">Leaderboard</span>
          <span className="leaderboard-subtitle">Top performers</span>
        </div>

        <div className="leaderboard-list">
          {rankedPlayers.map((player, index) => (
            <div
              key={player.id}
              className={`leaderboard-row ${player.isPlaceholder ? 'leaderboard-row--placeholder' : ''}`}
            >
              <div className="leaderboard-rank">{leaderboardService.getRankLabel(index)}</div>
              <div className="leaderboard-avatar" aria-hidden="true">
                <span className="leaderboard-avatar-text">
                  {player.isPlaceholder ? '' : generateEmoji(player.id)}
                </span>
              </div>
              <div className="leaderboard-main">
                <div className="leaderboard-name">{player.name}</div>
                <div className="leaderboard-team">{player.team}</div>
                <div className="leaderboard-bar">
                  <div
                    className="leaderboard-bar-fill"
                    style={{ width: `${Math.round((player.avgAccuracy / maxAvgAccuracy) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="leaderboard-metrics">
                <div className="leaderboard-metric-value">
                  {player.isPlaceholder ? '--' : `${player.avgWpm} wpm`}
                </div>
                <div className="leaderboard-metric-subvalue">
                  {player.isPlaceholder ? '--' : `${player.avgAccuracy}%`}
                </div>
                <div className="leaderboard-metric-label">avg score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
