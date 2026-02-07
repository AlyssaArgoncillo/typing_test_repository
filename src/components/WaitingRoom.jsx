import React, { useEffect, useMemo, useState } from 'react'
import '../styles/WaitingRoom.css'

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

export default function WaitingRoom({ onStatusChange, onStart, onComplete, isPostGame }) {
  const [players, setPlayers] = useState([])

  // Dummy data - In production, this would come from API/socket
  const dummyPlayers = useMemo(
    () => [
      { id: 1, name: 'Unknown', team: '', ping: '--' },
      { id: 2, name: 'Player 1', team: 'Team Alpha', ping: 99 },
      { id: 3, name: 'Player 2', team: 'Team Delta', ping: 99 },
      { id: 4, name: 'Player 1', team: 'Team Gamma', ping: 99 },
      { id: 5, name: 'Player 1', team: 'Team Beta', ping: 99 },
      { id: 6, name: 'Player 3', team: 'Team Alpha', ping: 87 },
      { id: 7, name: 'Player 4', team: 'Team Delta', ping: 92 },
      { id: 8, name: 'Player 5', team: 'Team Gamma', ping: 85 },
    ],
    [],
  )

  // Simulate fetching player data
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // TODO: Replace with actual API call to fetch players in room
        // const response = await fetch('/api/players')
        // const data = await response.json()
        
        // For now, use dummy data
        const normalizedPlayers = dummyPlayers.map((player) => ({
          id: player.id,
          name: player.name || 'Unknown',
          team: player.team || '',
          ping: player.ping !== undefined ? player.ping : '--',
        }))
        
        setPlayers(normalizedPlayers)
      } catch (error) {
        console.error('Failed to fetch players:', error)
        // If fetch fails, still show dummy players with unknown data
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
    onStatusChange(['WAITING', '--:--'])
  }, [onStatusChange])

  // TODO: In production, listen for WebSocket event when all players complete
  // and call onComplete() to transition to leaderboard-user view
  // Example: socket.on('all-players-complete', () => { if (onComplete) onComplete(); });

  const teamStats = useMemo(() => {
    const teams = {}
    players.forEach((player) => {
      if (!player.team) return
      teams[player.team] = (teams[player.team] || 0) + 1
    })
    return teams
  }, [players])

  const totalTeams = Object.keys(teamStats).length

  return (
    <section className="waiting-room lobby-room">
      <div className="lobby-header">
        <div className="lobby-title-wrap">
          <div className="lobby-title">Lobby Status</div>
          <div className="lobby-subtitle">
            {isPostGame ? 'Waiting for other players to finish...' : 'Waiting for host to start...'}
          </div>
        </div>
        <div className="lobby-summary-cards">
          <div className="lobby-card">
            <span className="lobby-card-label">Players</span>
            <span className="lobby-card-value">{players.length}</span>
          </div>
          <div className="lobby-card">
            <span className="lobby-card-label">Teams</span>
            <span className="lobby-card-value">{totalTeams}</span>
          </div>
          <div className="lobby-card">
            <span className="lobby-card-label">Capacity</span>
            <span className="lobby-card-value">8</span>
          </div>
        </div>
      </div>

      <div className="lobby-section">
        <div className="lobby-section-title">
          {isPostGame ? 'Player Status' : 'Players Connected'}
        </div>
        <div className="lobby-players-grid">
          {players.length === 0 ? (
            <div className="no-players">
              <span className="no-players-text">No players connected</span>
            </div>
          ) : (
            players.map((player) => (
              <div key={player.id} className="lobby-player-card">
                <div className="lobby-player-header">
                  <div className="player-avatar">
                    {generateEmoji(player.id)}
                  </div>
                  <div className="player-info">
                    <span className="player-name">{player.name}</span>
                    {player.team && <span className="player-team">{player.team}</span>}
                  </div>
                  {player.ping !== '--' && (
                    <div className="lobby-ping-card">
                      <span className="ping-indicator" style={{ color: getPingColor(player.ping) }}>●</span>
                      <span className="ping-value">{player.ping}</span>
                      <span className="ping-unit">ms</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
