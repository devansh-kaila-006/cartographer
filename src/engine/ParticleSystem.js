import * as THREE from 'three'

/**
 * Particle system for ambient atmosphere
 */
export class ParticleSystem {
  constructor(scene, count = 500) {
    this.scene = scene
    this.count = count
    this.particles = null
    this.velocities = []

    this.init()
  }

  init() {
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(this.count * 3)
    const colors = new Float32Array(this.count * 3)

    // Create particles scattered across the grid
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3

      // Position
      positions[i3] = (Math.random() - 0.5) * 400 // X
      positions[i3 + 1] = Math.random() * 50       // Y (height)
      positions[i3 + 2] = (Math.random() - 0.5) * 400 // Z

      // Color (cyan to violet gradient)
      const mixRatio = Math.random()
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0x00f3ff),
        new THREE.Color(0xbd00ff),
        mixRatio
      )
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b

      // Store velocity for animation
      this.velocities.push({
        y: Math.random() * 0.02 + 0.01,
        x: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01
      })
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({
      size: 1.2,  // Increased size for better visibility during zoom
      vertexColors: true,
      transparent: true,
      opacity: 0.8,  // Increased opacity
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  update() {
    if (!this.particles) return

    const positions = this.particles.geometry.attributes.position.array

    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3

      // Update position
      positions[i3] += this.velocities[i].x
      positions[i3 + 1] += this.velocities[i].y
      positions[i3 + 2] += this.velocities[i].z

      // Reset particles that go too high
      if (positions[i3 + 1] > 50) {
        positions[i3 + 1] = 0
        positions[i3] = (Math.random() - 0.5) * 400
        positions[i3 + 2] = (Math.random() - 0.5) * 400
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true
  }

  dispose() {
    if (this.particles) {
      this.scene.remove(this.particles)
      this.particles.geometry.dispose()
      this.particles.material.dispose()
    }
  }
}
