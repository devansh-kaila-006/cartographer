import { useState } from 'react'
import { IcicleIcon, SunburstIcon, ChordIcon, RefreshIcon, SettingsIcon, KeyIcon, AudioIcon } from './Icons'
import './TopBar.css'

export function TopBar({ repoInfo, currentView, onViewChange, onReset, onOpenSettings }) {
  const [showDropdown, setShowDropdown] = useState(false)

  const views = [
    { id: 'icicle', label: 'Icicle', icon: <IcicleIcon /> },
    { id: 'sunburst', label: 'Sunburst', icon: <SunburstIcon /> },
    { id: 'chord', label: 'Chord', icon: <ChordIcon /> }
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
              onClick={() => onViewChange(view.id)}
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
          onClick={onReset}
          title="Load new repository"
        >
          <span className="action-icon"><RefreshIcon /></span>
          <span className="action-label">Load New</span>
        </button>

        <div className="settings-dropdown">
          <button
            className="action-button"
            onClick={() => setShowDropdown(!showDropdown)}
            title="Settings"
          >
            <span className="action-icon"><SettingsIcon /></span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <button
                className="dropdown-item"
                onClick={() => {
                  onOpenSettings()
                  setShowDropdown(false)
                }}
              >
                <span><KeyIcon /></span>
                <span>API Keys</span>
              </button>
              <button
                className="dropdown-item"
                onClick={() => {
                  // TODO: Implement audio settings
                  setShowDropdown(false)
                }}
              >
                <span><AudioIcon /></span>
                <span>Audio</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
