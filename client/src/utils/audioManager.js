// Audio Manager using Web Audio API for synchronized playback
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.audioBuffers = new Map();
    this.sources = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Create AudioContext (handle different browser prefixes)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Resume context if suspended (some browsers require user interaction)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.initialized = true;
      console.log('AudioManager initialized');
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
    }
  }

  async preloadAudio(name, url) {
    if (!this.initialized) await this.init();
    
    try {
      // Check if already loaded
      if (this.audioBuffers.has(name)) {
        console.log(`Audio ${name} already preloaded`);
        return;
      }

      console.log(`Preloading audio: ${name}`);
      
      // Fetch audio file
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio data
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Store decoded buffer
      this.audioBuffers.set(name, audioBuffer);
      console.log(`Audio ${name} preloaded successfully`);
    } catch (error) {
      console.error(`Failed to preload audio ${name}:`, error);
    }
  }

  play(name, options = {}) {
    if (!this.initialized || !this.audioBuffers.has(name)) {
      console.warn(`Cannot play audio ${name}: not loaded`);
      return;
    }

    try {
      // Stop previous instance if playing
      this.stop(name);

      // Create buffer source
      const source = this.audioContext.createBufferSource();
      source.buffer = this.audioBuffers.get(name);

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = options.volume || 1.0;

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set options
      source.loop = options.loop || false;

      // Start playback
      const startTime = options.delay ? this.audioContext.currentTime + options.delay : 0;
      source.start(startTime);

      // Store reference for stopping
      this.sources.set(name, { source, gainNode });

      // Clean up when finished
      source.onended = () => {
        this.sources.delete(name);
      };

      console.log(`Playing audio: ${name}`);
    } catch (error) {
      console.error(`Failed to play audio ${name}:`, error);
    }
  }

  stop(name) {
    if (this.sources.has(name)) {
      try {
        const { source } = this.sources.get(name);
        source.stop();
        this.sources.delete(name);
        console.log(`Stopped audio: ${name}`);
      } catch (error) {
        console.error(`Failed to stop audio ${name}:`, error);
      }
    }
  }

  setVolume(name, volume) {
    if (this.sources.has(name)) {
      const { gainNode } = this.sources.get(name);
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Play with synchronized timing across clients
  playAtTimestamp(name, serverTimestamp, options = {}) {
    if (!this.initialized || !this.audioBuffers.has(name)) {
      console.warn(`Cannot play audio ${name}: not loaded`);
      return;
    }

    // Calculate delay based on server timestamp
    const now = Date.now();
    const delay = Math.max(0, (serverTimestamp - now) / 1000);

    this.play(name, { ...options, delay });
  }

  // Clean up resources
  dispose() {
    // Stop all playing sounds
    this.sources.forEach((_, name) => this.stop(name));
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    // Clear buffers
    this.audioBuffers.clear();
    this.sources.clear();
    
    this.initialized = false;
  }
}

// Create singleton instance
const audioManager = new AudioManager();

export default audioManager;