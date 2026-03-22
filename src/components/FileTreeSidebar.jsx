import { useState, useMemo } from 'react'
import {
  FaFolder, FaFolderOpen,
  FaSearch, FaTimes, FaChevronRight, FaChevronDown
} from 'react-icons/fa'
import {
  buildFileTree,
  filterTree,
  getFileIcon,
  getTreeStats
} from '../utils/fileTreeParser'
import './FileTreeSidebar.css'

/**
 * FileTreeSidebar Component
 * Collapsible file tree with icons, search, and click-to-navigate
 */
export function FileTreeSidebar({
  files = [],
  visible = false,
  onFileClick = null,
  onToggle = null
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['']))
  const [filter, setFilter] = useState('')
  const [hoveredFile, setHoveredFile] = useState(null)

  // Build file tree from flat files array
  const tree = useMemo(() => {
    return buildFileTree(files)
  }, [files])

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    return filterTree(tree, filter)
  }, [tree, filter])

  // Calculate stats
  const stats = useMemo(() => {
    return getTreeStats(tree)
  }, [tree])

  // Toggle folder expansion
  const toggleFolder = (path, event) => {
    event.stopPropagation()

    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  // Handle file click
  const handleFileClick = (file, event) => {
    event.stopPropagation()
    setHoveredFile(file.path)
    if (onFileClick) {
      onFileClick(file)
    }
  }

  // Expand all folders
  const expandAll = () => {
    const allPaths = new Set()

    function collectPaths(node) {
      if (node.type === 'folder') {
        allPaths.add(node.path)
        if (node.children) {
          node.children.forEach(child => collectPaths(child))
        }
      }
    }

    collectPaths(filteredTree)
    setExpandedFolders(allPaths)
  }

  // Collapse all folders
  const collapseAll = () => {
    setExpandedFolders(new Set(['']))
  }

  // Clear filter
  const clearFilter = () => {
    setFilter('')
  }

  // Render tree node
  const renderNode = (node, depth = 0) => {
    if (!node) return null

    const isExpanded = expandedFolders.has(node.path)
    const isHovered = hoveredFile === node.path

    if (node.type === 'file') {
      const icon = getFileIcon(node)
      return (
        <div
          key={node.path}
          className={`file-tree-item file ${isHovered ? 'hovered' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={(e) => handleFileClick(node, e)}
          onMouseEnter={() => setHoveredFile(node.path)}
          onMouseLeave={() => setHoveredFile(null)}
        >
          <span className="file-icon">{icon}</span>
          <span className="file-name">{node.name}</span>
          {node.size && (
            <span className="file-size">
              {(node.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>
      )
    }

    // Folder node
    return (
      <div key={node.path} className="folder-node">
        <div
          className={`file-tree-item folder ${isExpanded ? 'expanded' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={(e) => toggleFolder(node.path, e)}
        >
          <span className="folder-icon">
            {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
          </span>
          <span className="folder-icon">
            {isExpanded ? <FaFolderOpen /> : <FaFolder />}
          </span>
          <span className="folder-name">{node.name}</span>
          {node.languageCount && Object.keys(node.languageCount).length > 0 && (
            <span className="folder-languages">
              {Object.keys(node.languageCount).slice(0, 3).join(', ')}
            </span>
          )}
        </div>
        {isExpanded && node.children && (
          <div className="folder-children">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  if (!visible || !files.length) return null

  return (
    <div className="file-tree-sidebar glass">
      {/* Header */}
      <div className="file-tree-header">
        <h3>File Tree</h3>
        <button
          className="close-btn"
          onClick={onToggle}
          aria-label="Close file tree"
        >
          <FaTimes />
        </button>
      </div>

      {/* Search */}
      <div className="file-tree-search">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Filter files..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
        {filter && (
          <button
            className="clear-filter-btn"
            onClick={clearFilter}
            aria-label="Clear filter"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="file-tree-actions">
        <button
          className="action-btn"
          onClick={expandAll}
          disabled={!!filter}
        >
          Expand All
        </button>
        <button
          className="action-btn"
          onClick={collapseAll}
          disabled={!!filter}
        >
          Collapse All
        </button>
      </div>

      {/* Stats */}
      <div className="file-tree-stats">
        <span>{stats.fileCount} files</span>
        <span>{stats.folderCount} folders</span>
      </div>

      {/* Tree */}
      <div className="file-tree-content">
        {filteredTree ? (
          renderNode(filteredTree)
        ) : (
          <div className="no-results">
            No files match "{filter}"
          </div>
        )}
      </div>
    </div>
  )
}
