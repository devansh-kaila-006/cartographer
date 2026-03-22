import { useState } from 'react'
import './AuthPanel.css'

export function AuthPanel({ onAuth }) {
  const [repoInput, setRepoInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Parse owner/repo from input
    const match = repoInput.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (match) {
      const [, owner, repo] = match
      await onAuth({ owner, repo })
    }

    setIsLoading(false)
  }

  const handleDemo = async () => {
    setIsLoading(true)
    // Use a popular open-source repo for demo
    await onAuth({ owner: 'facebook', repo: 'react' })
    setIsLoading(false)
  }

  return (
    <div className="auth-panel glass">
      <div className="auth-content">
        <h2 className="auth-title">CARTOGRAPHER</h2>
        <p className="auth-subtitle">Codebase Visualization System</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="https://github.com/owner/repo"
            className="auth-input glass"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="auth-button glow-cyan"
            disabled={isLoading || !repoInput}
          >
            {isLoading ? 'Loading...' : 'Visualize Repository'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button
          onClick={handleDemo}
          className="demo-button glow-violet"
          disabled={isLoading}
        >
          Load Demo Repository
        </button>

        <p className="auth-note">
          No API key required for public repos
        </p>
      </div>
    </div>
  )
}
