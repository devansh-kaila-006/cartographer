import * as THREE from 'three'

/**
 * Central manager for switching between visualization types
 * Handles registration, switching, and cleanup of visualizations
 */
export class VisualizationManager {
  constructor(scene, cameraController = null) {
    this.scene = scene
    this.cameraController = cameraController
    this.generators = new Map()
    this.currentType = null
    this.highlightMesh = null
    this.createHighlightMesh()
  }

  /**
   * Register a visualization generator
   * @param {string} type - Visualization type identifier
   * @param {BaseVisualizationGenerator} generator - Generator instance
   */
  register(type, generator) {
    this.generators.set(type, generator)
  }

  /**
   * Switch to a different visualization type
   * @param {string} type - Visualization type to switch to
   * @param {Array} files - File data to visualize
   */
  switchTo(type, files) {
    console.log(`Switching from ${this.currentType} to ${type}`)

    // Validate type exists
    if (!this.generators.has(type)) {
      console.error(`Unknown visualization type: ${type}`)
      return
    }

    // Clear current visualization
    if (this.currentType) {
      const currentGenerator = this.generators.get(this.currentType)
      currentGenerator.clear()
    }

    // Generate new visualization
    this.currentType = type
    const generator = this.generators.get(type)
    generator.generate(files)

    // Reset and center camera for this visualization
    if (this.cameraController) {
      this.cameraController.setVisualizationView(type)
    }

    console.log(`Switched to ${type} visualization`)
  }

  /**
   * Get current visualization type
   * @returns {string|null} Current type or null
   */
  getCurrentType() {
    return this.currentType
  }

  /**
   * Get current generator instance
   * @returns {BaseVisualizationGenerator|null} Current generator or null
   */
  getCurrentGenerator() {
    if (!this.currentType) return null
    return this.generators.get(this.currentType)
  }

  /**
   * Get mesh by file path from current visualization
   * @param {string} path - File path
   * @returns {THREE.Mesh|null} Mesh or null
   */
  getMeshByPath(path) {
    const generator = this.getCurrentGenerator()
    if (!generator) return null
    return generator.getMeshByPath(path)
  }

  /**
   * Get all meshes from current visualization
   * @returns {Array<THREE.Mesh>} Array of meshes
   */
  getAllMeshes() {
    const generator = this.getCurrentGenerator()
    if (!generator) return []
    return generator.getAllMeshes()
  }

  /**
   * Create highlight mesh for selection
   */
  createHighlightMesh() {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    })
    this.highlightMesh = new THREE.Mesh(geometry, material)
    this.highlightMesh.visible = false
    this.scene.add(this.highlightMesh)
  }

  /**
   * Highlight a mesh (e.g., for selection)
   * @param {THREE.Mesh} mesh - Mesh to highlight
   */
  highlightMesh(mesh) {
    const generator = this.getCurrentGenerator()
    if (generator && typeof generator.highlightMesh === 'function') {
      generator.highlightMesh(mesh)
    }

    if (!mesh) {
      this.highlightMesh.visible = false
      return
    }

    this.highlightMesh.position.copy(mesh.position)
    this.highlightMesh.scale.copy(mesh.scale)
    this.highlightMesh.visible = true
  }

  /**
   * Reset highlighted mesh to original state
   * @param {THREE.Mesh} mesh - Mesh to reset
   */
  resetHighlight(mesh) {
    const generator = this.getCurrentGenerator()
    if (generator && typeof generator.resetMesh === 'function') {
      generator.resetMesh(mesh)
    }
  }

  /**
   * Update mesh visibility based on file paths
   * @param {Set<string>} visiblePaths - Set of file paths that should be visible
   */
  updateMeshVisibility(visiblePaths) {
    const generator = this.getCurrentGenerator()
    if (!generator || typeof generator.updateMeshVisibility !== 'function') {
      console.warn('Current generator does not support updateMeshVisibility')
      return
    }
    generator.updateMeshVisibility(visiblePaths)
  }

  /**
   * Clear highlight
   */
  clearHighlight() {
    this.highlightMesh.visible = false
  }

  /**
   * Clear all visualizations
   */
  clear() {
    this.generators.forEach(generator => {
      generator.clear()
    })
    this.currentType = null
  }

  /**
   * Dispose of all resources
   */
  dispose() {
    this.clear()
    if (this.highlightMesh) {
      this.scene.remove(this.highlightMesh)
      this.highlightMesh.geometry.dispose()
      this.highlightMesh.material.dispose()
    }
  }
}
