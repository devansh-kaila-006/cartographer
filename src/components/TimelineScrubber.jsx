import { useState, useEffect } from 'react'
import './TimelineScrubber.css'

export function TimelineScrubber({
  commits,
  currentPosition,
  onScrub,
  onPlay,
  isPlaying,
  onReset
}) {
  const [localPosition, setLocalPosition] = useState(currentPosition)
  const [hoveredCommit, setHoveredCommit] = useState(null)

  useEffect(() => {
    setLocalPosition(currentPosition)
  }, [currentPosition])

  const handleScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, x / rect.width))
    const newIndex = Math.round(percentage * (commits.length - 1))

    setLocalPosition(newIndex)
    if (onScrub) {
      onScrub(newIndex)
    }
  }

  const getCurrentCommit = () => {
    return commits[localPosition] || commits[0]
  }

  const getProgressPercentage = () => {
    if (commits.length === 0) return 0
    return (localPosition / (commits.length - 1)) * 100
  }

  const formatDate = (date) => {
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  if (!commits || commits.length === 0) return null

  const currentCommit = getCurrentCommit()

  return (
    <div className="timeline-scrubber">
      {/* Timeline Header */}
      <div className="timeline-header">
        <div className="timeline-info">
          <h3 className="timeline-title">Git History Timeline</h3>
          <div className="timeline-stats">
            <span className="timeline-stat">
              Commit {localPosition + 1} of {commits.length}
            </span>
            <span className="timeline-stat">
              {formatDate(currentCommit.date)}
            </span>
          </div>
        </div>

        <div className="timeline-controls">
          <button
            className="timeline-btn glass"
            onClick={onPlay}
            disabled={commits.length === 0}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            className="timeline-btn glass"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Scrubber Bar */}
      <div
        className="timeline-bar"
        onMouseMove={(e) => {
          if (e.buttons === 1) { // Only while dragging
            handleScrub(e)
          }
        }}
        onMouseDown={handleScrub}
        onClick={handleScrub}
      >
        {/* Progress fill */}
        <div
          className="timeline-progress"
          style={{ width: `${getProgressPercentage()}%` }}
        />

        {/* Commit markers */}
        {commits.map((commit, index) => {
          const percentage = (index / (commits.length - 1)) * 100
          const isActive = index === localPosition
          const isPast = index <= localPosition

          return (
            <div
              key={commit.sha}
              className={`timeline-marker ${isActive ? 'active' : ''} ${isPast ? 'past' : ''}`}
              style={{ left: `${percentage}%` }}
              onMouseEnter={() => setHoveredCommit(commit)}
              onMouseLeave={() => setHoveredCommit(null)}
              onClick={(e) => {
                e.stopPropagation()
                setLocalPosition(index)
                if (onScrub) onScrub(index)
              }}
            />
          )
        })}

        {/* Current position indicator */}
        <div
          className="timeline-indicator"
          style={{ left: `${getProgressPercentage()}%` }}
        />
      </div>

      {/* Commit message tooltip */}
      {hoveredCommit && (
        <div className="commit-tooltip glass">
          <div className="tooltip-message">{hoveredCommit.message}</div>
          <div className="tooltip-meta">
            {hoveredCommit.author} • {formatDate(hoveredCommit.date)}
          </div>
        </div>
      )}

      {/* Current commit display */}
      <div className="current-commit glass">
        <div className="commit-message">{currentCommit.message}</div>
        <div className="commit-meta">
          {currentCommit.author} • {formatDate(currentCommit.date)}
        </div>
      </div>
    </div>
  )
}
