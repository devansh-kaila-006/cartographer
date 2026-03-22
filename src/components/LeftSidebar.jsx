import { useState, useMemo } from 'react'
import './LeftSidebar.css'

export function LeftSidebar({ files, onFileClick, selectedFile }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedFolders, setCollapsedFolders] = useState(new Set())

  // Mock file data for now
  const mockFiles = [
    { path: 'src/App.jsx', name: 'App.jsx', type: 'file', language: 'jsx' },
    { path: 'src/main.jsx', name: 'main.jsx', type: 'file', language: 'jsx' },
    { path: 'src/components/LandingPage.jsx', name: 'LandingPage.jsx', type: 'file', language: 'jsx' },
    { path: 'src/components/TopBar.jsx', name: 'TopBar.jsx', type: 'file', language: 'jsx' },
    { path: 'src/styles/index.css', name: 'index.css', type: 'file', language: 'css' },
    { path: 'src/styles/linear.css', name: 'linear.css', type: 'file', language: 'css' },
    { path: 'package.json', name: 'package.json', type: 'file', language: 'json' },
  ]

  const displayFiles = files || mockFiles

  // Build file tree structure
  const fileTree = useMemo(() => {
    const tree = {}

    displayFiles.forEach(file => {
      const parts = file.path.split('/')
      let current = tree

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            isFolder: index < parts.length - 1,
            children: {},
            path: parts.slice(0, index + 1).join('/'),
            file: index === parts.length - 1 ? file : null
          }
        }

        if (index < parts.length - 1) {
          current = current[part].children
        }
      })
    })

    return tree
  }, [displayFiles])

  // Filter files by search query
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return displayFiles

    const query = searchQuery.toLowerCase()
    return displayFiles.filter(file =>
      file.path.toLowerCase().includes(query)
    )
  }, [displayFiles, searchQuery])

  // Toggle folder collapse
  const toggleFolder = (path) => {
    setCollapsedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  // Get file icon based on language/extension
  const getFileIcon = (file) => {
    if (!file) return '📄'

    const ext = file.name.split('.').pop().toLowerCase()
    const icons = {
      'jsx': '⚛️',
      'js': '⚛️',
      'tsx': '⚛️',
      'ts': '⚛️',
      'css': '🎨',
      'html': '🌐',
      'json': '📋',
      'md': '📝',
      'py': '🐍',
      'go': '🐹',
      'rs': '🦀',
    }
    return icons[ext] || '📄'
  }

  // Render tree items recursively
  const renderTree = (tree, depth = 0) => {
    return Object.entries(tree)
      .sort(([_, a], [__, b]) => {
        // Sort folders first, then files
        if (a.isFolder && !b.isFolder) return -1
        if (!a.isFolder && b.isFolder) return 1
        return a.name.localeCompare(b.name)
      })
      .map(([key, item]) => {
        const isCollapsed = collapsedFolders.has(item.path)
        const isSelected = selectedFile?.path === item.path

        if (item.isFolder) {
          return (
            <div key={item.path} className="tree-item">
              <div
                className={`tree-folder ${isCollapsed ? 'collapsed' : ''}`}
                style={{ paddingLeft: `${depth * 16 + 12}px` }}
                onClick={() => toggleFolder(item.path)}
              >
                <span className="folder-icon">
                  {isCollapsed ? '▶' : '▼'}
                </span>
                <span className="folder-name">{item.name}</span>
              </div>
              {!isCollapsed && renderTree(item.children, depth + 1)}
            </div>
          )
        } else {
          return (
            <div
              key={item.path}
              className={`tree-file ${isSelected ? 'selected' : ''}`}
              style={{ paddingLeft: `${depth * 16 + 28}px` }}
              onClick={() => onFileClick && onFileClick(item.file)}
            >
              <span className="file-icon">{getFileIcon(item.file)}</span>
              <span className="file-name">{item.name}</span>
            </div>
          )
        }
      })
  }

  return (
    <div className="left-sidebar">
      {/* Search */}
      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* File Tree */}
      <div className="sidebar-tree">
        {filteredFiles.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <span className="empty-text">No files found</span>
          </div>
        ) : (
          <div className="tree-content">
            {renderTree(fileTree)}
          </div>
        )}
      </div>

      {/* File Count */}
      <div className="sidebar-footer">
        <span className="file-count">{filteredFiles.length} files</span>
      </div>
    </div>
  )
}
