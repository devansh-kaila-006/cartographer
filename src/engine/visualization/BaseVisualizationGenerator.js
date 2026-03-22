import * as THREE from 'three'

/**
 * Abstract base class for all visualization generators
 * Provides common interface and utilities for different visualization types
 */
export class BaseVisualizationGenerator {
  constructor(scene) {
    this.scene = scene
    this.objects = new Map() // path -> mesh
  }

  /**
   * Generate visualization from file data
   * @abstract
   * @param {Array} files - Array of file objects with path, size, language
   */
  generate(files) {
    throw new Error('Must implement generate() method')
  }

  /**
   * Clear all visualization objects from scene
   */
  clear() {
    console.log('=== BaseVisualizationGenerator.clear ===')
    console.log('Objects to clear:', this.objects.size)
    console.log('Scene children before:', this.scene.children.length)

    // Only clear meshes that we own (in our objects map)
    this.objects.forEach((mesh, path) => {
      console.log('Removing mesh:', path)
      this.scene.remove(mesh)
      // Dispose geometry and material
      if (mesh.geometry) mesh.geometry.dispose()
      if (mesh.material) mesh.material.dispose()
      // Dispose children (edges, labels, etc.)
      mesh.children.forEach(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) child.material.dispose()
      })
    })
    this.objects.clear()

    console.log('Scene children after:', this.scene.children.length)
  }

  /**
   * Get mesh by file path
   * @param {string} path - File path
   * @returns {THREE.Mesh|null} The mesh or null if not found
   */
  getMeshByPath(path) {
    return this.objects.get(path) || null
  }

  /**
   * Get all meshes
   * @returns {Array<THREE.Mesh>} Array of all meshes
   */
  getAllMeshes() {
    return Array.from(this.objects.values())
  }

  /**
   * Get language color for file (vibrant, high-contrast colors)
   * @param {string} language - Programming language
   * @returns {number} Hex color value
   */
  getLanguageColor(language) {
    const colors = {
      javascript: 0xFFD700,     // Gold
      typescript: 0x00BFFF,     // Deep Sky Blue
      python: 0x00FF7F,         // Spring Green
      rust: 0xFF4500,           // Orange Red
      go: 0x1E90FF,             // Dodger Blue
      java: 0xFF69B4,           // Hot Pink
      cpp: 0x9370DB,            // Medium Purple
      c: 0x20B2AA,              // Light Sea Green
      ruby: 0xDC143C,           // Crimson
      php: 0x696969,            // Dim Gray
      swift: 0xFF8C00,          // Dark Orange
      kotlin: 0x8A2BE2,         // Blue Violet
      css: 0x00CED1,            // Dark Turquoise
      html: 0xFF6347,           // Tomato
      json: 0xFFC107,           // Amber
      markdown: 0x6495ED,       // Cornflower Blue
      jsx: 0x61DAFB,            // React Blue
      tsx: 0x3178C6,            // TypeScript Blue
      rs: 0xFF4500,             // Rust Orange
      default: 0x00F3FF         // Cyan
    }
    return colors[language] || colors.default
  }

  /**
   * Create edges for a mesh (for better definition)
   * @param {THREE.Mesh} mesh - The mesh to add edges to
   * @param {number} color - Edge color
   * @param {number} opacity - Edge opacity
   */
  addEdgesToMesh(mesh, color = 0xffffff, opacity = 0.4) {
    const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry)
    const edgesMaterial = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity
    })
    const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial)
    edges.position.copy(mesh.position)
    mesh.add(edges)
  }

  /**
   * Create highlight mesh for selection
   * @param {number} color - Highlight color
   * @returns {THREE.Mesh} Highlight mesh
   */
  createHighlightMesh(color = 0x00f3ff) {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.visible = false
    return mesh
  }
}
