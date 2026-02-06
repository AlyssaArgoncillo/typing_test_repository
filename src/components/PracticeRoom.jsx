import React, { useEffect, useMemo, useRef, useState } from 'react'
import typingService from '../services/typingService'
import '../styles/PracticeRoom.css'

export default function PracticeRoom({ onStatusChange, onProceed, onBackClick }) {
  const passage = useMemo(
    () =>
      'typing practice helps improve both speed and accuracy. this short paragraph gives you enough words to test spacing, punctuation, and rhythm while keeping things simple.',
    [],
  )
  const [typedChars, setTypedChars] = useState([])
  const containerRef = useRef(null)

  const isComplete = typedChars.length >= passage.length
  const completionPercentage = typingService.computeCompletionPercentage(
    typedChars.length,
    passage.length,
  )
  const activeProgressDot = typingService.getActiveProgressDot(completionPercentage, 7)

  useEffect(() => {
    if (!onStatusChange) return
    onStatusChange(['PRACTICE', '--:--'])
  }, [onStatusChange])

  useEffect(() => {
    containerRef.current?.focus()
  }, [])

  useEffect(() => {
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
  }, [typedChars.length, passage.length])

  const handleKeyDown = (event) => {
    if (isComplete) return

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

  const handleReset = () => {
    setTypedChars([])
    containerRef.current?.focus()
  }

  return (
    <section className="practice-room">
      {onBackClick && (
        <button className="practice-back-button" onClick={onBackClick}>
          &lt;&lt; Back
        </button>
      )}
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

      {isComplete && (
        <div className="practice-actions">
          <button className="action-button" onClick={handleReset}>Practice More</button>
          <button className="action-button primary" onClick={onProceed}>Proceed to Lobby</button>
        </div>
      )}
    </section>
  )
}
