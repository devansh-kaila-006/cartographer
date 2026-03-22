import { useState, useEffect } from 'react'
import { LandingPage } from './components/LandingPage'
import { TopBar } from './components/TopBar'
import { LeftSidebar } from './components/LeftSidebar'
import { VisualizationArea } from './components/VisualizationArea'
import { FileInfoCard } from './components/FileInfoCard'
import { SettingsModal } from './components/SettingsModal'
import { githubAPI } from './api/github'

function App() {
  const [repoInfo, setRepoInfo] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState('fetching')
  const [currentView, setCurrentView] = useState('sunburst')
  const [selectedFile, setSelectedFile] = useState(null)
  const [summaries, setSummaries] = useState(new Map())
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [files, setFiles] = useState([])
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeys, setApiKeys] = useState({
    gemini: ''
  })
  const [selectedProvider, setSelectedProvider] = useState('gemini')

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('cartographer_api_keys')
    const savedProvider = localStorage.getItem('cartographer_ai_provider')

    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys))
    }
    if (savedProvider) {
      setSelectedProvider(savedProvider)
    }
  }, [])

  // Save API keys to localStorage when they change
  useEffect(() => {
    localStorage.setItem('cartographer_api_keys', JSON.stringify(apiKeys))
  }, [apiKeys])

  // Save selected provider to localStorage
  useEffect(() => {
    localStorage.setItem('cartographer_ai_provider', selectedProvider)
  }, [selectedProvider])

  // Handle repository loading from landing page
  const handleLoadRepo = async (owner, repo) => {
    setIsLoading(true)
    setLoadingProgress(0)
    setLoadingStage('fetching')

    try {
      // Step 1: Fetch file tree from GitHub
      setLoadingProgress(20)
      const files = await githubAPI.getFileTree(owner, repo)

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
      setFiles(files)

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
    setCurrentView('sunburst')
    setSummaries(new Map())
    setFiles([])
  }

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view)
  }

  // Handle file click
  const handleFileClick = (file) => {
    setSelectedFile(file)
  }

  // Handle close file info card
  const handleCloseCard = () => {
    setSelectedFile(null)
  }

  // Handle generate AI summary
  const handleGenerateSummary = async (file) => {
    if (!file) return

    const apiKey = apiKeys.gemini
    if (!apiKey) {
      setShowSettings(true)
      return
    }

    setIsGeneratingSummary(true)

    try {
      const summary = await generateGeminiSummary(file, apiKey)
      setSummaries(prev => new Map(prev).set(file.path, summary))
    } catch (error) {
      console.error('Failed to generate summary:', error)
      alert(`Failed to generate AI summary: ${error.message}`)
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  // Generate summary using Gemini API
  const generateGeminiSummary = async (file, apiKey) => {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Provide a brief 2–3 sentence summary of what this file does in a codebase.\n\nFile: ${file.path}\nLanguage: ${file.language || "unknown"}\n\nCode:\n${file.content || ""}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned";
  };

  // Handle settings
  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  const handleCloseSettings = () => {
    setShowSettings(false)
  }

  const handleSaveSettings = (keys, provider) => {
    setApiKeys(keys)
    setSelectedProvider(provider)
    setShowSettings(false)
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
            files={files}
            onFileClick={handleFileClick}
            selectedFile={selectedFile}
          />

          <VisualizationArea
            currentView={currentView}
            files={files}
            onFileClick={handleFileClick}
          />

          <FileInfoCard
            file={selectedFile}
            visible={!!selectedFile}
            onClose={handleCloseCard}
            onGenerateSummary={handleGenerateSummary}
            summary={selectedFile ? summaries.get(selectedFile.path) : null}
            isGenerating={isGeneratingSummary}
            repoInfo={repoInfo}
            hasApiKey={!!apiKeys.gemini}
          />
        </>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          apiKeys={apiKeys}
          selectedProvider={selectedProvider}
          onSave={handleSaveSettings}
          onClose={handleCloseSettings}
        />
      )}
    </>
  )
}

export default App
