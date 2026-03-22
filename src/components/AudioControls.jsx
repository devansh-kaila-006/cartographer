import { useState, useEffect } from 'react'
import { audioManager } from '../utils/audioManager'
import './AudioControls.css'

export function AudioControls({ showSettings: externalShowSettings, onToggleSettings }) {
  const [enabled, setEnabled] = useState(true)
  const [volume, setVolume] = useState(0.3)
  const [internalShowSettings, setInternalShowSettings] = useState(false)

  const showSettings = externalShowSettings !== undefined ? externalShowSettings : internalShowSettings

  useEffect(() => {
    // Initialize audio on first user interaction
    const handleUserInteraction = async () => {
      await audioManager.init()
      document.removeEventListener('click', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    return () => {
      document.removeEventListener('click', handleUserInteraction)
    }
  }, [])

  const handleToggle = () => {
    const newState = audioManager.toggle()
    setEnabled(newState)
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    audioManager.setVolume(newVolume)
  }

  const playTestSound = () => {
    audioManager.play('success')
  }

  return (
    <div className="audio-controls">
      <button
        className={`audio-toggle glass ${enabled ? 'enabled' : ''}`}
        onClick={handleToggle}
        title={enabled ? 'Mute' : 'Unmute'}
      >
        {enabled ? 'Sound On' : 'Sound Off'}
      </button>

      {showSettings && (
        <div className="audio-settings glass">
          <div className="audio-setting">
            <label>Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
            <span className="volume-value">{Math.round(volume * 100)}%</span>
          </div>

          <div className="audio-setting">
            <button
              className="test-sound-btn glass"
              onClick={playTestSound}
            >
              Test Sound
            </button>
          </div>

          <div className="audio-hint">
            {enabled ? 'Sound effects enabled' : 'Sound effects muted'}
          </div>
        </div>
      )}

      {onToggleSettings === undefined && (
        <button
          className="audio-settings-toggle glass"
          onClick={() => setInternalShowSettings(!internalShowSettings)}
          title="Audio Settings"
        >
          Settings
        </button>
      )}
    </div>
  )
}
