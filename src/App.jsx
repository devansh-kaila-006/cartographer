import { useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { TopBar } from './components/TopBar'
import { LeftSidebar } from './components/LeftSidebar'
import { VisualizationArea } from './components/VisualizationArea'

function App() {
  const [repoInfo, setRepoInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState('fetching')
  const [currentView, setCurrentView] = useState('icicle')
  const [selectedFile, setSelectedFile] = useState(null)

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
    setSelectedFile(null)
    setCurrentView('icicle')
  }

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  // Handle file click
  const handleFileClick = (file) => {
    setSelectedFile(file)
    console.log('Selected file:', file)
  }

  // Handle settings
  const handleOpenSettings = () => {
    // TODO: Implement settings modal
    alert('Settings coming soon!')
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
        <>
          <TopBar
            repoInfo={repoInfo}
            currentView={currentView}
            onViewChange={handleViewChange}
            onReset={handleReset}
            onOpenSettings={handleOpenSettings}
          />

          <LeftSidebar
            files={[]}
            onFileClick={handleFileClick}
            selectedFile={selectedFile}
          />

          <VisualizationArea currentView={currentView} />
        </>
      )}
    </>
  )
}

export default App
