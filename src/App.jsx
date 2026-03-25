import { useState, useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import { LandingPage } from './components/LandingPage'
import { TopBar } from './components/TopBar'
import { LeftSidebar } from './components/LeftSidebar'
import { VisualizationArea } from './components/VisualizationArea'
import { FileInfoCard } from './components/FileInfoCard'
import { SettingsModal } from './components/SettingsModal'
import { AudioSettingsModal } from './components/AudioSettingsModal'
import { Timeline } from './components/Timeline'
import { KeyboardShortcuts } from './components/KeyboardShortcuts'
import { QuickStatsPanel } from './components/QuickStatsPanel'
import { githubAPI } from './api/github'
import audioManager from './utils/audioManager'

function App() {
  const visualizationRef = useRef(null)
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

  // Timeline state
  const [showTimeline, setShowTimeline] = useState(false)
  const [timelinePosition, setTimelinePosition] = useState(100) // Percentage (0-100)
  const [isPlaying, setIsPlaying] = useState(false)
  const [commits, setCommits] = useState([])

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Keyboard shortcuts state
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)

  // Quick stats state
  const [showQuickStats, setShowQuickStats] = useState(false)

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

  // Auto-play timeline
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setTimelinePosition(prev => {
        if (prev >= 100) {
          setIsPlaying(false)
          return 100
        }
        return prev + 1
      })
    }, 100) // Update every 100ms

    return () => clearInterval(interval)
  }, [isPlaying])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      const target = e.target
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      const isModKey = e.metaKey || e.ctrlKey

      // Cmd/Ctrl + F: Focus search
      if (isModKey && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector('.search-input')
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
        audioManager?.playClick()
      }

      // Escape: Close modals and deselect file
      if (e.key === 'Escape') {
        if (showSettings) {
          handleCloseSettings()
        } else if (showAudioSettings) {
          handleCloseAudioSettings()
        } else if (selectedFile) {
          setSelectedFile(null)
          audioManager?.playClick()
        }
      }

      // Space: Toggle timeline play/pause (only if timeline is visible)
      if (e.key === ' ' && showTimeline && !selectedFile) {
        e.preventDefault()
        handleTogglePlay()
      }

      // 1, 2, 3: Switch views (Sunburst, Chord, Grid)
      if (e.key === '1') {
        handleViewChange('sunburst')
        audioManager?.playClick()
      }
      if (e.key === '2') {
        handleViewChange('chord')
        audioManager?.playClick()
      }
      if (e.key === '3') {
        handleViewChange('grid')
        audioManager?.playClick()
      }

      // T: Toggle timeline
      if (e.key === 't' || e.key === 'T') {
        handleToggleTimeline()
      }

      // Cmd/Ctrl + ,: Open settings
      if (isModKey && e.key === ',') {
        e.preventDefault()
        handleOpenSettings()
        audioManager?.playClick()
      }

      // R: Reset view (when not typing)
      if (e.key === 'r' || e.key === 'R') {
        if (repoInfo) {
          handleReset()
          audioManager?.playClick()
        }
      }

      // ?: Show keyboard shortcuts
      if (e.key === '?') {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
        audioManager?.playClick()
      }

      // I: Toggle quick stats panel
      if (e.key === 'i' || e.key === 'I') {
        if (repoInfo) {
          handleToggleQuickStats()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSettings, showAudioSettings, selectedFile, showTimeline, showQuickStats, repoInfo])

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

      // Update state - handle both old format (array) and new format (object with files and commits)
      const fileList = Array.isArray(files) ? files : (files.files || [])
      const commitList = Array.isArray(files) ? [] : (files.commits || [])

      setRepoInfo({ owner, repo })
      setFiles(fileList)
      setCommits(commitList)

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
    setCommits([])
    setTimelinePosition(100)
    setIsPlaying(false)
    setShowTimeline(false)
  }

  // Handle timeline position change
  const handleTimelineChange = (position) => {
    setTimelinePosition(position)
    audioManager?.playClick()
  }

  // Handle timeline play/pause
  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev)
    audioManager?.playClick()
  }

  // Handle timeline reset
  const handleResetTimeline = () => {
    setTimelinePosition(100)
    setIsPlaying(false)
    audioManager?.playClick()
  }

  // Handle timeline toggle
  const handleToggleTimeline = () => {
    setShowTimeline(prev => !prev)
    audioManager?.playClick()
  }

  // Handle quick stats toggle
  const handleToggleQuickStats = () => {
    setShowQuickStats(prev => !prev)
    audioManager?.playClick()
  }

  // Handle close quick stats
  const handleCloseQuickStats = () => {
    setShowQuickStats(false)
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

  // Handle export as image
  const handleExportImage = async () => {
    const visualizationElement = visualizationRef.current

    if (!visualizationElement) {
      console.error('Visualization ref is not available')
      alert('Unable to capture visualization. Please try again.')
      return
    }

    try {
      audioManager?.playClick()

      // Find the SVG element
      const svgElement = visualizationElement.querySelector('svg')
      if (!svgElement) {
        alert('Could not find visualization to export.')
        return
      }

      const gElement = visualizationElement.querySelector('svg > g')
      if (!gElement) {
        alert('Could not find visualization content.')
        return
      }

      // Store original transform and viewBox
      const originalTransform = gElement.getAttribute('transform') || ''
      const originalViewBox = svgElement.getAttribute('viewBox') || ''

      // Remove transform to get actual content positions
      gElement.removeAttribute('transform')

      // Calculate bounding box of all content
      const bbox = svgElement.getBBox()
      const padding = 50

      // Create new viewBox that encompasses all content
      const newViewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`
      svgElement.setAttribute('viewBox', newViewBox)

      // Force reflow and wait
      svgElement.offsetHeight
      await new Promise(resolve => setTimeout(resolve, 100))

      // Capture
      const dataUrl = await toPng(visualizationElement, {
        backgroundColor: '#0f172a',
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      })

      // Restore original state
      gElement.setAttribute('transform', originalTransform)
      svgElement.setAttribute('viewBox', originalViewBox)

      // Download
      const link = document.createElement('a')
      link.download = `cartographer-${repoInfo.repo}-${currentView}-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to export image:', error)
      alert('Failed to export image: ' + error.message)
    }
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
            onShowShortcuts={() => setShowKeyboardShortcuts(true)}
            onExportImage={handleExportImage}
            audioManager={audioManager}
          />

          <LeftSidebar
            files={files}
            onFileClick={handleFileClick}
            selectedFile={selectedFile}
            audioManager={audioManager}
            timelinePosition={timelinePosition}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <VisualizationArea
            ref={visualizationRef}
            currentView={currentView}
            files={files}
            onFileClick={handleFileClick}
            audioManager={audioManager}
            timelinePosition={timelinePosition}
            searchQuery={searchQuery}
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

      {/* Timeline */}
      {showTimeline && (
        <Timeline
          commits={commits}
          position={timelinePosition}
          onPositionChange={handleTimelineChange}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onReset={handleResetTimeline}
          audioManager={audioManager}
          onClose={handleToggleTimeline}
        />
      )}

      {/* Timeline Toggle Button */}
      {repoInfo && (
        <button
          className="timeline-toggle"
          onClick={handleToggleTimeline}
          title={showTimeline ? 'Hide Timeline' : 'Show Timeline'}
        >
          {showTimeline ? '▼' : '▶'}
        </button>
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

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <KeyboardShortcuts
          onClose={() => setShowKeyboardShortcuts(false)}
          audioManager={audioManager}
        />
      )}

      {/* Quick Stats Panel */}
      {repoInfo && (
        <QuickStatsPanel
          files={files}
          commits={commits}
          visible={showQuickStats}
          onClose={handleCloseQuickStats}
          audioManager={audioManager}
        />
      )}
    </>
  )
}

export default App
