import React, { useEffect, useMemo } from 'react'
import leaderboardService from '../services/leaderboardService'
import '../styles/HostLeaderboard.css'

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
  { id: 6, name: 'Person', team: 'Team Zeta', wpmRounds: [112, 118, 109, 115, 121, 110, 113], accuracyRounds: [84, 86, 83, 85, 87, 82, 84] },
  { id: 7, name: 'Person', team: 'Team Sigma', wpmRounds: [132, 138, 129, 135, 141, 130, 133], accuracyRounds: [90, 92, 89, 91, 93, 88, 90] },
]

export default function HostLeaderboard({ onStatusChange, onExit }) {
  useEffect(() => {
    if (!onStatusChange) return
    onStatusChange(['HOST LEADERBOARD', 'ALL RESULTS'])
  }, [onStatusChange])

  const rankedPlayers = useMemo(() => leaderboardService.getRankedPlayers(samplePlayers), [])
  const maxAvgAccuracy = leaderboardService.getMaxAverageAccuracy(rankedPlayers)

  return (
    <section className="host-leaderboard">
      <button
        type="button"
        className="host-leaderboard-exit"
        onClick={onExit}
      >
        &lt;&lt; exit
      </button>
      <div className="host-leaderboard-card">
        <div className="host-leaderboard-header">
          <span className="host-leaderboard-title">Host Leaderboard</span>
          <span className="host-leaderboard-subtitle">All player results</span>
        </div>

        <div className="host-leaderboard-list">
          {rankedPlayers.map((player, index) => (
            <div key={player.id} className="host-leaderboard-row">
              <div className="host-leaderboard-rank">{leaderboardService.getRankLabel(index)}</div>
              <div className="host-leaderboard-avatar" aria-hidden="true">
                <span className="host-leaderboard-avatar-text">{generateEmoji(player.id)}</span>
              </div>
              <div className="host-leaderboard-main">
                <div className="host-leaderboard-name">{player.name}</div>
                <div className="host-leaderboard-team">{player.team}</div>
                <div className="host-leaderboard-bar">
                  <div
                    className="host-leaderboard-bar-fill"
                    style={{ width: `${Math.round((player.avgAccuracy / maxAvgAccuracy) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="host-leaderboard-metrics">
                <div className="host-leaderboard-metric-value">{player.avgWpm} wpm</div>
                <div className="host-leaderboard-metric-subvalue">{player.avgAccuracy}%</div>
                <div className="host-leaderboard-metric-label">avg score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
