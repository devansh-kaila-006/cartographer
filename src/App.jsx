import { useState } from 'react'
import { LandingPage } from './components/LandingPage'

function App() {
  const [repoInfo, setRepoInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState('fetching')

  // Handle repository loading from landing page
  const handleLoadRepo = async (owner, repo) => {
    setIsLoading(true)
    setLoadingProgress(0)
    setLoadingStage('fetching')

    try {
      // Step 1: Fetch file tree
      setLoadingProgress(20)

      // TODO: Implement actual GitHub API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Step 2: Analyze structure
      setLoadingProgress(60)
      setLoadingStage('analyzing')

      await new Promise(resolve => setTimeout(resolve, 800))

      // Step 3: Build visualization
      setLoadingProgress(80)
      setLoadingStage('building')

      await new Promise(resolve => setTimeout(resolve, 600))

      // Update state
      setRepoInfo({ owner, repo })

      // Complete
      setLoadingProgress(100)
    } catch (error) {
      alert(`Failed to load repository: ${error.message}`)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
        setLoadingProgress(0)
      }, 500)
    }
  }

  // Handle reset
  const handleReset = () => {
    setRepoInfo(null)
  }

  return (
    <>
      {/* Landing Page - shown when no repo is loaded */}
      {!repoInfo && (
        <LandingPage
          onLoad={handleLoadRepo}
          isLoading={isLoading}
          loadingProgress={loadingProgress}
          loadingStage={loadingStage}
        />
      )}

      {/* Main App - shown when repo is loaded */}
      {repoInfo && (
        <div className="main-app">
          <div className="placeholder">
            <h1>{repoInfo.owner}/{repoInfo.repo}</h1>
            <p>Repository loaded! Visualization coming in Phase 2...</p>
            <button className="btn btn-primary" onClick={handleReset}>
              Load New Repository
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default App
