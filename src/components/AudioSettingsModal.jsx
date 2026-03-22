import { useState } from 'react'
import { CloseIcon, AudioIcon } from './Icons'
import './AudioSettingsModal.css'

export function AudioSettingsModal({ soundEnabled, volume, onSave, onClose }) {
  const [enabled, setEnabled] = useState(soundEnabled)
  const [vol, setVol] = useState(volume)

  const handleSave = () => {
    onSave(enabled, vol)
  }

  return (
    <div className="audio-settings-modal-overlay" onClick={onClose}>
      <div className="audio-settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="audio-settings-header">
          <div className="audio-settings-title">
            <span className="audio-settings-icon"><AudioIcon /></span>
            <h2>Audio Settings</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Description */}
        <div className="audio-settings-description">
          <p>Configure audio feedback for interactions with visualizations.</p>
        </div>

        {/* Settings */}
        <div className="audio-settings-section">
          <h3 className="audio-section-title">Sound Effects</h3>

          <div className="audio-setting-row">
            <label className="audio-setting-label">
              <span className="audio-setting-text">Enable Sounds</span>
              <span className="audio-setting-desc">Play sounds on hover and click</span>
            </label>
            <button
              className={`toggle-button ${enabled ? 'active' : ''}`}
              onClick={() => setEnabled(!enabled)}
            >
              <span className="toggle-slider">{enabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="audio-setting-row">
            <label className="audio-setting-label">
              <span className="audio-setting-text">Volume</span>
              <span className="audio-setting-desc">Adjust sound volume level</span>
            </label>
            <div className="volume-control">
              <input
                type="range"
                min="0"
                max="100"
                value={vol}
                onChange={(e) => setVol(Number(e.target.value))}
                className="volume-slider"
                disabled={!enabled}
              />
              <span className="volume-value">{vol}%</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="audio-settings-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
