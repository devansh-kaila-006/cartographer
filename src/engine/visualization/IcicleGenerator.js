import * as THREE from 'three'

/**
 * Enhanced Icicle Chart Generator
 * Full-block click detection
 */
export class IcicleGenerator {
  constructor(scene, options = {}) {
    this.scene = scene
    this.group = new THREE.Group()
    this.scene.add(this.group)

    this.options = {
      width: 200,
      height: 120,
      levelHeight: 16,
      levelGap: 4,
      siblingGap: 2,
      blockGap: 1.5,
      minBlockWidth: 5,
      elevationStep: 0.25,
      blockElevation: 0.4,
      ...options
    }

    this.meshes = new Map()
  }

  /**
   * Generate icicle chart from file list
   */
  generate(files) {
    this.clear()

    if (!files || files.length === 0) return

    console.log(`📊 Icicle: ${files.length} files`)

    try {
      const tree = this.buildTree(files)
      this.calculateSizes(tree)

      // Render all levels
      this.renderAllLevels(tree, 0, 0, this.options.width)

      console.log(`✅ Created ${this.meshes.size} file nodes`)
    } catch (error) {
      console.error('Error generating icicle:', error)
      this.clear()
    }

    return this.group
  }

  /**
   * Build hierarchical tree from flat file list
   */
  buildTree(files) {
    const root = { name: 'root', children: [], size: 0, path: '', depth: 0 }

    files.forEach(file => {
      const parts = file.path.split('/')
      let current = root

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1

        if (isFile) {
          current.children.push({
            name: part,
            path: file.path,
            size: file.size || 1,
            isFile: true,
            file: file,
            depth: index + 1
          })
          current.size += file.size || 1
        } else {
          let child = current.children.find(c => c.name === part && !c.isFile)
          if (!child) {
            child = {
              name: part,
              children: [],
              size: 0,
              path: parts.slice(0, index + 1).join('/'),
              depth: index + 1
            }
            current.children.push(child)
          }
          current = child
        }
      })
    })

    return root
  }

  /**
   * Calculate sizes for all nodes
   */
  calculateSizes(node) {
    if (node.isFile || !node.children || node.children.length === 0) {
      return node.size || 1
    }
    node.size = node.children.reduce((sum, child) => sum + this.calculateSizes(child), 0)
    return node.size
  }

  /**
   * Render all levels of the tree
   */
  renderAllLevels(node, startX, startY, availableWidth) {
    const { levelHeight, levelGap, siblingGap, blockGap, elevationStep, blockElevation, minBlockWidth } = this.options

    if (!node.children || node.children.length === 0) return

    const levelY = startY + node.depth * (levelHeight + levelGap)
    const elevation = node.depth * elevationStep

    const sortedChildren = [...node.children].sort((a, b) => (b.size || 0) - (a.size || 0))
    const totalSize = sortedChildren.reduce((sum, child) => sum + (child.size || 0), 0)

    const maxChildrenThatFit = Math.floor(availableWidth / (minBlockWidth + siblingGap))
    const childrenToRender = sortedChildren.slice(0, maxChildrenThatFit)

    if (childrenToRender.length === 0) return

    const visibleTotalSize = childrenToRender.reduce((sum, child) => sum + (child.size || 0), 0)
    const totalSiblingGap = siblingGap * (childrenToRender.length - 1)
    const availableWidthForContent = availableWidth - totalSiblingGap

    let currentX = startX

    childrenToRender.forEach(child => {
      let childWidth = (child.size / visibleTotalSize) * availableWidthForContent
      childWidth = Math.max(minBlockWidth, childWidth)

      if (child.isFile) {
        this.renderFileBlock(child, currentX, levelY, childWidth, levelHeight, elevation + blockElevation)
      } else {
        this.renderFolderBackground(child, currentX, levelY, childWidth, levelHeight, elevation)
        this.renderAllLevels(child, currentX, startY, childWidth)
      }

      currentX += childWidth + siblingGap
    })
  }

  /**
   * Render folder background
   */
  renderFolderBackground(node, x, y, width, height, elevation) {
    const actualWidth = Math.max(6, width - 1)
    const actualHeight = Math.max(6, height - 1)

    const geometry = new THREE.BoxGeometry(actualWidth, 0.15, actualHeight)
    const color = this.getFolderColor(node.depth)

    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(x + actualWidth / 2, elevation, y + actualHeight / 2)
    mesh.userData = {
      path: node.path,
      name: node.name,
      isFolder: true,
      depth: node.depth
    }

    this.group.add(mesh)
  }

  /**
   * Render file block with full-block click detection
   */
  renderFileBlock(node, x, y, width, height, elevation) {
    const blockGap = this.options.blockGap
    const minBlockWidth = this.options.minBlockWidth

    // Calculate dimensions
    const blockWidth = Math.max(minBlockWidth, width - blockGap * 2)
    const blockHeight = Math.max(4, height - blockGap * 2)
    const blockDepth = Math.max(1.2, Math.min(2.8, Math.sqrt(node.size || 1) * 0.7))

    // Create geometry
    const geometry = new THREE.BoxGeometry(blockWidth, blockDepth, blockHeight)

    // CRITICAL: Compute bounding boxes for raycasting
    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

    // Get color
    const color = this.getFileColor(node)

    // Create material
    const material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    })

    // Create mesh
    const mesh = new THREE.Mesh(geometry, material)

    // Position mesh
    mesh.position.set(
      x + width / 2,
      elevation + blockDepth / 2,
      y + height / 2
    )

    // Store metadata
    mesh.userData = {
      path: node.path,
      name: node.name,
      size: node.size,
      file: node.file,
      isFile: true,
      depth: node.depth,
      originalColor: color
    }

    // Add edges that DON'T interfere with clicking
    this.addNonBlockingEdges(mesh, color)

    // Add to group and store
    this.group.add(mesh)
    this.meshes.set(node.path, mesh)
  }

  /**
   * Add edges that don't block raycasting
   */
  addNonBlockingEdges(mesh, color) {
    try {
      const edges = new THREE.EdgesGeometry(mesh.geometry)

      // White edges - CRITICAL: depthTest: false
      const whiteMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        depthTest: false,  // Don't block raycasting
        depthWrite: false // Don't write to depth buffer
      })
      const whiteEdges = new THREE.LineSegments(edges, whiteMaterial)
      whiteEdges.renderOrder = 1
      mesh.add(whiteEdges)

      // Colored glow edges - CRITICAL: depthTest: false
      const glowMaterial = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.2,
        depthTest: false,  // Don't block raycasting
        depthWrite: false // Don't write to depth buffer
      })
      const glowEdges = new THREE.LineSegments(edges.clone(), glowMaterial)
      glowEdges.scale.set(1.02, 1.02, 1.02)
      glowEdges.renderOrder = 2
      mesh.add(glowEdges)
    } catch (error) {
      // Skip edges on error
    }
  }

  /**
   * Get file color based on extension
   */
  getFileColor(node) {
    const name = node.name || node.path.split('/').pop()
    const ext = name.split('.').pop().toLowerCase()

    const colors = {
      'js': 0xFFD700,
      'jsx': 0x61DAFB,
      'ts': 0x00BFFF,
      'tsx': 0x3178C6,
      'py': 0x00FF7F,
      'rs': 0xFF4500,
      'go': 0x1E90FF,
      'java': 0xFF69B4,
      'cpp': 0x9370DB,
      'c': 0x20B2AA,
      'cs': 0x32CD32,
      'rb': 0xDC143C,
      'php': 0x696969,
      'swift': 0xFF8C00,
      'kt': 0x8A2BE2,
      'css': 0x00CED1,
      'scss': 0xFF1493,
      'html': 0xFF6347,
      'json': 0xFFC107,
      'md': 0x6495ED
    }

    return colors[ext] || 0x00F3FF
  }

  /**
   * Get folder color based on depth
   */
  getFolderColor(depth) {
    const colors = [
      0x3498db,
      0x2ecc71,
      0x9b59b6,
      0xe67e22,
      0x1abc9c
    ]
    return colors[depth % colors.length]
  }

  /**
   * Clear all meshes
   */
  clear() {
    const allMeshes = []
    this.group.children.forEach(child => {
      allMeshes.push(child)
    })

    allMeshes.forEach(mesh => {
      this.group.remove(mesh)
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) mesh.material.dispose()
      mesh.children?.forEach(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    })

    this.meshes.clear()
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
   * Highlight mesh
   */
  highlightMesh(mesh) {
    if (mesh && mesh.material) {
      mesh.material.color.setHex(0x00f3ff)
      mesh.scale.set(1.12, 1.12, 1.12)
      mesh.children?.forEach(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = Math.min(child.material.opacity * 1.4, 0.8)
        }
      })
    }
  }

  /**
   * Reset mesh to original state
   */
  resetMesh(mesh) {
    if (mesh && mesh.material && mesh.userData.originalColor) {
      mesh.material.color.setHex(mesh.userData.originalColor)
      mesh.scale.set(1, 1, 1)
      mesh.children?.forEach(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity *= 0.7
        }
      })
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
