const typingService = {
  formatTime(seconds) {
    const clamped = Math.max(0, seconds)
    const minutes = Math.floor(clamped / 60)
    const remainder = clamped % 60
    return `${minutes}:${String(remainder).padStart(2, '0')}`
  },

  computeCompletionPercentage(typedLength, passageLength) {
    return passageLength > 0 ? (typedLength / passageLength) * 100 : 0
  },

  getActiveProgressDot(percentage, totalDots = 7) {
    return Math.ceil((percentage / 100) * totalDots) - 1
  },

  buildTypedEntry(expectedChar, inputChar) {
    if (expectedChar === ' ' && inputChar !== ' ') {
      return { correct: false, isSpaceMismatch: true, char: inputChar }
    }

    const correct = inputChar === expectedChar
    return { correct, isSpaceMismatch: false, char: inputChar }
  },

  computeAccuracy(correctCount, totalCount) {
    return totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  },

  computeWpm(typedCharCount, elapsedSeconds) {
    const safeSeconds = Math.max(1, elapsedSeconds)
    return Math.max(0, Math.round((typedCharCount / 5) / (safeSeconds / 60)))
  },

  computeWordCount(typedChars) {
    const typedText = typedChars.map((t) => t.char || '').join('')
    const words = typedText.trim().split(/\s+/).filter((word) => word.length > 0)
    return words.length
  },

  computeAverageAccuracy(roundStats) {
    if (!roundStats.length) return 0
    const total = roundStats.reduce((sum, stat) => sum + (stat?.accuracy || 0), 0)
    return Math.round(total / roundStats.length)
  },

  buildRoundResult({ typedChars, passageLength, timeLeft, roundIndex, progressData }) {
    const correctCount = typedChars.filter((item) => item.correct).length
    const totalCount = passageLength
    const hasData = typedChars.length > 0
    const accuracy = hasData ? this.computeAccuracy(correctCount, totalCount) : null
    const elapsedSeconds = Math.max(1, 60 - timeLeft)
    const wpm = hasData ? this.computeWpm(typedChars.length, elapsedSeconds) : null
    const updatedProgressData = {
      timePoints: [...progressData.timePoints, roundIndex + 1],
      wpmData: [...progressData.wpmData, wpm || 0],
      accuracyData: [...progressData.accuracyData, accuracy || 0],
    }

    return {
      correctCount,
      totalCount,
      hasData,
      accuracy,
      wpm,
      updatedProgressData,
    }
  },

  buildResultChart(wpm, accuracy, hasData = true) {
    const width = 520
    const height = 200
    const paddingX = 36
    const paddingY = 24
    const yMax = 100
    const safeWpm = Math.max(0, wpm || 0)
    const safeAccuracy = Math.max(0, accuracy || 0)
    const xLabels = [20, 40, 60, 80, 100]
    const yLabels = [20, 40, 60, 80, 100]
    const chartWidth = width - paddingX * 2
    const chartHeight = height - paddingY * 2
    const xStep = chartWidth / (xLabels.length - 1)
    const yStep = chartHeight / (yLabels.length - 1)
    const labelsX = xLabels.map((label, index) => ({
      label,
      x: paddingX + index * xStep,
      y: height + 14,
    }))
    const labelsY = yLabels.map((label, index) => ({
      label,
      x: paddingX - 14,
      y: height - paddingY - index * yStep + 4,
    }))

    if (!hasData) {
      return {
        width,
        height,
        labelsX,
        labelsY,
        wpmPath: null,
        accuracyPath: null,
        wpmMarker: null,
        accuracyMarker: null,
      }
    }

    const clampedWpm = Math.min(yMax, Math.max(0, safeWpm))
    const clampedAccuracy = Math.min(yMax, Math.max(0, safeAccuracy))

    const buildLine = (value) => {
      const y = paddingY + ((yMax - value) / yMax) * chartHeight
      const points = xLabels.map((_, index) => ({
        x: paddingX + index * xStep,
        y,
      }))
      const path = points
        .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
        .join(' ')
      const marker = points[points.length - 1]
      return { path, marker }
    }

    const wpmLine = buildLine(clampedAccuracy)
    const accuracyLine = buildLine(clampedWpm)

    return {
      width,
      height,
      labelsX,
      labelsY,
      wpmPath: wpmLine.path,
      accuracyPath: accuracyLine.path,
      wpmMarker: wpmLine.marker,
      accuracyMarker: accuracyLine.marker,
    }
  },
}

export default typingService
