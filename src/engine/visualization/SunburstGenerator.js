import * as THREE from 'three'
import { BaseVisualizationGenerator } from './BaseVisualizationGenerator.js'

/**
 * Stable Sunburst Visualization Generator
 * Simple, clean, and glitch-free radial sunburst
 */
export class SunburstGenerator extends BaseVisualizationGenerator {
  constructor(scene) {
    super(scene)
    this.allMeshes = new Set()
    this.config = {
      innerRadius: 5,
      ringWidth: 9,
      maxDepth: 4,
      minArcLength: 0.05
    }
  }

  /**
   * Generate sunburst visualization
   */
  generate(files) {
    this.clear()

    if (!files || files.length === 0) return

    console.log(`☀️ Sunburst: ${files.length} files`)

    try {
      const tree = this.buildTree(files)
      this.calculateSizes(tree)
      this.renderSunburst(tree)
      console.log(`✅ Created ${this.objects.size} file nodes`)
    } catch (error) {
      console.error('Error generating sunburst:', error)
      this.clear()
    }
  }

  /**
   * Build tree structure
   */
  buildTree(files) {
    const root = {
      name: 'root',
      path: '',
      type: 'folder',
      children: [],
      size: 0,
      depth: 0
    }

    files.forEach(file => {
      const parts = file.path.split('/')
      let currentNode = root

      parts.forEach((part, index) => {
        const isFile = index === parts.length - 1
        const path = parts.slice(0, index + 1).join('/')

        if (isFile) {
          currentNode.children.push({
            name: part,
            path: file.path,
            type: 'file',
            size: file.size || 1,
            language: file.language,
            file: file,
            depth: index + 1
          })
          currentNode.size += file.size || 1
        } else {
          let folder = currentNode.children.find(c => c.name === part && c.type === 'folder')
          if (!folder) {
            folder = {
              name: part,
              path: path,
              type: 'folder',
              children: [],
              size: 0,
              depth: index + 1
            }
            currentNode.children.push(folder)
          }
          currentNode = folder
        }
      })
    })

    return root
  }

  /**
   * Calculate sizes
   */
  calculateSizes(node) {
    if (node.type === 'file') {
      return node.size
    }

    if (node.children && node.children.length > 0) {
      node.size = node.children.reduce((sum, child) => sum + this.calculateSizes(child), 0)
    }

    return node.size
  }

  /**
   * Render sunburst
   */
  renderSunburst(tree) {
    this.renderCenterCircle()

    if (tree.children) {
      tree.children.sort((a, b) => (b.size || 0) - (a.size || 0))
    }

    this.renderLevel(tree, 0, 0, Math.PI * 2)
  }

  /**
   * Render center circle
   */
  renderCenterCircle() {
    // Main center circle
    const geometry = new THREE.CircleGeometry(this.config.innerRadius, 64)
    const material = new THREE.MeshBasicMaterial({
      color: 0x0a0e27,
      side: THREE.DoubleSide
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.rotation.x = -Math.PI / 2
    this.scene.add(mesh)
    this.allMeshes.add(mesh)

    // Glowing border ring
    const ringGeom = new THREE.RingGeometry(
      this.config.innerRadius - 0.4,
      this.config.innerRadius,
      64
    )
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    })
    const ring = new THREE.Mesh(ringGeom, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.05
    this.scene.add(ring)
    this.allMeshes.add(ring)
  }

  /**
   * Render level
   */
  renderLevel(node, depth, startAngle, endAngle) {
    if (depth > this.config.maxDepth) return

    const innerRadius = this.config.innerRadius + depth * this.config.ringWidth
    const outerRadius = innerRadius + this.config.ringWidth

    if (node.type === 'file') {
      this.renderArcSegment(
        node.path,
        node.name,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        node.language,
        depth,
        node.file,
        false
      )
    } else if (node.type === 'folder' && node.children && node.children.length > 0) {
      this.renderArcSegment(
        node.path,
        node.name,
        innerRadius,
        outerRadius,
        startAngle,
        endAngle,
        null,
        depth,
        null,
        true
      )

      let currentAngle = startAngle
      const totalSize = node.size || 1

      node.children.forEach(child => {
        const childSize = child.size || 1
        const angleRange = (endAngle - startAngle) * (childSize / totalSize)
        const childEndAngle = currentAngle + angleRange

        if (angleRange > this.config.minArcLength) {
          this.renderLevel(child, depth + 1, currentAngle, childEndAngle)
        }

        currentAngle = childEndAngle
      })
    }
  }

  /**
   * Render arc segment
   */
  renderArcSegment(
    path,
    name,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    language,
    depth,
    file,
    isFolder
  ) {
    // Validate inputs
    if (!isFinite(innerRadius) || !isFinite(outerRadius) ||
        innerRadius < 0 || outerRadius < 0 || innerRadius >= outerRadius) {
      return
    }

    const angleDiff = Math.abs(endAngle - startAngle)
    if (angleDiff < 0.01 || angleDiff > Math.PI * 2) {
      return
    }

    try {
      // Create shape
      const shape = new THREE.Shape()
      shape.absarc(0, 0, outerRadius, startAngle, endAngle, false)
      shape.absarc(0, 0, innerRadius, endAngle, startAngle, true)

      // Create geometry with appropriate segments
      const segments = Math.max(24, Math.min(48, Math.floor(angleDiff * 20)))
      const geometry = new THREE.ShapeGeometry(shape, segments)

      // Validate geometry
      geometry.computeBoundingSphere()
      if (!geometry.boundingSphere || isNaN(geometry.boundingSphere.radius)) {
        geometry.dispose()
        return
      }

      // Get color
      const color = isFolder
        ? this.getFolderColor(depth)
        : this.getLanguageColor(language)

      // Create material
      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: false,
        side: THREE.DoubleSide
      })

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation.x = -Math.PI / 2
      mesh.position.y = depth * 0.3

      // Store metadata
      mesh.userData = {
        file: file,
        path: path,
        type: isFolder ? 'folder' : 'file',
        name: name,
        depth: depth,
        originalColor: color
      }

      // Add white edges for files only
      if (!isFolder) {
        const edges = new THREE.EdgesGeometry(geometry)
        const edgeMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.4
        })
        const edgeLines = new THREE.LineSegments(edges, edgeMaterial)
        mesh.add(edgeLines)
      }

      this.scene.add(mesh)
      this.allMeshes.add(mesh)

      // Store only files for selection
      if (file && path) {
        this.objects.set(path, mesh)
      }

    } catch (error) {
      console.warn('Failed to create arc segment:', error)
    }
  }

  /**
   * Get folder color - stable palette
   */
  getFolderColor(depth) {
    const colors = [
      0x3498db, // Blue
      0x2ecc71, // Green
      0x9b59b6, // Purple
      0xe67e22, // Orange
      0x1abc9c  // Teal
    ]
    return colors[depth % colors.length]
  }

  /**
   * Clear all meshes
   */
  clear() {
    this.allMeshes.forEach(mesh => {
      this.scene.remove(mesh)

      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) mesh.material.dispose()

      // Dispose children
      mesh.children.forEach(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    })

    this.allMeshes.clear()
    this.objects.clear()
  }

  /**
   * Get all file meshes
   */
  getAllMeshes() {
    return Array.from(this.objects.values())
  }

  /**
   * Get bounding box
   */
  getBoundingBox() {
    const maxRadius = this.config.innerRadius + this.config.maxDepth * this.config.ringWidth
    return {
      min: { x: -maxRadius, z: -maxRadius },
      max: { x: maxRadius, z: maxRadius }
    }
  }

  /**
   * Update mesh visibility
   */
  updateMeshVisibility(visiblePaths) {
    this.objects.forEach((mesh, path) => {
      mesh.visible = visiblePaths.has(path)
    })
  }

  /**
   * Highlight mesh
   */
  highlightMesh(mesh) {
    if (mesh && mesh.material) {
      mesh.material.color.setHex(0x00f3ff)
      mesh.scale.set(1.08, 1.08, 1.08)
    }
  }

  /**
   * Reset mesh
   */
  resetMesh(mesh) {
    if (mesh && mesh.material && mesh.userData.originalColor) {
      mesh.material.color.setHex(mesh.userData.originalColor)
      mesh.scale.set(1, 1, 1)
    }
  }
}
