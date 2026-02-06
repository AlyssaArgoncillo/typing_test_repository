import React, { useState } from 'react'
import Header from './components/Header'
import SystemBriefing from './components/SystemBriefing'
import RankingPanel from './components/RankingPanel'
import PracticeRoom from './components/PracticeRoom'
import MainTypingTest from './components/MainTypingTest'
import WaitingRoom from './components/WaitingRoom'
import HostWaitingRoom from './components/HostWaitingRoom'
import DevMenu from './components/DevMenu'
import StarfieldBackground from './components/StarfieldBackground'
import './App.css'

function App() {
  const [statusPills, setStatusPills] = useState(['PRACTICE', '--:--'])
  const [view, setView] = useState('briefing')

  const handleDevNavigation = (newView) => {
    setView(newView)
  }

  return (
    <div className="app">
      <StarfieldBackground />
      <Header
        title=""
        statusPills={view === 'practice' || view === 'waiting' || view === 'main-typing' ? statusPills : []}
        isPractice={view === 'practice' || view === 'waiting' || view === 'host-waiting' || view === 'main-typing'}
        isWaitingRoom={view === 'waiting' || view === 'host-waiting'}
      />
      <main className="main-content">
        {view === 'practice' ? (
          <PracticeRoom onStatusChange={setStatusPills} onProceed={() => setView('waiting')} onBackClick={() => setView('briefing')} />
        ) : view === 'main-typing' ? (
          <MainTypingTest onStatusChange={setStatusPills} onProceed={() => setView('waiting')} onBackClick={() => setView('briefing')} />
        ) : view === 'waiting' ? (
          <WaitingRoom onStatusChange={setStatusPills} />
        ) : view === 'host-waiting' ? (
          <HostWaitingRoom onStatusChange={setStatusPills} onStart={() => setView('main-typing')} />
        ) : (
          <div className="system-panel">
            <SystemBriefing onBeginPractice={() => setView('practice')} />
            <RankingPanel />
          </div>
        )}
      </main>
      <DevMenu onNavigate={handleDevNavigation} />
    </div>
  )
}

export default App
