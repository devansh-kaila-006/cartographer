import { useState } from 'react'
import { CloseIcon, KeyIcon, CheckIcon } from './Icons'
import './SettingsModal.css'

export function SettingsModal({ apiKeys, selectedProvider, onSave, onClose }) {
  const [keys, setKeys] = useState(apiKeys)
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    onSave(keys, 'gemini')
  }

  const handleKeyChange = (value) => {
    setKeys(prev => ({
      ...prev,
      gemini: value
    }))
  }

  const geminiProvider = {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google\'s Gemini 2.5 Flash API',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1"/>
        <path d="M16 6C13.7909 6 12 7.79086 12 10V16H16V14C16 12.8954 16.8954 12 18 12H20V10C20 7.79086 18.2091 6 16 6Z" fill="currentColor"/>
        <path d="M16 26C18.2091 26 20 24.2091 20 22V16H16V18C16 19.1046 15.1046 20 14 20H12V22C12 24.2091 13.7909 26 16 26Z" fill="currentColor" fillOpacity="0.7"/>
        <path d="M6 16C6 13.7909 7.79086 12 10 12H16V16H14C12.8954 16 12 16.8954 12 18V20H10C7.79086 20 6 18.2091 6 16Z" fill="currentColor" fillOpacity="0.4"/>
        <path d="M26 16C26 18.2091 24.2091 20 22 20H16V16H18C19.1046 16 20 15.1046 20 14V12H22C24.2091 12 26 13.7909 26 16Z" fill="currentColor" fillOpacity="0.9"/>
      </svg>
    ),
    placeholder: 'AIza...'
  }

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3C4.5 3 1.5 5.5 1 8C1.5 10.5 4.5 13 8 13C11.5 13 14.5 10.5 15 8C14.5 5.5 11.5 3 8 3ZM8 11C6.34315 11 5 9.65685 5 8C5 6.34315 6.34315 5 8 5C9.65685 5 11 6.34315 11 8C11 9.65685 9.65685 11 8 11ZM8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8C9.5 8.82843 8.82843 9.5 8 9.5Z" fill="currentColor"/>
    </svg>
  )

  const EyeOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 3C4.5 3 1.5 5.5 1 8C1.5 10.5 4.5 13 8 13C11.5 13 14.5 10.5 15 8C14.5 5.5 11.5 3 8 3ZM8 11C6.34315 11 5 9.65685 5 8C5 6.34315 6.34315 5 8 5C9.65685 5 11 6.34315 11 8C11 9.65685 9.65685 11 8 11ZM8 9.5C7.17157 9.5 6.5 8.82843 6.5 8C6.5 7.17157 7.17157 6.5 8 6.5C8.82843 6.5 9.5 7.17157 9.5 8C9.5 8.82843 8.82843 9.5 8 9.5Z" fill="currentColor" fillOpacity="0.3"/>
      <path d="M3 3L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title">
            <span className="settings-icon"><KeyIcon /></span>
            <h2>API Settings</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        {/* Description */}
        <div className="settings-description">
          <p>Configure your Google Gemini API key to generate file summaries. Keys are stored locally in your browser.</p>
        </div>

        {/* Provider Info */}
        <div className="settings-section">
          <h3 className="section-title">AI Provider</h3>
          <div className="provider-card active">
            <span className="provider-icon">{geminiProvider.icon}</span>
            <span className="provider-name">{geminiProvider.name}</span>
            <span className="provider-desc">{geminiProvider.description}</span>
          </div>
        </div>

        {/* API Key Input */}
        <div className="settings-section">
          <h3 className="section-title">API Key</h3>
          <div className="api-key-input">
            <label className="input-label">
              <span className="label-icon">{geminiProvider.icon}</span>
              <span className="label-text">{geminiProvider.name} API Key</span>
            </label>
            <div className="input-wrapper">
              <input
                type={showKey ? 'text' : 'password'}
                className="settings-input"
                placeholder={geminiProvider.placeholder}
                value={keys.gemini}
                onChange={(e) => handleKeyChange(e.target.value)}
              />
              <button
                className="toggle-visibility"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="settings-actions">
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
