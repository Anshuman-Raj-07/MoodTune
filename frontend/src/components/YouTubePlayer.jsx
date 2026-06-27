import { useEffect, useRef, useState } from 'react'

export default function YouTubePlayer({ mood }) {
  const [videoId, setVideoId] = useState(null)
  const [loading, setLoading] = useState(false)
  const prevMood = useRef(null)

  useEffect(() => {
    if (!mood || mood === prevMood.current) return
    prevMood.current = mood
    setLoading(true)

    fetch(`/api/music?mood=${mood}`)
      .then(r => r.json())
      .then(data => {
        if (data.videoId) setVideoId(data.videoId)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [mood])

  if (!mood) return null

  return (
    <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '16/9' }}>
      {loading && (
        <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/40 text-sm">
          Finding music for your mood...
        </div>
      )}
      {videoId && !loading && (
        <iframe
          key={videoId}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`}
          allow="autoplay; encrypted-media"
          allowFullScreen
          className="border-0"
        />
      )}
    </div>
  )
}