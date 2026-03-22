import * as THREE from 'three'

/**
 * Camera zoom levels for Cartographer
 */
export const ZoomLevels = {
  OVERVIEW: { name: 'Overview', distance: 300, height: 300, fov: 40 },
  WIDE: { name: 'Wide', distance: 150, height: 150, fov: 35 },
  NORMAL: { name: 'Normal', distance: 80, height: 80, fov: 30 },
  DETAIL: { name: 'Detail', distance: 40, height: 40, fov: 25 }
}

/**
 * Visualization-specific camera settings
 */
export const VisualizationCameraSettings = {
  TREEMAP: { distance: 180, height: 120, fov: 35 },  // Increased view range
  SUNBURST: { distance: 100, height: 100, fov: 40 }, // Fixed, no auto-adjust
  ICICLE: { distance: 150, height: 80, fov: 35 },    // Current icicle view
  CHORD: { distance: 120, height: 100, fov: 40 }
}

/**
 * Camera controller with swoop transitions
 */
export class CameraController {
  constructor(camera, controls) {
    this.camera = camera
    this.controls = controls
    this.currentLevel = ZoomLevels.WIDE
    this.targetPosition = null
    this.isAnimating = false
    this.animationProgress = 0
    this.animationDuration = 1500 // ms
    this.startTime = null

    // Camera shake parameters
    this.shakeIntensity = 0
    this.shakeDecay = 0.9
  }

  /**
   * Animate camera to target position with easing
   */
  swoopTo(targetPosition, onComplete) {
    this.targetPosition = targetPosition
    this.startPosition = this.camera.position.clone()
    this.isAnimating = true
    this.animationProgress = 0
    this.startTime = performance.now()
    this.onComplete = onComplete

    // Disable controls during animation
    this.controls.enabled = false
  }

  /**
   * Swoop to a specific zoom level
   */
  swoopToLevel(levelName, focusPoint = new THREE.Vector3(0, 0, 0)) {
    const level = ZoomLevels[levelName.toUpperCase()]
    if (!level) {
      console.warn(`Unknown zoom level: ${levelName}`)
      return
    }

    this.currentLevel = level

    const targetPosition = new THREE.Vector3(
      focusPoint.x + level.distance,
      focusPoint.y + level.height,
      focusPoint.z + level.distance
    )

    this.swoopTo(targetPosition, () => {
      this.controls.target.copy(focusPoint)
      this.controls.enabled = true

      // Add micro-shake on arrival
      this.addShake(0.3)
    })
  }

  /**
   * Swoop to focus on a specific building
   */
  swoopToBuilding(buildingMesh) {
    const position = buildingMesh.position.clone()
    const level = ZoomLevels.DETAIL

    const targetPosition = new THREE.Vector3(
      position.x + level.distance,
      position.y + level.height,
      position.z + level.distance
    )

    this.swoopTo(targetPosition, () => {
      this.controls.target.copy(position)
      this.controls.enabled = true
      this.addShake(0.5)
    })
  }

  /**
   * Add camera shake effect
   */
  addShake(intensity = 0.5) {
    this.shakeIntensity = intensity
  }

  /**
   * Update animation frame
   */
  update(deltaTime) {
    // Handle swoop animation
    if (this.isAnimating) {
      const elapsed = performance.now() - this.startTime
      this.animationProgress = Math.min(elapsed / this.animationDuration, 1)

      // Easing function (ease-out cubic)
      const easeOut = 1 - Math.pow(1 - this.animationProgress, 3)

      // Interpolate position
      this.camera.position.lerpVectors(
        this.startPosition,
        this.targetPosition,
        easeOut
      )

      // Check if animation complete
      if (this.animationProgress >= 1) {
        this.isAnimating = false
        if (this.onComplete) {
          this.onComplete()
          this.onComplete = null
        }
      }
    }

    // Apply camera shake
    if (this.shakeIntensity > 0.01) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeIntensity
      this.camera.position.y += (Math.random() - 0.5) * this.shakeIntensity
      this.camera.position.z += (Math.random() - 0.5) * this.shakeIntensity
      this.shakeIntensity *= this.shakeDecay
    }
  }

  /**
   * Reset camera to default position
   */
  reset() {
    this.swoopToLevel('WIDE')
  }

  /**
   * Set camera position for visualization type
   * @param {string} vizType - Visualization type (TREEMAP, SUNBURST, ICICLE, CHORD)
   */
  setVisualizationView(vizType) {
    const settings = VisualizationCameraSettings[vizType.toUpperCase()]
    if (!settings) {
      console.warn(`Unknown visualization type: ${vizType}, using default`)
      this.reset()
      return
    }

    const targetPosition = new THREE.Vector3(
      settings.distance,
      settings.height,
      settings.distance
    )

    this.swoopTo(targetPosition, () => {
      this.controls.target.set(0, 0, 0)
      this.controls.enabled = true
    })
  }

  /**
   * Get current zoom level
   */
  getCurrentLevel() {
    return this.currentLevel
  }
}
