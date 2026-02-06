import React from 'react'
import '../styles/RankingPanel.css'

export default function RankingPanel() {
  const rankings = [
    { place: ['Champion'], rank: '1st Place' },
    { place: ['1st-Runner', 'Up'], rank: '2nd Place' },
    { place: ['2nd-Runner', 'Up'], rank: '3rd Place' }
  ]

  return (
    <div className="ranking-panel">
      <h2 className="ranking-title">RANKING</h2>
      <div className="ranking-list">
        {rankings.map((item, index) => (
          <div key={index} className="ranking-item">
            <div className="ranking-badge">
              {item.place.map((line, lineIndex) => (
                <span key={lineIndex} className="ranking-line">
                  {line}
                </span>
              ))}
            </div>
            <div className="ranking-rank">{item.rank}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
