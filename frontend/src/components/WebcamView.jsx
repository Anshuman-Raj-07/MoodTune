import { useEffect, useRef } from 'react'

export default function WebcamView({ onVideoReady, moodColor, isDetecting }) {
  const videoRef = useRef(null)

  useEffect(() => {
    let stream = null
    async function startCam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            onVideoReady(videoRef)
          }
        }
      } catch (err) {
        console.error('Webcam error:', err)
      }
    }
    startCam()
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [onVideoReady])

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="rounded-full overflow-hidden"
        style={{
          width: 260,
          height: 260,
          padding: 4,
          background: `conic-gradient(${moodColor}, #0f0f0f, ${moodColor})`,
          transition: 'background 1s ease',
          animation: isDetecting ? 'spin 4s linear infinite' : 'none',
        }}
      >
        <div className="rounded-full overflow-hidden w-full h-full bg-black">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover scale-x-[-1]"
          />
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}