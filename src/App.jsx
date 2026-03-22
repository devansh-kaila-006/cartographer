import { useRef, useEffect, useState } from 'react'
import { SceneManager } from './engine/SceneManager'
import { VisualizationManager } from './engine/VisualizationManager'
import { TreemapGenerator } from './engine/visualization/TreemapGenerator'
import { SunburstGenerator } from './engine/visualization/SunburstGenerator'
import { IcicleGenerator } from './engine/visualization/IcicleGenerator'
import { ChordDiagramGenerator } from './engine/visualization/ChordDiagramGenerator'
import { Atmosphere } from './engine/Atmosphere'
import { githubAPI } from './api/github'
import { apiKeyManager } from './utils/apiKeyManager'
import { llmService } from './utils/llmService'
import { gitHistoryService } from './utils/gitHistory'
import { audioManager } from './utils/audioManager'
import { AuthPanel } from './components/AuthPanel'
import { HUD } from './components/HUD'
import { FileTreeSidebar } from './components/FileTreeSidebar'
import { BuildingInfo } from './components/BuildingInfo'
import { APIKeyModal } from './components/APIKeyModal'
import { SemanticSearch } from './components/SemanticSearch'
import { SearchResults } from './components/SearchResults'
import { TimelineScrubber } from './components/TimelineScrubber'
import { AudioControls } from './components/AudioControls'
import './styles/vibe.css'

function App() {
  const containerRef = useRef(null)
  const sceneManagerRef = useRef(null)
  const vizManagerRef = useRef(null)
  const isInitializedRef = useRef(false) // Track if we've ever initialized

  const [repoInfo, setRepoInfo] = useState(null)
  const [files, setFiles] = useState([])
  const [aiSummaries, setAiSummaries] = useState(new Map())
  const [fileHistory, setFileHistory] = useState(new Map())
  const [commits, setCommits] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [hoveredFile, setHoveredFile] = useState(null)
  const [visualizationType, setVisualizationType] = useState('TREEMAP')
  const [showFileTree, setShowFileTree] = useState(true)
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [timelinePosition, setTimelinePosition] = useState(0)
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showAudioSettings, setShowAudioSettings] = useState(false)

  // Initialize Three.js scene ONCE - use refs to avoid re-initialization
  useEffect(() => {
    // Skip if already initialized (handles React StrictMode double-run)
    if (isInitializedRef.current) {
      console.log('Skipping re-initialization')
      return
    }

    if (!containerRef.current) return

    console.log('=== Initializing SceneManager ===')
    isInitializedRef.current = true // Mark as initialized
    sceneManagerRef.current = new SceneManager(containerRef.current)

    // Initialize visualization manager with camera controller
    vizManagerRef.current = new VisualizationManager(
      sceneManagerRef.current.scene,
      sceneManagerRef.current.cameraController
    )
    vizManagerRef.current.register('TREEMAP', new TreemapGenerator(sceneManagerRef.current.scene))
    vizManagerRef.current.register('SUNBURST', new SunburstGenerator(sceneManagerRef.current.scene))
    vizManagerRef.current.register('ICICLE', new IcicleGenerator(sceneManagerRef.current.scene))
    vizManagerRef.current.register('CHORD', new ChordDiagramGenerator(sceneManagerRef.current.scene))

    // Initialize atmosphere
    const atmosphere = new Atmosphere(sceneManagerRef.current.scene)
    sceneManagerRef.current.atmosphere = atmosphere

    // Animation loop for atmosphere
    const animateAtmosphere = (time) => {
      atmosphere.update(time)
      requestAnimationFrame(animateAtmosphere)
    }
    requestAnimationFrame(animateAtmosphere)

    // Setup mesh selector callbacks - use refs to access latest state
    sceneManagerRef.current.buildingSelector.setOnBuildingClick((mesh) => {
      if (mesh) {
        const file = {
          path: mesh.path,
          name: mesh.path.split('/').pop(), // Extract filename from path
          size: mesh.size,
          language: mesh.language
        }
        setSelectedFile(file)
        audioManager.play('click')

        // Generate AI summary if not already cached
        const currentSummaries = aiSummariesRef.current
        if (hasApiKeyRef.current && !currentSummaries.has(file.path)) {
          generateAISummary(file)
        }
      }
    })

    sceneManagerRef.current.buildingSelector.setOnBuildingHover((mesh) => {
      if (mesh) {
        const file = {
          path: mesh.path,
          name: mesh.path.split('/').pop() // Extract filename from path
        }
        setHoveredFile(file)
        audioManager.play('hover')
      } else {
        setHoveredFile(null)
      }
    })

    return () => {
      // Don't null out refs in cleanup to preserve them through StrictMode re-renders
      // Only dispose resources
      if (sceneManagerRef.current) {
        sceneManagerRef.current.dispose()
      }
      if (vizManagerRef.current) {
        vizManagerRef.current.dispose()
      }
    }
  }, []) // Empty dependency array - run only once

  // Refs for callback dependencies to prevent re-initialization
  const aiSummariesRef = useRef(aiSummaries)
  const hasApiKeyRef = useRef(hasApiKey)

  useEffect(() => {
    aiSummariesRef.current = aiSummaries
  }, [aiSummaries])

  useEffect(() => {
    hasApiKeyRef.current = hasApiKey
  }, [hasApiKey])

  // Check for existing API keys
  useEffect(() => {
    const providers = apiKeyManager.getProviders()
    if (providers.length > 0) {
      // Check for LLM keys
      const llmProviders = ['anthropic', 'openai', 'gemini']
      const llmKey = providers.find(p => llmProviders.includes(p))

      if (llmKey) {
        setHasApiKey(true)
        const key = apiKeyManager.getKey(llmKey)
        llmService.setCredentials(llmKey, key)
      }

      // Check for GitHub key
      const githubKey = providers.find(p => p === 'github')
      if (githubKey) {
        const key = apiKeyManager.getKey(githubKey)
        gitHistoryService.setToken(key)
      }
    }
  }, [])

  // Handle repository authentication and data fetching
  const handleAuth = async ({ owner, repo }) => {
    setIsLoading(true)

    try {
      // Fetch file tree from GitHub
      const repoFiles = await githubAPI.getFileTree(owner, repo)

      // Filter out very large files and focus on code files
      const filteredFiles = repoFiles
        .filter(file => {
          const ext = file.path.split('.').pop().toLowerCase()
          // Include code files, exclude node_modules, test files, etc.
          const isCodeFile = [
            'js', 'jsx', 'ts', 'tsx', 'py', 'rs', 'go', 'java',
            'cpp', 'c', 'cs', 'rb', 'php', 'swift', 'kt',
            'css', 'scss', 'html', 'json', 'md'
          ].includes(ext)

          const isIncluded = !file.path.includes('node_modules') &&
                           !file.path.includes('.test.') &&
                           !file.path.includes('.spec.') &&
                           !file.path.includes('dist') &&
                           !file.path.includes('build')

          return isCodeFile && isIncluded
        })

      // Limit to 400 files for performance
      const limitedFiles = filteredFiles.slice(0, 400)

      // Update state
      setFiles(limitedFiles)
      setRepoInfo({ owner, repo })

      // Clear existing visualizations
      vizManagerRef.current.clear()

      // Generate visualization using current type
      vizManagerRef.current.switchTo(visualizationType, limitedFiles)

      // Swoop camera to view
      setTimeout(() => {
        sceneManagerRef.current.cameraController.swoopToLevel('WIDE')
        audioManager.play('swoosh')
      }, 100)

      // Fetch git history (with error handling)
      try {
        const commitHistory = await gitHistoryService.fetchCommitHistory(owner, repo)
        setCommits(commitHistory)
        setTimelinePosition(commitHistory.length - 1)
        setShowTimeline(commitHistory.length > 1)

        // Use batch file history (simulated to avoid rate limits)
        const historyMap = await gitHistoryService.batchGetFileHistory(
          owner,
          repo,
          limitedFiles.slice(0, 20).map(f => f.path)
        )
        setFileHistory(historyMap)
      } catch (error) {
        // Show user-friendly error
        if (error.message.includes('rate limit')) {
          alert('GitHub API rate limit exceeded. Timeline feature will use simulated data.\n\n' +
                'To get full timeline data:\n' +
                '1. Add a GitHub Personal Access Token in API Key modal\n' +
                '2. Or wait for the rate limit to reset')
        }

        // Still show timeline with mock data
        const mockCommits = Array.from({ length: 5 }, (_, i) => ({
          sha: `mock-${i}`,
          message: `Commit ${i + 1} - Simulated history`,
          author: 'Mock Author',
          date: new Date(Date.now() - (4 - i) * 24 * 60 * 60 * 1000),
          index: 5 - i,
          filesChanged: Math.floor(Math.random() * 10) + 1
        }))

        setCommits(mockCommits)
        setTimelinePosition(mockCommits.length - 1)
        setShowTimeline(true)
      }

    } catch (error) {
      // Check if it's a rate limit error
      if (error.message.includes('rate limit') || error.message.includes('403')) {
        const shouldAddToken = confirm(
          `${error.message}\n\n` +
          `Would you like to add a GitHub API token now? ` +
          `(This increases your limit from 60/hr to 5000/hr)`
        )

        if (shouldAddToken) {
          setShowAPIKeyModal(true)
        }
      } else {
        alert(`Failed to load repository: ${error.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handle visualization type change
  const handleVisualizationChange = (type) => {
    setVisualizationType(type)

    if (!files.length || !vizManagerRef.current) return

    // Clear current visualization and switch to new type
    vizManagerRef.current.switchTo(type, files)
    audioManager.play('swoosh')
  }

  // Handle file tree click
  const handleFileTreeClick = (file) => {
    setSelectedFile(file)

    // Find and select the building/mesh in visualization
    if (vizManagerRef.current) {
      const mesh = vizManagerRef.current.getMeshByPath(file.path)
      if (mesh && sceneManagerRef.current) {
        // Highlight the mesh
        vizManagerRef.current.highlightMesh(mesh)

        // Swoop camera to mesh position
        sceneManagerRef.current.cameraController.swoopToPosition(mesh.position)
      }
    }

    audioManager.play('click')
  }

  // Generate AI summary for a file
  const generateAISummary = async (file) => {
    if (!hasApiKey || aiSummaries.has(file.path)) return

    try {
      const content = await githubAPI.getFileContent(repoInfo.owner, repoInfo.repo, file.path)

      // Create minimal file data for summary
      const fileData = {
        filename: file.path.split('/').pop(),
        functions: [],
        classes: [],
        language: file.language
      }

      const summary = await llmService.generateSummary(fileData, content)

      setAiSummaries(prev => new Map(prev).set(file.path, summary))
    } catch (error) {
      // Silently fail - AI summary is optional
    }
  }

  // Handle API key save
  const handleKeySaved = (provider) => {
    const key = apiKeyManager.getKey(provider)

    if (provider === 'github') {
      gitHistoryService.setToken(key)
    } else {
      llmService.setCredentials(provider, key)
      setHasApiKey(true)
    }

    setShowAPIKeyModal(false)

    // If we just added a GitHub key and repo is loaded, refetch timeline
    if (provider === 'github' && repoInfo) {
      gitHistoryService.clearCache()
      // Reload timeline data
      gitHistoryService.fetchCommitHistory(repoInfo.owner, repoInfo.repo)
        .then(commits => {
          setCommits(commits)
          setTimelinePosition(commits.length - 1)
          setShowTimeline(commits.length > 1)
        })
        .catch(() => {})
    }
  }

  // Handle semantic search
  const handleSemanticSearch = async (query) => {
    if (!hasApiKey || !files.length) return

    setIsSearching(true)

    try {
      const repoContext = {
        directoryStructure: files.slice(0, 20).map(f => f.path).join('\n'),
        languages: [...new Set(files.map(f => f.language))]
      }

      const searchParams = await llmService.semanticSearch(query, repoContext)

      // Search files based on LLM results
      const results = []

      // Search by keywords
      searchParams.keywords?.forEach(keyword => {
        files.forEach(file => {
          if (file.path.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({
              path: file.path,
              type: 'file',
              match: `Contains "${keyword}"`,
              relevance: 0.9
            })
          }
        })
      })

      // Sort by relevance and limit
      const sortedResults = results
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 10)

      setSearchResults(sortedResults)
      setShowSearchResults(true)
    } catch (error) {
      // User-friendly error message
      let errorMessage = 'Search failed. Please try again.'

      if (error.message.includes('404') || error.message.includes('model')) {
        errorMessage = 'LLM model not found. This might be a temporary API issue. Please try again or switch to a different provider (Claude recommended).'
      } else if (error.message.includes('API key')) {
        errorMessage = 'Invalid API key. Please check your API key configuration.'
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'API rate limit exceeded. Please wait a moment and try again.'
      }

      alert(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search result click
  const handleSearchResultClick = (result) => {
    setShowSearchResults(false)

    // Find and select the building
    const file = files.find(f => f.path === result.path)
    if (file && sceneManagerRef.current?.buildingSelector) {
      const building = sceneManagerRef.current.buildingSelector.buildings.get(result.path)
      if (building) {
        sceneManagerRef.current.buildingSelector.selectBuilding(building)
        sceneManagerRef.current.cameraController.swoopToBuilding(building)
        setSelectedFile(file)
      }
    }
  }

  // Handle timeline scrub
  const handleTimelineScrub = async (position) => {
    setTimelinePosition(position)
    audioManager.play('timelineScrub')

    const commit = commits[position]
    if (!commit) return

    // Update mesh visibility based on file creation dates
    const filesToShow = new Set()

    for (const [path, history] of fileHistory) {
      if (history.createdAt <= commit.date) {
        filesToShow.add(path)
      }
    }

    // Update visualization mesh visibility
    if (vizManagerRef.current) {
      vizManagerRef.current.updateMeshVisibility(filesToShow)
    }
  }

  // Handle timeline play
  const handleTimelinePlay = () => {
    if (isPlayingTimeline) {
      setIsPlayingTimeline(false)
      return
    }

    setIsPlayingTimeline(true)
    audioManager.play('success')

    const playInterval = setInterval(() => {
      setTimelinePosition(prev => {
        if (prev >= commits.length - 1) {
          clearInterval(playInterval)
          setIsPlayingTimeline(false)
          return commits.length - 1
        }

        const next = prev + 1
        handleTimelineScrub(next)
        return next
      })
    }, 1500)
  }

  // Handle timeline reset
  const handleTimelineReset = () => {
    setTimelinePosition(commits.length - 1)
    handleTimelineScrub(commits.length - 1)
    audioManager.play('success')
  }

  // Handle toggle audio settings
  const handleToggleAudioSettings = () => {
    setShowAudioSettings(!showAudioSettings)
  }

  // Handle reset
  const handleReset = () => {
    setRepoInfo(null)
    setSelectedFile(null)
    setHoveredFile(null)
    setFiles([])

    // Clear visualizations
    if (vizManagerRef.current) {
      vizManagerRef.current.clear()
    }
  }

  return (
    <>
      <div ref={containerRef} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />

      {/* Auth Panel - shown when no repo is loaded */}
      {!repoInfo && <AuthPanel onAuth={handleAuth} />}

      {/* File Tree Sidebar */}
      {repoInfo && (
        <FileTreeSidebar
          files={files}
          visible={showFileTree}
          onFileClick={handleFileTreeClick}
          onToggle={() => {
            setShowFileTree(!showFileTree)
            audioManager.play('click')
          }}
        />
      )}

      {/* HUD - shown when repo is loaded */}
      {repoInfo && (
        <HUD
          repoInfo={repoInfo}
          fileCount={files.length}
          summaryCount={aiSummaries.size}
          isLoading={isLoading}
          visualizationType={visualizationType}
          hasApiKey={hasApiKey}
          showTimeline={showTimeline}
          showFileTree={showFileTree}
          showAudioSettings={showAudioSettings}
          onReset={handleReset}
          onVisualizationChange={handleVisualizationChange}
          onOpenAPIKeyModal={() => setShowAPIKeyModal(true)}
          onToggleTimeline={() => {
            setShowTimeline(!showTimeline)
            audioManager.play('click')
          }}
          onToggleFileTree={() => {
            setShowFileTree(!showFileTree)
            audioManager.play('click')
          }}
          onToggleAudioSettings={handleToggleAudioSettings}
        />
      )}

      {/* Semantic Search - shown when repo is loaded */}
      {repoInfo && !showTimeline && (
        <SemanticSearch
          onSearch={handleSemanticSearch}
          isSearching={isSearching}
          hasApiKey={hasApiKey}
        />
      )}

      {/* Timeline Scrubber - shown when timeline is available */}
      {showTimeline && commits.length > 0 && (
        <TimelineScrubber
          commits={commits}
          currentPosition={timelinePosition}
          onScrub={handleTimelineScrub}
          onPlay={handleTimelinePlay}
          isPlaying={isPlayingTimeline}
          onReset={handleTimelineReset}
        />
      )}

      {/* Audio Controls */}
      {repoInfo && (
        <AudioControls
          showSettings={showAudioSettings}
          onToggleSettings={handleToggleAudioSettings}
        />
      )}

      {/* API Key Modal */}
      {showAPIKeyModal && (
        <APIKeyModal
          onClose={() => setShowAPIKeyModal(false)}
          onKeySaved={handleKeySaved}
        />
      )}

      {/* Search Results */}
      <SearchResults
        results={searchResults}
        visible={showSearchResults}
        onResultClick={handleSearchResultClick}
        onClose={() => setShowSearchResults(false)}
      />

      {/* Building Info Panel */}
      <BuildingInfo
        file={selectedFile}
        summary={selectedFile ? aiSummaries.get(selectedFile.path) : null}
        visible={!!selectedFile}
        onClose={() => {
          // Reset highlighted mesh if in Dependency Graph mode
          if (selectedFile && vizManagerRef.current) {
            const mesh = vizManagerRef.current.getMeshByPath(selectedFile.path)
            if (mesh) {
              vizManagerRef.current.resetHighlight(mesh)
            }
          }

          setSelectedFile(null)
          if (sceneManagerRef.current?.buildingSelector) {
            sceneManagerRef.current.buildingSelector.deselectBuilding()
          }
        }}
      />

      {/* Hover tooltip */}
      {hoveredFile && !selectedFile && (
        <div className="hover-tooltip glass">
          <span className="tooltip-path">{hoveredFile.path}</span>
        </div>
      )}
    </>
  )
}

export default App
