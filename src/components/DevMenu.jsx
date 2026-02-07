//remove this component when not needed anymore. make sure to remove the import and usage in App.jsx and the component-specific css as well.

import React, { useState } from 'react'
import '../styles/DevMenu.css'

export default function DevMenu({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)

  const pages = [
    { label: 'System Briefing', view: 'briefing' },
    { label: 'Practice Room', view: 'practice' },
    { label: 'Main Typing Test', view: 'main-typing' },
    { label: 'Waiting Room (User)', view: 'waiting' },
    { label: 'Waiting Room (Host)', view: 'host-waiting' },
    { label: 'Host Monitoring', view: 'host-monitoring' },
    { label: 'Leaderboard (User)', view: 'leaderboard-user' },
    { label: 'Leaderboard (Host)', view: 'host-leaderboard' },
  ]

  const handleNavigation = (view) => {
    onNavigate(view)
    setIsOpen(false)
  }

  return (
    <div className={`dev-menu ${isOpen ? 'open' : 'closed'}`}>
      <button
        className="dev-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Development Menu"
      >
        DEV
      </button>

      {isOpen && (
        <div className="dev-menu-panel">
          <div className="dev-menu-header">Navigation</div>
          <div className="dev-menu-list">
            {pages.map((page) => (
              <button
                key={page.view}
                className="dev-menu-item"
                onClick={() => handleNavigation(page.view)}
              >
                {page.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
