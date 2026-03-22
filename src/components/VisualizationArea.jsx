import { IcicleIcon, SunburstIcon, ChordIcon } from './Icons'
import { useState, useRef } from 'react'
import './VisualizationArea.css'

export function VisualizationArea({ currentView, files, onFileClick }) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [expandedDirs, setExpandedDirs] = useState(new Set())
  const svgRef = useRef(null)

  const handleNodeClick = (file) => {
    if (onFileClick && file) {
      onFileClick(file)
    }
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
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.4))
  }

  const handleResetZoom = () => {
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

  const fileTree = buildFileTree(files || [])

  // Icicle Visualization
  const renderIcicle = () => {
    const getDirColor = (depth) => {
      const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']
      return colors[depth % colors.length]
    }

    const getFileColor = (language) => {
      const colors = {
        'javascript': '#fbbf24', 'jsx': '#38bdf8', 'typescript': '#3b82f6', 'tsx': '#38bdf8',
        'css': '#8b5cf6', 'html': '#f97316', 'json': '#94a3b8', 'markdown': '#64748b',
        'python': '#eab308', 'rust': '#ef4444'
      }
      return colors[language] || '#64748b'
    }

    const renderNode = (node, x, y, width, height, depth = 0) => {
      if (!node || width < 1 || height < 1) return null

      const elements = []
      const totalItems = node.children.length + node.files.length

      if (totalItems === 0) return null

      const itemHeight = Math.max(height / totalItems, 2)
      const gap = 1

      // Render directories
      node.children.forEach((child, index) => {
        const childY = y + (index * itemHeight)
        const childHeight = Math.max(itemHeight - gap, 1)

        elements.push(
          <g key={`dir-${child.path || child.name}-${depth}`}>
            <rect
              x={x}
              y={childY}
              width={width}
              height={childHeight}
              fill={getDirColor(depth)}
              className="icicle-rect-dir"
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(child)
              }}
            />
            {childHeight > 14 && width > 30 && (
              <text
                x={x + 8}
                y={childY + childHeight / 2}
                fill="white"
                fontSize="12"
                fontWeight="600"
                dominantBaseline="middle"
                className="icicle-text"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNodeClick(child)
                }}
              >
                {child.name}
              </text>
            )}
          </g>
        )

        const childElements = renderNode(child, x, childY, width, childHeight, depth + 1)
        if (childElements) elements.push(childElements)
      })

      // Render files
      node.files.forEach((file, index) => {
        const fileY = y + ((node.children.length + index) * itemHeight)
        const fileHeight = Math.max(itemHeight - gap, 1)

        elements.push(
          <g key={`file-${file.path}`}>
            <rect
              x={x}
              y={fileY}
              width={width}
              height={fileHeight}
              fill={getFileColor(file.language)}
              className="icicle-rect-file"
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(file)
              }}
            />
            {fileHeight > 14 && width > 30 && (
              <text
                x={x + 8}
                y={fileY + fileHeight / 2}
                fill="white"
                fontSize="11"
                dominantBaseline="middle"
                className="icicle-text"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNodeClick(file)
                }}
              >
                {file.name}
              </text>
            )}
          </g>
        )
      })

      return elements
    }

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1200 800"
        className="icicle-chart"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        ref={svgRef}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <style>{`
          .icicle-rect-file { transition: opacity 0.2s; cursor: pointer; }
          .icicle-rect-file:hover { opacity: 0.7; stroke: white; stroke-width: 2px; }
          .icicle-rect-dir { transition: opacity 0.2s; cursor: pointer; }
          .icicle-rect-dir:hover { opacity: 0.8; }
          .icicle-text { pointer-events: none; font-family: -apple-system, sans-serif; cursor: pointer; }
        `}</style>
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {renderNode(fileTree, 0, 0, 1200, 800)}
        </g>
      </svg>
    )
  }

  // Sunburst Visualization
  const renderSunburst = () => {
    const centerX = 400
    const centerY = 300
    const maxLevel = 4
    const levelRadius = 55

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
          'javascript': '#f7df1e',
          'jsx': '#61dafb',
          'typescript': '#3178c6',
          'tsx': '#61dafb',
          'css': '#264de4',
          'html': '#e34c26',
          'json': '#f7df1e',
          'markdown': '#083fa1',
          'python': '#3776ab',
          'rust': '#000000',
          'go': '#00add8',
        }
        const fileColor = fileColors[file.language] || '#6b7280'

        const fileArcPath = describeArc(innerRadius, outerRadius, fileStart, fileEnd)

        elements.push(
          <g key={`file-${file.path}`}>
            <path
              d={fileArcPath}
              fill={fileColor}
              stroke="#ffffff"
              strokeWidth="1"
              opacity="0.85"
              className="sunburst-arc-file"
              onClick={(e) => {
                e.stopPropagation()
                handleNodeClick(file)
              }}
            />
          </g>
        )

        currentAngle = fileEnd
      })

      return elements.length > 0 ? <>{elements}</> : null
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
          .sunburst-arc { transition: opacity 0.2s; cursor: pointer; }
          .sunburst-arc:hover { opacity: 1; filter: brightness(1.15); }
          .sunburst-text { pointer-events: none; font-family: system-ui, -apple-system, sans-serif; text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
        `}</style>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Center circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r="23"
            fill="#1e293b"
            stroke="#ffffff"
            strokeWidth="3"
            className="sunburst-center"
          />
          <text
            x={centerX}
            y={centerY}
            fill="white"
            fontSize="11"
            fontWeight="700"
            textAnchor="middle"
            dominantBaseline="middle"
            className="sunburst-text"
          >
            Root
          </text>

          {renderNode(fileTree, 1, 0, Math.PI * 2)}
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

    const directories = groupFilesByDirectory(files || [])
    const dirCount = directories.length

    // Simple professional color palette (only 6 colors)
    const getDirColor = (index) => {
      const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed']
      return colors[index % colors.length]
    }

    // Simple file colors
    const getFileColor = () => '#64748b'

    // Create nodes
    const createNodes = () => {
      const nodes = []
      const radius = Math.min(200, Math.max(120, 14000 / (dirCount + 10)))
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
          const innerRadius = radius - 45

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
              connections.push({
                x1: nodeA.x,
                y1: nodeA.y,
                x2: nodeB.x,
                y2: nodeB.y
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
          {/* Connections */}
          {connections.map((conn, i) => (
            <line
              key={i}
              x1={conn.x1}
              y1={conn.y1}
              x2={conn.x2}
              y2={conn.y2}
              stroke="#64748b"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* Nodes */}
          {nodes.map((node, i) => {
            if (node.type === 'directory') {
              const dir = node.data
              const isExpanded = expandedDirs.has(dir.path)
              const dirColor = getDirColor(i)

              return (
                <g key={i}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={18}
                    fill={dirColor}
                    stroke={isExpanded ? 'white' : 'rgba(255,255,255,0.15)'}
                    strokeWidth={isExpanded ? 2 : 1}
                    className="chord-dir-node"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleDirectory(dir.path)
                    }}
                  />

                  {/* File count in center */}
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
                    {dir.files.length}
                  </text>

                  {/* Directory name on outer side */}
                  <text
                    x={node.x + Math.cos(node.angle) * 35}
                    y={node.y + Math.sin(node.angle) * 35}
                    fill="rgba(255,255,255,0.8)"
                    fontSize="9"
                    fontWeight="500"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="chord-text"
                  >
                    {dir.name.length > 10 ? dir.name.substring(0, 10) + '…' : dir.name}
                  </text>
                </g>
              )
            } else if (node.type === 'file') {
              return (
                <g key={i}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={6}
                    fill={getFileColor()}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                    className="chord-file-node"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNodeClick(node.data)
                    }}
                  />
                </g>
              )
            } else if (node.type === 'more') {
              return (
                <g key={i}>
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
    icicle: {
      icon: <IcicleIcon />,
      title: 'Icicle View',
      description: 'Vertical hierarchical visualization',
      render: renderIcicle
    },
    sunburst: {
      icon: <SunburstIcon />,
      title: 'Sunburst View',
      description: 'Radial hierarchical visualization',
      render: renderSunburst
    },
    chord: {
      icon: <ChordIcon />,
      title: 'Directory Relations',
      description: 'Directory dependencies • Click to expand',
      render: renderChord
    }
  }

  const config = viewConfig[currentView] || viewConfig.icicle

  return (
    <div className="visualization-area">
      <div className="visualization-container">
        <div className="visualization-header">
          <span className="visualization-icon">{config.icon}</span>
          <h2 className="visualization-title">{config.title}</h2>
          <p className="visualization-description">{config.description}</p>
        </div>
        <div className="visualization-content">
          {config.render()}
        </div>

        {/* Zoom Controls */}
        <div className="zoom-controls">
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
      </div>
    </div>
  )
}
