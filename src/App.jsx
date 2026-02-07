import React, { useState } from 'react'
import Header from './components/Header'
import SystemBriefing from './components/SystemBriefing'
import RankingPanel from './components/RankingPanel'
import PracticeRoom from './components/PracticeRoom'
import MainTypingTest from './components/MainTypingTest'
import WaitingRoom from './components/WaitingRoom'
import HostWaitingRoom from './components/HostWaitingRoom'
import HostMonitoring from './components/HostMonitoring'
import LeaderboardUser from './components/LeaderboardUser'
import HostLeaderboard from './components/HostLeaderboard'
import DevMenu from './components/DevMenu'
import StarfieldBackground from './components/StarfieldBackground'
import './App.css'

function App() {
  const [statusPills, setStatusPills] = useState(['PRACTICE', '--:--'])
  const [view, setView] = useState('briefing')
  const [isPostGameWaiting, setIsPostGameWaiting] = useState(false)

  const handleDevNavigation = (newView) => {
    setView(newView)
  }

  return (
    <div className="app">
      <StarfieldBackground />
      <Header
        title=""
        statusPills={view === 'practice' || view === 'waiting' || view === 'main-typing' || view === 'host-monitoring' || view === 'host-leaderboard' ? statusPills : []}
        isPractice={view === 'practice' || view === 'waiting' || view === 'host-waiting' || view === 'main-typing' || view === 'host-monitoring' || view === 'host-leaderboard'}
        isWaitingRoom={view === 'waiting' || view === 'host-waiting' || view === 'host-monitoring' || view === 'host-leaderboard'}
      />
      <main className="main-content">
        {view === 'practice' ? (
          <PracticeRoom onStatusChange={setStatusPills} onProceed={() => { setIsPostGameWaiting(false); setView('waiting'); }} onBackClick={() => setView('briefing')} />
        ) : view === 'main-typing' ? (
          <MainTypingTest onStatusChange={setStatusPills} onWaitForResults={() => { setIsPostGameWaiting(true); setView('waiting'); }} onBackClick={() => setView('briefing')} />
        ) : view === 'waiting' ? (
          <WaitingRoom onStatusChange={setStatusPills} onStart={() => setView('main-typing')} onComplete={() => setView('leaderboard-user')} isPostGame={isPostGameWaiting} />
        ) : view === 'host-waiting' ? (
          <HostWaitingRoom onStatusChange={setStatusPills} onStart={() => setView('host-monitoring')} />
        ) : view === 'host-monitoring' ? (
          <HostMonitoring onStatusChange={setStatusPills} onComplete={() => setView('host-leaderboard')} />
        ) : view === 'leaderboard-user' ? (
          <LeaderboardUser onStatusChange={setStatusPills} onExit={() => setView('briefing')} />
        ) : view === 'host-leaderboard' ? (
          <HostLeaderboard onStatusChange={setStatusPills} onExit={() => setView('briefing')} />
        ) : (
          <div className="system-panel">
            <SystemBriefing onBeginPractice={() => setView('practice')} onHostStart={() => setView('host-waiting')} />
            <RankingPanel />
          </div>
        )}
      </main>
      <DevMenu onNavigate={handleDevNavigation} />
    </div>
  )
}

export default App
