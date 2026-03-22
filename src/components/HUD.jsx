import { useState } from 'react'
import './HUD.css'

const VISUALIZATION_TYPES = [
  { name: 'TREEMAP', label: 'Treemap' },
  { name: 'SUNBURST', label: 'Sunburst' },
  { name: 'ICICLE', label: 'Icicle' },
  { name: 'CHORD', label: 'Chord Diagram' }
]

export function HUD({ repoInfo, fileCount, summaryCount, isLoading, visualizationType, hasApiKey, showTimeline, onReset, onOpenAPIKeyModal, onToggleTimeline, onToggleFileTree, onToggleAudioSettings, showAudioSettings, showFileTree, onVisualizationChange }) {
  if (!repoInfo) return null

  return (
    <div className="hud-container">
      {/* Top Bar */}
      <div className="hud-top glass">
        <div className="hud-section">
          <h1 className="hud-title">{repoInfo.owner}/{repoInfo.repo}</h1>
          <div className="hud-stats">
            <span className="hud-stat">
              <span className="hud-label">FILES</span>
              <span className="hud-value">{fileCount.toLocaleString()}</span>
            </span>
            <span className="hud-stat">
              <span className="hud-label">AI</span>
              <span className="hud-value">{summaryCount.toLocaleString()}</span>
            </span>
          </div>
        </div>
        <div className="hud-actions">
          <button
            onClick={onToggleFileTree}
            className={`file-tree-button glass ${showFileTree ? 'file-tree-active' : ''}`}
            disabled={isLoading}
          >
            Files
          </button>
          <button
            onClick={onToggleTimeline}
            className={`timeline-button glass ${showTimeline ? 'timeline-active' : ''}`}
            disabled={isLoading}
          >
            Timeline
          </button>
          <button
            onClick={onOpenAPIKeyModal}
            className={`api-key-button glass ${hasApiKey ? 'has-key' : ''}`}
            disabled={isLoading}
          >
            {hasApiKey ? 'API Key' : '+ API Key'}
          </button>
          <button
            onClick={onToggleAudioSettings}
            className={`settings-button glass ${showAudioSettings ? 'settings-active' : ''}`}
            disabled={isLoading}
          >
            Settings
          </button>
          <button
            onClick={onReset}
            className="reset-button glass"
            disabled={isLoading}
          >
            Change Repo
          </button>
        </div>
      </div>

      {/* Visualization Type Selector */}
      <div className="viz-type-selector glass">
        {VISUALIZATION_TYPES.map((type) => (
          <button
            key={type.name}
            onClick={() => onVisualizationChange && onVisualizationChange(type.name)}
            className={`viz-type-button ${visualizationType === type.name ? 'viz-type-active' : ''}`}
            disabled={isLoading}
            title={type.label}
          >
            <span className="viz-type-label">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Bottom Bar - Controls */}
      <div className="hud-bottom glass">
        <div className="hud-controls">
          <div className="hud-tip">
            <span className="hud-key">DRAG</span>
            <span className="hud-desc">Pan</span>
          </div>
          <div className="hud-tip">
            <span className="hud-key">SCROLL</span>
            <span className="hud-desc">Zoom</span>
          </div>
          <div className="hud-tip">
            <span className="hud-key">CLICK</span>
            <span className="hud-desc">Inspect File</span>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">Analyzing repository...</p>
        </div>
      )}
    </div>
  )
}
