import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CameraController } from './CameraController.js'
import { BuildingSelector } from './BuildingSelector.js'
import { ParticleSystem } from './ParticleSystem.js'

export class SceneManager {
  constructor(container) {
    this.container = container
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null
    this.gridHelper = null
    this.cameraController = null
    this.buildingSelector = null
    this.particleSystem = null

    this.init()
  }

  init() {
    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0f1c)

    // Add subtle fog for depth
    this.scene.fog = new THREE.Fog(0x0a0f1c, 100, 500)

    // Camera (Isometric) - larger frustum for full screen visibility
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 200  // Increased from 100 for wider view
    this.camera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      2000  // Increased far plane for better depth
    )
    this.camera.position.set(100, 100, 100)  // Further back for better view
    this.camera.lookAt(0, 0, 0)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.container.appendChild(this.renderer.domElement)

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.enableRotate = true  // Enable rotation for canvas movement
    this.controls.enableZoom = true
    this.controls.enablePan = true
    this.controls.maxPolarAngle = Math.PI / 1.8  // Allow more vertical movement
    this.controls.minPolarAngle = Math.PI / 6    // Prevent going below ground
    this.controls.minZoom = 0.2                  // Allow more zoom out
    this.controls.maxZoom = 5                    // Allow more zoom in
    this.controls.zoomSpeed = 1.2
    this.controls.rotateSpeed = 0.8  // Slower rotation for better control
    this.controls.panSpeed = 1.0
    this.controls.maxDistance = 500  // Allow camera to move further away
    this.controls.minDistance = 20   // Prevent camera from getting too close

    // Camera Controller
    this.cameraController = new CameraController(this.camera, this.controls)

    // Building Selector
    this.buildingSelector = new BuildingSelector(
      this.scene,
      this.camera,
      this.renderer.domElement
    )

    // Particle System disabled (stars removed)
    // this.particleSystem = new ParticleSystem(this.scene, 1000)
    this.particleSystem = null

    // Grid removed - visualizations don't need it
    // this.setupGrid()


    // Lighting (for potential future mesh materials)
    this.setupLighting()

    // Resize handler
    window.addEventListener('resize', () => this.onResize())

    // Start animation loop
    this.animate()
  }

  setupGrid() {
    // Main grid - larger area
    this.gridHelper = new THREE.GridHelper(500, 125, 0x00f3ff, 0x1a2332)
    this.scene.add(this.gridHelper)

    // Add secondary grid for depth
    const secondaryGrid = new THREE.GridHelper(500, 25, 0x1a2332, 0x0f1520)
    secondaryGrid.position.y = -0.01
    this.scene.add(secondaryGrid)
  }

  setupLighting() {
    // Ambient light - increased for better visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    this.scene.add(ambientLight)

    // Directional light - increased intensity
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = true
    this.scene.add(directionalLight)

    // Point lights for neon glow effect - increased intensity
    const cyanLight = new THREE.PointLight(0x00f3ff, 1.0, 200)
    cyanLight.position.set(25, 20, 25)
    this.scene.add(cyanLight)

    const violetLight = new THREE.PointLight(0xbd00ff, 1.0, 200)
    violetLight.position.set(-25, 20, -25)
    this.scene.add(violetLight)

    console.log('Lighting setup complete')
  }

  onResize() {
    const aspect = window.innerWidth / window.innerHeight
    const frustumSize = 200  // Match the updated frustum size
    this.camera.left = frustumSize * aspect / -2
    this.camera.right = frustumSize * aspect / 2
    this.camera.top = frustumSize / 2
    this.camera.bottom = frustumSize / -2
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  animate() {
    requestAnimationFrame(() => this.animate())
    this.controls.update()
    this.cameraController.update(16) // ~60fps
    if (this.particleSystem) {
      this.particleSystem.update()
    }
    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    window.removeEventListener('resize', this.onResize)
    this.buildingSelector.dispose()
    if (this.particleSystem) {
      this.particleSystem.dispose()
    }
    this.renderer.dispose()
  }
}
