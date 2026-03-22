/**
 * AudioManager - Sound design and haptic feedback for Cartographer
 */

export class AudioManager {
  constructor() {
    this.context = null
    this.masterGain = null
    this.sounds = new Map()
    this.enabled = true
    this.volume = 0.3

    this.soundPresets = {
      // UI Sounds
      click: { frequency: 800, duration: 0.05, type: 'sine' },
      hover: { frequency: 600, duration: 0.03, type: 'sine' },
      swoosh: { frequency: 200, duration: 0.3, type: 'triangle', slide: true },
      success: { frequency: 523, duration: 0.15, type: 'sine', chord: true },
      error: { frequency: 150, duration: 0.2, type: 'sawtooth' },

      // Timeline Sounds
      timelineScrub: { frequency: 400, duration: 0.05, type: 'sine' },
      timelineTick: { frequency: 1000, duration: 0.02, type: 'sine' },

      // Building Sounds
      buildingRise: { frequency: 100, duration: 0.4, type: 'triangle', slide: true, slideTo: 400 },
      buildingFall: { frequency: 400, duration: 0.3, type: 'triangle', slide: true, slideTo: 100 },

      // Ambient
      ambient: { frequency: 80, duration: 2, type: 'sine', loop: true }
    }
  }

  /**
   * Initialize audio context
   */
  async init() {
    if (this.context) return

    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)()
      this.masterGain = this.context.createGain()
      this.masterGain.gain.value = this.volume
      this.masterGain.connect(this.context.destination)
    } catch (error) {
      console.warn('Audio not supported:', error)
      this.enabled = false
    }
  }

  /**
   * Play a sound by name
   */
  async play(soundName) {
    if (!this.enabled || !this.context) return

    // Resume context if suspended (required for user gesture)
    if (this.context.state === 'suspended') {
      await this.context.resume()
    }

    const preset = this.soundPresets[soundName]
    if (!preset) {
      return
    }

    this.playTone(preset)

    // Haptic feedback
    this.vibrate(this.getVibrationPattern(soundName))
  }

  /**
   * Play a tone with given parameters
   */
  playTone({ frequency, duration, type, slide, slideTo, chord }) {
    if (!this.context || !this.masterGain) return

    const oscillator = this.context.createOscillator()
    const gainNode = this.context.createGain()

    oscillator.type = type
    oscillator.frequency.value = frequency

    gainNode.gain.setValueAtTime(0.1, this.context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.001,
      this.context.currentTime + duration
    )

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start(this.context.currentTime)
    oscillator.stop(this.context.currentTime + duration)

    // Pitch slide effect
    if (slide && slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(
        slideTo,
        this.context.currentTime + duration
      )
    }

    // Chord effect (add harmonics)
    if (chord) {
      setTimeout(() => {
        this.playTone({ frequency: frequency * 1.25, duration: duration * 0.8, type })
        this.playTone({ frequency: frequency * 1.5, duration: duration * 0.6, type })
      }, 50)
    }
  }

  /**
   * Get vibration pattern for haptic feedback
   */
  getVibrationPattern(soundName) {
    const patterns = {
      click: [10],
      hover: [5],
      swoosh: [10, 20, 10],
      success: [10, 30, 10, 30],
      error: [50, 50, 50],
      timelineScrub: [5],
      timelineTick: [10],
      buildingRise: [10, 20, 30],
      buildingFall: [30, 20, 10]
    }

    return patterns[soundName] || []
  }

  /**
   * Vibrate device
   */
  vibrate(pattern) {
    if ('vibrate' in navigator && pattern.length > 0) {
      navigator.vibrate(pattern)
    }
  }

  /**
   * Set master volume
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value))
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume
    }
  }

  /**
   * Toggle audio
   */
  toggle() {
    this.enabled = !this.enabled
    return this.enabled
  }

  /**
   * Mute/unmute
   */
  mute() {
    this.enabled = false
    if (this.masterGain) {
      this.masterGain.gain.value = 0
    }
  }

  unmute() {
    this.enabled = true
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume
    }
  }

  /**
   * Play ambient background sound
   */
  async playAmbient() {
    if (!this.enabled || !this.context) return

    // Create low drone for atmosphere
    const oscillator = this.context.createOscillator()
    const gainNode = this.context.createGain()
    const filter = this.context.createBiquadFilter()

    oscillator.type = 'sine'
    oscillator.frequency.value = 60

    filter.type = 'lowpass'
    filter.frequency.value = 200
    filter.Q.value = 1

    gainNode.gain.value = 0.02

    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start()

    this.ambientOscillator = oscillator
    this.ambientGain = gainNode
  }

  /**
   * Stop ambient sound
   */
  stopAmbient() {
    if (this.ambientOscillator) {
      this.ambientOscillator.stop()
      this.ambientOscillator = null
    }
  }

  /**
   * Dispose
   */
  dispose() {
    this.stopAmbient()

    if (this.context) {
      this.context.close()
      this.context = null
    }

    this.sounds.clear()
  }
}

// Singleton instance
export const audioManager = new AudioManager()
