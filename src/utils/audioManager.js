/**
 * Audio Manager
 * Handles sound effects for user interactions
 */

class AudioManager {
  constructor() {
    this.audioContext = null
    this.enabled = false
    this.volume = 0.5
    this.initialized = false
  }

  // Initialize AudioContext (must be done after user interaction)
  init() {
    if (this.initialized) return

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.initialized = true
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  // Enable/disable sounds
  setEnabled(enabled) {
    this.enabled = enabled
    if (enabled && !this.initialized) {
      this.init()
    }
  }

  // Set volume (0-100)
  setVolume(volume) {
    this.volume = volume / 100
  }

  // Play a simple beep/click sound
  playClick() {
    if (!this.enabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.1
      )

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.1)
    } catch (error) {
      console.warn('Error playing click sound:', error)
    }
  }

  // Play hover sound (subtle)
  playHover() {
    if (!this.enabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = 600
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.05
      )

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.05)
    } catch (error) {
      console.warn('Error playing hover sound:', error)
    }
  }

  // Play success sound
  playSuccess() {
    if (!this.enabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1) // E5
      oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2) // G5
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.3
      )

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn('Error playing success sound:', error)
    }
  }

  // Play error sound
  playError() {
    if (!this.enabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime)
      oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime + 0.1)
      oscillator.type = 'sawtooth'

      gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.2
      )

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + 0.2)
    } catch (error) {
      console.warn('Error playing error sound:', error)
    }
  }
}

// Create singleton instance
const audioManager = new AudioManager()

export default audioManager
