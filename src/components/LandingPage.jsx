import { useState } from 'react'
import { LoadingIcon, CheckIcon } from './Icons'
import './LandingPage.css'

export function LandingPage({ onLoad, isLoading, loadingProgress, loadingStage, audioManager }) {
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!owner.trim() || !repo.trim()) {
      setError('Please enter both owner and repository')
      audioManager?.playError()
      return
    }

    setError('')
    audioManager?.playSuccess()
    onLoad(owner.trim(), repo.trim())
  }

  const loadSampleRepo = (sampleOwner, sampleRepo) => {
    audioManager?.playClick()
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
                <span className="step-icon">
                  {loadingStage === 'fetching' ? <LoadingIcon /> : <CheckIcon />}
                </span>
                Fetching file tree
              </div>
              <div className={`loading-step ${loadingStage === 'analyzing' ? 'active' : loadingStage === 'fetching' ? '' : 'done'}`}>
                <span className="step-icon">
                  {loadingStage === 'analyzing' ? <LoadingIcon /> : loadingStage === 'fetching' ? '' : <CheckIcon />}
                </span>
                Analyzing structure
              </div>
              <div className={`loading-step ${loadingStage === 'building' ? 'active' : loadingStage === 'fetching' || loadingStage === 'analyzing' ? '' : 'done'}`}>
                <span className="step-icon">
                  {loadingStage === 'building' ? <LoadingIcon /> : loadingStage === 'fetching' || loadingStage === 'analyzing' ? '' : <CheckIcon />}
                </span>
                Building visualization
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
              onMouseEnter={() => audioManager?.playHover()}
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
                onMouseEnter={() => audioManager?.playHover()}
              >
                facebook/react
              </button>
              <button
                className="btn btn-ghost sample-btn"
                onClick={() => loadSampleRepo('vercel', 'next.js')}
                disabled={isLoading}
                onMouseEnter={() => audioManager?.playHover()}
              >
                vercel/next.js
              </button>
              <button
                className="btn btn-ghost sample-btn"
                onClick={() => loadSampleRepo('nodejs', 'node')}
                disabled={isLoading}
                onMouseEnter={() => audioManager?.playHover()}
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
