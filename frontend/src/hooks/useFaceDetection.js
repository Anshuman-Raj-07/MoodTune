import { useEffect, useRef, useState, useCallback } from 'react'
import * as faceapi from 'face-api.js'

const MOOD_MAP = {
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
  surprised: 'surprised',
  fearful: 'sad',
  disgusted: 'angry',
  neutral: 'neutral',
}

const MOOD_COLORS = {
  happy: '#f2b705',
  sad: '#4a7fe0',
  angry: '#e5484d',
  neutral: '#a78bfa',
  surprised: '#e5399d',
}

export function useFaceDetection(videoRef) {
  const [status, setStatus] = useState('loading-models')
  const [mood, setMood] = useState(null)
  const [moodColor, setMoodColor] = useState('#a78bfa')
  const intervalRef = useRef(null)
  const modelsLoaded = useRef(false)

  useEffect(() => {
    async function loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        await faceapi.nets.faceExpressionNet.loadFromUri('/models')
        modelsLoaded.current = true
        setStatus('ready')
      } catch (err) {
        console.error('Model load error:', err)
        setStatus('error')
      }
    }
    loadModels()
  }, [])

  const startDetection = useCallback(() => {
    if (!modelsLoaded.current) return
    setStatus('detecting')

    intervalRef.current = setInterval(async () => {
      const video = videoRef.current
      if (!video || video.readyState < 2) return

      try {
        const result = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions()

        if (result) {
          const expressions = result.expressions
          const top = Object.entries(expressions).sort((a, b) => b[1] - a[1])[0][0]
          const detectedMood = MOOD_MAP[top] || 'neutral'
          setMood(detectedMood)
          const color = MOOD_COLORS[detectedMood]
          setMoodColor(color)
          document.documentElement.style.setProperty('--mood-color', color)
        }
      } catch (err) {
        console.error('Detection error:', err)
      }
    }, 700)
  }, [videoRef])

  const stopDetection = useCallback(() => {
    clearInterval(intervalRef.current)
    setStatus('ready')
  }, [])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  return { status, mood, moodColor, startDetection, stopDetection }
}