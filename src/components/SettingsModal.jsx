import { useState } from 'react'
import { CloseIcon, KeyIcon, CheckIcon } from './Icons'
import './SettingsModal.css'

export function SettingsModal({ apiKeys, selectedProvider, onSave, onClose }) {
  const [keys, setKeys] = useState(apiKeys)
  const [provider, setProvider] = useState(selectedProvider)
  const [showKeys, setShowKeys] = useState({})

  const handleSave = () => {
    onSave(keys, provider)
  }

  const handleKeyChange = (providerName, value) => {
    setKeys(prev => ({
      ...prev,
      [providerName]: value
    }))
  }

  const toggleKeyVisibility = (providerName) => {
    setShowKeys(prev => ({
      ...prev,
      [providerName]: !prev[providerName]
    }))
  }

  const providers = [
    {
      id: 'claude',
      name: 'Claude',
      description: 'Anthropic\'s Claude API',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1"/>
          <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8ZM16 22C12.6863 22 10 19.3137 10 16C10 12.6863 12.6863 10 16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22Z" fill="currentColor"/>
          <circle cx="16" cy="16" r="3" fill="currentColor"/>
        </svg>
      ),
      placeholder: 'sk-ant-...'
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'OpenAI\'s GPT models',
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.1"/>
          <path d="M16 8L12 12H16V16L20 12H16V8Z" fill="currentColor"/>
          <path d="M16 24L20 20H16V16L12 20H16V24Z" fill="currentColor" fillOpacity="0.6"/>
          <path d="M8 16L12 12V16L8 20V16Z" fill="currentColor" fillOpacity="0.4"/>
          <path d="M24 16L20 20V16L24 12V16Z" fill="currentColor" fillOpacity="0.4"/>
        </svg>
      ),
      placeholder: 'sk-...'
    },
    {
      id: 'gemini',
      name: 'Gemini',
      description: 'Google\'s Gemini API',
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
  ]

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
          <p>Configure your AI provider API keys to generate file summaries. Keys are stored locally in your browser.</p>
        </div>

        {/* Provider Selection */}
        <div className="settings-section">
          <h3 className="section-title">Select AI Provider</h3>
          <div className="provider-grid">
            {providers.map(p => (
              <button
                key={p.id}
                className={`provider-card ${provider === p.id ? 'active' : ''}`}
                onClick={() => setProvider(p.id)}
              >
                <span className="provider-icon">{p.icon}</span>
                <span className="provider-name">{p.name}</span>
                <span className="provider-desc">{p.description}</span>
                {provider === p.id && <span className="provider-check"><CheckIcon /></span>}
              </button>
            ))}
          </div>
        </div>

        {/* API Keys Input */}
        <div className="settings-section">
          <h3 className="section-title">API Keys</h3>
          {providers.map(p => (
            <div key={p.id} className="api-key-input">
              <label className="input-label">
                <span className="label-icon">{p.icon}</span>
                <span className="label-text">{p.name} API Key</span>
                {provider === p.id && <span className="active-badge">Active</span>}
              </label>
              <div className="input-wrapper">
                <input
                  type={showKeys[p.id] ? 'text' : 'password'}
                  className="settings-input"
                  placeholder={p.placeholder}
                  value={keys[p.id]}
                  onChange={(e) => handleKeyChange(p.id, e.target.value)}
                />
                <button
                  className="toggle-visibility"
                  onClick={() => toggleKeyVisibility(p.id)}
                  type="button"
                >
                  {showKeys[p.id] ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>
          ))}
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
