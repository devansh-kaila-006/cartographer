import { SunburstIcon, ChordIcon, GridIcon } from './Icons'
import { Tooltip } from './Tooltip'
import { useState, useRef, useEffect, forwardRef } from 'react'
import './VisualizationArea.css'

export const VisualizationArea = forwardRef(({ currentView, files, onFileClick, audioManager, timelinePosition = 100, searchQuery = '' }, ref) => {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [expandedDirs, setExpandedDirs] = useState(new Set())
  const svgRef = useRef(null)
  const panRef = useRef({ x: 0, y: 0 })
  const zoomCenterRef = useRef({ x: 400, y: 300 })
  const [showInfo, setShowInfo] = useState(false)

  // Keep panRef in sync with pan state
  useEffect(() => {
    panRef.current = pan
  }, [pan])

  // Update zoom center based on view
  useEffect(() => {
    if (currentView === 'sunburst') {
      zoomCenterRef.current = { x: 400, y: 300 }
    } else if (currentView === 'chord') {
      zoomCenterRef.current = { x: 400, y: 300 }
    } else {
      // Grid - center will be calculated dynamically in renderIcicle
      zoomCenterRef.current = { x: 400, y: 300 }
    }
  }, [currentView, timelinePosition])

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      const target = e.target
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      const isModKey = e.metaKey || e.ctrlKey

      // Plus/Equals: Zoom in
      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        handleZoomIn()
      }

      // Minus: Zoom out
      if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        handleZoomOut()
      }

      // Cmd/Ctrl + 0: Reset zoom
      if (isModKey && e.key === '0') {
        e.preventDefault()
        handleResetZoom()
      }

      // I: Toggle info box
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault()
        setShowInfo(prev => !prev)
        audioManager?.playClick()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [zoom, pan])

  // Filter files based on timeline position
  const getVisibleFiles = () => {
    if (!files || files.length === 0) return []

    // Get the date range from all files
    const dates = files
      .map(f => new Date(f.createdAt))
      .filter(d => !isNaN(d.getTime()))
      .sort((a, b) => a - b)

    if (dates.length === 0) {
      // No valid dates, show all files as non-ghost
      return files.map(file => ({ ...file, isGhost: false }))
    }

    const minDate = dates[0]
    const maxDate = dates[dates.length - 1]
    const totalMs = maxDate.getTime() - minDate.getTime()

    // Handle case where all files have the same date
    if (totalMs === 0) {
      return files.map(file => ({ ...file, isGhost: false }))
    }

    const currentMs = totalMs * (timelinePosition / 100)
    const currentDate = new Date(minDate.getTime() + currentMs)

    // Filter files that exist at or before the current timeline position
    return files.map(file => {
      const fileDate = new Date(file.createdAt)
      const isGhost = isNaN(fileDate.getTime()) ? false : fileDate > currentDate
      return { ...file, isGhost }
    })
  }

  // Filter files based on search query
  const getFilteredFiles = () => {
    const timelineFiltered = getVisibleFiles()

    if (!searchQuery || searchQuery.trim() === '') {
      return timelineFiltered
    }

    const query = searchQuery.toLowerCase().trim()

    // Find files that match the search
    const matchingFiles = timelineFiltered.filter(file =>
      file.path.toLowerCase().includes(query)
    )

    return matchingFiles
  }

  const visibleFiles = getFilteredFiles()

  // Reset zoom and pan when switching views
  useEffect(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [currentView])

  const handleNodeClick = (file) => {
    if (onFileClick && file) {
      audioManager?.playClick()
      onFileClick(file)
    }
  }

  const handleNodeHover = () => {
    audioManager?.playHover()
  }

  const toggleDirectory = (dirPath) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(dirPath)) {
        newSet.delete(dirPath)
      } else {
        newSet.add(dirPath)
      }
      return newSet
    })
  }

  const handleZoomIn = () => {
    audioManager?.playClick()
    const prevZoom = zoom
    const prevPan = panRef.current
    const newZoom = Math.min(prevZoom + 0.2, 3)

    // To keep the zoomCenter fixed when scaling:
    // newTranslate = zoomCenter - (zoomCenter - oldTranslate) * (newScale / oldScale)
    // Simplified: newTranslate = zoomCenter * (1 - newScale/oldScale) + oldTranslate * (newScale/oldScale)
    const scaleRatio = newZoom / prevZoom

    const newPan = {
      x: zoomCenterRef.current.x * (1 - scaleRatio) + prevPan.x * scaleRatio,
      y: zoomCenterRef.current.y * (1 - scaleRatio) + prevPan.y * scaleRatio
    }

    setZoom(newZoom)
    setPan(newPan)
  }

  const handleZoomOut = () => {
    audioManager?.playClick()
    const prevZoom = zoom
    const prevPan = panRef.current
    const newZoom = Math.max(prevZoom - 0.2, 0.4)

    // To keep the zoomCenter fixed when scaling:
    const scaleRatio = newZoom / prevZoom

    const newPan = {
      x: zoomCenterRef.current.x * (1 - scaleRatio) + prevPan.x * scaleRatio,
      y: zoomCenterRef.current.y * (1 - scaleRatio) + prevPan.y * scaleRatio
    }

    setZoom(newZoom)
    setPan(newPan)
  }

  const handleResetZoom = () => {
    audioManager?.playClick()
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const handleWheel = (e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn()
    } else {
      handleZoomOut()
    }
  }

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left mouse button
      setIsDragging(true)
      setDragStart({
        x: e.clientX - pan.x,
        y: e.clientY - pan.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }
  // Build hierarchical tree structure from flat file list
  const buildFileTree = (fileList) => {
    const root = { name: 'root', children: [], files: [], size: 0 }

    if (!fileList || fileList.length === 0) return root

    fileList.forEach(file => {
      const parts = file.path.split('/')
      let current = root

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // It's a file
          current.files.push(file)
          current.size += file.size || 0
        } else {
          // It's a directory
          let existingChild = current.children.find(c => c.name === part)
          if (!existingChild) {
            existingChild = { name: part, children: [], files: [], size: 0, path: parts.slice(0, index + 1).join('/') }
            current.children.push(existingChild)
          }
          current = existingChild
        }
      })
    })

    return root
  }

  const fileTree = buildFileTree(visibleFiles || [])

  // Grid Heatmap Visualization - Improved
  const renderIcicle = () => {
    const getFileColor = (language) => {
      const colors = {
        'javascript': '#f59e0b',
        'jsx': '#0ea5e9',
        'typescript': '#3b82f6',
        'tsx': '#0ea5e9',
        'css': '#8b5cf6',
        'html': '#f97316',
        'json': '#10b981',
        'markdown': '#64748b',
        'md': '#64748b',
        'python': '#eab308',
        'rust': '#ef4444',
        'go': '#06b6d4'
      }
      return colors[language] || '#6b7280'
    }

    const getFolderColor = (depth) => {
      const colors = ['#1e3a8a', '#1e40af', '#134e4a', '#065f46', '#854d0e', '#7e22ce']
      return colors[depth % colors.length]
    }

    // Group files by folder
    const groupByFolder = (node) => {
      const folders = []

      const processNode = (currentNode, depth = 0) => {
        if (currentNode.children && currentNode.children.length > 0) {
          currentNode.children.forEach(child => {
            processNode(child, depth + 1)
          })
        }

        if (currentNode.files && currentNode.files.length > 0) {
          folders.push({
            path: currentNode.path || currentNode.name,
            name: currentNode.name,
            files: currentNode.files,
            depth: depth
          })
        }
      }

      processNode(node)
      return folders
    }

    const folders = groupByFolder(fileTree)

    // Flatten all files with folder context
    const allFiles = folders.flatMap(folder =>
      folder.files.map(file => ({
        ...file,
        folderName: folder.name,
        folderPath: folder.path,
        isGhost: file.isGhost || false
      }))
    )

    // Calculate sizes
    const maxSize = Math.max(...allFiles.map(f => f.size || 1000))
    const minSize = Math.min(...allFiles.map(f => f.size || 1000))

    // Grid configuration - INCREASED SIZES
    const baseCellSize = 140 // Increased from 100
    const gap = 8 // Increased from 6
    const padding = 30 // Increased from 20
    const gridCols = Math.ceil(Math.sqrt(allFiles.length))
    const totalWidth = gridCols * (baseCellSize + gap) + padding * 2
    const totalHeight = Math.ceil(allFiles.length / gridCols) * (baseCellSize + gap) + padding * 2

    // Calculate cell size with better distribution
    const getCellSize = (fileSize) => {
      if (maxSize === minSize) return baseCellSize * 0.5
      const logSize = Math.log2(fileSize - minSize + 1)
      const logMax = Math.log2(maxSize - minSize + 1)
      const normalized = logSize / logMax
      return baseCellSize * (0.35 + normalized * 0.65)
    }

    // Format file size
    const formatSize = (bytes) => {
      if (!bytes) return '0 B'
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    // Update zoom center for grid view
    const centerX = totalWidth / 2
    const centerY = totalHeight / 2
    zoomCenterRef.current = { x: centerX, y: centerY }

    return (
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        className="heatmap-chart"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={svgRef}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <style>{`
          .heatmap-cell { transition: all 0.2s ease; cursor: pointer; }
          .heatmap-cell:hover rect { filter: brightness(1.15); stroke: white; stroke-width: 2px; }
          .heatmap-cell:hover text { opacity: 1; }
          .heatmap-bg { fill: #1e293b; opacity: 0.3; }
          .heatmap-text { pointer-events: none; font-family: -apple-system, sans-serif; font-weight: 500; }
          .heatmap-folder { font-size: 11px; fill: #94a3b8; }
          .heatmap-size { font-size: 10px; fill: #64748b; }
        `}</style>
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {allFiles.map((file, index) => {
            const col = index % gridCols
            const row = Math.floor(index / gridCols)
            const x = padding + col * (baseCellSize + gap)
            const y = padding + row * (baseCellSize + gap)

            const cellSize = getCellSize(file.size || 1000)
            const offset = (baseCellSize - cellSize) / 2

            const showLabel = cellSize > 50
            const showInfo = cellSize > 70

            return (
              <g key={file.path} className="heatmap-cell">
                {/* Background cell */}
                <rect
                  x={x}
                  y={y}
                  width={baseCellSize}
                  height={baseCellSize}
                  className="heatmap-bg"
                  rx="8"
                />

                {/* Colored file cell */}
                <rect
                  x={x + offset}
                  y={y + offset}
                  width={cellSize}
                  height={cellSize}
                  rx={Math.max(4, cellSize * 0.12)}
                  fill={file.isGhost ? 'transparent' : getFileColor(file.language)}
                  stroke={file.isGhost ? getFileColor(file.language) : 'rgba(255,255,255,0.2)'}
                  strokeWidth={file.isGhost ? 2 : 1.5}
                  strokeDasharray={file.isGhost ? '4 2' : '0'}
                  opacity={file.isGhost ? 0.3 : 1}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNodeClick(file)
                  }}
                  onMouseEnter={handleNodeHover}
                  style={file.isGhost ? { pointerEvents: 'none' } : {}}
                />

                {/* File name */}
                {showLabel && cellSize > 55 && (
                  <text
                    x={x + baseCellSize / 2}
                    y={y + baseCellSize / 2 - (showInfo ? 6 : 0)}
                    fill="white"
                    fontSize={Math.min(12, cellSize / 5)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="heatmap-text"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {file.name.length > 14 ? file.name.substring(0, 14) + '…' : file.name}
                  </text>
                )}

                {/* Folder name */}
                {showInfo && cellSize > 80 && (
                  <text
                    x={x + baseCellSize / 2}
                    y={y + baseCellSize / 2 + 14}
                    className="heatmap-text heatmap-folder"
                    textAnchor="middle"
                  >
                    {file.folderName.length > 18 ? file.folderName.substring(0, 18) + '…' : file.folderName}
                  </text>
                )}

                {/* File size */}
                {showInfo && cellSize > 100 && (
                  <text
                    x={x + baseCellSize / 2}
                    y={y + baseCellSize / 2 + 28}
                    className="heatmap-text heatmap-size"
                    textAnchor="middle"
                  >
                    {formatSize(file.size)}
                  </text>
                )}
              </g>
            )
          })}
        </g>
      </svg>
    )
  }

  // Sunburst Visualization
  const renderSunburst = () => {
    const centerX = 400
    const centerY = 300
    const maxLevel = 4
    const levelRadius = 70

    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
      '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
    ]

    const getColor = (level, index) => {
      return colors[(level + index) % colors.length]
    }

    const polarToCartesian = (radius, angleInRadians) => {
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians)
      }
    }

    const describeArc = (innerRadius, outerRadius, startAngle, endAngle) => {
      const startOuter = polarToCartesian(outerRadius, startAngle)
      const endOuter = polarToCartesian(outerRadius, endAngle)
      const startInner = polarToCartesian(innerRadius, endAngle)
      const endInner = polarToCartesian(innerRadius, startAngle)

      const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1"

      return [
        "M", startOuter.x, startOuter.y,
        "A", outerRadius, outerRadius, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
        "L", startInner.x, startInner.y,
        "A", innerRadius, innerRadius, 0, largeArcFlag, 0, endInner.x, endInner.y,
        "Z"
      ].join(" ")
    }

    const renderNode = (node, level, startAngle, endAngle) => {
      if (!node || level > maxLevel) return null

      const innerRadius = level * levelRadius + 25
      const outerRadius = (level + 1) * levelRadius + 20
      const angleRange = endAngle - startAngle

      const elements = []

      // Calculate total weight for distribution
      let totalWeight = 0
      node.children.forEach(child => {
        totalWeight += 1 + child.children.length + child.files.length
      })
      node.files.forEach(() => {
        totalWeight += 1
      })

      if (totalWeight === 0) return null

      let currentAngle = startAngle

      // Render directory children
      node.children.forEach((child, index) => {
        const childWeight = 1 + child.children.length + child.files.length
        const childAngleSize = (angleRange * childWeight) / totalWeight
        const childStart = currentAngle
        const childEnd = currentAngle + childAngleSize

        const color = getColor(level, index)

        // Draw arc for directory
        const arcPath = describeArc(innerRadius, outerRadius, childStart, childEnd)

        const midAngle = (childStart + childEnd) / 2
        const textRadius = (innerRadius + outerRadius) / 2
        const textPos = polarToCartesian(textRadius, midAngle)

        const shouldShowLabel = true

        elements.push(
          <g key={`dir-${child.path || child.name}-${level}`}>
            <path
              d={arcPath}
              fill={color}
              stroke="#ffffff"
              strokeWidth="2"
              opacity="0.9"
              className="sunburst-arc-dir"
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(child)
              }}
              onMouseEnter={handleNodeHover}
            />
            {shouldShowLabel && (
              <text
                x={textPos.x}
                y={textPos.y}
                fill="white"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="middle"
                className="sunburst-text"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNodeClick(child)
                }}
              >
                {child.name.length > 8 ? child.name.substring(0, 8) + '…' : child.name}
              </text>
            )}
          </g>
        )

        // Recursively render children
        const childElements = renderNode(child, level + 1, childStart, childEnd)
        if (childElements) {
          elements.push(childElements)
        }

        currentAngle = childEnd
      })

      // Render files
      node.files.forEach((file, index) => {
        const fileAngleSize = angleRange / totalWeight
        const fileStart = currentAngle
        const fileEnd = currentAngle + fileAngleSize

        // File colors based on language
        const fileColors = {
          'javascript': '#f59e0b',
          'jsx': '#0ea5e9',
          'typescript': '#3b82f6',
          'tsx': '#0ea5e9',
          'css': '#8b5cf6',
          'html': '#f97316',
          'json': '#10b981',
          'markdown': '#64748b',
          'md': '#64748b',
          'python': '#eab308',
          'rust': '#ef4444',
          'go': '#06b6d4',
        }
        const fileColor = fileColors[file.language] || '#6b7280'

        const fileArcPath = describeArc(innerRadius, outerRadius, fileStart, fileEnd)

        elements.push(
          <g key={`file-${file.path}`}>
            <path
              d={fileArcPath}
              fill={file.isGhost ? 'transparent' : fileColor}
              stroke={file.isGhost ? fileColor : 'rgba(255,255,255,0.3)'}
              strokeWidth={file.isGhost ? 2 : 1.5}
              strokeDasharray={file.isGhost ? '4 2' : '0'}
              opacity={file.isGhost ? 0.3 : 0.85}
              className="sunburst-arc-file"
              onClick={(e) => {
                e.stopPropagation()
                if (!file.isGhost) handleNodeClick(file)
              }}
              onMouseEnter={handleNodeHover}
              style={file.isGhost ? { pointerEvents: 'none' } : {}}
            />
          </g>
        )

        currentAngle = fileEnd
      })

      return elements
    }

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="sunburst-chart"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <style>{`
          .sunburst-arc { transition: all 0.2s; cursor: pointer; }
          .sunburst-arc:hover { opacity: 1; filter: brightness(1.15); stroke-width: 2px; }
          .sunburst-text { pointer-events: none; font-family: system-ui, -apple-system, sans-serif; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        `}</style>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="35"
            fill="#1e293b"
            stroke="#ffffff"
            strokeWidth="3"
            className="sunburst-center"
          />
          <text
            x={centerX}
            y={centerY}
            fill="white"
            fontSize="13"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
            className="sunburst-text"
          >
            Root
          </text>

          {renderNode(fileTree, 1, 0, Math.PI * 2) || []}
        </g>
      </svg>
    )
  }

  // Chord Diagram Visualization
  const renderChord = () => {
    // Group files by directory
    const groupFilesByDirectory = (fileList) => {
      const dirs = new Map()

      fileList.forEach(file => {
        const dirPath = file.path.split('/').slice(0, -1).join('/') || 'root'

        if (!dirs.has(dirPath)) {
          dirs.set(dirPath, {
            path: dirPath,
            name: dirPath.split('/').pop() || dirPath,
            files: [],
            depth: dirPath.split('/').length
          })
        }

        dirs.get(dirPath).files.push(file)
      })

      return Array.from(dirs.values()).sort((a, b) => a.depth - b.depth || b.files.length - a.files.length)
    }

    // Use visibleFiles (filtered by search) instead of raw files
    const directories = groupFilesByDirectory(visibleFiles || [])
    const dirCount = directories.length

    // Check if search is active
    const searchActive = searchQuery && searchQuery.trim() !== ''

    // Calculate radius for the circle - make it much larger to spread nodes out
    const maxRadius = 380 // Maximum radius that fits in the canvas
    const minRadius = 150 // Minimum radius for small repos
    const targetRadius = 120 + (dirCount * 25) // 25px per folder - very aggressive spacing
    const radius = Math.min(maxRadius, Math.max(minRadius, targetRadius))

    // Keep label offset simple and constant
    const labelOffset = 45

    // Enhanced color palette with search highlighting
    const getDirColor = (index, isHighlighted = false) => {
      if (isHighlighted && searchActive) {
        return '#fbbf24' // Amber for highlighted directories during search
      }
      const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed']
      return colors[index % colors.length]
    }

    // Enhanced file colors with search highlighting
    const getFileColor = (isHighlighted = false) => {
      if (isHighlighted && searchActive) {
        return '#fbbf24' // Amber for highlighted files
      }
      return '#64748b'
    }

    // Check if file matches search query
    const fileMatchesSearch = (file) => {
      if (!searchActive) return false
      return file.path.toLowerCase().includes(searchQuery.toLowerCase())
    }

    // Create nodes
    const createNodes = () => {
      const nodes = []
      const centerX = 400
      const centerY = 300

      directories.forEach((dir, dirIndex) => {
        const angle = (2 * Math.PI * dirIndex) / dirCount - Math.PI / 2

        nodes.push({
          type: 'directory',
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          data: dir,
          angle: angle
        })

        // Add files if expanded
        if (expandedDirs.has(dir.path)) {
          const fileCount = Math.min(dir.files.length, 5)
          // Scale inner radius based on main radius
          const innerRadius = radius - (radius * 0.2) // 20% of radius inward

          dir.files.slice(0, fileCount).forEach((file, fileIndex) => {
            const offsetAngle = ((fileIndex - (fileCount - 1) / 2)) * 0.18
            const fileAngle = angle + offsetAngle

            nodes.push({
              type: 'file',
              x: centerX + innerRadius * Math.cos(fileAngle),
              y: centerY + innerRadius * Math.sin(fileAngle),
              data: file
            })
          })

          // More indicator
          if (dir.files.length > 5) {
            const moreAngle = angle + 0.32
            nodes.push({
              type: 'more',
              x: centerX + innerRadius * Math.cos(moreAngle),
              y: centerY + innerRadius * Math.sin(moreAngle),
              data: { count: dir.files.length - 5, dirPath: dir.path }
            })
          }
        }
      })

      return nodes
    }

    const nodes = createNodes()

    // Generate connections
    const generateConnections = () => {
      const connections = []

      // Only connect related directories
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i]
          const nodeB = nodes[j]

          if (nodeA.type === 'directory' && nodeB.type === 'directory') {
            const dirA = nodeA.data
            const dirB = nodeB.data

            // Only connect parent-child or sibling directories
            const isParentChild = dirA.path.startsWith(dirB.path + '/') || dirB.path.startsWith(dirA.path + '/')
            const isSibling = dirA.path.split('/').slice(0, -1).join('/') === dirB.path.split('/').slice(0, -1).join('/')

            if ((isParentChild || isSibling) && dirA.path !== dirB.path) {
              // Find the original index of these directories to get their colors
              const dirAIndex = directories.findIndex(d => d.path === dirA.path)
              const dirBIndex = directories.findIndex(d => d.path === dirB.path)
              const colorA = getDirColor(dirAIndex)
              const colorB = getDirColor(dirBIndex)

              connections.push({
                x1: nodeA.x,
                y1: nodeA.y,
                x2: nodeB.x,
                y2: nodeB.y,
                color: colorA,
                colorEnd: colorB
              })
            }
          }
        }
      }

      return connections
    }

    const connections = generateConnections()

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Define gradients for connections */}
          <defs>
            {connections.map((conn, i) => (
              <linearGradient key={`grad-${conn.x1}-${conn.y1}-${conn.x2}-${conn.y2}`} id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={conn.color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={conn.colorEnd || conn.color} stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>

          {/* Connections */}
          {connections.map((conn, i) => (
            <line
              key={`line-${conn.x1}-${conn.y1}-${conn.x2}-${conn.y2}`}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke={`url(#gradient-${i})`}
              strokeWidth="1.5"
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => {
            if (node.type === 'directory') {
              const dir = node.data
              const isExpanded = expandedDirs.has(dir.path)

              // Check if this directory contains matching files
              const matchingFileCount = dir.files.filter(f => fileMatchesSearch(f)).length
              const hasMatches = matchingFileCount > 0

              // Check if directory has ghost files
              const ghostFileCount = dir.files.filter(f => f.isGhost).length
              const hasGhostFiles = ghostFileCount > 0

              const dirColor = getDirColor(i, hasMatches)

              // Adjust radius for highlighted directories
              const nodeRadius = hasMatches && searchActive ? 21 : 18

              return (
                <g key={`dir-${dir.path}`}>
                  {/* Glow effect for highlighted directories */}
                  {hasMatches && searchActive && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeRadius + 4}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="2"
                      opacity="0.3"
                    />
                  )}

                  {/* Ghost files indicator */}
                  {hasGhostFiles && !hasMatches && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={nodeRadius + 3}
                      fill="none"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={nodeRadius}
                    fill={dirColor}
                    stroke={isExpanded ? 'white' : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isExpanded ? 2 : 1.5}
                    className="chord-dir-node"
                    onClick={(e) => {
                      e.stopPropagation()
                      audioManager?.playClick()
                      toggleDirectory(dir.path)
                    }}
                    onMouseEnter={handleNodeHover}
                    style={hasMatches && searchActive ? { filter: 'brightness(1.2)' } : (hasGhostFiles ? { opacity: 0.7 } : {})}
                  />

                  {/* File count in center - show matches during search or ghost count */}
                  <text
                    x={node.x}
                    y={node.y}
                    fill="white"
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="chord-text"
                  >
                    {searchActive && matchingFileCount > 0 ? matchingFileCount :
                     hasGhostFiles ? `${dir.files.length - ghostFileCount}/${dir.files.length}` :
                     dir.files.length}
                  </text>

                  {/* Directory name on outer side - highlight if matches or has ghosts */}
                  <text
                    x={node.x + Math.cos(node.angle) * labelOffset}
                    y={node.y + Math.sin(node.angle) * labelOffset}
                    fill={hasMatches && searchActive ? '#fbbf24' : (hasGhostFiles ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.8)')}
                    fontSize={hasMatches && searchActive ? '10' : '9'}
                    fontWeight={hasMatches && searchActive ? '700' : '500'}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="chord-text"
                  >
                    {dir.name.length > 10 ? dir.name.substring(0, 10) + '…' : dir.name}
                  </text>
                </g>
              )
            } else if (node.type === 'file') {
              const isGhost = node.data.isGhost || false
              const fileMatches = fileMatchesSearch(node.data)
              const fileColor = getFileColor(fileMatches && searchActive)
              const fileRadius = (fileMatches && searchActive && !isGhost) ? 8 : 6

              return (
                <g key={`file-${node.data.path}`}>
                  {/* Glow for matching files */}
                  {fileMatches && searchActive && !isGhost && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={fileRadius + 3}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.5"
                      opacity="0.4"
                    />
                  )}

                  {/* Ghost file indicator - larger wireframe circle */}
                  {isGhost && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={fileRadius + 2}
                      fill="none"
                      stroke={fileColor}
                      strokeWidth="1"
                      strokeDasharray="4 2"
                      opacity="0.5"
                    />
                  )}

                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={fileRadius}
                    fill={isGhost ? 'transparent' : fileColor}
                    stroke={isGhost ? fileColor : 'rgba(255,255,255,0.3)'}
                    strokeWidth={isGhost ? 2 : 1.5}
                    strokeDasharray={isGhost ? '3 2' : '0'}
                    opacity={isGhost ? 0.5 : (fileMatches && searchActive ? 1 : 0.7)}
                    className="chord-file-node"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!isGhost) handleNodeClick(node.data)
                    }}
                    onMouseEnter={handleNodeHover}
                    style={isGhost ? { pointerEvents: 'none' } : {}}
                  />
                </g>
              )
            } else if (node.type === 'more') {
              return (
                <g key={`more-${node.data.dirPath}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={6}
                    fill="rgba(255,255,255,0.1)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                    className="chord-more-node"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleDirectory(node.data.dirPath)
                    }}
                  />
                  <text
                    x={node.x}
                    y={node.y + 1}
                    fill="rgba(255,255,255,0.6)"
                    fontSize="7"
                    fontWeight="600"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="chord-text"
                  >
                    +{node.data.count}
                  </text>
                </g>
              )
            }
            return null
          })}
        </g>
      </svg>
    )
  }

  const viewConfig = {
    grid: {
      icon: <GridIcon />,
      title: 'Grid Heatmap',
      description: 'File size grid visualization',
      render: renderIcicle,
      instructions: {
        what: 'Displays all files in a grid layout where cell size represents file size. Larger cells indicate bigger files.',
        how: '• Click any cell to view file details\n• Scroll or use +/- buttons to zoom\n• Drag to pan around the grid\n• Colors indicate programming language'
      }
    },
    sunburst: {
      icon: <SunburstIcon />,
      title: 'Sunburst View',
      description: 'Radial hierarchical visualization',
      render: renderSunburst,
      instructions: {
        what: 'Shows repository structure as nested concentric rings. Inner rings are top-level folders, outer rings are deeper files.',
        how: '• Click folders to expand/collapse in the file tree\n• Scroll or use +/- buttons to zoom\n• Drag to pan around the visualization\n• Colors represent different directory branches'
      }
    },
    chord: {
      icon: <ChordIcon />,
      title: 'Directory Relations',
      description: 'Directory dependencies • Click to expand',
      render: renderChord,
      instructions: {
        what: 'Displays directories as nodes in a circle, with colored connections showing parent-child and sibling relationships. Matching directories and files are highlighted during search.',
        how: '• Click directory nodes to expand their files (max 5 shown)\n• Search to highlight matching directories/files in amber\n• Scroll or use +/- buttons to zoom\n• Drag to pan around the diagram\n• Connection colors fade from one directory to another'
      }
    }
  }

  const config = viewConfig[currentView] || viewConfig.grid

  // Check if search is active and has results
  const allFiles = getVisibleFiles()
  const searchActive = searchQuery && searchQuery.trim() !== ''
  const hasSearchResults = visibleFiles.length > 0

  return (
    <div className="visualization-area">
      <div className="visualization-container">
        <div className="visualization-header">
          <span className="visualization-icon">{config.icon}</span>
          <div className="visualization-title-section">
            <h2 className="visualization-title">{config.title}</h2>
            <p className="visualization-description">{config.description}</p>
            {searchActive && (
              <div className="search-indicator">
                <span className="search-label">Filtering:</span>
                <span className="search-query">"{searchQuery}"</span>
                <span className="search-count">
                  ({visibleFiles.length} of {allFiles.length} files)
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="visualization-content" ref={ref}>
          {searchActive && !hasSearchResults ? (
            <div className="no-search-results">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" fill="none"/>
                <path d="M34 34L40 40" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round"/>
                <path d="M19 19C19 17.3431 20.3431 16 22 16H26C27.6569 16 29 17.3431 29 19V29H19V19Z" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3>No files found</h3>
              <p>No files match "<strong>{searchQuery}</strong>"</p>
              <p className="hint">Try a different search term</p>
            </div>
          ) : (
            config.render()
          )}
        </div>

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button
            className={`zoom-button info-toggle ${showInfo ? 'active' : ''}`}
            onClick={() => {
              audioManager?.playClick()
              setShowInfo(prev => !prev)
            }}
            title={showInfo ? 'Hide info' : 'Show info'}
          >
            {showInfo ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M8 5V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M8 5V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <button
            className="zoom-button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.4}
            title="Zoom Out"
          >
            −
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button
            className="zoom-button"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            title="Zoom In"
          >
            +
          </button>
          <button
            className="zoom-button zoom-reset"
            onClick={handleResetZoom}
            title="Reset View (Pan & Zoom)"
          >
            ↺
          </button>
          <div className="zoom-hint" title={pan.x !== 0 || pan.y !== 0 ? 'Panned' : 'Drag to pan'}>
            {pan.x !== 0 || pan.y !== 0 ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="8" cy="8" r="2" fill="currentColor"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="3" y="3" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" rx="1"/>
                <path d="M8 5 L8 11 M5 8 L11 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Visualization Info Box */}
        {showInfo && config.instructions && (
          <div className="visualization-info-box">
            <div className="info-box-header">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M8 5V8M8 11H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="info-box-title">What is this?</span>
            </div>
            <p className="info-box-what">{config.instructions.what}</p>
            <div className="info-box-how-section">
              <span className="info-box-how-title">How to use:</span>
              <pre className="info-box-how">{config.instructions.how}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

VisualizationArea.displayName = 'VisualizationArea'
