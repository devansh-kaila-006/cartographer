import { useState } from 'react'
import './KeyboardShortcuts.css'

export function KeyboardShortcuts({ onClose, audioManager }) {
  const shortcuts = [
    { key: '⌘/Ctrl + F', description: 'Focus search' },
    { key: '1, 2, 3', description: 'Switch views (Sunburst, Chord, Grid)' },
    { key: '+ / -', description: 'Zoom in/out' },
    { key: '⌘/Ctrl + 0', description: 'Reset zoom' },
    { key: 'Space', description: 'Play/pause timeline' },
    { key: 'T', description: 'Toggle timeline' },
    { key: 'I', description: 'Toggle info box' },
    { key: 'R', description: 'Reset repository' },
    { key: '⌘/Ctrl + ,', description: 'Open settings' },
    { key: 'Escape', description: 'Close modals / Deselect file' },
  ]

  return (
    <div className="keyboard-shortcuts-overlay" onClick={onClose}>
      <div
        className="keyboard-shortcuts-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="keyboard-shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <button
            className="close-button"
            onClick={() => {
              audioManager?.playClick()
              onClose()
            }}
          >
            ×
          </button>
        </div>

        <div className="keyboard-shortcuts-list">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="shortcut-item">
              <div className="shortcut-key">{shortcut.key}</div>
              <div className="shortcut-description">{shortcut.description}</div>
            </div>
          ))}
        </div>

        <div className="keyboard-shortcuts-footer">
          <p>Press <kbd>?</kbd> anytime to show this help</p>
        </div>
      </div>
    </div>
  )
}
