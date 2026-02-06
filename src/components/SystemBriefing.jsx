import React from 'react'
import '../styles/SystemBriefing.css'

export default function SystemBriefing({ onBeginPractice }) {
  const handleEnterRoom = () => {
    if (onBeginPractice) {
      onBeginPractice()
      return
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
          <button className="enter-button" onClick={handleEnterRoom}>
            Begin Practice &gt;&gt;
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
