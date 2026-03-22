import * as THREE from 'three'

/**
 * Building selector using raycasting
 */
export class BuildingSelector {
  constructor(scene, camera, domElement) {
    this.scene = scene
    this.camera = camera
    this.domElement = domElement

    this.raycaster = new THREE.Raycaster()
    this.raycaster.params.Points.threshold = 0.5
    this.mouse = new THREE.Vector2()

    this.selectedBuilding = null
    this.hoveredBuilding = null
    this.highlightMesh = null

    this.onBuildingClick = null
    this.onBuildingHover = null

    this.setupEvents()
    this.createHighlightMesh()
  }

  /**
   * Create highlight mesh for selected building
   */
  createHighlightMesh() {
    const geometry = new THREE.BoxGeometry(3, 1, 3)
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
   * Setup mouse events
   */
  setupEvents() {
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e))
    this.domElement.addEventListener('click', (e) => this.onClick(e))
  }

  /**
   * Handle mouse move for hover detection
   */
  onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera)

    // Get all building meshes (exclude highlight mesh, edge lines, and glow meshes)
    const meshes = []

    this.scene.traverse((object) => {
      if (object.isMesh &&
          object !== this.highlightMesh &&
          !object.isLine &&
          object.userData.file) {  // Only include meshes with file data
        meshes.push(object)
      }
    })

    // Check for intersections
    const intersects = this.raycaster.intersectObjects(meshes)

    if (intersects.length > 0) {
      const building = intersects[0].object

      if (this.hoveredBuilding !== building) {
        this.hoveredBuilding = building

        // Update cursor
        this.domElement.style.cursor = 'pointer'

        // Callback with file data
        if (this.onBuildingHover && building.userData.file) {
          this.onBuildingHover(building.userData.file)
        }
      }
    } else {
      if (this.hoveredBuilding) {
        this.hoveredBuilding = null
        this.domElement.style.cursor = 'default'

        if (this.onBuildingHover) {
          this.onBuildingHover(null)
        }
      }
    }
  }

  /**
   * Handle click for building selection
   */
  onClick(event) {
    if (this.hoveredBuilding && this.hoveredBuilding.userData.file) {
      this.selectBuilding(this.hoveredBuilding)

      if (this.onBuildingClick) {
        this.onBuildingClick(this.hoveredBuilding.userData.file)
      }
    } else {
      this.deselectBuilding()
    }
  }

  /**
   * Select a building
   */
  selectBuilding(building) {
    this.selectedBuilding = building

    // Update highlight mesh to match building position and size
    this.highlightMesh.position.copy(building.position)

    // Get height from userData or geometry
    const height = building.userData.height || 1

    // Scale highlight to match building
    this.highlightMesh.scale.set(1, height, 1)
    this.highlightMesh.visible = true

    // Add glow effect to selected building
    if (building.material && building.material.emissive) {
      building.material.emissive.setHex(0x00f3ff)
      building.material.emissiveIntensity = 0.4
    }
  }

  /**
   * Deselect current building
   */
  deselectBuilding() {
    if (this.selectedBuilding) {
      // Remove glow effect
      if (this.selectedBuilding.material && this.selectedBuilding.material.emissive) {
        this.selectedBuilding.material.emissive.setHex(0x000000)
        this.selectedBuilding.material.emissiveIntensity = 0
      }
    }

    this.selectedBuilding = null
    this.highlightMesh.visible = false
  }

  /**
   * Set click callback
   */
  setOnBuildingClick(callback) {
    this.onBuildingClick = callback
  }

  /**
   * Set hover callback
   */
  setOnBuildingHover(callback) {
    this.onBuildingHover = callback
  }

  /**
   * Dispose
   */
  dispose() {
    this.domElement.removeEventListener('mousemove', this.onMouseMove)
    this.domElement.removeEventListener('click', this.onClick)
    this.scene.remove(this.highlightMesh)
    this.highlightMesh.geometry.dispose()
    this.highlightMesh.material.dispose()
  }
}
