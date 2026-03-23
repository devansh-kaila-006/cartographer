import { useState } from 'react'
import { SunburstIcon, ChordIcon, GridIcon, RefreshIcon, SettingsIcon, KeyIcon, AudioIcon, HelpIcon } from './Icons'
import './TopBar.css'

export function TopBar({ repoInfo, currentView, onViewChange, onReset, onOpenSettings, onOpenAudioSettings, onShowShortcuts, audioManager }) {
  const [showDropdown, setShowDropdown] = useState(false)

  const views = [
    { id: 'sunburst', label: 'Sunburst', icon: <SunburstIcon /> },
    { id: 'chord', label: 'Chord', icon: <ChordIcon /> },
    { id: 'grid', label: 'Grid', icon: <GridIcon /> }
  ]

  return (
    <div className="top-bar">
      {/* Left: Repository Info */}
      <div className="top-bar-left">
        <div className="repo-info">
          <span className="repo-name">{repoInfo?.owner || ''}/{repoInfo?.repo || ''}</span>
        </div>
      </div>

      {/* Center: View Selector */}
      <div className="top-bar-center">
        <div className="view-selector">
          {views.map(view => (
            <button
              key={view.id}
              className={`view-button ${currentView === view.id ? 'active' : ''}`}
              onClick={() => {
                audioManager?.playClick()
                onViewChange(view.id)
              }}
              onMouseEnter={() => audioManager?.playHover()}
              title={`${view.label} visualization`}
            >
              <span className="view-icon">{view.icon}</span>
              <span className="view-label">{view.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="top-bar-right">
        <button
          className="action-button"
          onClick={() => {
            audioManager?.playClick()
            onReset()
          }}
          onMouseEnter={() => audioManager?.playHover()}
          title="Load new repository"
        >
          <span className="action-icon"><RefreshIcon /></span>
          <span className="action-label">Load New</span>
        </button>

        <div className="settings-dropdown">
          <button
            className="action-button"
            onClick={() => {
              audioManager?.playClick()
              setShowDropdown(!showDropdown)
            }}
            onMouseEnter={() => audioManager?.playHover()}
            title="Settings"
          >
            <span className="action-icon"><SettingsIcon /></span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  audioManager?.playClick()
                  onOpenSettings()
                  setShowDropdown(false)
                }}
                onMouseEnter={() => audioManager?.playHover()}
              >
                <span><KeyIcon /></span>
                <span>API Keys</span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  audioManager?.playClick()
                  onOpenAudioSettings()
                  setShowDropdown(false)
                }}
                onMouseEnter={() => audioManager?.playHover()}
              >
                <span><AudioIcon /></span>
                <span>Audio</span>
              </button>
            </div>
          )}
        </div>

        <button
          className="action-button shortcuts-button"
          onClick={() => {
            audioManager?.playClick()
            onShowShortcuts()
          }}
          onMouseEnter={() => audioManager?.playHover()}
          title="Keyboard shortcuts (?)"
        >
          <span className="action-icon"><HelpIcon /></span>
          <span className="action-label shortcuts-label">Shortcuts</span>
        </button>
      </div>
    </div>
  )
}
