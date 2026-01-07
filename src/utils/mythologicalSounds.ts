// Procedurally generated mythological sound effects using Web Audio API
// Pure sound design - no external audio files

class MythologicalSoundEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  
  // Individual volume levels for each sound type
  public volumes = {
    master: 0.3,
    zeus: 1.0,
    apollo: 1.0,
    vulcan: 1.0,
    oracle: 1.0,
    hermes: 1.0,
    pandora: 1.0,
    ui: 1.0,
    transition: 1.0,
  };

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volumes.master;
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
    
    // Individual volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.zeus;
    
    // Envelope
    const envelope = this.audioContext.createGain();
    envelope.gain.value = 0;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.4, now + 0.002);
    envelope.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(volumeControl);
    volumeControl.connect(this.masterGain);
    
    noise.start(now);
    noise.stop(now + 0.05);
  }

  // Apollo Realm - Harmonic harp pluck (tuned sine waves)
  playApolloPluck() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    const fundamental = 440; // A4
    
    // Individual volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.apollo;
    volumeControl.connect(this.masterGain);
    
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
      gain.connect(volumeControl);
      
      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  // Vulcan Realm - Forge hammer impact (pitched impulse with resonance)
  playVulcanForge() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Individual volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.vulcan;
    volumeControl.connect(this.masterGain);
    
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
    impactGain.connect(volumeControl);
    resonanceGain.connect(volumeControl);
    
    impactOsc.start(now);
    resonanceOsc.start(now);
    impactOsc.stop(now + 0.15);
    resonanceOsc.stop(now + 0.3);
  }

  // Oracle Realm - Ethereal sweep (FM synthesis)
  playOracleWisper() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Individual volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.oracle;
    volumeControl.connect(this.masterGain);
    
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
    envelope.connect(volumeControl);
    
    modulator.start(now);
    carrier.start(now);
    modulator.stop(now + 0.4);
    carrier.stop(now + 0.4);
  }

  // Hermes Realm - Quick transport bleep (frequency glide)
  playHermesBleep() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Individual volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.hermes;
    volumeControl.connect(this.masterGain);
    
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
    gain.connect(volumeControl);
    
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Pandora Realm - Mystery reveal (chord swell)
  playPandoraOpen() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Individual volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.pandora;
    volumeControl.connect(this.masterGain);
    
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
      gain.connect(volumeControl);
      
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  // Generic UI click (subtle, professional)
  playUIClick() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Individual volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.ui;
    volumeControl.connect(this.masterGain);
    
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
    gain.connect(volumeControl);
    
    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Realm transition whoosh (reverse cymbal effect)
  playRealmTransition() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    // Individual volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.transition;
    volumeControl.connect(this.masterGain);
    
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
      gain.connect(volumeControl);
      
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }

  // Cosmic drone for opening animation (returns stop function)
  playCosmicDrone(): () => void {
    if (!this.audioContext || !this.masterGain) return () => {};

    const now = this.audioContext.currentTime;
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Volume control for cosmic sounds
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.transition * 0.4;
    volumeControl.connect(this.masterGain);

    // Deep sub bass drone
    const subBass = this.audioContext.createOscillator();
    subBass.type = 'sine';
    subBass.frequency.value = 40;
    const subGain = this.audioContext.createGain();
    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(0.3, now + 2);
    subBass.connect(subGain);
    subGain.connect(volumeControl);
    oscillators.push(subBass);
    gains.push(subGain);

    // Ethereal pad layers (detuned for richness)
    const padFreqs = [110, 165, 220, 330];
    padFreqs.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq + (Math.random() - 0.5) * 2; // Slight detune
      
      // Slow LFO for movement
      const lfo = this.audioContext!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1 + Math.random() * 0.2;
      const lfoGain = this.audioContext!.createGain();
      lfoGain.gain.value = freq * 0.02;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      oscillators.push(lfo);

      const gain = this.audioContext!.createGain();
      const baseAmp = 0.08 / (i + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(baseAmp, now + 3 + i * 0.5);
      
      osc.connect(gain);
      gain.connect(volumeControl);
      oscillators.push(osc);
      gains.push(gain);
    });

    // Shimmering high frequencies
    const shimmer = this.audioContext.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = 880;
    const shimmerLfo = this.audioContext.createOscillator();
    shimmerLfo.type = 'sine';
    shimmerLfo.frequency.value = 0.5;
    const shimmerLfoGain = this.audioContext.createGain();
    shimmerLfoGain.gain.value = 50;
    shimmerLfo.connect(shimmerLfoGain);
    shimmerLfoGain.connect(shimmer.frequency);
    
    const shimmerGain = this.audioContext.createGain();
    shimmerGain.gain.setValueAtTime(0, now);
    shimmerGain.gain.linearRampToValueAtTime(0.03, now + 4);
    
    // High-pass filter for airiness
    const shimmerFilter = this.audioContext.createBiquadFilter();
    shimmerFilter.type = 'highpass';
    shimmerFilter.frequency.value = 2000;
    
    shimmer.connect(shimmerFilter);
    shimmerFilter.connect(shimmerGain);
    shimmerGain.connect(volumeControl);
    shimmerLfo.start(now);
    oscillators.push(shimmer, shimmerLfo);
    gains.push(shimmerGain);

    // Start all oscillators
    oscillators.forEach(osc => {
      try { osc.start(now); } catch {}
    });

    // Return stop function with fade out
    return () => {
      if (!this.audioContext) return;
      const stopTime = this.audioContext.currentTime;
      
      gains.forEach(gain => {
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.linearRampToValueAtTime(0, stopTime + 1.5);
      });

      setTimeout(() => {
        oscillators.forEach(osc => {
          try { osc.stop(); } catch {}
        });
      }, 1600);
    };
  }

  // Portal fanfare for realm carousel (ascending arpeggio with shimmer)
  playPortalFanfare() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;

    // Volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.transition * 0.5;
    volumeControl.connect(this.masterGain);

    // Ascending fanfare notes (pentatonic scale for mystical feel)
    const notes = [392, 440, 523.25, 587.33, 659.25, 783.99]; // G4, A4, C5, D5, E5, G5
    const noteDelay = 0.06;

    notes.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      // Second detuned oscillator for richness
      const osc2 = this.audioContext!.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = freq * 1.005; // Slight detune

      const noteTime = now + i * noteDelay;

      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.2 - i * 0.02, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      const gain2 = this.audioContext!.createGain();
      gain2.gain.setValueAtTime(0, noteTime);
      gain2.gain.linearRampToValueAtTime(0.08, noteTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

      osc.connect(gain);
      osc2.connect(gain2);
      gain.connect(volumeControl);
      gain2.connect(volumeControl);

      osc.start(noteTime);
      osc2.start(noteTime);
      osc.stop(noteTime + 0.5);
      osc2.stop(noteTime + 0.4);
    });

    // Final shimmer burst
    const shimmerTime = now + notes.length * noteDelay;
    const shimmerFreqs = [783.99, 987.77, 1174.66]; // G5, B5, D6

    shimmerFreqs.forEach((freq) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, shimmerTime);
      gain.gain.linearRampToValueAtTime(0.1, shimmerTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, shimmerTime + 0.6);

      osc.connect(gain);
      gain.connect(volumeControl);

      osc.start(shimmerTime);
      osc.stop(shimmerTime + 0.7);
    });
  }

  // Celestial choir for title reveal (returns stop function)
  playCelestialChoir(): () => void {
    if (!this.audioContext || !this.masterGain) return () => {};

    const now = this.audioContext.currentTime;
    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Volume control
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.transition * 0.35;
    volumeControl.connect(this.masterGain);

    // Major chord frequencies (C major across octaves)
    const baseFreqs = [261.63, 329.63, 392.00]; // C4, E4, G4
    const highFreqs = [523.25, 659.25, 783.99]; // C5, E5, G5

    // Base pad layer with slight detune for richness
    baseFreqs.forEach((freq, i) => {
      // Main tone
      const osc = this.audioContext!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq + (Math.random() - 0.5) * 4; // ±2 cents detune

      // Slow amplitude LFO for shimmer
      const lfo = this.audioContext!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.3 + Math.random() * 0.4;
      const lfoGain = this.audioContext!.createGain();
      lfoGain.gain.value = 0.15;
      lfo.connect(lfoGain);

      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 1.5); // Slow attack
      gain.gain.linearRampToValueAtTime(0.1, now + 3);

      // Apply LFO to gain
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(volumeControl);
      lfo.start(now);
      osc.start(now);
      oscillators.push(osc, lfo);
      gains.push(gain);
    });

    // High shimmer layer (softer, more ethereal)
    highFreqs.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      osc.type = 'triangle'; // Softer than sine
      osc.frequency.value = freq + (Math.random() - 0.5) * 6;

      // Faster LFO for shimmer effect
      const lfo = this.audioContext!.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.5 + Math.random() * 0.3;
      const lfoGain = this.audioContext!.createGain();
      lfoGain.gain.value = freq * 0.008; // Subtle pitch wobble
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      const gain = this.audioContext!.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 2); // Slower attack for high layer
      gain.gain.linearRampToValueAtTime(0.05, now + 3.5);

      osc.connect(gain);
      gain.connect(volumeControl);
      lfo.start(now);
      osc.start(now);
      oscillators.push(osc, lfo);
      gains.push(gain);
    });

    // Airy breath layer (filtered noise)
    const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 4, this.audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    const noise = this.audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 3000;
    noiseFilter.Q.value = 2;

    const noiseGain = this.audioContext.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.015, now + 2);
    noiseGain.gain.linearRampToValueAtTime(0.01, now + 3.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(volumeControl);
    noise.start(now);
    gains.push(noiseGain);

    // Return stop function with graceful fade
    return () => {
      if (!this.audioContext) return;
      const stopTime = this.audioContext.currentTime;

      gains.forEach(gain => {
        gain.gain.cancelScheduledValues(stopTime);
        gain.gain.setValueAtTime(gain.gain.value, stopTime);
        gain.gain.linearRampToValueAtTime(0, stopTime + 2); // 2s fade out
      });

      setTimeout(() => {
        oscillators.forEach(osc => {
          try { osc.stop(); } catch {}
        });
        try { noise.stop(); } catch {}
      }, 2100);
    };
  }

  // Thunder rumble for opening
  playThunderRumble() {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    
    const volumeControl = this.audioContext.createGain();
    volumeControl.gain.value = this.volumes.zeus * 0.6;
    volumeControl.connect(this.masterGain);

    // Low rumble with noise
    const bufferSize = this.audioContext.sampleRate * 1.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5);
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    
    // Low-pass filter for rumble
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 150;
    filter.Q.value = 1;
    
    const envelope = this.audioContext.createGain();
    envelope.gain.setValueAtTime(0.8, now);
    envelope.gain.exponentialRampToValueAtTime(0.01, now + 1.5);
    
    noise.connect(filter);
    filter.connect(envelope);
    envelope.connect(volumeControl);
    
    noise.start(now);
    noise.stop(now + 1.5);
  }

  // Volume control methods
  setMasterVolume(volume: number) {
    this.volumes.master = Math.max(0, Math.min(1, volume));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volumes.master;
    }
  }

  setVolume(type: keyof typeof this.volumes, volume: number) {
    if (type in this.volumes) {
      this.volumes[type] = Math.max(0, Math.min(1, volume));
    }
  }
}

// Singleton instance
export const mythSounds = new MythologicalSoundEngine();
