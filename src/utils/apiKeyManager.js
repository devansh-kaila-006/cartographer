/**
 * API Key Manager - Secure storage and retrieval of LLM API keys
 */
export class APIKeyManager {
  constructor() {
    this.storageKey = 'cartographer_api_keys'
    this.keys = this.loadKeys()
  }

  /**
   * Load keys from localStorage
   */
  loadKeys() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading API keys:', error)
      return {}
    }
  }

  /**
   * Save keys to localStorage
   */
  saveKeys() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.keys))
    } catch (error) {
      console.error('Error saving API keys:', error)
    }
  }

  /**
   * Set an API key for a provider
   */
  setKey(provider, key) {
    this.keys[provider] = key
    this.saveKeys()
  }

  /**
   * Get an API key for a provider
   */
  getKey(provider) {
    return this.keys[provider] || null
  }

  /**
   * Remove an API key
   */
  removeKey(provider) {
    delete this.keys[provider]
    this.saveKeys()
  }

  /**
   * Check if a provider has a key set
   */
  hasKey(provider) {
    return !!this.keys[provider]
  }

  /**
   * Get all providers with keys
   */
  getProviders() {
    return Object.keys(this.keys)
  }

  /**
   * Clear all keys
   */
  clearAll() {
    this.keys = {}
    this.saveKeys()
  }

  /**
   * Validate key format (basic validation)
   */
  validateKey(provider, key) {
    const validators = {
      openai: (k) => k.startsWith('sk-'),
      anthropic: (k) => k.startsWith('sk-ant-'),
      gemini: (k) => k.length > 20,
      github: (k) => k.startsWith('ghp_') || k.startsWith('github_pat_')
    }

    const validator = validators[provider]
    return validator ? validator(key) : !!key
  }
}

// Singleton instance
export const apiKeyManager = new APIKeyManager()
