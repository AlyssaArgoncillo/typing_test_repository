import React, { useEffect, useMemo, useState } from 'react'
import '../styles/WaitingRoom.css'
import '../styles/HostWaitingRoom.css'

const EMOJIS = ['👨‍💻', '👩‍💻', '🧑‍💻', '🎮', '🎯', '🚀', '✨', '🌟', '⚡', '🎨', '🔥', '💎', '🏆', '🎭', '🎪']

const generateEmoji = (playerId) => {
  return EMOJIS[playerId % EMOJIS.length]
}

const getPingColor = (ping) => {
  if (ping === '--') return 'var(--light-mint)'
  const pingMs = parseInt(ping)
  if (pingMs < 50) return 'var(--neon-green)' // Low ping - green
  if (pingMs < 100) return '#FFD700' // Medium ping - gold
  return '#E32A2A' // High ping - red
}

export default function HostWaitingRoom({ onStatusChange, onStart }) {
  const [players, setPlayers] = useState([])
  const [isStarted, setIsStarted] = useState(false)

  // Dummy data - In production, this would come from API/socket
  const dummyPlayers = useMemo(
    () => [
      { id: 1, name: 'Unknown', team: '', ping: '--' },
      { id: 2, name: 'Player 1', team: 'Team 2', ping: 99 },
      { id: 3, name: 'Player 2', team: 'Team 1', ping: 99 },
      { id: 4, name: 'Player 3', team: 'Team 3', ping: 99 },
      { id: 5, name: 'Player 4', team: 'Team 4', ping: 99 },
      { id: 6, name: 'Player 5', team: 'Team 1', ping: 87 },
      { id: 7, name: 'Player 6', team: 'Team 2', ping: 92 },
      { id: 8, name: 'Player 7', team: 'Team 3', ping: 85 },
    ],
    [],
  )

  // Simulate fetching player data
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // TODO: Replace with actual API call
        const normalizedPlayers = dummyPlayers.map((player) => ({
          id: player.id,
          name: player.name || 'Unknown',
          team: player.team || '',
          ping: player.ping !== undefined ? player.ping : '--',
        }))
        
        setPlayers(normalizedPlayers)
      } catch (error) {
        console.error('Failed to fetch players:', error)
        setPlayers(
          dummyPlayers.map((player) => ({
            id: player.id,
            name: 'Unknown',
            team: '',
            ping: '--',
          })),
        )
      }
    }

    fetchPlayers()
  }, [dummyPlayers])

  useEffect(() => {
    if (!onStatusChange) return
    onStatusChange(['HOST', isStarted ? 'RUNNING' : 'READY'])
  }, [onStatusChange, isStarted])

  const handleStartGame = () => {
    if (players.length > 0) {
      setIsStarted(true)
      // TODO: Broadcast game start to all players
      if (onStart) {
        onStart()
      }
    }
  }

  const teamStats = useMemo(() => {
    const teams = {}
    players.forEach((player) => {
      if (player.team) {
        teams[player.team] = (teams[player.team] || 0) + 1
      }
    })
    return teams
  }, [players])

  const totalTeams = Object.keys(teamStats).length

  return (
    <section className="waiting-room host-mode">
      <div className="waiting-status">
        <span className="status-text">{isStarted ? 'Game in progress...' : 'Ready to start'}</span>
      </div>

      <div className="host-stats-grid">
        <div className="host-stat-card players-card">
          <div className="card-label">Players Connected</div>
          <div className="card-value">{players.length}</div>
          <div className="card-subtitle">out of 8</div>
        </div>

        <div className="host-stat-card teams-card">
          <div className="card-label">Teams ({totalTeams})</div>
          <div className="team-list">
            {Object.entries(teamStats).map(([team, count]) => (
              <div key={team} className="team-item">
                <span className="team-name">{team}</span>
                <span className="team-count">{count}</span>
              </div>
            ))}
            {Object.keys(teamStats).length === 0 && (
              <div className="team-item empty">
                <span className="team-name">No teams assigned</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        className="host-start-button"
        onClick={handleStartGame}
        disabled={players.length === 0 || isStarted}
      >
        {isStarted ? 'Game Started' : 'Start Game'} &gt;&gt;
      </button>
    </section>
  )
}
