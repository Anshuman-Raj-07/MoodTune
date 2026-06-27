const MOOD_EMOJI = {
    happy: '😄',
    sad: '😢',
    angry: '😠',
    neutral: '😐',
    surprised: '😲',
  }
  
  export default function MoodBadge({ mood, moodColor }) {
    if (!mood) return null
    return (
      <div
        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-widest"
        style={{
          background: `color-mix(in srgb, ${moodColor} 20%, transparent)`,
          border: `1px solid ${moodColor}`,
          color: moodColor,
          fontFamily: 'JetBrains Mono, monospace',
          transition: 'all 0.8s ease',
        }}
      >
        <span>{MOOD_EMOJI[mood]}</span>
        <span>{mood}</span>
      </div>
    )
  }