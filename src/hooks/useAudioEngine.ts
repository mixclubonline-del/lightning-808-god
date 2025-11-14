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
}

export const useAudioEngine = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const reverbRef = useRef<ConvolverNode | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
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

    // Create master gain
    masterGainRef.current = audioContextRef.current.createGain();
    masterGainRef.current.gain.value = 0.5;

    // Create reverb (simple convolver)
    reverbRef.current = audioContextRef.current.createConvolver();
    await createReverbImpulse(audioContextRef.current, reverbRef.current);

    // Connect reverb to master gain
    reverbRef.current.connect(masterGainRef.current);
    masterGainRef.current.connect(audioContextRef.current.destination);

    setIsInitialized(true);
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

  const play808 = (
    frequency: number,
    config: AudioEngineConfig,
    midiNote: number,
    layerType: "core" | "layer1" | "layer2" | "layer3" = "core"
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
    const pitchEnvelope = frequency * (layerType === "core" ? 4 : 2);
    osc.frequency.setValueAtTime(pitchEnvelope, now);
    osc.frequency.exponentialRampToValueAtTime(frequency, now + 0.05);

    // Configure filter
    filter.type = "lowpass";
    filter.frequency.value = 200 + (config.filter * 50); // 200Hz to 5200Hz
    filter.Q.value = config.resonance / 10;

    // Configure envelope
    const attackTime = (config.attack / 100) * 0.1; // 0 to 100ms
    const decayTime = (config.decay / 100) * 2; // 0 to 2 seconds
    const sustainLevel = 0.3;

    oscGain.gain.setValueAtTime(0, now);
    oscGain.gain.linearRampToValueAtTime(config.gain / 100, now + attackTime);
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

    // Connect the audio graph
    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(masterGainRef.current);
    oscGain.connect(reverbSend);
    reverbSend.connect(reverbRef.current);

    // Start and stop
    osc.start(now);
    osc.stop(now + attackTime + decayTime + 0.5);

    // Store active note
    activeNotesRef.current.set(midiNote, { osc, gain: oscGain, filter });

    // Clean up after note ends
    setTimeout(() => {
      activeNotesRef.current.delete(midiNote);
    }, (attackTime + decayTime + 0.5) * 1000);
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

  return {
    initialize,
    play808,
    stopNote,
    updateMasterGain,
    updateFilter,
    isInitialized,
  };
};

// Helper function to convert MIDI note to frequency
export const midiToFrequency = (midiNote: number): number => {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
};
