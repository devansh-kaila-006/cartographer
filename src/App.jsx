import { useState, useEffect } from 'react'
import { LandingPage } from './components/LandingPage'
import { TopBar } from './components/TopBar'
import { LeftSidebar } from './components/LeftSidebar'
import { VisualizationArea } from './components/VisualizationArea'
import { FileInfoCard } from './components/FileInfoCard'
import { SettingsModal } from './components/SettingsModal'
import { AudioSettingsModal } from './components/AudioSettingsModal'
import { githubAPI } from './api/github'
import audioManager from './utils/audioManager'

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
  const [showAudioSettings, setShowAudioSettings] = useState(false)
  const [audioSettings, setAudioSettings] = useState({
    soundEnabled: false,
    volume: 50
  })

  // Load API keys from localStorage on mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('cartographer_api_keys')
    const savedProvider = localStorage.getItem('cartographer_ai_provider')
    const savedAudioSettings = localStorage.getItem('cartographer_audio_settings')

    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys))
    }
    if (savedProvider) {
      setSelectedProvider(savedProvider)
    }
    if (savedAudioSettings) {
      setAudioSettings(JSON.parse(savedAudioSettings))
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

  // Save audio settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('cartographer_audio_settings', JSON.stringify(audioSettings))
    // Update audio manager
    audioManager.setEnabled(audioSettings.soundEnabled)
    audioManager.setVolume(audioSettings.volume)
  }, [audioSettings])

  // Initialize audio manager on mount
  useEffect(() => {
    audioManager.setEnabled(audioSettings.soundEnabled)
    audioManager.setVolume(audioSettings.volume)
  }, [])

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

  // Handle audio settings
  const handleOpenAudioSettings = () => {
    setShowAudioSettings(true)
  }

  const handleCloseAudioSettings = () => {
    setShowAudioSettings(false)
  }

  const handleSaveAudioSettings = (soundEnabled, volume) => {
    setAudioSettings({
      soundEnabled,
      volume
    })
    setShowAudioSettings(false)
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
          audioManager={audioManager}
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
            onOpenAudioSettings={handleOpenAudioSettings}
            audioManager={audioManager}
          />

          <LeftSidebar
            files={files}
            onFileClick={handleFileClick}
            selectedFile={selectedFile}
            audioManager={audioManager}
          />

          <VisualizationArea
            currentView={currentView}
            files={files}
            onFileClick={handleFileClick}
            audioManager={audioManager}
          />

          <FileInfoCard
            file={selectedFile}
            audioManager={audioManager}
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
          audioManager={audioManager}
        />
      )}

      {/* Audio Settings Modal */}
      {showAudioSettings && (
        <AudioSettingsModal
          soundEnabled={audioSettings.soundEnabled}
          volume={audioSettings.volume}
          onSave={handleSaveAudioSettings}
          onClose={handleCloseAudioSettings}
          audioManager={audioManager}
        />
      )}
    </>
  )
}

export default App
