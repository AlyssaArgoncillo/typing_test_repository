import React, { useEffect, useRef } from 'react'
import '../styles/StarfieldBackground.css'

export default function StarfieldBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create stars
    const stars = []
    const starCount = 100

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5,
        opacity: Math.random() * 0.5 + 0.3,
        twinkleSpeed: Math.random() * 0.02 + 0.01
      })
    }

    let animationId

    const animate = () => {
      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(0, 20, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and update stars
      stars.forEach(star => {
        // Update opacity for twinkling effect
        star.opacity += star.twinkleSpeed
        if (star.opacity > 1) {
          star.twinkleSpeed *= -1
          star.opacity = 1
        } else if (star.opacity < 0.2) {
          star.twinkleSpeed *= -1
          star.opacity = 0.2
        }

        // Draw star
        ctx.fillStyle = `rgba(0, 255, 100, ${star.opacity})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield-canvas" />
}
