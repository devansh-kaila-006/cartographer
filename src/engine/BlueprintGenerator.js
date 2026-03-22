import * as THREE from 'three'

/**
 * BlueprintGenerator - Creates wireframe visualizations of code structure
 */
export class BlueprintGenerator {
  constructor(scene) {
    this.scene = scene
    this.blueprintGroups = new Map()
  }

  /**
   * Generate blueprint visualization for a parsed file
   */
  generateBlueprint(fileData, buildingPosition) {
    const groupId = `${fileData.filename}-blueprint`

    // Remove existing blueprint if any
    this.removeBlueprint(groupId)

    // Create group for this file's blueprint
    const group = new THREE.Group()
    group.position.copy(buildingPosition)

    const { functions, classes, imports, exports } = fileData

    // Visualize functions as vertical nodes
    functions.forEach((func, index) => {
      const node = this.createFunctionNode(func, index, functions.length)
      group.add(node)
    })

    // Visualize classes as larger structures
    classes.forEach((cls, index) => {
      const structure = this.createClassStructure(cls, index, classes.length)
      group.add(structure)
    })

    // Visualize imports as incoming connections
    if (imports.length > 0) {
      const importVisualization = this.createImportVisualization(imports)
      importVisualization.position.set(-5, 0, 0)
      group.add(importVisualization)
    }

    // Visualize exports as outgoing connections
    if (exports.length > 0) {
      const exportVisualization = this.createExportVisualization(exports)
      exportVisualization.position.set(5, 0, 0)
      group.add(exportVisualization)
    }

    // Add container wireframe
    const container = this.createContainer(functions.length + classes.length)
    group.add(container)

    this.scene.add(group)
    this.blueprintGroups.set(groupId, group)

    return group
  }

  /**
   * Create a function node visualization
   */
  createFunctionNode(func, index, total) {
    const group = new THREE.Group()

    // Height based on complexity
    const height = Math.max(1, func.complexity * 0.5)
    const y = (index - total / 2) * 2

    // Create node geometry
    const geometry = new THREE.BoxGeometry(0.8, height, 0.8)
    const material = new THREE.MeshBasicMaterial({
      color: 0x00f3ff,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.set(0, y, 0)
    group.add(mesh)

    // Add complexity indicator (inner glow)
    if (func.complexity > 1) {
      const glowGeometry = new THREE.BoxGeometry(0.4, height * 0.8, 0.4)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0066,
        transparent: true,
        opacity: 0.6
      })

      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      glow.position.set(0, y, 0)
      group.add(glow)
    }

    return group
  }

  /**
   * Create a class structure visualization
   */
  createClassStructure(cls, index, total) {
    const group = new THREE.Group()
    const y = (index - total / 2) * 4

    // Class container
    const containerGeometry = new THREE.BoxGeometry(3, 2, 3)
    const containerMaterial = new THREE.MeshBasicMaterial({
      color: 0xbd00ff,
      transparent: true,
      opacity: 0.3,
      wireframe: true
    })

    const container = new THREE.Mesh(containerGeometry, containerMaterial)
    container.position.set(0, y, 0)
    group.add(container)

    // Method nodes
    cls.methods.forEach((method, methodIndex) => {
      const methodGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5)
      const methodMaterial = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        transparent: true,
        opacity: 0.5
      })

      const methodNode = new THREE.Mesh(methodGeometry, methodMaterial)
      const angle = (methodIndex / cls.methods.length) * Math.PI * 2
      const radius = 1
      methodNode.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      )
      group.add(methodNode)
    })

    return group
  }

  /**
   * Create import visualization
   */
  createImportVisualization(imports) {
    const group = new THREE.Group()

    imports.forEach((imp, index) => {
      const geometry = new THREE.SphereGeometry(0.3, 8, 8)
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.6
      })

      const sphere = new THREE.Mesh(geometry, material)
      sphere.position.set(0, index * 0.5, 0)
      group.add(sphere)

      // Add line pointing inward
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-1, index * 0.5, 0),
        new THREE.Vector3(0, index * 0.5, 0)
      ])

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0.3
      })

      const line = new THREE.Line(lineGeometry, lineMaterial)
      group.add(line)
    })

    return group
  }

  /**
   * Create export visualization
   */
  createExportVisualization(exports) {
    const group = new THREE.Group()

    exports.forEach((exp, index) => {
      const geometry = new THREE.OctahedronGeometry(0.3)
      const material = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.6
      })

      const octahedron = new THREE.Mesh(geometry, material)
      octahedron.position.set(0, index * 0.5, 0)
      group.add(octahedron)

      // Add line pointing outward
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, index * 0.5, 0),
        new THREE.Vector3(1, index * 0.5, 0)
      ])

      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.3
      })

      const line = new THREE.Line(lineGeometry, lineMaterial)
      group.add(line)
    })

    return group
  }

  /**
   * Create container wireframe
   */
  createContainer(itemCount) {
    const height = Math.max(2, itemCount * 0.8)
    const geometry = new THREE.BoxGeometry(6, height, 6)
    const material = new THREE.MeshBasicMaterial({
      color: 0x1a2332,
      transparent: true,
      opacity: 0.2,
      wireframe: true
    })

    const mesh = new THREE.Mesh(geometry, material)
    return mesh
  }

  /**
   * Remove a blueprint visualization
   */
  removeBlueprint(groupId) {
    const group = this.blueprintGroups.get(groupId)
    if (group) {
      this.scene.remove(group)

      // Dispose all geometries and materials
      group.traverse((object) => {
        if (object.geometry) {
          object.geometry.dispose()
        }
        if (object.material) {
          object.material.dispose()
        }
      })

      this.blueprintGroups.delete(groupId)
    }
  }

  /**
   * Clear all blueprints
   */
  clearAll() {
    this.blueprintGroups.forEach((group, groupId) => {
      this.removeBlueprint(groupId)
    })
  }

  /**
   * Toggle blueprint visibility
   */
  toggleVisibility(groupId, visible) {
    const group = this.blueprintGroups.get(groupId)
    if (group) {
      group.visible = visible
    }
  }
}
