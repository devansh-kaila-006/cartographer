import './BuildingInfo.css'

export function BuildingInfo({ file, summary, visible, onClose }) {
  if (!visible || !file) return null

  // Format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get language icon/color
  const getLanguageInfo = (lang) => {
    const icons = {
      javascript: 'JS',
      typescript: 'TS',
      tsx: 'TSX',
      jsx: 'JSX',
      python: 'PY',
      rust: 'RS',
      go: 'GO',
      java: 'JAVA',
      cpp: 'C++',
      c: 'C',
      ruby: 'RB',
      php: 'PHP',
      swift: 'SWIFT',
      kotlin: 'KT',
      css: 'CSS',
      html: 'HTML',
      json: 'JSON',
      markdown: 'MD',
      unknown: 'FILE'
    }
    return {
      icon: icons[lang] || 'FILE',
      color: lang === 'javascript' ? '#f7df1e' :
             lang === 'typescript' ? '#3178c6' :
             lang === 'tsx' ? '#3178c6' :
             lang === 'jsx' ? '#f7df1e' :
             lang === 'python' ? '#3776ab' :
             lang === 'rust' ? '#ce412b' :
             '#00f3ff'
    }
  }

  const langInfo = getLanguageInfo(file.language)

  return (
    <div className="building-info glass">
      <button
        className="info-close"
        onClick={onClose}
      >
        ×
      </button>

      <div className="info-header">
        <span className="info-icon">[{langInfo.icon}]</span>
        <h3 className="info-title">{file.path.split('/').pop()}</h3>
      </div>

      <div className="info-meta">
        <div className="info-row">
          <span className="info-label">PATH</span>
          <span className="info-value">{file.path}</span>
        </div>
        <div className="info-row">
          <span className="info-label">LANGUAGE</span>
          <span className="info-value" style={{ color: langInfo.color }}>
            {(file.language || 'unknown').toUpperCase()}
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">SIZE</span>
          <span className="info-value">{formatSize(file.size)}</span>
        </div>
      </div>

      {/* AI Summary Section */}
      {summary && (
        <div className="info-summary">
          <div className="summary-header">
            <span className="summary-icon">AI</span>
            <span className="summary-title">AI Analysis</span>
          </div>
          <p className="summary-text">{summary}</p>
        </div>
      )}

      {/* Loading state for summary */}
      {!summary && (
        <div className="info-summary-hint">
          <span className="hint-icon">INFO</span>
          <span className="hint-text">Add an API key to enable AI summaries</span>
        </div>
      )}

      <div className="info-actions">
        <button
          className="info-action-btn glass"
          onClick={() => window.open(`https://github.com/${file.path.replace(file.path.split('/')[0], '')}`, '_blank')}
        >
          View on GitHub
        </button>
      </div>
    </div>
  )
}
