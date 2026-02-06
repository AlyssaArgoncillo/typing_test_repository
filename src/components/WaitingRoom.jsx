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

export default function WaitingRoom({ onStatusChange }) {
  const [players, setPlayers] = useState([])

  // Dummy data - In production, this would come from API/socket
  const dummyPlayers = useMemo(
    () => [
      { id: 1, name: 'Unknown', team: '', ping: '--' },
      { id: 2, name: 'Player 1', team: 'Team 2', ping: 99 },
      { id: 3, name: 'Player 2', team: 'Team 1', ping: 99 },
      { id: 4, name: 'Player 1', team: 'Team 3', ping: 99 },
      { id: 5, name: 'Player 1', team: 'Team 4', ping: 99 },
      { id: 6, name: 'Player 3', team: 'Team 1', ping: 87 },
      { id: 7, name: 'Player 4', team: 'Team 2', ping: 92 },
      { id: 8, name: 'Player 5', team: 'Team 3', ping: 85 },
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

  return (
    <section className="waiting-room">
      <div className="waiting-status">
        <span className="status-text">Waiting for host to start...</span>
      </div>

      <div className="players-panel">
        <div className={`players-list ${players.length > 5 ? 'scrollable' : ''}`}>
          {players.length === 0 ? (
            <div className="no-players">
              <span className="no-players-text">No players connected</span>
            </div>
          ) : (
            players.map((player) => (
              <div key={player.id} className="player-row">
                <span className="player-number">{player.id}</span>
                <div className="player-avatar">
                  {generateEmoji(player.id)}
                </div>
                <div className="player-info">
                  <span className="player-name">{player.name}</span>
                  {player.team && <span className="player-team">{player.team}</span>}
                </div>
                <div className="player-ping-container">
                  <span className="ping-indicator" style={{ color: getPingColor(player.ping) }}>●</span>
                  <span className="ping-value">{player.ping}</span>
                  <span className="ping-unit">ms</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
