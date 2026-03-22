import * as THREE from 'three'

/**
 * Dependency Graph Generator
 * Creates force-directed graph showing file dependencies
 */
export class DependencyGraphGenerator {
  constructor(scene, options = {}) {
    this.scene = scene
    this.group = new THREE.Group()
    this.scene.add(this.group)
    this.options = {
      nodeSize: 20,
      linkWidth: 2,
      ...options
    }
    this.meshes = new Map() // path -> mesh
    this.links = []
  }

  /**
   * Generate dependency graph from file list
   */
  generate(files) {
    this.clear()

    // Filter files to reduce clutter - only show important code files
    const filteredFiles = files.filter(file => {
      const filename = file.path.split('/').pop().toLowerCase()
      const ext = file.path.split('.').pop()

      // Exclude config files, test files, and common non-code files
      const excluded = [
        'config', 'conf', '.env', 'package.json', 'package-lock.json',
        'tsconfig.json', '.eslintrc', '.prettierrc', 'webpack.config',
        'vite.config', 'rollup.config', 'babel.config', '.gitignore',
        'readme', 'license', 'changelog', 'contributing'
      ]

      const isExcluded = excluded.some(ex => filename.includes(ex))
      const isTest = file.path.includes('.test.') || file.path.includes('.spec.') || file.path.includes('__tests__')
      const isConfig = filename.includes('config') || filename.includes('.rc')

      return !isExcluded && !isTest && !isConfig
    })

    // Limit to most important files by size (larger files are usually more important)
    const sortedFiles = filteredFiles
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, 50) // Max 50 nodes for clarity

    console.log(`📊 Dependency Graph: ${sortedFiles.length} files (filtered from ${files.length} total)`)

    // Build dependency graph
    const graph = this.buildDependencyGraph(sortedFiles)

    // Apply force-directed layout
    const layout = this.applyForceLayout(graph)

    // Create nodes and links
    this.createVisualization(graph, layout)

    console.log(`✅ Created ${this.meshes.size} nodes and ${this.links.length} links`)

    return this.group
  }

  /**
   * Build dependency graph from files
   * Simulates dependencies based on folder structure and file types
   */
  buildDependencyGraph(files) {
    const nodes = []
    const links = []

    // Create nodes for each file
    files.forEach(file => {
      nodes.push({
        id: file.path,
        name: file.name,
        path: file.path,
        size: file.size || 1,
        type: this.getFileType(file.path),
        file: file
      })
    })

    // Simulate dependencies based on:
    // 1. Files in same folder are likely related
    // 2. Common import patterns (index files import from subfolders)
    // 3. Test files import from source files

    const folderMap = new Map()
    files.forEach(file => {
      const folder = file.path.split('/').slice(0, -1).join('/')
      if (!folderMap.has(folder)) {
        folderMap.set(folder, [])
      }
      folderMap.get(folder).push(file)
    })

    // Create links within folders (limited to reduce clutter)
    folderMap.forEach((folderFiles, folder) => {
      if (folderFiles.length > 1) {
        // Only connect adjacent files in folder to reduce visual clutter
        for (let i = 0; i < folderFiles.length - 1; i++) {
          // Skip if both are test files
          if (folderFiles[i].path.includes('.test.') && folderFiles[i + 1].path.includes('.test.')) {
            continue
          }
          links.push({
            source: folderFiles[i].path,
            target: folderFiles[i + 1].path,
            strength: 0.5
          })
        }
      }
    })

    // Create links from index files to files in subfolders (very limited)
    files.forEach(file => {
      if (file.name === 'index.js' || file.name === 'index.ts' || file.name === 'index.jsx') {
        const folder = file.path.split('/').slice(0, -1).join('/')

        files.forEach(otherFile => {
          const otherFolder = otherFile.path.split('/').slice(0, -1).join('/')
          // Check if otherFile is in a direct subfolder
          if (otherFolder.startsWith(folder + '/') && otherFolder !== folder) {
            const relativePath = otherFolder.slice(folder.length + 1)
            if (relativePath.split('/').length === 1) {
              // Only connect to first 3 files in subfolder to reduce clutter
              links.push({
                source: file.path,
                target: otherFile.path,
                strength: 0.6
              })
            }
          }
        })
      }
    })

    // Create links from test files to source files (very limited)
    files.forEach(file => {
      if (file.path.includes('.test.') || file.path.includes('.spec.')) {
        const sourcePath = file.path.replace('.test.', '.').replace('.spec.', '.')
        const sourceFile = files.find(f => f.path === sourcePath)
        if (sourceFile) {
          links.push({
            source: file.path,
            target: sourcePath,
            strength: 0.7
          })
        }
      }
    })

    return { nodes, links }
  }

  /**
   * Get file type for coloring
   */
  getFileType(path) {
    const ext = path.split('.').pop().toLowerCase()
    const typeMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'rs': 'rust',
      'go': 'go',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'rb': 'ruby',
      'php': 'php',
      'swift': 'swift',
      'kt': 'kotlin',
      'css': 'css',
      'scss': 'scss',
      'html': 'html',
      'json': 'json',
      'md': 'markdown'
    }
    return typeMap[ext] || 'other'
  }

  /**
   * Apply force-directed layout algorithm
   */
  applyForceLayout(graph) {
    const positions = new Map()
    const velocities = new Map()

    // Group nodes by folder for initial placement
    const folderGroups = new Map()
    const nodeDepths = new Map()

    graph.nodes.forEach(node => {
      const folder = node.path.split('/').slice(0, -1).join('/') || 'root'
      const depth = folder.split('/').length

      if (!folderGroups.has(folder)) {
        folderGroups.set(folder, [])
      }
      folderGroups.get(folder).push(node.id)
      nodeDepths.set(node.id, depth)
    })

    // Initialize positions with hierarchical radial layout
    const centerX = 0
    const centerZ = 0

    // Sort folders by depth (root folders first)
    const sortedFolders = Array.from(folderGroups.entries())
      .sort((a, b) => {
        const depthA = a[0].split('/').length
        const depthB = b[0].split('/').length
        return depthA - depthB
      })

    sortedFolders.forEach(([folder, nodeIds], folderIndex) => {
      const folderDepth = folder.split('/').length
      const radius = 8 + folderDepth * 6
      const angleStep = (Math.PI * 2) / Math.max(folderGroups.size, 1)
      const angle = folderIndex * angleStep + (folderDepth * 0.3)

      const folderCenterX = centerX + Math.cos(angle) * radius
      const folderCenterZ = centerZ + Math.sin(angle) * radius

      nodeIds.forEach(nodeId => {
        const spread = 5
        positions.set(nodeId, {
          x: folderCenterX + (Math.random() - 0.5) * spread,
          y: folderCenterZ + (Math.random() - 0.5) * spread
        })
        velocities.set(nodeId, { x: 0, y: 0 })
      })
    })

    // Simulate force-directed layout
    const iterations = 150
    const repulsion = 20000
    const attraction = 0.05
    const damping = 0.7

    for (let i = 0; i < iterations; i++) {
      // Repulsion between all nodes
      graph.nodes.forEach(nodeA => {
        const posA = positions.get(nodeA.id)

        graph.nodes.forEach(nodeB => {
          if (nodeA.id !== nodeB.id) {
            const posB = positions.get(nodeB.id)
            const dx = posA.x - posB.x
            const dy = posA.y - posB.y
            const distance = Math.sqrt(dx * dx + dy * dy) || 1

            const force = repulsion / (distance * distance)
            const fx = (dx / distance) * force
            const fy = (dy / distance) * force

            const vel = velocities.get(nodeA.id)
            vel.x += fx
            vel.y += fy
          }
        })
      })

      // Attraction along links
      graph.links.forEach(link => {
        const posSource = positions.get(link.source)
        const posTarget = positions.get(link.target)

        if (posSource && posTarget) {
          const dx = posTarget.x - posSource.x
          const dy = posTarget.y - posSource.y
          const distance = Math.sqrt(dx * dx + dy * dy) || 1

          const force = distance * attraction * link.strength
          const fx = (dx / distance) * force
          const fy = (dy / distance) * force

          const velSource = velocities.get(link.source)
          const velTarget = velocities.get(link.target)

          velSource.x += fx
          velSource.y += fy
          velTarget.x -= fx
          velTarget.y -= fy
        }
      })

      // Center gravity
      graph.nodes.forEach(node => {
        const pos = positions.get(node.id)
        const vel = velocities.get(node.id)

        vel.x += (centerX - pos.x) * 0.02
        vel.y += (centerZ - pos.y) * 0.02

        // Update position
        vel.x *= damping
        vel.y *= damping

        pos.x += vel.x
        pos.y += vel.y
      })
    }

    return positions
  }

  /**
   * Create visualization meshes
   */
  createVisualization(graph, layout) {
    // Create nodes
    graph.nodes.forEach(node => {
      const pos = layout.get(node.id)

      // Larger, more visible nodes based on file size
      const baseSize = Math.max(Math.sqrt(node.size) * 3, 4)
      const geometry = new THREE.SphereGeometry(baseSize, 32, 32)
      const color = this.getNodeColor(node.type)
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: false,
        opacity: 1.0
      })

      const mesh = new THREE.Mesh(geometry, material)
      // Position on X-Z plane with Y as height
      mesh.position.set(pos.x, baseSize, pos.y)
      mesh.userData = {
        path: node.path,
        name: node.name,
        size: node.size,
        file: node.file || null,
        type: node.type,
        originalColor: color
      }

      this.group.add(mesh)
      this.meshes.set(node.path, mesh)
    })

    // Create links (very subtle)
    graph.links.forEach(link => {
      const sourcePos = layout.get(link.source)
      const targetPos = layout.get(link.target)

      if (sourcePos && targetPos) {
        const sourceNode = graph.nodes.find(n => n.id === link.source)
        const targetNode = graph.nodes.find(n => n.id === link.target)
        const sourceSize = sourceNode ? Math.max(Math.sqrt(sourceNode.size) * 3, 4) : 4
        const targetSize = targetNode ? Math.max(Math.sqrt(targetNode.size) * 3, 4) : 4

        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sourcePos.x, sourceSize, sourcePos.y),
          new THREE.Vector3(targetPos.x, targetSize, targetPos.y)
        ])

        const material = new THREE.LineBasicMaterial({
          color: 0x334455,
          transparent: true,
          opacity: 0.08 * link.strength
        })

        const line = new THREE.Line(geometry, material)
        this.group.add(line)
        this.links.push(line)
      }
    })
  }

  /**
   * Get node color based on file type (high contrast vibrant colors)
   */
  getNodeColor(type) {
    const colors = {
      'javascript': 0xFFD700,     // Gold
      'typescript': 0x00BFFF,     // Deep Sky Blue
      'python': 0x00FF7F,         // Spring Green
      'rust': 0xFF4500,           // Orange Red
      'go': 0x1E90FF,             // Dodger Blue
      'java': 0xFF69B4,           // Hot Pink
      'cpp': 0x9370DB,            // Medium Purple
      'c': 0x20B2AA,              // Light Sea Green
      'csharp': 0x32CD32,         // Lime Green
      'ruby': 0xDC143C,           // Crimson
      'php': 0x696969,            // Dim Gray
      'swift': 0xFF8C00,          // Dark Orange
      'kotlin': 0x8A2BE2,         // Blue Violet
      'css': 0x00CED1,            // Dark Turquoise
      'scss': 0xFF1493,           // Deep Pink
      'html': 0xFF6347,           // Tomato
      'json': 0xFFD700,           // Gold
      'markdown': 0x6495ED,       // Cornflower Blue
      'other': 0xB0C4DE           // Light Steel Blue
    }
    return colors[type] || colors.other
  }

  /**
   * Clear all meshes
   */
  clear() {
    while (this.group.children.length > 0) {
      const mesh = this.group.children[0]
      this.group.remove(mesh)
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) mesh.material.dispose()
    }
    this.meshes.clear()
    this.links = []
  }

  /**
   * Reset mesh to original state
   */
  resetMesh(mesh) {
    if (mesh && mesh.material && mesh.userData.originalColor) {
      mesh.material.color.setHex(mesh.userData.originalColor)
      mesh.material.opacity = 1
      mesh.scale.set(1, 1, 1)
    }
  }

  /**
   * Get node count for debugging
   */
  getNodeCount() {
    return this.meshes.size
  }

  /**
   * Get link count for debugging
   */
  getLinkCount() {
    return this.links.length
  }

  /**
   * Get mesh by file path
   */
  getMeshByPath(path) {
    return this.meshes.get(path)
  }

  /**
   * Get all meshes
   */
  getAllMeshes() {
    return Array.from(this.meshes.values())
  }

  /**
   * Highlight mesh (enhanced visual feedback)
   */
  highlightMesh(mesh) {
    if (mesh && mesh.material) {
      // Store original color if not already stored
      if (!mesh.userData.originalColor) {
        mesh.userData.originalColor = mesh.material.color.getHex()
      }

      // Change to bright cyan for selection
      mesh.material.color.setHex(0x00f3ff)
      mesh.material.opacity = 1
      mesh.scale.set(1.5, 1.5, 1.5)
    }
  }

  /**
   * Update mesh visibility
   */
  updateMeshVisibility(visiblePaths) {
    this.meshes.forEach((mesh, path) => {
      mesh.visible = visiblePaths.has(path)
    })
  }

  /**
   * Dispose resources
   */
  dispose() {
    this.clear()
    this.scene.remove(this.group)
  }
}
