import * as THREE from 'three'

/**
 * Atmosphere - Cinematic volumetric fog and lighting effects
 */
export class Atmosphere {
  constructor(scene) {
    this.scene = scene
    this.fogDensity = 0.002
    this.fogColor = new THREE.Color(0x0a0f1c)
    this.lights = []

    this.init()
  }

  init() {
    // Main fog
    this.scene.fog = new THREE.FogExp2(this.fogColor, this.fogDensity)

    // Volumetric light shafts removed (towers)

    // Ambient glow particles removed (stars removed)
    // this.createGlowParticles()

    // Add dynamic point lights
    this.createDynamicLights()
  }

  /**
   * Create ambient glow particles
   */
  createGlowParticles() {
    const particleCount = 200
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // Position
      positions[i3] = (Math.random() - 0.5) * 200
      positions[i3 + 1] = Math.random() * 30
      positions[i3 + 2] = (Math.random() - 0.5) * 200

      // Color (cyan to violet)
      const mixRatio = Math.random()
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0x00f3ff),
        new THREE.Color(0xbd00ff),
        mixRatio
      )
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      // Size
      sizes[i] = Math.random() * 2 + 1
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

    const material = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    this.glowParticles = new THREE.Points(geometry, material)
    this.scene.add(this.glowParticles)
  }

  /**
   * Create dynamic point lights for atmosphere
   */
  createDynamicLights() {
    const lightConfigs = [
      { color: 0x00f3ff, intensity: 0.3, distance: 80, position: [30, 20, 30] },
      { color: 0xbd00ff, intensity: 0.3, distance: 80, position: [-30, 20, -30] },
      { color: 0x00ff88, intensity: 0.2, distance: 60, position: [0, 15, 40] },
      { color: 0xff0066, intensity: 0.2, distance: 60, position: [-40, 10, 0] }
    ]

    lightConfigs.forEach(config => {
      const light = new THREE.PointLight(
        config.color,
        config.intensity,
        config.distance
      )
      light.position.set(...config.position)
      this.scene.add(light)
      this.lights.push(light)
    })
  }

  /**
   * Update atmospheric effects
   */
  update(time) {
    // Glow particles disabled (stars removed)
  }

  /**
   * Set fog density
   */
  setFogDensity(density) {
    this.fogDensity = Math.max(0.0005, Math.min(0.01, density))
    if (this.scene.fog) {
      this.scene.fog.density = this.fogDensity
    }
  }

  /**
   * Set fog color
   */
  setFogColor(color) {
    this.fogColor = new THREE.Color(color)
    if (this.scene.fog) {
      this.scene.fog.color = this.fogColor
    }
  }

  /**
   * Create lightning effect
   */
  triggerLightning() {
    const flash = new THREE.PointLight(0xffffff, 2, 200)
    flash.position.set(
      (Math.random() - 0.5) * 100,
      50,
      (Math.random() - 0.5) * 100
    )
    this.scene.add(flash)

    // Fade out
    let intensity = 2
    const fadeOut = () => {
      intensity *= 0.8
      flash.intensity = intensity

      if (intensity > 0.01) {
        requestAnimationFrame(fadeOut)
      } else {
        this.scene.remove(flash)
      }
    }

    fadeOut()
  }

  /**
   * Dispose
   */
  dispose() {
    // Glow particles disabled (stars removed)

    this.lights.forEach(light => {
      this.scene.remove(light)
    })

    this.lights = []
  }
}
