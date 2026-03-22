import { useState, useEffect } from 'react'
import { apiKeyManager } from '../utils/apiKeyManager'
import './APIKeyModal.css'

export function APIKeyModal({ onClose, onKeySaved }) {
  const [provider, setProvider] = useState('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [savedKeys, setSavedKeys] = useState({})

  useEffect(() => {
    // Load existing keys
    const keys = {}
    apiKeyManager.getProviders().forEach(p => {
      keys[p] = apiKeyManager.getKey(p)
    })
    setSavedKeys(keys)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Validate key
    if (!apiKey.trim()) {
      setError('Please enter an API key')
      return
    }

    if (!apiKeyManager.validateKey(provider, apiKey)) {
      setError(`Invalid ${provider} API key format`)
      return
    }

    // Save key
    apiKeyManager.setKey(provider, apiKey.trim())

    // Update saved keys
    setSavedKeys(prev => ({
      ...prev,
      [provider]: apiKey.trim()
    }))

    // Clear input
    setApiKey('')

    // Notify parent
    if (onKeySaved) {
      onKeySaved(provider)
    }
  }

  const handleRemoveKey = (providerToRemove) => {
    apiKeyManager.removeKey(providerToRemove)
    setSavedKeys(prev => {
      const newKeys = { ...prev }
      delete newKeys[providerToRemove]
      return newKeys
    })
  }

  const providerInfo = {
    anthropic: {
      name: 'Anthropic Claude',
      placeholder: 'sk-ant-...',
      url: 'https://console.anthropic.com/settings/keys'
    },
    openai: {
      name: 'OpenAI GPT',
      placeholder: 'sk-...',
      url: 'https://platform.openai.com/api-keys'
    },
    gemini: {
      name: 'Google Gemini',
      placeholder: 'AIza...',
      url: 'https://makersuite.google.com/app/apikey'
    },
    github: {
      name: 'GitHub (for Timeline)',
      placeholder: 'ghp_...',
      url: 'https://github.com/settings/tokens'
    },
    gemini_note: {
      name: 'Gemini API Note',
      placeholder: 'See note below',
      url: null
    }
  }

  return (
    <div className="api-key-modal-overlay" onClick={onClose}>
      <div className="api-key-modal glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>API Key Configuration</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <p className="modal-description">
            Add your API key to enable AI-powered code analysis. Keys are stored locally in your browser.
          </p>

          {/* Provider Selection */}
          <div className="provider-tabs">
            <button
              className={`provider-tab ${provider === 'anthropic' ? 'active' : ''}`}
              onClick={() => setProvider('anthropic')}
            >
              Claude
            </button>
            <button
              className={`provider-tab ${provider === 'openai' ? 'active' : ''}`}
              onClick={() => setProvider('openai')}
            >
              GPT
            </button>
            <button
              className={`provider-tab ${provider === 'gemini' ? 'active' : ''}`}
              onClick={() => setProvider('gemini')}
            >
              Gemini
            </button>
            <button
              className={`provider-tab ${provider === 'github' ? 'active' : ''}`}
              onClick={() => setProvider('github')}
            >
              GitHub
            </button>
          </div>

          {/* Key Input Form */}
          <form onSubmit={handleSubmit} className="key-form">
            <div className="input-group">
              <label htmlFor="apiKey">
                {providerInfo[provider].name} API Key
              </label>
              <div className="input-wrapper">
                <input
                  id="apiKey"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={providerInfo[provider].placeholder}
                  className="api-input glass"
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? 'Hide' : 'Show'}
                </button>
              </div>
              {error && <p className="error-message">{error}</p>}
            </div>

            <button type="submit" className="save-key-btn glow-cyan">
              Save API Key
            </button>
          </form>

          <a
            href={providerInfo[provider].url}
            target="_blank"
            rel="noopener noreferrer"
            className="get-key-link"
          >
            Get API Key →
          </a>

          {/* Saved Keys */}
          {Object.keys(savedKeys).length > 0 && (
            <div className="saved-keys">
              <h3>Saved Keys</h3>
              {Object.entries(savedKeys).map(([p, key]) => (
                <div key={p} className="saved-key-item">
                  <span className="key-provider">{providerInfo[p]?.name || p}</span>
                  <span className="key-display">
                    {key.slice(0, 8)}...{key.slice(-4)}
                  </span>
                  <button
                    onClick={() => handleRemoveKey(p)}
                    className="remove-key-btn"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Gemini Note */}
          {provider === 'gemini' && (
            <div className="gemini-note glass">
              <p className="note-title">Gemini API Setup</p>
              <p className="note-text">
                1. Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>
              </p>
              <p className="note-text">
                2. Create a new API key (free tier available)
              </p>
              <p className="note-text">
                3. Make sure to enable the Generative Language API
              </p>
              <p className="note-text" style={{ color: '#00f3ff', marginTop: '8px' }}>
                If you get 404 errors, your key might not have the right permissions. Try creating a new key.
              </p>
            </div>
          )}

          <p className="security-note">
            Your keys are stored locally and never sent to our servers.
          </p>
        </div>
      </div>
    </div>
  )
}
