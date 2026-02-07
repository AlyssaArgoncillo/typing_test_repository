import React from 'react'
import '../styles/SystemBriefing.css'

export default function SystemBriefing({ onBeginPractice, onHostStart }) {
  // TODO: Replace with actual authentication check from backend
  // This dummy value should come from user session/token
  const isAdmin = false // Set to true for admin/host accounts

  const handleEnterEvent = () => {
    if (isAdmin && onHostStart) {
      onHostStart()
    } else if (!isAdmin && onBeginPractice) {
      onBeginPractice()
    }
  }

  return (
    <div className="system-briefing">
      <div className="briefing-box">
        <div className="briefing-top">
          <div className="briefing-header">
            <span className="exe-title">TYPINGTEST.EXE</span>
            <span className="exe-path">C:\Users\Welcome to Typing_Test</span>
          </div>
          <button className="enter-button" onClick={handleEnterEvent}>
            Enter event &gt;&gt;
          </button>
        </div>

        <div className="briefing-content">
          <div className="section">
            <h3>Rounds</h3>
            <p>&gt;&gt; The competition consists of 7 timed rounds.</p>
          </div>

          <div className="section">
            <h3>Test Cases</h3>
            <p>&gt;&gt; Each round will feature a unique passage of text to type.</p>
          </div>

          <div className="section">
            <h3>Time Limit</h3>
            <p>&gt;&gt; Each round lasts for 60 seconds.</p>
          </div>

          <div className="section">
            <h3>Evaluation</h3>
            <p>
              &gt;&gt; Scores for accuracy and words per minute (WPM) will be
              automatically calculated and recorded after each round.
            </p>
          </div>

          <div className="section">
            <h3>Scoring</h3>
            <p>
              &gt;&gt; A participant's final score is the average of their scores
              across all 7 rounds.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
