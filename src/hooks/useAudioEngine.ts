import { useEffect, useRef, useState } from "react";

interface AudioEngineConfig {
  wave: number;
  filter: number;
  vibrato: number;
  gain: number;
  attack: number;
  decay: number;
  reverb: number;
  resonance: number;
  distortionDrive: number;
  distortionTone: number;
  distortionMix: number;
}

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const distortionRef = useRef<WaveShaperNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const mediaStreamDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLayerIndex, setCurrentLayerIndex] = useState(0);
  const [triggerMode, setTriggerMode] = useState<"cycle" | "random">("cycle");
  const activeNotesRef = useRef<Map<number, { osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }>>(new Map());

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

    // Create analyser for visualization
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048;

    // Create distortion
    distortionRef.current = audioContextRef.current.createWaveShaper();
    const initialCurve = makeDistortionCurve(0);
    distortionRef.current.curve = initialCurve as any;
    distortionRef.current.oversample = "4x";

    // Create master gain
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.gain.value = 0.5;

    // Create reverb (simple convolver)
    reverbRef.current = audioContextRef.current.createConvolver();
    await createReverbImpulse(audioContextRef.current, reverbRef.current);

    // Create media stream for recording
    mediaStreamDestinationRef.current = audioContextRef.current.createMediaStreamDestination();

    // Connect audio graph: distortion -> analyser -> master gain -> destination + recorder
    distortionRef.current.connect(analyserRef.current);
    analyserRef.current.connect(masterGainRef.current);
    reverbRef.current.connect(masterGainRef.current);
    masterGainRef.current.connect(audioContextRef.current.destination);
    masterGainRef.current.connect(mediaStreamDestinationRef.current);

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

  const createReverbImpulse = async (context: AudioContext, convolver: ConvolverNode) => {
    const rate = context.sampleRate;
    const length = rate * 2; // 2 seconds
    const impulse = context.createBuffer(2, length, rate);
    const impulseL = impulse.getChannelData(0);
    const impulseR = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = length - i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
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

  const play808 = (
    frequency: number,
    config: AudioEngineConfig,
    midiNote: number,
    isCore: boolean = true
  ) => {
    if (!audioContextRef.current || !masterGainRef.current || !reverbRef.current) return;

    const context = audioContextRef.current;
    const now = context.currentTime;

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

    // Configure filter
    filter.type = "lowpass";
    filter.frequency.value = 200 + (config.filter * 50); // 200Hz to 5200Hz
    filter.Q.value = config.resonance / 10;

    // Configure envelope - layers have slightly different envelopes for variation
    const attackTime = (config.attack / 100) * 0.1; // 0 to 100ms
    const decayTime = (config.decay / 100) * 2; // 0 to 2 seconds
    const sustainLevel = isCore ? 0.3 : 0.2;
    const gainMultiplier = isCore ? 1 : 0.6; // Layers are quieter

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime((config.gain / 100) * gainMultiplier, now + attackTime);
    oscGain.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + attackTime + decayTime + 0.5);

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

    // Start and stop
    osc.start(now);
    osc.stop(now + attackTime + decayTime + 0.5);

    // Store active note
    activeNotesRef.current.set(midiNote, { osc, gain: oscGain, filter });

    // Clean up after note ends - use unique key for layers
    const noteKey = isCore ? midiNote : midiNote + 10000;
    setTimeout(() => {
      activeNotesRef.current.delete(noteKey);
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

  const stopNote = (midiNote: number) => {
    const note = activeNotesRef.current.get(midiNote);
    if (note && audioContextRef.current) {
      const now = audioContextRef.current.currentTime;
      note.gain.gain.cancelScheduledValues(now);
      note.gain.gain.setValueAtTime(note.gain.gain.value, now);
      note.gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      note.osc.stop(now + 0.1);
      activeNotesRef.current.delete(midiNote);
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

  return {
    initialize,
    play808,
    playMulti808,
    stopNote,
    updateMasterGain,
    updateFilter,
    updateDistortion,
    startRecording,
    stopRecording,
    downloadRecording,
    setTriggerMode,
    isInitialized,
    isRecording,
    currentLayerIndex,
    triggerMode,
    analyserNode: analyserRef.current,
    hasRecording: recordedChunksRef.current.length > 0,
  };
};

// Helper function to convert MIDI note to frequency
export const midiToFrequency = (midiNote: number): number => {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};
