import React, { useEffect, useMemo, useRef, useState } from 'react'
import { LineChart } from '@mui/x-charts/LineChart'
import typingService from '../services/typingService'
import '../styles/MainTypingTest.css'

const passages = [
  'typing practice helps improve both speed and accuracy. this short paragraph gives you enough words to test spacing, punctuation, and rhythm while keeping things simple.',
  'the quick brown fox jumps over the lazy dog. this line is used to test every letter, and it keeps the rhythm short and familiar.',
  'accuracy comes first, then speed follows. stay calm, keep your eyes steady, and let each word land with purpose.',
  'focus on the cursor and keep your fingers relaxed. steady typing builds rhythm, and rhythm builds confidence.',
  'small errors add up fast. slow down, reset your pace, and aim for clean, consistent input each round.',
  'clear spacing and clean punctuation are just as important as speed. treat every character as part of the score.',
  'finish strong and keep your timing even. each round is a fresh start, so stay sharp and keep moving forward.',
]

export default function MainTypingTest({ onStatusChange, onComplete, onBackClick, onWaitForResults }) {
  const [roundIndex, setRoundIndex] = useState(0)
  const [typedChars, setTypedChars] = useState([])
  const [roundStats, setRoundStats] = useState([])
  const [showSummary, setShowSummary] = useState(false)
  const [overlayPhase, setOverlayPhase] = useState('none')
  const [countdownValue, setCountdownValue] = useState(3)
  const [timeLeft, setTimeLeft] = useState(60)
  const [resultOverlay, setResultOverlay] = useState(null)
  const [progressData, setProgressData] = useState({ wpmData: [], accuracyData: [], timePoints: [] })
  const containerRef = useRef(null)
  const overlayRef = useRef(null)
  const overlayTimersRef = useRef([])
  const timeUpTimerRef = useRef(null)
  const resultTimerRef = useRef(null)
  const advancingRef = useRef(false)

  const passage = useMemo(() => passages[roundIndex] || '', [roundIndex])
  const isComplete = typedChars.length >= passage.length
  const completionPercentage = typingService.computeCompletionPercentage(
    typedChars.length,
    passage.length,
  )
  const activeProgressDot = typingService.getActiveProgressDot(completionPercentage, 7)

  useEffect(() => {
    if (!onStatusChange) return
    const label = showSummary ? 'RESULTS' : `ROUND ${roundIndex + 1} OF 7`
    const timerLabel = showSummary ? '--:--' : typingService.formatTime(timeLeft)
    onStatusChange([label, timerLabel])
  }, [onStatusChange, roundIndex, showSummary, timeLeft])

  useEffect(() => {
    if (overlayPhase === 'round-result') {
      overlayRef.current?.focus()
    } else {
      containerRef.current?.focus()
    }
  }, [roundIndex, showSummary, overlayPhase])

  useEffect(() => {
    setTimeLeft(60)
  }, [roundIndex])

  useEffect(() => {
    if (showSummary) return

    overlayTimersRef.current.forEach((timer) => clearTimeout(timer))
    overlayTimersRef.current = []

    setCountdownValue(3)
    setOverlayPhase('init')

    overlayTimersRef.current.push(setTimeout(() => setOverlayPhase('round'), 2000))
    overlayTimersRef.current.push(setTimeout(() => setOverlayPhase('countdown'), 4000))
    overlayTimersRef.current.push(setTimeout(() => setCountdownValue(2), 5000))
    overlayTimersRef.current.push(setTimeout(() => setCountdownValue(1), 6000))
    overlayTimersRef.current.push(setTimeout(() => setOverlayPhase('none'), 7000))

    return () => {
      overlayTimersRef.current.forEach((timer) => clearTimeout(timer))
      overlayTimersRef.current = []
    }
  }, [roundIndex, showSummary])

  useEffect(() => {
    if (showSummary || overlayPhase !== 'none') return undefined
    if (timeLeft <= 0) return undefined

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [overlayPhase, showSummary, timeLeft])

  useEffect(() => {
    if (showSummary || overlayPhase !== 'none') return
    if (timeLeft !== 0) return
    if (advancingRef.current) return

    overlayTimersRef.current.forEach((timer) => clearTimeout(timer))
    overlayTimersRef.current = []
    setOverlayPhase('timeup')
    if (timeUpTimerRef.current) {
      clearTimeout(timeUpTimerRef.current)
    }
    timeUpTimerRef.current = setTimeout(() => {
      finalizeRound()
    }, 3000)
  }, [overlayPhase, showSummary, timeLeft])

  useEffect(() => {
    if (showSummary || overlayPhase !== 'none') return
    const container = containerRef.current
    if (!container) return
    const currentIndex = Math.min(typedChars.length, passage.length - 1)
    const activeChar = container.querySelector(`[data-index="${currentIndex}"]`)
    if (!activeChar) return

    const containerRect = container.getBoundingClientRect()
    const activeRect = activeChar.getBoundingClientRect()
    const offset = activeRect.top - containerRect.top
    const target = container.scrollTop + offset - containerRect.height * 0.4

    container.scrollTo({ top: target, behavior: 'smooth' })
  }, [typedChars.length, passage.length, showSummary])

  const handleKeyDown = (event) => {
    if (overlayPhase === 'round-result') {
      if (event.key === ' ') {
        event.preventDefault()
        advanceToNextRound()
      }
      return
    }
    if (isComplete || showSummary || overlayPhase !== 'none') return

    if (event.key === 'Backspace') {
      event.preventDefault()
      setTypedChars((prev) => prev.slice(0, -1))
      return
    }

    if (event.key.length !== 1) return

    event.preventDefault()
    setTypedChars((prev) => {
      if (prev.length >= passage.length) return prev
      const expected = passage[prev.length]

      const entry = typingService.buildTypedEntry(expected, event.key)
      return [...prev, entry]
    })
  }

  const handleFocus = () => {
    containerRef.current?.focus()
  }

  const advanceToNextRound = () => {
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current)
      resultTimerRef.current = null
    }
    if (roundIndex >= passages.length - 1) {
      // Final round complete - go to waiting room to wait for other players
      setOverlayPhase('none')
      if (onWaitForResults) {
        onWaitForResults()
      }
      return
    }

    setOverlayPhase('none')
    setResultOverlay(null)
    setTypedChars([])
    setRoundIndex((prev) => prev + 1)
  }

  const finalizeRound = () => {
    if (advancingRef.current) return
    advancingRef.current = true
    const {
      accuracy,
      wpm,
      hasData,
      correctCount,
      totalCount,
      updatedProgressData,
    } = typingService.buildRoundResult({
      typedChars,
      passageLength: passage.length,
      timeLeft,
      roundIndex,
      progressData,
    })

    setRoundStats((prev) => {
      const updated = [...prev]
      updated[roundIndex] = { accuracy, correctCount, totalCount, wpm, hasData }
      return updated
    })

    setProgressData(updatedProgressData)
    setResultOverlay({ accuracy, wpm, hasData, progressData: updatedProgressData })
    setOverlayPhase('round-result')
  }

  useEffect(() => {
    advancingRef.current = false
    if (timeUpTimerRef.current) {
      clearTimeout(timeUpTimerRef.current)
      timeUpTimerRef.current = null
    }
    if (resultTimerRef.current) {
      clearTimeout(resultTimerRef.current)
      resultTimerRef.current = null
    }
  }, [roundIndex, showSummary])

  const handleRestart = () => {
    setRoundIndex(0)
    setTypedChars([])
    setRoundStats([])
    setProgressData({ wpmData: [], accuracyData: [], timePoints: [] })
    setShowSummary(false)
  }

  const averageAccuracy = typingService.computeAverageAccuracy(roundStats)

  const wordCount = useMemo(() => typingService.computeWordCount(typedChars), [typedChars])

  useEffect(() => {
    if (showSummary || overlayPhase !== 'none') return
    if (isComplete) {
      finalizeRound()
    }
  }, [isComplete, overlayPhase, showSummary])

  const overlayText = overlayPhase === 'countdown'
    ? `${countdownValue}`
    : overlayPhase === 'init'
      ? 'Initializing round...'
      : overlayPhase === 'round'
        ? `Round ${roundIndex + 1}.`
        : overlayPhase === 'timeup'
          ? "Time's up."
          : ''

  return (
    <section className={`practice-room ${overlayPhase !== 'none' ? 'overlay-active' : ''}`}>

      {overlayPhase !== 'none' && (
        <div className="typing-overlay" role="presentation" onKeyDown={handleKeyDown} tabIndex={0} ref={overlayRef}>
          <div className={`typing-overlay-card ${overlayPhase === 'round-result' ? 'round-result-card' : ''}`}>
            {overlayPhase === 'round-result' ? (
              <div className="round-result-grid">
                <div className="round-result-title">ROUND {roundIndex + 1}</div>
                <div className="round-result-metrics">
                  <span className="round-result-label">wpm</span>
                  <span className="round-result-value">
                    {resultOverlay?.hasData ? resultOverlay?.wpm ?? 0 : '--'}
                  </span>
                  <span className="round-result-label">accuracy</span>
                  <span className="round-result-value">
                    {resultOverlay?.hasData ? `${resultOverlay?.accuracy ?? 0} %` : '--'}
                  </span>
                </div>
                <div className="round-result-graph" style={{ width: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {resultOverlay?.hasData ? (
                    <div style={{ width: '100%' }}>
                      <LineChart
                        key={`chart-${resultOverlay.progressData?.timePoints?.length || 0}`}
                        xAxis={[{ 
                          data: resultOverlay.progressData?.timePoints || [1],
                          scaleType: 'point',
                        }]}
                        yAxis={[
                          { 
                            id: 'wpm',
                            position: 'left',
                            min: 0,
                          },
                          { 
                            id: 'accuracy',
                            position: 'right',
                            min: 0,
                            max: 100,
                          },
                        ]}
                        series={[
                          {
                            yAxisKey: 'wpm',
                            data: resultOverlay.progressData?.wpmData || [0],
                            label: 'WPM',
                            color: '#8BF99A',
                            showMark: true,
                            curve: 'linear',
                          },
                          {
                            yAxisKey: 'accuracy',
                            data: resultOverlay.progressData?.accuracyData || [0],
                            label: 'Accuracy',
                            color: '#FFFF00',
                            showMark: true,
                            curve: 'linear',
                          },
                        ]}
                        width={600}
                        height={250}
                        margin={{ top: 35, right: 50, bottom: 35, left: 50 }}
                        slotProps={{ 
                          legend: { 
                            hidden: false,
                            direction: 'row',
                            position: { vertical: 'top', horizontal: 'middle' },
                            padding: { top: 5, bottom: 10 },
                            itemMarkWidth: 12,
                            itemMarkHeight: 12,
                            markGap: 6,
                            itemGap: 20,
                            labelStyle: {
                              fill: '#8BF99A',
                              fontSize: '0.95rem',
                              fontWeight: 600,
                            },
                          }
                        }}
                        tooltip={{ trigger: 'item' }}
                      sx={{
                        backgroundColor: 'rgba(8, 18, 12, 0.5)',
                        '& .MuiChartsAxis-line': { stroke: '#C5FDD0 !important' },
                        '& .MuiChartsAxis-tick': { stroke: '#C5FDD0 !important' },
                        '& .MuiChartsAxis-tickLabel': { fill: '#E0FFE8 !important', fontSize: '0.9rem', fontWeight: 500 },
                        '& .MuiChartsAxis-label': { fill: '#E0FFE8 !important', fontSize: '0.9rem', fontWeight: 600 },
                        '& .MuiChartsLegend-root': { 
                          fill: '#8BF99A !important',
                          color: '#8BF99A !important',
                        },
                        '& .MuiChartsLegend-series': { 
                          fill: '#8BF99A !important',
                          color: '#8BF99A !important',
                        },
                        '& .MuiChartsLegend-series text': { 
                          fill: '#8BF99A !important',
                          color: '#8BF99A !important',
                          fontSize: '0.95rem !important',
                          fontWeight: '600 !important',
                        },
                        '& .MuiChartsLegend-label': {
                          fill: '#8BF99A !important',
                          color: '#8BF99A !important',
                        },
                        '& text': {
                          fill: '#8BF99A !important',
                        },
                        '& .MuiChartsLegend-mark': { rx: 2 },
                        '& .MuiChartsGrid-line': { stroke: 'rgba(197, 253, 208, 0.15) !important' },
                        '& .MuiLineElement-root': { strokeWidth: 3 },
                        '& .MuiMarkElement-root': {
                          fill: '#265C3D',
                          stroke: '#8BF99A',
                          strokeWidth: 2.5,
                          r: 6,
                          '&:hover': {
                            stroke: '#3DFF9D',
                            r: 8,
                            strokeWidth: 3.5,
                            cursor: 'pointer',
                          },
                        },
                        '& .MuiChartsTooltip-root': {
                          backgroundColor: '#265C3D !important',
                          border: '1px solid #C5FDD0',
                          borderRadius: '4px',
                        },
                        '& .MuiChartsTooltip-table': {
                          '& td': { color: '#E0FFE8 !important', fontSize: '0.9rem' },
                        },
                      }}
                    />
                    </div>
                  ) : (
                    <div className="round-result-no-data">No data to display</div>
                  )}
                </div>
                <div className="round-result-footer">Press Space to Proceed</div>
              </div>
            ) : (
              <div
                key={overlayPhase}
                className={`typing-overlay-text ${overlayPhase === 'countdown' ? 'overlay-countdown' : ''}`}
              >
                {overlayText}
              </div>
            )}
          </div>
        </div>
      )}

      {showSummary ? (
        <div className="practice-panel typing-summary">
          <h2 className="summary-title">Round Summary</h2>
          <div className="summary-list">
            {roundStats.map((stat, index) => (
              <div className="summary-row" key={`round-${index}`}>
                <span className="summary-label">Round {index + 1}</span>
                <span className="summary-value">
                  {typeof stat?.accuracy === 'number' ? `${stat.accuracy}%` : '--'}
                </span>
              </div>
            ))}
          </div>
          <div className="summary-row summary-total">
            <span className="summary-label">Average</span>
            <span className="summary-value">{averageAccuracy}%</span>
          </div>
          <div className="practice-actions">
            <button className="action-button" onClick={handleRestart}>Restart Test</button>
          </div>
        </div>
      ) : (
        <>
          <div className="word-count-display">
            {wordCount}
          </div>
          <div
            className="practice-panel"
            role="textbox"
            tabIndex={0}
            ref={containerRef}
            onKeyDown={handleKeyDown}
            onClick={handleFocus}
          >
            <p className="practice-text">
              {passage.split('').map((char, index) => {
                const typed = typedChars[index]
                const isActive = !isComplete && index === typedChars.length
                let className = 'char-untyped'

                if (typed) {
                  className = typed.correct ? 'char-correct' : 'char-incorrect'
                }

                if (isActive) {
                  className = `${className} char-active`
                }

                if (typed?.isSpaceMismatch) {
                  className = `${className} space-mismatch`
                }

                return (
                  <span
                    key={`${char}-${index}`}
                    className={className}
                    data-index={index}
                  >
                    {typed?.isSpaceMismatch ? '_' : char}
                  </span>
                )
              })}
            </p>
          </div>

          <div className="progress-row">
            {[0, 1, 2, 3, 4, 5, 6].map((index) => (
              <React.Fragment key={index}>
                <span className={`progress-dot ${index <= activeProgressDot ? 'active' : ''}`} />
                {index < 6 && <span className="progress-line" />}
              </React.Fragment>
            ))}
          </div>

        </>
      )}
    </section>
  )
}
