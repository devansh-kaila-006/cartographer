import * as THREE from 'three'

/**
 * Premium Chord Diagram Generator
 * Stunning circular visualization with enhanced design
 */
export class ChordDiagramGenerator {
  constructor(scene, options = {}) {
    this.scene = scene
    this.group = new THREE.Group()
    this.scene.add(this.group)

    this.options = {
      radius: 38,
      nodeRadius: 6,
      maxFiles: 28,
      ribbonSegments: 60,
      ...options
    }

    this.meshes = new Map()
    this.ribbons = []
  }

  /**
   * Generate chord diagram from file list
   */
  generate(files) {
    this.clear()

    // Filter and limit files
    const filteredFiles = files.filter(file => {
      const filename = file.path.split('/').pop().toLowerCase()
      const excluded = ['config', 'conf', '.env', 'package.json', 'package-lock.json',
        'tsconfig.json', '.eslintrc', '.prettierrc', 'webpack.config',
        'vite.config', 'rollup.config', 'babel.config', '.gitignore',
        'readme', 'license', 'changelog', 'contributing']
      const isExcluded = excluded.some(ex => filename.includes(ex))
      const isTest = file.path.includes('.test.') || file.path.includes('.spec.') || file.path.includes('__tests__')
      return !isExcluded && !isTest
    })

    const sortedFiles = filteredFiles
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, this.options.maxFiles)

    console.log(`🎵 Chord Diagram: ${sortedFiles.length} files (filtered from ${files.length} total)`)

    // Build relationships
    const relationships = this.buildRelationships(sortedFiles)

    // Calculate layout
    const layout = this.calculateLayout(sortedFiles)

    // Create visualization
    this.createVisualization(sortedFiles, relationships, layout)

    console.log(`✅ Created ${this.meshes.size} nodes and ${this.ribbons.length} ribbons`)

    return this.group
  }

  /**
   * Build relationships between files
   */
  buildRelationships(files) {
    const relationships = new Map()

    files.forEach((file, i) => {
      const fileRelations = []
      const myFolder = file.path.split('/').slice(0, -1).join('/')
      const myType = this.getFileType(file.path)

      files.forEach((otherFile, j) => {
        if (i === j) return

        const otherFolder = otherFile.path.split('/').slice(0, -1).join('/')
        const otherType = this.getFileType(otherFile.path)

        let strength = 0

        // Same folder = very strong
        if (myFolder === otherFolder) {
          strength = 0.95
        }
        // Same type = moderate
        else if (myType === otherType) {
          strength = 0.6
        }
        // Parent/child folder
        else if (otherFolder.startsWith(myFolder + '/') || myFolder.startsWith(otherFolder + '/')) {
          strength = 0.75
        }

        if (strength > 0) {
          fileRelations.push({ index: j, strength })
        }
      })

      // Sort by strength and take top connections
      fileRelations.sort((a, b) => b.strength - a.strength)
      relationships.set(i, fileRelations.slice(0, 6))
    })

    return relationships
  }

  /**
   * Calculate circular layout
   */
  calculateLayout(files) {
    const radius = this.options.radius
    const angleStep = (Math.PI * 2) / files.length
    const positions = []

    files.forEach((file, i) => {
      const angle = i * angleStep - Math.PI / 2
      positions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        angle: angle
      })
    })

    return positions
  }

  /**
   * Create visualization meshes
   */
  createVisualization(files, relationships, layout) {
    const nodeRadius = this.options.nodeRadius
    const nodeHeight = nodeRadius

    // Add central hub
    this.renderCentralHub()

    // Create nodes
    files.forEach((file, i) => {
      const pos = layout[i]
      const color = this.getNodeColor(this.getFileType(file.path))

      // Main node sphere with enhanced design
      const geometry = new THREE.SphereGeometry(nodeRadius, 32, 32)
      geometry.computeBoundingBox()
      geometry.computeBoundingSphere()

      const material = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide
      })

      const mesh = new THREE.Mesh(geometry, material)
      mesh.position.set(pos.x, nodeHeight, pos.z)

      mesh.userData = {
        path: file.path,
        name: file.name,
        size: file.size,
        file: file,
        type: this.getFileType(file.path),
        originalColor: color,
        index: i
      }

      // Add premium node effects
      this.addInnerCore(mesh, nodeRadius, color)
      this.addOuterRing(mesh, nodeRadius, color)
      this.addGlowHalo(mesh, nodeRadius, color)

      this.group.add(mesh)
      this.meshes.set(file.path, mesh)
    })

    // Create ribbons
    let ribbonCount = 0
    relationships.forEach((relations, sourceIndex) => {
      relations.forEach(relation => {
        const targetIndex = relation.index
        const sourcePos = layout[sourceIndex]
        const targetPos = layout[targetIndex]

        if (sourceIndex < targetIndex) {
          this.createPremiumRibbon(sourcePos, targetPos, relation.strength, nodeHeight)
          ribbonCount++
        }
      })
    })

    console.log(`Created ${ribbonCount} ribbons`)
  }

  /**
   * Render central hub decoration
   */
  renderCentralHub() {
    // Main center circle
    const hubGeometry = new THREE.CylinderGeometry(8, 8, 1, 32)
    const hubMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a0e27,
      side: THREE.DoubleSide
    })
    const hub = new THREE.Mesh(hubGeometry, hubMaterial)
    hub.position.set(0, 0.5, 0)
    this.group.add(hub)

    // Glowing ring around hub
    const ringGeometry = new THREE.TorusGeometry(9, 0.5, 16, 48)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.4,
      depthTest: false
    })
    const ring = new THREE.Mesh(ringGeometry, ringMaterial)
    ring.rotation.x = Math.PI / 2
    ring.position.set(0, 0.5, 0)
    this.group.add(ring)

    // Inner decorative ring
    const innerRingGeometry = new THREE.TorusGeometry(6, 0.3, 8, 32)
    const innerRingMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.2,
      depthTest: false
    })
    const innerRing = new THREE.Mesh(innerRingGeometry, innerRingMaterial)
    innerRing.rotation.x = Math.PI / 2
    innerRing.position.set(0, 0.6, 0)
    this.group.add(innerRing)
  }

  /**
   * Add inner core to node
   */
  addInnerCore(mesh, nodeRadius, color) {
    try {
      const coreGeometry = new THREE.SphereGeometry(nodeRadius * 0.4, 16, 16)
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
      })
      const core = new THREE.Mesh(coreGeometry, coreMaterial)
      core.position.set(0, 0, 0)
      mesh.add(core)
    } catch (error) {
      // Skip core if fails
    }
  }

  /**
   * Add outer ring to node
   */
  addOuterRing(mesh, nodeRadius, color) {
    try {
      const ringGeometry = new THREE.TorusGeometry(nodeRadius * 1.1, 0.25, 8, 24)
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        depthTest: false,
        depthWrite: false
      })
      const ring = new THREE.Mesh(ringGeometry, ringMaterial)
      ring.rotation.x = Math.PI / 2
      ring.position.y = 0
      mesh.add(ring)
    } catch (error) {
      // Skip ring if fails
    }
  }

  /**
   * Add glow halo to node
   */
  addGlowHalo(mesh, nodeRadius, color) {
    try {
      const haloGeometry = new THREE.SphereGeometry(nodeRadius * 1.25, 24, 24)
      const haloMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15,
        depthTest: false,
        depthWrite: false
      })
      const halo = new THREE.Mesh(haloGeometry, haloMaterial)
      mesh.add(halo)
    } catch (error) {
      // Skip halo if fails
    }
  }

  /**
   * Create premium ribbon with enhanced design
   */
  createPremiumRibbon(sourcePos, targetPos, strength, nodeHeight) {
    const startPoint = new THREE.Vector3(sourcePos.x, nodeHeight, sourcePos.z)
    const endPoint = new THREE.Vector3(targetPos.x, nodeHeight, targetPos.z)

    // Midpoint calculation
    const midPoint = new THREE.Vector3(
      (sourcePos.x + targetPos.x) / 2,
      nodeHeight,
      (sourcePos.z + targetPos.z) / 2
    )

    // Control point with arc - pull toward center
    const pullFactor = 0.5
    const controlPoint = new THREE.Vector3(
      midPoint.x * (1 - pullFactor),
      nodeHeight + 12,
      midPoint.z * (1 - pullFactor)
    )

    // Create curve
    const curve = new THREE.QuadraticBezierCurve3(startPoint, controlPoint, endPoint)
    const points = curve.getPoints(this.options.ribbonSegments)

    // Create thick tube geometry for visibility
    const tubeGeometry = new THREE.TubeGeometry(curve, this.options.ribbonSegments, 0.3, 8, false)
    const tubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.6 * strength,
      side: THREE.DoubleSide
    })
    const tube = new THREE.Mesh(tubeGeometry, tubeMaterial)
    this.group.add(tube)
    this.ribbons.push(tube)

    // Add glow tube (larger, more transparent)
    const glowGeometry = new THREE.TubeGeometry(curve, this.options.ribbonSegments, 0.6, 8, false)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.25 * strength,
      side: THREE.DoubleSide
    })
    const glowTube = new THREE.Mesh(glowGeometry, glowMaterial)
    this.group.add(glowTube)
    this.ribbons.push(glowTube)

    // Add bright core for strong connections
    if (strength > 0.6) {
      const coreGeometry = new THREE.TubeGeometry(curve, this.options.ribbonSegments, 0.15, 8, false)
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8 * strength,
        side: THREE.DoubleSide
      })
      const coreTube = new THREE.Mesh(coreGeometry, coreMaterial)
      this.group.add(coreTube)
      this.ribbons.push(coreTube)
    }
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
   * Get node color based on file type
   */
  getNodeColor(type) {
    const colors = {
      'javascript': 0xFFD700,
      'typescript': 0x00BFFF,
      'python': 0x00FF7F,
      'rust': 0xFF4500,
      'go': 0x1E90FF,
      'java': 0xFF69B4,
      'cpp': 0x9370DB,
      'c': 0x20B2AA,
      'csharp': 0x32CD32,
      'ruby': 0xDC143C,
      'php': 0x696969,
      'swift': 0xFF8C00,
      'kotlin': 0x8A2BE2,
      'css': 0x00CED1,
      'scss': 0xFF1493,
      'html': 0xFF6347,
      'json': 0xFFD700,
      'markdown': 0x6495ED,
      'other': 0x00F3FF
    }
    return colors[type] || colors.other
  }

  /**
   * Highlight mesh
   */
  highlightMesh(mesh) {
    if (mesh && mesh.material) {
      mesh.material.color.setHex(0x00f3ff)
      mesh.material.opacity = 1
      mesh.scale.set(1.12, 1.12, 1.12)

      // Enhance all child effects
      mesh.children.forEach(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity = Math.min(child.material.opacity * 1.5, 0.8)
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
      mesh.material.opacity = 1
      mesh.scale.set(1, 1, 1)

      // Reset all children
      mesh.children.forEach(child => {
        if (child.material && child.material.transparent) {
          child.material.opacity *= 0.65
        }
      })
    }
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

      // Dispose mesh geometry and material
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) mesh.material.dispose()

      // Dispose children
      if (mesh.children) {
        mesh.children.forEach(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        })
      }
    })

    this.meshes.clear()
    this.ribbons = []
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
