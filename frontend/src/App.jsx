import { useRef, useCallback, useState } from 'react'
import { useFaceDetection } from './hooks/useFaceDetection'
import WebcamView from './components/WebcamView'
import MoodBadge from './components/MoodBadge'
import YouTubePlayer from './components/YouTubePlayer'

export default function App() {
  const videoRef = useRef(null)
  const [camReady, setCamReady] = useState(false)
  const { status, mood, moodColor, startDetection, stopDetection } = useFaceDetection(videoRef)

  const handleVideoReady = useCallback((ref) => {
    videoRef.current = ref.current
    setCamReady(true)
  }, [])

  const isDetecting = status === 'detecting'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 py-12">
      {/* Title */}
      <div className="text-center">
        <h1
          className="text-5xl font-black tracking-tight"
          style={{ fontFamily: 'Fraunces, serif', color: moodColor, transition: 'color 1s ease' }}
        >
          MoodTune
        </h1>
        <p className="text-white/40 text-sm mt-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
          music that matches how you feel
        </p>
      </div>

      {/* Webcam */}
      <WebcamView
        onVideoReady={handleVideoReady}
        moodColor={moodColor}
        isDetecting={isDetecting}
      />

      {/* Mood badge */}
      <MoodBadge mood={mood} moodColor={moodColor} />

      {/* Status */}
      <p className="text-white/30 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {status === 'loading-models' && 'loading face models...'}
        {status === 'ready' && !camReady && 'waiting for camera...'}
        {status === 'ready' && camReady && 'ready — press detect'}
        {status === 'detecting' && 'reading your face...'}
        {status === 'error' && 'failed to load models'}
      </p>

      {/* Controls */}
      <div className="flex gap-4">
        <button
          onClick={startDetection}
          disabled={!camReady || isDetecting || status === 'loading-models'}
          className="px-6 py-2 rounded-full text-sm font-semibold disabled:opacity-30 transition-all"
          style={{
            background: moodColor,
            color: '#0f0f0f',
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          Detect Mood
        </button>
        <button
          onClick={stopDetection}
          disabled={!isDetecting}
          className="px-6 py-2 rounded-full text-sm font-semibold disabled:opacity-30 transition-all"
          style={{
            border: `1px solid ${moodColor}`,
            color: moodColor,
            fontFamily: 'Manrope, sans-serif',
          }}
        >
          Stop
        </button>
      </div>

      {/* YouTube Player */}
      <YouTubePlayer mood={mood} />
    </main>
  )
}