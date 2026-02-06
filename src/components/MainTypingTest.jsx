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

export default function MainTypingTest({ onStatusChange, onProceed, onBackClick }) {
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

    overlayTimersRef.current.push(setTimeout(() => setOverlayPhase('round'), 3000))
    overlayTimersRef.current.push(setTimeout(() => setOverlayPhase('countdown'), 6000))
    overlayTimersRef.current.push(setTimeout(() => setCountdownValue(2), 7000))
    overlayTimersRef.current.push(setTimeout(() => setCountdownValue(1), 8000))
    overlayTimersRef.current.push(setTimeout(() => setOverlayPhase('none'), 9000))

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
      setOverlayPhase('none')
      setShowSummary(true)
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
    const correctCount = typedChars.filter((item) => item.correct).length
    const totalCount = passage.length
    const hasData = typedChars.length > 0
    const accuracy = hasData ? typingService.computeAccuracy(correctCount, totalCount) : null
    const elapsedSeconds = Math.max(1, 60 - timeLeft)
    const wpm = hasData ? typingService.computeWpm(typedChars.length, elapsedSeconds) : null

    // Add this round's result to progressData
    const updatedProgressData = {
      timePoints: [...progressData.timePoints, elapsedSeconds],
      wpmData: [...progressData.wpmData, wpm || 0],
      accuracyData: [...progressData.accuracyData, accuracy || 0],
    }

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
    setShowSummary(false)
  }

  const averageAccuracy = roundStats.length
    ? Math.round(roundStats.reduce((sum, stat) => sum + (stat?.accuracy || 0), 0) / roundStats.length)
    : 0

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
                          data: resultOverlay.progressData?.timePoints || [0],
                          label: 'Time (seconds)',
                          type: 'point',
                          min: 0,
                          max: 60,
                        }]}
                        yAxis={[{ 
                          label: 'Accuracy',
                        }]}
                        series={[
                          {
                            data: resultOverlay.progressData?.wpmData || [0],
                            label: 'Words Per Minute',
                            color: '#8BF99A',
                            showMark: true,
                            curve: 'linear',
                          },
                          {
                            data: resultOverlay.progressData?.accuracyData || [0],
                            label: 'Accuracy',
                            color: '#3DFF9D',
                            showMark: true,
                            curve: 'linear',
                          },
                        ]}
                        width={600}
                        height={250}
                        margin={{ top: 5, right: 10, bottom: 25, left: 35 }}
                        slotProps={{ legend: { hidden: true } }}
                      sx={{
                        backgroundColor: 'rgba(8, 18, 12, 0.5)',
                        '& .MuiChartsAxis-line': { stroke: '#8BF99A !important' },
                        '& .MuiChartsAxis-tick': { stroke: '#8BF99A !important' },
                        '& .MuiChartsAxis-tickLabel': { fill: '#8BF99A !important', fontSize: '0.875rem' },
                        '& .MuiChartsAxis-label': { fill: '#8BF99A !important', fontSize: '0.875rem' },
                        '& text': { fill: '#8BF99A !important' },
                        '& tspan': { fill: '#8BF99A !important' },
                        '& .MuiChartsLegend-series': { '& text': { fill: '#8BF99A !important' } },
                        '& .MuiChartsLegend-root': { '& text': { fill: '#8BF99A !important' } },
                        '& .MuiChartsGrid-line': { stroke: 'rgba(139, 249, 154, 0.15) !important' },
                        '& .MuiTooltip-root': { '& .MuiTooltip-tooltip': { backgroundColor: 'rgba(8, 18, 12, 0.95)', color: '#8BF99A' } },
                        '& .MuiLineElement-root': { strokeWidth: 3 },
                        '& .MuiMarkElement-root': {
                          fill: 'rgba(8, 18, 12, 0.9)',
                          stroke: '#8BF99A !important',
                          strokeWidth: 2,
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
            {onProceed && (
              <button className="action-button primary" onClick={onProceed}>Proceed to Lobby</button>
            )}
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
