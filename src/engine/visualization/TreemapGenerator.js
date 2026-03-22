import * as THREE from 'three'
import { BaseVisualizationGenerator } from './BaseVisualizationGenerator.js'

/**
 * Treemap Visualization Generator
 * Creates rectangular treemap showing directory structure
 * Folders as rectangles subdivided into files
 */
export class TreemapGenerator extends BaseVisualizationGenerator {
  constructor(scene) {
    super(scene)
    this.config = {
      padding: 2.5,  // Increased from 0.5 for more spacing between layers
      minSize: 1,
      maxHeight: 20,
      blockPadding: 1.5  // Added spacing between blocks in same layer
    }
  }

  /**
   * Generate treemap visualization from file data
   * @param {Array} files - Array of file objects with path, size, language
   */
  generate(files) {
    // Clear existing
    this.clear()

    if (!files || files.length === 0) return

    console.log(`🗂️ Treemap: ${files.length} files`)

    // Build hierarchical tree structure
    const tree = this.buildTree(files)

    // Calculate layout
    const layout = this.calculateTreemapLayout(tree, 120, 120)  // Increased from 100

    // Render rectangles
    this.renderLayout(layout)

    console.log(`✅ Created ${this.objects.size} nodes`)
  }

  /**
   * Build tree structure from files
   * @param {Array} files - File array
   * @returns {Object} Tree structure
   */
  buildTree(files) {
    const root = {
      name: 'root',
      path: '',
      type: 'folder',
      children: [],
      size: 0
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
            file: file
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
              size: 0
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
   * Calculate treemap layout using squarified algorithm
   * @param {Object} tree - Tree structure
   * @param {number} width - Total width
   * @param {number} height - Total height
   * @returns {Array} Layout nodes with positions
   */
  calculateTreemapLayout(tree, width, height) {
    const layouts = []

    const layoutNode = (node, x, y, w, h, depth = 0) => {
      const layout = {
        name: node.name,
        path: node.path,
        type: node.type,
        x, y, width: w, height: h,
        depth,
        language: node.language,
        file: node.file
      }
      layouts.push(layout)

      if (node.type === 'folder' && node.children && node.children.length > 0) {
        // Sort children by size (descending)
        const sortedChildren = [...node.children].sort((a, b) => (b.size || 0) - (a.size || 0))

        // Apply enhanced padding for better separation
        const padding = this.config.padding * (depth + 1) * 1.5
        const innerX = x + padding
        const innerY = y + padding
        const innerW = Math.max(this.config.minSize, w - padding * 2)
        const innerH = Math.max(this.config.minSize, h - padding * 2)

        // Squarified treemap layout with block padding
        this.squarify(sortedChildren, innerX, innerY, innerW, innerH, depth + 1, layouts)
      }
    }

    layoutNode(tree, -width / 2, -height / 2, width, height, 0)
    return layouts
  }

  /**
   * Squarified treemap algorithm
   * @param {Array} children - Child nodes
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} w - Width
   * @param {number} h - Height
   * @param {number} depth - Depth level
   * @param {Array} layouts - Layout array to populate
   */
  squarify(children, x, y, w, h, depth, layouts) {
    if (children.length === 0) return

    const totalSize = children.reduce((sum, child) => sum + (child.size || 1), 0)

    // Determine split direction based on aspect ratio
    const splitVertical = w > h

    let currentPos = 0
    let remainingSize = totalSize
    const blockGap = this.config.blockPadding  // Gap between blocks in same layer

    children.forEach((child, index) => {
      const childSize = child.size || 1
      const ratio = childSize / remainingSize

      if (splitVertical) {
        // Split vertically (create columns)
        const childW = (w * ratio) - blockGap  // Subtract gap
        const childH = h - blockGap  // Subtract gap

        layouts.push({
          name: child.name,
          path: child.path,
          type: child.type,
          x: x + currentPos,
          y: y,
          width: Math.max(this.config.minSize, childW),
          height: Math.max(this.config.minSize, childH),
          depth,
          language: child.language,
          file: child.file
        })

        // Recursively layout folder children
        if (child.type === 'folder' && child.children) {
          const padding = this.config.padding
          this.squarify(
            child.children,
            x + currentPos + padding,
            y + padding,
            Math.max(this.config.minSize, childW - padding * 2),
            Math.max(this.config.minSize, childH - padding * 2),
            depth + 1,
            layouts
          )
        }

        currentPos += (w * ratio)
      } else {
        // Split horizontally (create rows)
        const childW = w - blockGap  // Subtract gap
        const childH = (h * ratio) - blockGap  // Subtract gap

        layouts.push({
          name: child.name,
          path: child.path,
          type: child.type,
          x: x,
          y: y + currentPos,
          width: Math.max(this.config.minSize, childW),
          height: Math.max(this.config.minSize, childH),
          depth,
          language: child.language,
          file: child.file
        })

        // Recursively layout folder children
        if (child.type === 'folder' && child.children) {
          const padding = this.config.padding
          this.squarify(
            child.children,
            x + padding,
            y + currentPos + padding,
            Math.max(this.config.minSize, childW - padding * 2),
            Math.max(this.config.minSize, childH - padding * 2),
            depth + 1,
            layouts
          )
        }

        currentPos += (h * ratio)
      }

      remainingSize -= childSize
    })
  }

  /**
   * Render layout as 3D meshes
   * @param {Array} layouts - Layout nodes
   */
  renderLayout(layouts) {
    let fileCount = 0

    layouts.forEach(layout => {
      // Skip root node
      if (layout.depth === 0) return

      // Only render files, not folders
      if (layout.type !== 'file') {
        return
      }

      if (!layout.file) {
        return
      }

      fileCount++

      // Make blocks significantly smaller for better spacing
      const sizeReduction = 0.6  // Reduce to 60% of original size
      const width = Math.max(2, Math.min(layout.width, 30) * sizeReduction)
      const depth = Math.max(2, Math.min(layout.height, 30) * sizeReduction)
      const boxHeight = Math.max(1.5, Math.sqrt(layout.file.size || 1) * 1.2)  // Reduced height

      if (!isFinite(width) || !isFinite(depth) || !isFinite(boxHeight)) {
        console.warn('Invalid dimensions:', layout)
        return
      }

      // Use BoxGeometry with reduced size
      const geometry = new THREE.BoxGeometry(width, boxHeight, depth)

      // Enhanced vibrant colors
      const color = this.getLanguageColor(layout.language)

      const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: false,
        opacity: 1.0,
        side: THREE.DoubleSide
      })

      const mesh = new THREE.Mesh(geometry, material)

      // Position on the ground plane with height
      mesh.position.set(
        layout.x + layout.width / 2,
        boxHeight / 2,  // Sit on ground
        layout.y + layout.height / 2
      )

      mesh.visible = true

      // Add glowing edges for better visibility
      this.addEdgesToMesh(mesh, color, 0.5)

      // Store metadata with file object
      mesh.userData = {
        file: layout.file,
        path: layout.path,
        type: layout.type,
        name: layout.name,
        size: layout.file.size,
        language: layout.language,
        originalColor: color
      }

      this.scene.add(mesh)

      // Store in objects map for selection
      this.objects.set(layout.path, mesh)
    })

    console.log(`🗂️ Treemap: ${fileCount} files rendered`)
  }

  /**
   * Get bounding box of the treemap
   * @returns {Object} Bounding box
   */
  getBoundingBox() {
    return { min: { x: -50, z: -50 }, max: { x: 50, z: 50 } }
  }

  /**
   * Update mesh visibility based on file paths
   */
  updateMeshVisibility(visiblePaths) {
    this.objects.forEach((mesh, path) => {
      mesh.visible = visiblePaths.has(path)
    })
  }

  /**
   * Add edges to mesh for better visibility
   */
  addEdgesToMesh(mesh, color, opacity = 0.5) {
    const edges = new THREE.EdgesGeometry(mesh.geometry)
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: opacity
    })
    const line = new THREE.LineSegments(edges, lineMaterial)
    mesh.add(line)
  }

  /**
   * Highlight mesh
   */
  highlightMesh(mesh) {
    if (mesh && mesh.material) {
      mesh.material.color.setHex(0x00f3ff)
      mesh.scale.set(1.1, 1.1, 1.1)
    }
  }

  /**
   * Reset mesh to original state
   */
  resetMesh(mesh) {
    if (mesh && mesh.material && mesh.userData.originalColor) {
      mesh.material.color.setHex(mesh.userData.originalColor)
      mesh.scale.set(1, 1, 1)
    }
  }
}
