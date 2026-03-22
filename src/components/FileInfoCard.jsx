import { useState } from 'react'
import { CloseIcon, CheckIcon, KeyIcon } from './Icons'
import './FileInfoCard.css'

const FileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

export function FileInfoCard({ file, visible, onClose, onGenerateSummary, summary, isGenerating, repoInfo, hasApiKey }) {
  const [copied, setCopied] = useState(false)

  if (!visible || !file) return null

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Get language display
  const getLanguageDisplay = (lang) => {
    if (!lang) return 'Unknown'
    const langMap = {
      'jsx': 'JavaScript JSX',
      'js': 'JavaScript',
      'tsx': 'TypeScript JSX',
      'ts': 'TypeScript',
      'css': 'CSS',
      'html': 'HTML',
      'json': 'JSON',
      'md': 'Markdown',
      'py': 'Python',
      'go': 'Go',
      'rs': 'Rust',
    }
    return langMap[lang] || lang.toUpperCase()
  }

  // Handle copy path
  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle view on GitHub
  const handleViewOnGitHub = () => {
    if (repoInfo) {
      const url = `https://github.com/${repoInfo.owner}/${repoInfo.repo}/blob/main/${file.path}`
      window.open(url, '_blank')
    }
  }

  // Handle generate summary
  const handleGenerateSummary = () => {
    if (onGenerateSummary) {
      onGenerateSummary(file)
    }
  }

  return (
    <div className="file-info-card">
      <button className="close-button" onClick={onClose}>
        <CloseIcon />
      </button>

      {/* File Header */}
      <div className="file-header">
        <div className="file-icon-wrapper">
          <span className="file-icon"><FileIcon /></span>
        </div>
        <div className="file-name-section">
          <h3 className="file-name">{file.name}</h3>
          <p className="file-path">{file.path}</p>
        </div>
      </div>

      {/* File Metadata */}
      <div className="file-metadata">
        <div className="metadata-row">
          <span className="metadata-label">Size</span>
          <span className="metadata-value">{formatSize(file.size)}</span>
        </div>
        <div className="metadata-row">
          <span className="metadata-label">Language</span>
          <span className="metadata-value">{getLanguageDisplay(file.language)}</span>
        </div>
      </div>

      {/* AI Summary Section */}
      {summary ? (
        <div className="summary-section">
          <div className="summary-header">
            <span className="summary-icon">AI</span>
            <span className="summary-title">AI Analysis</span>
          </div>
          <p className="summary-text">{summary}</p>
        </div>
      ) : !hasApiKey ? (
        <div className="no-api-key-section">
          <div className="no-api-key-content">
            <span className="no-api-key-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2C5.52944 2 2 5.52944 2 10C2 14.4706 5.52944 18 10 18C14.4706 18 18 14.4706 18 10C18 5.52944 14.4706 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z" fill="currentColor" fillOpacity="0.5"/>
                <path d="M10 6V10L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <div className="no-api-key-text">
              <p className="no-api-key-title">No API Key Configured</p>
              <p className="no-api-key-desc">Add an API key to generate AI summaries</p>
            </div>
          </div>
          <button
            className="configure-api-btn"
            onClick={onGenerateSummary}
          >
            <KeyIcon />
            Configure API Key
          </button>
        </div>
      ) : (
        <button
          className="generate-summary-btn"
          onClick={handleGenerateSummary}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate AI Summary'}
        </button>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          className="action-btn"
          onClick={handleCopyPath}
          disabled={copied}
        >
          {copied ? <><CheckIcon /> Copied!</> : 'Copy Path'}
        </button>
        {repoInfo && (
          <button
            className="action-btn"
            onClick={handleViewOnGitHub}
          >
            View on GitHub
          </button>
        )}
      </div>
    </div>
  )
}
