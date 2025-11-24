import { useEffect, useRef, useState } from "react";
import { midiHandler, type MidiMessage } from "@/utils/midiHandler";
import { keyboardMapper } from "@/utils/keyboardMapper";

interface AudioEngineConfig {
  wave: number;
  filter: number;
  vibrato: number;
  gain: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  reverb: number;
  resonance: number;
  distortionDrive: number;
  distortionTone: number;
  distortionMix: number;
  velocityCurve?: "linear" | "exponential" | "logarithmic";
  velocityToVolume?: number;
  velocityToFilter?: number;
  masterVolume?: number;
  limiterEnabled?: boolean;
  limiterThreshold?: number;
}

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const limiterRef = useRef<DynamicsCompressorNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const reverbMixRef = useRef<GainNode | null>(null);
  const reverbDryRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const distortionRef = useRef<WaveShaperNode | null>(null);
  
  // Delay nodes
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const delayMixRef = useRef<GainNode | null>(null);
  const delayDryRef = useRef<GainNode | null>(null);
  
  // Chorus nodes
  const chorusDelaysRef = useRef<DelayNode[]>([]);
  const chorusLFOsRef = useRef<OscillatorNode[]>([]);
  const chorusGainsRef = useRef<GainNode[]>([]);
  const chorusMixRef = useRef<GainNode | null>(null);
  const chorusDryRef = useRef<GainNode | null>(null);
  
  // Mars Verb nodes (shimmer reverb)
  const marsReverbRef = useRef<ConvolverNode | null>(null);
  const marsShimmerRef = useRef<BiquadFilterNode | null>(null);
  const marsMixRef = useRef<GainNode | null>(null);
  const marsDryRef = useRef<GainNode | null>(null);
  
  // Past Time Verb nodes (reverse reverb)
  const pastTimeReverbRef = useRef<ConvolverNode | null>(null);
  const pastTimeMixRef = useRef<GainNode | null>(null);
  const pastTimeDryRef = useRef<GainNode | null>(null);
  
  // Half Time nodes
  const halfTimeBufferRef = useRef<AudioBuffer | null>(null);
  const halfTimeMixRef = useRef<GainNode | null>(null);
  const halfTimeDryRef = useRef<GainNode | null>(null);
  
  // Spandex Compressor nodes
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const compressorMakeupRef = useRef<GainNode | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const mediaStreamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [triggerMode, setTriggerMode] = useState<"cycle" | "random">("cycle");
  const [maxPolyphony, setMaxPolyphony] = useState(16);
  const [currentVoices, setCurrentVoices] = useState(0);
  const activeNotesRef = useRef<Map<number, { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode; velocity: number }>>(new Map());
  const activeVelocitiesRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const initialize = async () => {
    if (audioContextRef.current) return;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    audioContextRef.current = new AudioContext();
    
    // Resume context if suspended to prevent clicks
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // Create analyser for visualization
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;

    // Create distortion
    distortionRef.current = audioContextRef.current.createWaveShaper();
    const initialCurve = makeDistortionCurve(0);
    distortionRef.current.curve = initialCurve as any;
    distortionRef.current.oversample = "4x";

    // Create delay effect
    delayNodeRef.current = audioContextRef.current.createDelay(2.0); // Max 2 seconds
    delayNodeRef.current.delayTime.value = 0.5; // 500ms default
    delayFeedbackRef.current = audioContextRef.current.createGain();
    delayFeedbackRef.current.gain.value = 0.3; // 30% feedback
    delayMixRef.current = audioContextRef.current.createGain();
    delayMixRef.current.gain.value = 0; // Start with delay off
    delayDryRef.current = audioContextRef.current.createGain();
    delayDryRef.current.gain.value = 1.0;
    
    // Connect delay feedback loop
    delayNodeRef.current.connect(delayFeedbackRef.current);
    delayFeedbackRef.current.connect(delayNodeRef.current);

    // Create chorus effect (3 voices with LFO modulation)
    chorusMixRef.current = audioContextRef.current.createGain();
    chorusMixRef.current.gain.value = 0; // Start with chorus off
    chorusDryRef.current = audioContextRef.current.createGain();
    chorusDryRef.current.gain.value = 1.0;
    
    for (let i = 0; i < 3; i++) {
      const delay = audioContextRef.current.createDelay(0.05);
      delay.delayTime.value = 0.01 + (i * 0.005); // 10-20ms delays
      
      const lfo = audioContextRef.current.createOscillator();
      lfo.frequency.value = 0.5 + (i * 0.2); // Slightly different LFO rates
      
      const lfoGain = audioContextRef.current.createGain();
      lfoGain.gain.value = 0.002; // Small modulation depth
      
      const voiceGain = audioContextRef.current.createGain();
      voiceGain.gain.value = 0.33; // Equal mix of 3 voices
      
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      delay.connect(voiceGain);
      voiceGain.connect(chorusMixRef.current);
      
      lfo.start();
      
      chorusDelaysRef.current.push(delay);
      chorusLFOsRef.current.push(lfo);
      chorusGainsRef.current.push(lfoGain);
    }

    // Create master gain and limiter
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.gain.value = 0.8;

    limiterRef.current = audioContextRef.current.createDynamicsCompressor();
    limiterRef.current.threshold.value = -10;
    limiterRef.current.knee.value = 0;
    limiterRef.current.ratio.value = 20;
    limiterRef.current.attack.value = 0.001;
    limiterRef.current.release.value = 0.1;

    // Create reverb (Pluto Verb - simple convolver with wet/dry mix)
    reverbRef.current = audioContextRef.current.createConvolver();
    await createReverbImpulse(audioContextRef.current, reverbRef.current, 2, 0.5);
    reverbMixRef.current = audioContextRef.current.createGain();
    reverbMixRef.current.gain.value = 0; // Start with reverb off
    reverbDryRef.current = audioContextRef.current.createGain();
    reverbDryRef.current.gain.value = 1.0;
    
    // Create Mars Verb (shimmer reverb)
    marsReverbRef.current = audioContextRef.current.createConvolver();
    await createReverbImpulse(audioContextRef.current, marsReverbRef.current, 3, 0.7);
    marsShimmerRef.current = audioContextRef.current.createBiquadFilter();
    marsShimmerRef.current.type = "highpass";
    marsShimmerRef.current.frequency.value = 1000;
    marsMixRef.current = audioContextRef.current.createGain();
    marsMixRef.current.gain.value = 0;
    marsDryRef.current = audioContextRef.current.createGain();
    marsDryRef.current.gain.value = 1.0;
    
    // Create Past Time Verb (reverse reverb)
    pastTimeReverbRef.current = audioContextRef.current.createConvolver();
    await createReverseReverbImpulse(audioContextRef.current, pastTimeReverbRef.current, 2);
    pastTimeMixRef.current = audioContextRef.current.createGain();
    pastTimeMixRef.current.gain.value = 0;
    pastTimeDryRef.current = audioContextRef.current.createGain();
    pastTimeDryRef.current.gain.value = 1.0;
    
    // Create Half Time effect
    halfTimeMixRef.current = audioContextRef.current.createGain();
    halfTimeMixRef.current.gain.value = 0;
    halfTimeDryRef.current = audioContextRef.current.createGain();
    halfTimeDryRef.current.gain.value = 1.0;
    
    // Create Spandex Compressor
    compressorRef.current = audioContextRef.current.createDynamicsCompressor();
    compressorRef.current.threshold.value = -24;
    compressorRef.current.knee.value = 30;
    compressorRef.current.ratio.value = 4;
    compressorRef.current.attack.value = 0.003;
    compressorRef.current.release.value = 0.25;
    compressorMakeupRef.current = audioContextRef.current.createGain();
    compressorMakeupRef.current.gain.value = 1.0;

    // Create media stream for recording
    mediaStreamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();

    // Connect audio graph: distortion -> compressor -> chorus -> delay -> reverbs -> analyser -> master gain -> limiter -> destination
    distortionRef.current.connect(compressorRef.current);
    compressorRef.current.connect(compressorMakeupRef.current);
    
    compressorMakeupRef.current.connect(chorusDryRef.current);
    compressorMakeupRef.current.connect(chorusDelaysRef.current[0]);
    compressorMakeupRef.current.connect(chorusDelaysRef.current[1]);
    compressorMakeupRef.current.connect(chorusDelaysRef.current[2]);
    
    chorusDryRef.current.connect(delayDryRef.current);
    chorusMixRef.current.connect(delayDryRef.current);
    
    delayDryRef.current.connect(reverbDryRef.current);
    delayNodeRef.current.connect(delayMixRef.current);
    delayMixRef.current.connect(reverbDryRef.current);
    
    // Connect Pluto Verb (regular reverb)
    reverbDryRef.current.connect(marsDryRef.current);
    reverbDryRef.current.connect(reverbRef.current);
    reverbRef.current.connect(reverbMixRef.current);
    reverbMixRef.current.connect(marsDryRef.current);
    
    // Connect Mars Verb (shimmer)
    marsDryRef.current.connect(pastTimeDryRef.current);
    marsDryRef.current.connect(marsShimmerRef.current);
    marsShimmerRef.current.connect(marsReverbRef.current);
    marsReverbRef.current.connect(marsMixRef.current);
    marsMixRef.current.connect(pastTimeDryRef.current);
    
    // Connect Past Time Verb (reverse)
    pastTimeDryRef.current.connect(halfTimeDryRef.current);
    pastTimeDryRef.current.connect(pastTimeReverbRef.current);
    pastTimeReverbRef.current.connect(pastTimeMixRef.current);
    pastTimeMixRef.current.connect(halfTimeDryRef.current);
    
    // Connect Half Time (simplified routing)
    halfTimeDryRef.current.connect(analyserRef.current);
    halfTimeMixRef.current.connect(analyserRef.current);
    
    analyserRef.current.connect(masterGainRef.current);
    masterGainRef.current.connect(limiterRef.current);
    limiterRef.current.connect(audioContextRef.current.destination);
    limiterRef.current.connect(mediaStreamDestinationRef.current);

    setIsInitialized(true);
  };

  const makeDistortionCurve = (amount: number): Float32Array => {
    const k = typeof amount === "number" ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;

    for (let i = 0; i < n_samples; i++) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve as Float32Array;
  };

  const createReverbImpulse = async (
    context: AudioContext, 
    convolver: ConvolverNode,
    duration: number = 2,
    decay: number = 0.5
  ) => {
    const rate = context.sampleRate;
    const length = rate * duration;
    const impulse = context.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }

    convolver.buffer = impulse;
  };
  
  const createReverseReverbImpulse = async (
    context: AudioContext,
    convolver: ConvolverNode,
    duration: number = 2
  ) => {
    const rate = context.sampleRate;
    const length = rate * duration;
    const impulse = context.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    // Create reverse decay (build up instead of decay)
    for (let i = 0; i < length; i++) {
      const progress = i / length;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(progress, 2);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(progress, 2);
    }

    convolver.buffer = impulse;
  };

  const getNextLayer = (): "layer1" | "layer2" | "layer3" => {
    if (triggerMode === "random") {
      const layers: ("layer1" | "layer2" | "layer3")[] = ["layer1", "layer2", "layer3"];
      return layers[Math.floor(Math.random() * 3)];
    } else {
      // Round robin cycle
      const layers: ("layer1" | "layer2" | "layer3")[] = ["layer1", "layer2", "layer3"];
      const layer = layers[currentLayerIndex];
      setCurrentLayerIndex((currentLayerIndex + 1) % 3);
      return layer;
    }
  };

  const play808 = async (
    frequency: number,
    config: AudioEngineConfig,
    midiNote: number,
    isCore: boolean = true,
    velocity: number = 1.0
  ) => {
    if (!audioContextRef.current || !masterGainRef.current || !reverbRef.current) return;

    // Enforce polyphony limit
    if (activeNotesRef.current.size >= maxPolyphony) {
      // Find oldest note and stop it
      const oldestNote = Array.from(activeNotesRef.current.keys())[0];
      if (oldestNote !== undefined) {
        stopNote(oldestNote, config);
      }
    }

    const context = audioContextRef.current;
    
    // Ensure context is running to prevent clicks
    if (context.state === 'suspended') {
      await context.resume();
    }
    
    const now = context.currentTime;

    // Apply velocity curve
    const velocityCurve = config.velocityCurve || "linear";
    const velocityToVolume = (config.velocityToVolume || 80) / 100;
    const velocityToFilter = (config.velocityToFilter || 50) / 100;

    // Transform velocity based on curve
    let transformedVelocity = velocity;
    if (velocityCurve === "exponential") {
      transformedVelocity = Math.pow(velocity, 2);
    } else if (velocityCurve === "logarithmic") {
      transformedVelocity = Math.sqrt(velocity);
    }

    // Create oscillator for 808 bass
    const osc = context.createOscillator();
    const oscGain = context.createGain();
    const filter = context.createBiquadFilter();

    // 808 characteristics: sine wave for sub-bass
    osc.type = config.wave > 75 ? "sawtooth" : config.wave > 50 ? "square" : config.wave > 25 ? "triangle" : "sine";
    osc.frequency.value = frequency;

    // Add pitch envelope for 808 punch
    const pitchEnvelope = frequency * (isCore ? 4 : 2);
    osc.frequency.setValueAtTime(pitchEnvelope, now);
    osc.frequency.exponentialRampToValueAtTime(frequency, now + 0.05);

    // Configure filter with velocity sensitivity
    const baseFilterFreq = 200 + (config.filter * 50);
    const velocityFilterMod = transformedVelocity * velocityToFilter * 2000;
    filter.type = "lowpass";
    filter.frequency.value = baseFilterFreq + velocityFilterMod;
    filter.Q.value = config.resonance / 10;

    // Configure ADSR envelope with velocity
    const attackTime = (config.attack / 100) * 0.5;
    const decayTime = (config.decay / 100) * 2;
    const sustainLevel = (config.sustain / 100);
    const releaseTime = (config.release / 100) * 2;
    const gainMultiplier = isCore ? 1 : 0.6;
    const baseGain = (config.gain / 100) * gainMultiplier;
    const peakGain = baseGain * (1 - velocityToVolume + (velocityToVolume * transformedVelocity));

    // ADSR: Attack -> Decay -> Sustain
    const minGain = 0.001;
    oscGain.gain.setValueAtTime(minGain, now);
    oscGain.gain.exponentialRampToValueAtTime(
      Math.max(minGain, peakGain), 
      now + Math.max(0.005, attackTime)
    );
    oscGain.gain.exponentialRampToValueAtTime(
      Math.max(minGain, peakGain * sustainLevel), 
      now + Math.max(0.005, attackTime) + Math.max(0.01, decayTime)
    );

    // Add vibrato
    if (config.vibrato > 0) {
      const vibrato = context.createOscillator();
      const vibratoGain = context.createGain();
      vibrato.frequency.value = 5; // 5Hz vibrato
      vibratoGain.gain.value = (config.vibrato / 100) * 10; // Vibrato depth
      vibrato.connect(vibratoGain);
      vibratoGain.connect(osc.frequency);
      vibrato.start(now);
      vibrato.stop(now + attackTime + decayTime + 0.5);
    }

    // Create reverb send
    const reverbSend = context.createGain();
    reverbSend.gain.value = config.reverb / 100;

    // Create dry/wet mix for distortion
    const dryGain = context.createGain();
    const wetGain = context.createGain();
    dryGain.gain.value = 1 - config.distortionMix / 100;
    wetGain.gain.value = config.distortionMix / 100;

    // Update distortion curve
    if (distortionRef.current) {
      const curve = makeDistortionCurve(config.distortionDrive);
      distortionRef.current.curve = curve as any;
    }

    // Connect the audio graph with distortion
    osc.connect(filter);
    filter.connect(oscGain);
    
    // Split signal for dry/wet
    oscGain.connect(dryGain);
    oscGain.connect(wetGain);
    
    // Wet signal through distortion
    if (distortionRef.current) {
      wetGain.connect(distortionRef.current);
    }
    
    // Mix and send to outputs
    dryGain.connect(masterGainRef.current!);
    oscGain.connect(reverbSend);
    reverbSend.connect(reverbRef.current!);

    // Start oscillator
    osc.start(now);
    
    // Store active note with release time for proper stop handling
    const totalTime = attackTime + decayTime + releaseTime + 2; // Extra buffer
    osc.stop(now + totalTime);

    // Store active note
    activeNotesRef.current.set(midiNote, { osc, gain: oscGain, filter, velocity: transformedVelocity });
    activeVelocitiesRef.current.set(midiNote, transformedVelocity);
    setCurrentVoices(activeNotesRef.current.size);

    // Clean up after note ends - use unique key for layers
    const noteKey = isCore ? midiNote : midiNote + 10000;
    setTimeout(() => {
      activeNotesRef.current.delete(noteKey);
      activeVelocitiesRef.current.delete(midiNote);
      setCurrentVoices(activeNotesRef.current.size);
    }, (attackTime + decayTime + 0.5) * 1000);

    return !isCore; // Return true if this was a layer (for visual feedback)
  };

  const playMulti808 = (
    frequency: number,
    config: AudioEngineConfig,
    midiNote: number
  ): "layer1" | "layer2" | "layer3" => {
    // ALWAYS play the core 808
    play808(frequency, config, midiNote, true);

    // Play ONE of the texture layers (round robin or random)
    const activeLayer = getNextLayer();
    play808(frequency, config, midiNote + 1000, false); // Offset to avoid key collision

    return activeLayer;
  };

  const stopNote = (midiNote: number, config?: AudioEngineConfig) => {
    const note = activeNotesRef.current.get(midiNote);
    if (note && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      const releaseTime = config ? Math.max(0.01, (config.release / 100) * 2) : 0.05; // Min 10ms release
      
      // Get current gain value for smooth release
      const currentGain = note.gain.gain.value;
      const minGain = 0.001;
      
      // Apply smooth exponential release to prevent clicks
      note.gain.gain.cancelScheduledValues(now);
      note.gain.gain.setValueAtTime(Math.max(minGain, currentGain), now);
      note.gain.gain.exponentialRampToValueAtTime(minGain, now + releaseTime);
      
      // Stop oscillator with buffer time
      try {
        note.osc.stop(now + releaseTime + 0.05);
      } catch (e) {
        // Oscillator may already be stopped
      }
      
      // Cleanup
      setTimeout(() => {
        try {
          note.osc.disconnect();
          note.gain.disconnect();
        } catch (e) {
          // Already disconnected
        }
        activeNotesRef.current.delete(midiNote);
        activeVelocitiesRef.current.delete(midiNote);
        setCurrentVoices(activeNotesRef.current.size);
      }, (releaseTime + 0.1) * 1000);
    }
  };

  const updateMasterVolume = (volume: number, limiterEnabled: boolean, limiterThreshold: number) => {
    if (masterGainRef.current && limiterRef.current) {
      masterGainRef.current.gain.value = volume / 100;
      
      if (limiterEnabled) {
        // Threshold: 50-100 maps to -20dB to 0dB
        const thresholdDb = -20 + ((limiterThreshold - 50) / 50) * 20;
        limiterRef.current.threshold.value = thresholdDb;
        limiterRef.current.ratio.value = 20;
      } else {
        // Disable limiter by setting threshold very high
        limiterRef.current.threshold.value = 0;
        limiterRef.current.ratio.value = 1;
      }
    }
  };

  const updateMasterGain = (value: number) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = value / 100;
    }
  };

  const updateFilter = (frequency: number, resonance: number) => {
    activeNotesRef.current.forEach((note) => {
      note.filter.frequency.value = 200 + (frequency * 50);
      note.filter.Q.value = resonance / 10;
    });
  };

  const updateDistortion = (drive: number, mix: number) => {
    if (distortionRef.current) {
      const curve = makeDistortionCurve(drive);
      distortionRef.current.curve = curve as any;
    }
  };

  const updateDelay = (time: number, feedback: number, mix: number, enabled: boolean) => {
    if (delayNodeRef.current && delayFeedbackRef.current && delayMixRef.current && delayDryRef.current) {
      // Time: 0-100 maps to 0-2000ms
      const delayTime = (time / 100) * 2.0;
      delayNodeRef.current.delayTime.setValueAtTime(delayTime, audioContextRef.current!.currentTime);
      
      // Feedback: 0-100 maps to 0-95% (prevent runaway feedback)
      delayFeedbackRef.current.gain.value = (feedback / 100) * 0.95;
      
      // Mix: wet/dry balance
      if (enabled) {
        delayMixRef.current.gain.value = mix / 100;
        delayDryRef.current.gain.value = 1 - (mix / 100);
      } else {
        delayMixRef.current.gain.value = 0;
        delayDryRef.current.gain.value = 1;
      }
    }
  };

  const updateChorus = (rate: number, depth: number, mix: number, enabled: boolean) => {
    if (chorusMixRef.current && chorusDryRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      
      // Update LFO rates and depths
      chorusLFOsRef.current.forEach((lfo, i) => {
        // Rate: 0-100 maps to 0.1-10 Hz
        const freq = 0.1 + (rate / 100) * 9.9;
        lfo.frequency.setValueAtTime(freq + (i * 0.2), now);
      });
      
      chorusGainsRef.current.forEach((gain) => {
        // Depth: 0-100 maps to 0-0.005s modulation
        gain.gain.value = (depth / 100) * 0.005;
      });
      
      // Mix: wet/dry balance
      if (enabled) {
        chorusMixRef.current.gain.value = mix / 100;
        chorusDryRef.current.gain.value = 1 - (mix / 100);
      } else {
        chorusMixRef.current.gain.value = 0;
        chorusDryRef.current.gain.value = 1;
      }
    }
  };

  const updateReverb = async (size: number, damping: number, mix: number, enabled: boolean) => {
    if (reverbRef.current && reverbMixRef.current && reverbDryRef.current && audioContextRef.current) {
      // Size: 0-100 maps to 0.5-5 seconds
      const duration = 0.5 + (size / 100) * 4.5;
      
      // Damping: 0-100 maps to decay curve (0.2-3.0)
      const decay = 0.2 + (damping / 100) * 2.8;
      
      // Recreate impulse response with new parameters
      await createReverbImpulse(audioContextRef.current, reverbRef.current, duration, decay);
      
      // Mix: wet/dry balance
      if (enabled) {
        reverbMixRef.current.gain.value = mix / 100;
        reverbDryRef.current.gain.value = 1 - (mix / 100);
      } else {
        reverbMixRef.current.gain.value = 0;
        reverbDryRef.current.gain.value = 1;
      }
    }
  };
  
  const updateMarsVerb = async (size: number, shimmer: number, mix: number, enabled: boolean) => {
    if (marsReverbRef.current && marsShimmerRef.current && marsMixRef.current && marsDryRef.current && audioContextRef.current) {
      const duration = 1 + (size / 100) * 4; // 1-5 seconds
      await createReverbImpulse(audioContextRef.current, marsReverbRef.current, duration, 0.8);
      
      // Shimmer control affects highpass frequency
      marsShimmerRef.current.frequency.value = 500 + (shimmer / 100) * 2500; // 500-3000 Hz
      
      if (enabled) {
        marsMixRef.current.gain.value = mix / 100;
        marsDryRef.current.gain.value = 1 - (mix / 100);
      } else {
        marsMixRef.current.gain.value = 0;
        marsDryRef.current.gain.value = 1;
      }
    }
  };
  
  const updatePastTimeVerb = async (size: number, reverse: number, mix: number, enabled: boolean) => {
    if (pastTimeReverbRef.current && pastTimeMixRef.current && pastTimeDryRef.current && audioContextRef.current) {
      const duration = 0.5 + (size / 100) * 2.5; // 0.5-3 seconds
      await createReverseReverbImpulse(audioContextRef.current, pastTimeReverbRef.current, duration);
      
      if (enabled) {
        // Reverse amount controls the mix intensity
        const adjustedMix = (mix / 100) * (reverse / 100);
        pastTimeMixRef.current.gain.value = adjustedMix;
        pastTimeDryRef.current.gain.value = 1 - adjustedMix;
      } else {
        pastTimeMixRef.current.gain.value = 0;
        pastTimeDryRef.current.gain.value = 1;
      }
    }
  };
  
  const updateHalfTime = (amount: number, smoothing: number, mix: number, enabled: boolean) => {
    if (halfTimeMixRef.current && halfTimeDryRef.current) {
      // Half time is a complex effect - this is a simplified version
      // In production, you'd use buffer manipulation and pitch shifting
      if (enabled) {
        halfTimeMixRef.current.gain.value = (mix / 100) * (amount / 100);
        halfTimeDryRef.current.gain.value = 1 - ((mix / 100) * (amount / 100));
      } else {
        halfTimeMixRef.current.gain.value = 0;
        halfTimeDryRef.current.gain.value = 1;
      }
    }
  };
  
  const updateCompressor = (threshold: number, ratio: number, attack: number, release: number, enabled: boolean) => {
    if (compressorRef.current && compressorMakeupRef.current) {
      if (enabled) {
        // Threshold: 0-100 maps to -60dB to 0dB
        compressorRef.current.threshold.value = -60 + (threshold / 100) * 60;
        
        // Ratio: 0-100 maps to 1:1 to 20:1
        compressorRef.current.ratio.value = 1 + (ratio / 100) * 19;
        
        // Attack: 0-100 maps to 0.001 to 1 second (logarithmic)
        compressorRef.current.attack.value = 0.001 * Math.pow(1000, attack / 100);
        
        // Release: 0-100 maps to 0.01 to 3 seconds (logarithmic)
        compressorRef.current.release.value = 0.01 * Math.pow(300, release / 100);
        
        // Auto makeup gain based on threshold and ratio
        const makeupGain = 1 + (1 - threshold / 100) * (ratio / 100) * 0.5;
        compressorMakeupRef.current.gain.value = makeupGain;
      } else {
        // Bypass compressor
        compressorRef.current.threshold.value = 0;
        compressorRef.current.ratio.value = 1;
        compressorMakeupRef.current.gain.value = 1;
      }
    }
  };

  const startRecording = () => {
    if (!mediaStreamDestinationRef.current) return;

    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(mediaStreamDestinationRef.current.stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = () => {
    if (recordedChunksRef.current.length === 0) return;

    const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vst-god-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getRecordedAudioBuffer = async (): Promise<AudioBuffer | null> => {
    if (recordedChunksRef.current.length === 0 || !audioContextRef.current) return null;

    try {
      const blob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error("Failed to decode recorded audio:", error);
      return null;
    }
  };

  // MIDI and Keyboard Integration
  const enableMidiInput = (config: AudioEngineConfig) => {
    const unsubscribe = midiHandler.subscribe((message: MidiMessage) => {
      if (message.type === 'noteon' && message.note !== undefined && message.velocity !== undefined) {
        const frequency = midiToFrequency(message.note);
        play808(frequency, config, message.note, true);
      } else if (message.type === 'noteoff' && message.note !== undefined) {
        stopNote(message.note, config);
      }
    });
    return unsubscribe;
  };

  const enableKeyboardInput = (config: AudioEngineConfig) => {
    const unsubscribe = keyboardMapper.subscribe((note: number, velocity: number, isNoteOn: boolean) => {
      if (isNoteOn) {
        const frequency = midiToFrequency(note);
        play808(frequency, config, note, true);
      } else {
        stopNote(note, config);
      }
    });
    return unsubscribe;
  };

  return {
    initialize,
    play808,
    playMulti808,
    stopNote,
    enableMidiInput,
    enableKeyboardInput,
    updateMasterGain,
    updateMasterVolume,
    updateFilter,
    updateDistortion,
    updateDelay,
    updateChorus,
    updateReverb,
    updateMarsVerb,
    updatePastTimeVerb,
    updateHalfTime,
    updateCompressor,
    startRecording,
    stopRecording,
    downloadRecording,
    getRecordedAudioBuffer,
    setTriggerMode,
    isInitialized,
    isRecording,
    currentLayerIndex,
    triggerMode,
    analyserNode: analyserRef.current,
    hasRecording: recordedChunksRef.current.length > 0,
    maxPolyphony,
    setMaxPolyphony,
    currentVoices,
    activeVelocities: activeVelocitiesRef.current,
  };
};

// Helper function to convert MIDI note to frequency
export const midiToFrequency = (midiNote: number): number => {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};
