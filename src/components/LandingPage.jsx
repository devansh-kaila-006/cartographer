import { useState } from 'react'
import './LandingPage.css'

export function LandingPage({ onLoad, isLoading, loadingProgress, loadingStage }) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!owner.trim() || !repo.trim()) {
      setError('Please enter both owner and repository')
      return
    }

    setError('')
    onLoad(owner.trim(), repo.trim())
  }

  const loadSampleRepo = (sampleOwner, sampleRepo) => {
    setOwner(sampleOwner)
    setRepo(sampleRepo)
  }

  if (isLoading) {
    return (
      <div className="landing-page">
        <div className="loading-container">
          <div className="loading-card card">
            <h2 className="loading-title">Analyzing repository...</h2>
            <div className="progress-bar-container">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <span className="progress-text">{loadingProgress}%</span>
            </div>
            <div className="loading-steps">
              <div className={`loading-step ${loadingStage === 'fetching' ? 'active' : 'done'}`}>
                {loadingStage === 'fetching' ? '⏳' : '✓'} Fetching file tree
              </div>
              <div className={`loading-step ${loadingStage === 'analyzing' ? 'active' : loadingStage === 'fetching' ? '' : 'done'}`}>
                {loadingStage === 'analyzing' ? '⏳' : loadingStage === 'fetching' ? '' : '✓'} Analyzing structure
              </div>
              <div className={`loading-step ${loadingStage === 'building' ? 'active' : loadingStage === 'fetching' || loadingStage === 'analyzing' ? '' : 'done'}`}>
                {loadingStage === 'building' ? '⏳' : loadingStage === 'fetching' || loadingStage === 'analyzing' ? '' : '✓'} Building visualization
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="landing-page">
      <div className="landing-container">
        <div className="landing-card card">
          {/* Logo/Title */}
          <div className="landing-header">
            <h1 className="landing-title">Cartographer</h1>
            <p className="landing-subtitle">
              Understand any codebase visually
            </p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="landing-form">
            <div className="input-group">
              <div className="input-row">
                <div className="input-wrapper">
                  <label htmlFor="owner" className="input-label">Owner</label>
                  <input
                    id="owner"
                    type="text"
                    className="input"
                    placeholder="facebook"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <span className="input-separator">/</span>
                <div className="input-wrapper">
                  <label htmlFor="repo" className="input-label">Repository</label>
                  <input
                    id="repo"
                    type="text"
                    className="input"
                    placeholder="react"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary submit-btn"
              disabled={isLoading}
            >
              Load Repository
            </button>
          </form>

          {/* Sample Repos */}
          <div className="sample-repos">
            <p className="sample-label">Try popular repositories:</p>
            <div className="sample-buttons">
              <button
                className="btn btn-ghost sample-btn"
                onClick={() => loadSampleRepo('facebook', 'react')}
                disabled={isLoading}
              >
                facebook/react
              </button>
              <button
                className="btn btn-ghost sample-btn"
                onClick={() => loadSampleRepo('vercel', 'next.js')}
                disabled={isLoading}
              >
                vercel/next.js
              </button>
              <button
                className="btn btn-ghost sample-btn"
                onClick={() => loadSampleRepo('nodejs', 'node')}
                disabled={isLoading}
              >
                nodejs/node
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
