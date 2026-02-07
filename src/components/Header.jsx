import React, { useState, useEffect } from 'react'
import '../styles/Header.css'
import ccisLogo from '../assets/logo/ccis_logo.svg'
import cssLogo from '../assets/logo/css_logo.svg'

export default function Header({
  title = 'SYSTEM_BRIEFING',
  statusPills = [],
  isPractice = false,
  isWaitingRoom = false
}) {
  const [ping, setPing] = useState(null)
  const [isChecking, setIsChecking] = useState(false)

  const capturePing = async () => {
    setIsChecking(true)
    const startTime = performance.now()
    
    try {
      // Ping a small resource to measure latency
      await fetch(window.location.origin, { method: 'HEAD' })
      const endTime = performance.now()
      const latency = Math.round(endTime - startTime)
      setPing(latency)
    } catch (error) {
      setPing('ERROR')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    // Initial ping on mount
    capturePing()
    
    // Refresh ping every 10 seconds
    const interval = setInterval(capturePing, 10000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <header className={`header ${isPractice ? 'practice-mode' : ''} ${isWaitingRoom ? 'waiting-room-mode' : ''}`}>
      <div className="header-left">
        <div className="logo">
          <img src={ccisLogo} alt="CCIS Logo" className="logo-img" />
          <img src={cssLogo} alt="CSS Logo" className="logo-img" />
        </div>
      </div>
      <div className="header-center">
        {statusPills.length > 0 && (
          <div className="header-status">
            {statusPills.map((pill) => (
              <span key={pill} className="header-pill">
                {pill}
              </span>
            ))}
          </div>
        )}
        {title && <h1 className="title">{title}</h1>}
      </div>
      <div className="header-right">
        <button
          className={`ping-button ${isChecking ? 'checking' : ''}`}
          onClick={capturePing}
          disabled={isChecking}
          title="Check connection latency"
        >
          <span className="ping-icon" aria-hidden="true" />
          <span className="ping-value">{ping !== null ? `${ping}ms` : '--'}</span>
        </button>
      </div>
    </header>
  )
}
