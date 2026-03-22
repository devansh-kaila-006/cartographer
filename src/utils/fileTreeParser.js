/**
 * File tree parser utilities
 * Convert flat file arrays to hierarchical tree structures
 */

/**
 * Build a hierarchical file tree from a flat array of files
 * @param {Array} files - Array of file objects with path, size, language
 * @returns {Object} Hierarchical tree structure
 */
export function buildFileTree(files) {
  const root = {
    name: 'root',
    type: 'folder',
    path: '',
    children: [],
    size: 0,
    languageCount: {}
  }

  files.forEach(file => {
    const parts = file.path.split('/')
    let currentNode = root

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1
      const path = parts.slice(0, index + 1).join('/')

      if (isFile) {
        // Add file node
        const fileNode = {
          name: part,
          type: 'file',
          path: file.path,
          size: file.size,
          language: file.language,
          extension: part.split('.').pop()
        }
        currentNode.children.push(fileNode)
        currentNode.size += file.size

        // Track language count
        if (!currentNode.languageCount[file.language]) {
          currentNode.languageCount[file.language] = 0
        }
        currentNode.languageCount[file.language]++
      } else {
        // Find or create folder node
        let folderNode = currentNode.children.find(child => child.name === part && child.type === 'folder')

        if (!folderNode) {
          folderNode = {
            name: part,
            type: 'folder',
            path: path,
            children: [],
            size: 0,
            languageCount: {}
          }
          currentNode.children.push(folderNode)
        }

        currentNode = folderNode
      }
    })
  })

  // Sort children: folders first, then files, both alphabetically
  sortTree(root)

  return root
}

/**
 * Sort tree nodes: folders first, then files, both alphabetically
 * @param {Object} node - Tree node to sort
 */
function sortTree(node) {
  if (!node.children) return

  node.children.sort((a, b) => {
    // Folders come before files
    if (a.type === 'folder' && b.type === 'file') return -1
    if (a.type === 'file' && b.type === 'folder') return 1
    // Same type: sort alphabetically
    return a.name.localeCompare(b.name)
  })

  // Recursively sort children
  node.children.forEach(child => {
    if (child.type === 'folder') {
      sortTree(child)
    }
  })
}

/**
 * Filter tree by search term
 * @param {Object} tree - Tree to filter
 * @param {string} filter - Search filter
 * @returns {Object|null} Filtered tree or null if no matches
 */
export function filterTree(tree, filter) {
  if (!filter || filter.trim() === '') {
    return tree
  }

  const lowerFilter = filter.toLowerCase()

  function filterNode(node) {
    if (node.type === 'file') {
      // Check if file name matches
      const matches = node.name.toLowerCase().includes(lowerFilter) ||
                     node.path.toLowerCase().includes(lowerFilter)
      return matches ? node : null
    } else {
      // Filter children
      const filteredChildren = node.children
        .map(child => filterNode(child))
        .filter(child => child !== null)

      if (filteredChildren.length === 0) {
        return null
      }

      // Return copy of node with filtered children
      return {
        ...node,
        children: filteredChildren
      }
    }
  }

  return filterNode(tree)
}

/**
 * Flatten tree to array of visible file paths
 * @param {Object} tree - Tree to flatten
 * @param {Set} expandedFolders - Set of expanded folder paths
 * @returns {Array} Array of file nodes
 */
export function flattenTree(tree, expandedFolders = new Set()) {
  const files = []

  function traverse(node) {
    if (node.type === 'file') {
      files.push(node)
    } else if (node.type === 'folder') {
      const isExpanded = expandedFolders.has(node.path)

      if (isExpanded) {
        node.children.forEach(child => traverse(child))
      }
    }
  }

  traverse(tree)
  return files
}

/**
 * Get all file paths from tree
 * @param {Object} tree - Tree to extract files from
 * @returns {Array<string>} Array of file paths
 */
export function getAllFilePaths(tree) {
  const paths = []

  function traverse(node) {
    if (node.type === 'file') {
      paths.push(node.path)
    } else if (node.type === 'folder' && node.children) {
      node.children.forEach(child => traverse(child))
    }
  }

  traverse(tree)
  return paths
}

/**
 * Find a node by path in the tree
 * @param {Object} tree - Tree to search
 * @param {string} path - Path to find
 * @returns {Object|null} Found node or null
 */
export function findNodeByPath(tree, path) {
  function traverse(node) {
    if (node.path === path) {
      return node
    }

    if (node.children) {
      for (const child of node.children) {
        const found = traverse(child)
        if (found) return found
      }
    }

    return null
  }

  return traverse(tree)
}

/**
 * Get file icon based on extension or language
 * @param {Object} file - File node
 * @returns {string} Icon name or emoji
 */
export function getFileIcon(file) {
  if (file.type === 'folder') {
    return 'DIR'
  }

  const extensionMap = {
    'js': 'JS',
    'jsx': 'JSX',
    'ts': 'TS',
    'tsx': 'TSX',
    'py': 'PY',
    'rs': 'RS',
    'go': 'GO',
    'java': 'JAVA',
    'cpp': 'CPP',
    'c': 'C',
    'cs': 'CS',
    'rb': 'RB',
    'php': 'PHP',
    'swift': 'SWIFT',
    'kt': 'KT',
    'css': 'CSS',
    'scss': 'SCSS',
    'html': 'HTML',
    'json': 'JSON',
    'md': 'MD',
    'yml': 'YML',
    'yaml': 'YAML'
  }

  if (file.extension) {
    return extensionMap[file.extension] || file.extension.toUpperCase()
  }

  return 'FILE'
}

/**
 * Calculate tree statistics
 * @param {Object} tree - Tree to analyze
 * @returns {Object} Statistics object
 */
export function getTreeStats(tree) {
  let fileCount = 0
  let folderCount = 0
  let totalSize = 0
  const languageCount = {}

  function traverse(node) {
    if (node.type === 'file') {
      fileCount++
      totalSize += node.size || 0

      if (node.language) {
        languageCount[node.language] = (languageCount[node.language] || 0) + 1
      }
    } else if (node.type === 'folder') {
      folderCount++
      if (node.children) {
        node.children.forEach(child => traverse(child))
      }
    }
  }

  traverse(tree)

  return {
    fileCount,
    folderCount,
    totalSize,
    languageCount,
    topLanguages: Object.entries(languageCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, count }))
  }
}
