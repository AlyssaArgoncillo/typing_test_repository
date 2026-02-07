import React, { useEffect, useMemo, useState } from 'react'
import adminMonitorService from '../services/adminMonitorService'
import '../styles/AdminMonitor.css'

const EMOJIS = ['👨‍💻', '👩‍💻', '🧑‍💻', '🎮', '🎯', '🚀', '✨', '🌟', '⚡', '🎨', '🔥', '💎', '🏆', '🎭', '🎪']

const generateEmoji = (playerId) => {
  return EMOJIS[playerId % EMOJIS.length]
}

export default function HostMonitoring({ onStatusChange, onComplete }) {
  const [players, setPlayers] = useState([])

  // Dummy data - In production, this will come from backend.
  const dummyPlayers = useMemo(
    () => [
      { id: 1, name: 'Player 1', team: 'Team Alpha', currentRound: 3, isCompleted: false, wpm: 65, accuracy: 92 },
      { id: 2, name: 'Player 2', team: 'Team Beta', currentRound: 5, isCompleted: false, wpm: 78, accuracy: 88 },
      { id: 3, name: 'Player 3', team: 'Team Alpha', currentRound: 7, isCompleted: true, wpm: 82, accuracy: 95 },
      { id: 4, name: 'Player 4', team: 'Team Gamma', currentRound: 4, isCompleted: false, wpm: 71, accuracy: 90 },
      { id: 5, name: 'Player 5', team: 'Team Beta', currentRound: 6, isCompleted: false, wpm: 69, accuracy: 86 },
      { id: 6, name: 'Player 6', team: 'Team Delta', currentRound: 2, isCompleted: false, wpm: 55, accuracy: 94 },
      { id: 7, name: 'Player 7', team: 'Team Gamma', currentRound: 7, isCompleted: true, wpm: 91, accuracy: 97 },
      { id: 8, name: 'Player 8', team: 'Team Delta', currentRound: 5, isCompleted: false, wpm: 73, accuracy: 89 },
    ],
    [],
  )

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // TODO: Replace with actual API call or WebSocket connection
        const normalizedPlayers = dummyPlayers.map((player) => ({
          id: player.id,
          name: player.name || 'Unknown',
          team: player.team || 'No Team',
          currentRound: player.currentRound || 1,
          isCompleted: player.isCompleted || false,
          wpm: player.wpm || 0,
          accuracy: player.accuracy || 0,
        }))

        setPlayers(normalizedPlayers)
      } catch (error) {
        console.error('Failed to fetch players:', error)
        setPlayers([])
      }
    }

    fetchPlayers()

    const interval = setInterval(() => {
      setPlayers((prevPlayers) =>
        prevPlayers.map((player) => {
          if (player.isCompleted) return player

          if (Math.random() > 0.7) {
            const newRound = Math.min(player.currentRound + 1, 7)
            return {
              ...player,
              currentRound: newRound,
              isCompleted: newRound === 7,
              wpm: player.wpm + Math.floor(Math.random() * 5),
              accuracy: Math.min(100, player.accuracy + Math.floor(Math.random() * 3)),
            }
          }
          return player
        }),
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [dummyPlayers])

  useEffect(() => {
    if (!onStatusChange) return
    const completedCount = adminMonitorService.getCompletedCount(players)
    onStatusChange(['HOST MONITOR', `${completedCount}/${players.length} DONE`])
  }, [onStatusChange, players])

  useEffect(() => {
    // Auto-transition to host leaderboard when all players complete
    if (players.length > 0 && onComplete) {
      const completedCount = adminMonitorService.getCompletedCount(players)
      if (completedCount === players.length) {
        setTimeout(() => onComplete(), 2000) // 2 second delay before transition
      }
    }
  }, [players, onComplete])

  const { completedPlayers, activePlayers } = useMemo(
    () => adminMonitorService.splitPlayers(players),
    [players],
  )

  const teamProgress = useMemo(() => adminMonitorService.buildTeamProgress(players), [players])

  return (
    <section className="admin-monitor">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-title">Host Monitoring</div>
        </div>
        <div className="admin-summary-cards">
          <div className="summary-card summary-total">
            <span className="summary-label">Total</span>
            <span className="summary-value">{players.length}</span>
          </div>
          <div className="summary-card summary-active">
            <span className="summary-label">In Progress</span>
            <span className="summary-value">{activePlayers.length}</span>
          </div>
          <div className="summary-card summary-completed">
            <span className="summary-label">Completed</span>
            <span className="summary-value">{completedPlayers.length}</span>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <h3 className="section-title">Team Progress</h3>
          <div className="team-progress-grid">
            {Object.entries(teamProgress).map(([teamName, stats]) => (
              <div key={teamName} className="team-progress-card">
                <div className="team-progress-name">{teamName}</div>
                <div className="team-progress-stats">
                  <div className="team-stat">
                    <span className="team-stat-value">{stats.completed}/{stats.total}</span>
                    <span className="team-stat-label">Completed</span>
                  </div>
                  <div className="team-stat">
                    <span className="team-stat-value">Rd {stats.avgRound}</span>
                    <span className="team-stat-label">Avg Round</span>
                  </div>
                </div>
                <div className="team-progress-bar">
                  <div
                    className="team-progress-fill"
                    style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h3 className="section-title">Active Players ({activePlayers.length})</h3>
          <div className="players-grid">
            {activePlayers.map((player) => (
              <div key={player.id} className="player-card">
                <div className="player-header">
                  <span className="player-emoji">{generateEmoji(player.id)}</span>
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-team">{player.team}</div>
                  </div>
                  <div
                    className="player-round"
                    style={{ color: adminMonitorService.getRoundColor(player.currentRound, player.isCompleted) }}
                  >
                    Round {player.currentRound}/7
                  </div>
                </div>
                <div className="player-stats">
                  <div className="stat-item">
                    <span className="stat-label">WPM</span>
                    <span className="stat-value">{player.wpm}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">ACC</span>
                    <span className="stat-value">{player.accuracy}%</span>
                  </div>
                </div>
                <div className="player-progress-bar">
                  <div
                    className="player-progress-fill"
                    style={{ width: `${(player.currentRound / 7) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-section">
          <h3 className="section-title completed-section">Completed Players ({completedPlayers.length})</h3>
          <div className="players-grid">
            {completedPlayers.map((player) => (
              <div key={player.id} className="player-card completed-card">
                <div className="player-header">
                  <span className="player-emoji">{generateEmoji(player.id)}</span>
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-team">{player.team}</div>
                  </div>
                  <div className="player-status-badge completed">
                    ✓ DONE
                  </div>
                </div>
                <div className="player-stats">
                  <div className="stat-item">
                    <span className="stat-label">WPM</span>
                    <span className="stat-value">{player.wpm}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">ACC</span>
                    <span className="stat-value">{player.accuracy}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
