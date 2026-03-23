import { format } from 'date-fns'
import { PlayIcon, PauseIcon, ResetIcon, CloseIcon } from './Icons'
import './Timeline.css'

export function Timeline({ commits, position, onPositionChange, isPlaying, onTogglePlay, onReset, audioManager, onClose }) {
  // Get date range from commits
  const getDateRange = () => {
    if (!commits || commits.length === 0) {
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      return { start: oneYearAgo, end: now }
    }

    const dates = commits.map(c => new Date(c.date)).filter(d => !isNaN(d.getTime())).sort((a, b) => a - b)
    if (dates.length === 0) {
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      return { start: oneYearAgo, end: now }
    }

    return {
      start: dates[0],
      end: dates[dates.length - 1]
    }
  }

  const { start, end } = getDateRange()

  // Get current date based on position
  const getCurrentDate = () => {
    const totalMs = end.getTime() - start.getTime()
    const currentMs = totalMs * (position / 100)
    return new Date(start.getTime() + currentMs)
  }

  const currentDate = getCurrentDate()

  // Handle slider change
  const handleSliderChange = (e) => {
    const newPosition = Number(e.target.value)
    onPositionChange(newPosition)
  }

  return (
    <div className="timeline">
      <button
        className="timeline-close-btn"
        onClick={() => {
          audioManager?.playClick()
          onClose()
        }}
        title="Close timeline"
      >
        <CloseIcon />
      </button>
      <div className="timeline-content">
        {/* Left: Date indicator */}
        <div className="timeline-date">
          <div className="date-label">Current Date</div>
          <div className="date-value">
            {format(currentDate, 'MMM d, yyyy')}
          </div>
          {commits && commits.length > 0 && (
            <div className="commit-info">
              {Math.round((position / 100) * commits.length)} of {commits.length} commits
            </div>
          )}
        </div>

        {/* Center: Timeline slider */}
        <div className="timeline-track">
          <div className="timeline-info">
            <span className="timeline-start">{format(start, 'MMM yyyy')}</span>
            <span className="timeline-end">{format(end, 'MMM yyyy')}</span>
          </div>
          <div className="timeline-slider-container">
            <div
              className="timeline-progress"
              style={{ width: `${position}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={position}
              onChange={handleSliderChange}
              className="timeline-slider"
              onMouseDown={() => audioManager?.playClick()}
            />
            <div
              className="timeline-thumb"
              style={{ left: `${position}%` }}
            >
              <div className="thumb-indicator" />
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="timeline-controls">
          <button
            className="timeline-btn"
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            className="timeline-btn"
            onClick={onReset}
            title="Reset to present"
          >
            <ResetIcon />
          </button>
        </div>
      </div>
    </div>
  )
}
