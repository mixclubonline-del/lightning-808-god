// Procedurally generated mythological sound effects using Web Audio API
// Pure sound design - no external audio files

class MythologicalSoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Master volume for UI sounds
      this.masterGain.connect(this.audioContext.destination);
    }
  }

  // Zeus Realm - Lightning crackle (filtered white noise burst)
  playZeusClick() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // White noise source
    const bufferSize = this.audioContext.sampleRate * 0.05; // 50ms
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    // High-pass filter for crackle
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;
    filter.Q.value = 5;
    
    // Envelope
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.4, now + 0.002);
    envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.masterGain);
    
    noise.start(now);
    noise.stop(now + 0.05);
  }

  // Apollo Realm - Harmonic harp pluck (tuned sine waves)
  playApolloPluck() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const fundamental = 440; // A4
    
    // Create harmonic series (1st, 2nd, 3rd harmonics)
    [1, 2, 3].forEach((harmonic, index) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = fundamental * harmonic;
      
      const gain = this.audioContext!.createGain();
      const amplitude = 0.3 / harmonic; // Harmonics decrease in amplitude
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(amplitude, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  // Vulcan Realm - Forge hammer impact (pitched impulse with resonance)
  playVulcanForge() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Low frequency oscillator for impact
    const impactOsc = this.audioContext.createOscillator();
    impactOsc.type = 'sine';
    impactOsc.frequency.value = 80;
    impactOsc.frequency.setValueAtTime(80, now);
    impactOsc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    // Metallic resonance
    const resonanceOsc = this.audioContext.createOscillator();
    resonanceOsc.type = 'triangle';
    resonanceOsc.frequency.value = 1200;
    
    // Impact envelope (sharp attack)
    const impactGain = this.audioContext.createGain();
    impactGain.gain.value = 0;
    impactGain.gain.setValueAtTime(0, now);
    impactGain.gain.linearRampToValueAtTime(0.6, now + 0.003);
    impactGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    // Resonance envelope (slower decay)
    const resonanceGain = this.audioContext.createGain();
    resonanceGain.gain.value = 0;
    resonanceGain.gain.setValueAtTime(0, now + 0.01);
    resonanceGain.gain.linearRampToValueAtTime(0.15, now + 0.02);
    resonanceGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    impactOsc.connect(impactGain);
    resonanceOsc.connect(resonanceGain);
    impactGain.connect(this.masterGain);
    resonanceGain.connect(this.masterGain);
    
    impactOsc.start(now);
    resonanceOsc.start(now);
    impactOsc.stop(now + 0.15);
    resonanceOsc.stop(now + 0.3);
  }

  // Oracle Realm - Ethereal sweep (FM synthesis)
  playOracleWisper() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Carrier oscillator
    const carrier = this.audioContext.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = 800;
    carrier.frequency.setValueAtTime(800, now);
    carrier.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    
    // Modulator for FM synthesis
    const modulator = this.audioContext.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.value = 5;
    
    const modulatorGain = this.audioContext.createGain();
    modulatorGain.gain.value = 200;
    
    // Envelope
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.2, now + 0.1);
    envelope.gain.linearRampToValueAtTime(0.15, now + 0.3);
    envelope.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    
    modulator.connect(modulatorGain);
    modulatorGain.connect(carrier.frequency);
    carrier.connect(envelope);
    envelope.connect(this.masterGain);
    
    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + 0.4);
    carrier.stop(now + 0.4);
  }

  // Hermes Realm - Quick transport bleep (frequency glide)
  playHermesBleep() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 800;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Pandora Realm - Mystery reveal (chord swell)
  playPandoraOpen() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Minor chord (A minor: A, C, E)
    const frequencies = [440, 523.25, 659.25];
    
    frequencies.forEach((freq) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const gain = this.audioContext!.createGain();
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.1, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  // Generic UI click (subtle, professional)
  playUIClick() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1200;
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
    
    const gain = this.audioContext.createGain();
    gain.gain.value = 0;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Realm transition whoosh (reverse cymbal effect)
  playRealmTransition() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Multiple oscillators for shimmer
    [1.0, 1.5, 2.0, 2.5].forEach((ratio, index) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 200 * ratio;
      
      const gain = this.audioContext!.createGain();
      gain.gain.value = 0;
      gain.gain.setValueAtTime(0, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      
      // High-pass filter for airiness
      const filter = this.audioContext!.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1000 + (index * 500);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}

// Singleton instance
export const mythSounds = new MythologicalSoundEngine();
