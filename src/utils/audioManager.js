// Audio Manager using Web Audio API for synchronized playback
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.audioBuffers = new Map();
    this.sources = new Map();
    this.initialized = false;
    this.heartbeatCallbacks = new Set();
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

  // Fade out audio over a specified duration
  fadeOut(name, duration = 1.0) {
    if (this.sources.has(name)) {
      try {
        const { source, gainNode } = this.sources.get(name);
        const currentTime = this.audioContext.currentTime;
        
        // Fade out from current volume to 0
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        
        // Stop the source after fade completes
        setTimeout(() => {
          try {
            source.stop();
            this.sources.delete(name);
            console.log(`Faded out and stopped audio: ${name}`);
          } catch (error) {
            console.error(`Failed to stop audio after fadeout ${name}:`, error);
          }
        }, duration * 1000);
        
        console.log(`Fading out audio: ${name} over ${duration}s`);
      } catch (error) {
        console.error(`Failed to fade out audio ${name}:`, error);
      }
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

  // Play a simple beep/tick sound using oscillator
  playTick(frequency = 800, duration = 0.1, volume = 0.5) {
    if (!this.initialized) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Set frequency (higher = higher pitch)
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      // Set volume envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play sound
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
      
      console.log(`Playing tick sound: ${frequency}Hz`);
    } catch (error) {
      console.error('Failed to play tick sound:', error);
    }
  }
  
  // Play countdown sound with different pitch based on number
  playCountdownSound(number) {
    if (!this.initialized) return;
    
    // Different frequencies for different numbers
    // Higher numbers = lower pitch, 0 = highest pitch
    let frequency;
    if (number >= 3) {
      frequency = 600;  // All numbers 3 and above use same frequency
    } else if (number === 2) {
      frequency = 700;
    } else if (number === 1) {
      frequency = 800;
    } else if (number === 0) {
      frequency = 1000;  // Final beep is highest
    } else {
      frequency = 600;  // Default
    }
    
    const duration = number === 0 ? 0.3 : 0.15;  // Longer beep for 0
    const volume = number === 0 ? 0.7 : 0.5;     // Louder for 0
    
    this.playTick(frequency, duration, volume);
  }

  // Play heartbeat sound using oscillator
  playHeartbeat(volume = 0.3) {
    if (!this.initialized) return;
    
    try {
      // Create two beats for a heartbeat (lub-dub)
      this.createHeartbeatBeat(0, volume);      // First beat (lub)
      this.createHeartbeatBeat(0.15, volume * 0.8);  // Second beat (dub)
      
      // Notify subscribers of heartbeat
      this.heartbeatCallbacks.forEach(callback => callback('lub'));
      setTimeout(() => {
        this.heartbeatCallbacks.forEach(callback => callback('dub'));
      }, 150);
    } catch (error) {
      console.error('Failed to play heartbeat sound:', error);
    }
  }

  // Subscribe to heartbeat events
  onHeartbeat(callback) {
    this.heartbeatCallbacks.add(callback);
    return () => this.heartbeatCallbacks.delete(callback);
  }

  // Create a single heartbeat beat
  createHeartbeatBeat(delay, volume) {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();
    
    // Set up low frequency for heartbeat
    oscillator.frequency.value = 60;  // Very low frequency
    oscillator.type = 'sine';
    
    // Add some filtering to make it more muffled
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 200;
    filterNode.Q.value = 1;
    
    // Set volume envelope for heartbeat
    const startTime = this.audioContext.currentTime + delay;
    const duration = 0.1;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    // Connect nodes
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Play sound
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  // Start continuous heartbeat
  startHeartbeat(bpm = 80, volume = 0.3) {
    if (!this.initialized) return;
    
    // Stop any existing heartbeat
    this.stopHeartbeat();
    
    const interval = 60000 / bpm; // Convert BPM to milliseconds
    
    // Store interval reference
    this.heartbeatInterval = setInterval(() => {
      this.playHeartbeat(volume);
    }, interval);
    
    // Play first heartbeat immediately
    this.playHeartbeat(volume);
    
    console.log(`Started heartbeat at ${bpm} BPM`);
  }

  // Stop continuous heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('Stopped heartbeat');
    }
  }
  
  // Clean up resources
  dispose() {
    // Stop all playing sounds
    this.sources.forEach((_, name) => this.stop(name));
    
    // Stop heartbeat
    this.stopHeartbeat();
    
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