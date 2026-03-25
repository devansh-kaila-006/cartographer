import { formatDistanceToNow } from 'date-fns'
import './QuickStatsPanel.css'

export function QuickStatsPanel({ files, commits, visible, onClose, audioManager }) {
  if (!visible) return null

  // Calculate statistics
  const totalFiles = files.length
  const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0)

  // Format size to human-readable
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i]
  }

  // Calculate language distribution
  const languageStats = files.reduce((acc, file) => {
    const lang = file.language || 'unknown'
    acc[lang] = (acc[lang] || 0) + 1
    return acc
  }, {})

  const sortedLanguages = Object.entries(languageStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const topLanguage = sortedLanguages[0]?.[0] || 'N/A'
  const topLanguagePercentage = sortedLanguages[0]
    ? Math.round((sortedLanguages[0][1] / totalFiles) * 100)
    : 0

  // Get last updated date from commits
  const lastUpdated = commits && commits.length > 0
    ? commits[0].date
    : files.length > 0
    ? files[files.length - 1]?.createdAt
    : null

  const formattedLastUpdate = lastUpdated
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })
    : 'N/A'

  // Calculate file type distribution
  const fileTypes = files.reduce((acc, file) => {
    const ext = file.name.split('.').pop().toLowerCase()
    acc[ext] = (acc[ext] || 0) + 1
    return acc
  }, {})

  const sortedFileTypes = Object.entries(fileTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="quick-stats-overlay" onClick={onClose}>
      <div
        className="quick-stats-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="quick-stats-header">
          <h2>Repository Statistics</h2>
          <button
            className="close-button"
            onClick={() => {
              audioManager?.playClick()
              onClose()
            }}
            onMouseEnter={() => audioManager?.playHover()}
          >
            ✕
          </button>
        </div>

        <div className="quick-stats-content">
          {/* Main Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Files</div>
              <div className="stat-value">{totalFiles.toLocaleString()}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Total Size</div>
              <div className="stat-value">{formatSize(totalSize)}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Top Language</div>
              <div className="stat-value">{topLanguage}</div>
              <div className="stat-sub">{topLanguagePercentage}% of codebase</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Last Updated</div>
              <div className="stat-value small">{formattedLastUpdate}</div>
            </div>
          </div>

          {/* Language Breakdown */}
          <div className="stats-section">
            <h3>Languages</h3>
            <div className="language-list">
              {sortedLanguages.map(([lang, count]) => {
                const percentage = Math.round((count / totalFiles) * 100)
                return (
                  <div key={lang} className="language-item">
                    <div className="language-info">
                      <span className="language-name">{lang}</span>
                      <span className="language-count">{count} files</span>
                    </div>
                    <div className="language-bar-container">
                      <div
                        className="language-bar"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* File Extensions */}
          {sortedFileTypes.length > 0 && (
            <div className="stats-section">
              <h3>File Extensions</h3>
              <div className="extension-list">
                {sortedFileTypes.map(([ext, count]) => (
                  <div key={ext} className="extension-item">
                    <span className="extension-name">.{ext}</span>
                    <span className="extension-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
