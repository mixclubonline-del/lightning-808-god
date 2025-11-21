import { useState, useEffect, useCallback } from "react";
import { AppContainer } from "@/components/AppContainer";
import { OlympusHub, RealmType } from "@/components/OlympusHub";
import { RealmIndicator } from "@/components/RealmIndicator";
import { RealmTransition } from "@/components/RealmTransition";
import { OpeningAnimation } from "@/components/OpeningAnimation";
import { MidiKeyboardControls } from "@/components/MidiKeyboardControls";
import { PresetPanel } from "@/components/PresetPanel";
import { PresetBrowser } from "@/components/PresetBrowser";
import { PresetFileDropZone } from "@/components/PresetFileDropZone";
import { PresetShareDialog } from "@/components/PresetShareDialog";
import { VelocityControls } from "@/components/VelocityControls";
import { ADSRVisualEditor } from "@/components/ADSRVisualEditor";
import { MasterControls } from "@/components/MasterControls";
import { ZeusRealm } from "@/components/realms/ZeusRealm";
import { ApolloRealm } from "@/components/realms/ApolloRealm";
import { VulcanRealm } from "@/components/realms/VulcanRealm";
import { PandoraRealm } from "@/components/realms/PandoraRealm";
import { OracleRealm } from "@/components/realms/OracleRealm";
import { HermesRealm } from "@/components/realms/HermesRealm";
import { useAudioEngine, midiToFrequency } from "@/hooks/useAudioEngine";
import { generateChord, calculateStrumDelay } from "@/utils/chordGenerator";
import { mythSounds } from "@/utils/mythologicalSounds";
import { usePresets } from "@/hooks/usePresets";
import { usePresetKeyboard } from "@/hooks/usePresetKeyboard";
import { useCloudPresets } from "@/hooks/useCloudPresets";
import { PresetConfig, Preset } from "@/types/preset";
import { downloadPresetFile } from "@/utils/presetIO";
import { toast } from "sonner";

const Index = () => {
  const [mode, setMode] = useState<"standard" | "multi808">("multi808");
  const [activeLayer, setActiveLayer] = useState<"core" | "layer1" | "layer2" | "layer3">("core");
  const [activeView, setActiveView] = useState<"synth" | "library" | "studio" | "flow">("synth");
  const audioEngine = useAudioEngine();
  
  // Control values
  const [wave, setWave] = useState(50);
  const [filter, setFilter] = useState(50);
  const [vibrato, setVibrato] = useState(0);
  const [gain, setGain] = useState(75);
  const [attack, setAttack] = useState(20);
  const [decay, setDecay] = useState(50);
  const [sustain, setSustain] = useState(70);
  const [release, setRelease] = useState(40);
  const [reverb, setReverb] = useState(30);
  
  // Slider values
  const [waveSlider, setWaveSlider] = useState(50);
  const [filterSlider, setFilterSlider] = useState(50);
  const [delaySlider, setDelaySlider] = useState(25);
  const [turrie, setTurrie] = useState(50);
  const [resonance, setResonance] = useState(50);
  const [grenulate, setGrenulate] = useState(0);

  // Output values
  const [output1, setOutput1] = useState(100);
  const [output3, setOutput3] = useState(100);
  const [output4, setOutput4] = useState(100);

  // Distortion values
  const [distortionDrive, setDistortionDrive] = useState(30);
  const [distortionTone, setDistortionTone] = useState(50);
  const [distortionMix, setDistortionMix] = useState(25);

  // Delay values
  const [delayTime, setDelayTime] = useState(50);
  const [delayFeedback, setDelayFeedback] = useState(30);
  const [delayMix, setDelayMix] = useState(30);
  const [delayEnabled, setDelayEnabled] = useState(false);

  // Chorus values
  const [chorusRate, setChorusRate] = useState(50);
  const [chorusDepth, setChorusDepth] = useState(50);
  const [chorusMix, setChorusMix] = useState(40);
  const [chorusEnabled, setChorusEnabled] = useState(false);

  // Reverb values (Pluto Verb)
  const [reverbSize, setReverbSize] = useState(50);
  const [reverbDamping, setReverbDamping] = useState(50);
  const [reverbMix, setReverbMix] = useState(30);
  const [reverbEnabled, setReverbEnabled] = useState(false);
  
  // Mars Verb values (shimmer)
  const [marsSize, setMarsSize] = useState(50);
  const [marsShimmer, setMarsShimmer] = useState(50);
  const [marsMix, setMarsMix] = useState(30);
  const [marsEnabled, setMarsEnabled] = useState(false);
  
  // Past Time Verb values (reverse)
  const [pastTimeSize, setPastTimeSize] = useState(50);
  const [pastTimeReverse, setPastTimeReverse] = useState(50);
  const [pastTimeMix, setPastTimeMix] = useState(30);
  const [pastTimeEnabled, setPastTimeEnabled] = useState(false);
  const chronosEnabled = pastTimeEnabled;
  
  // Half Time values
  const [halfTimeAmount, setHalfTimeAmount] = useState(50);
  const [halfTimeSmoothing, setHalfTimeSmoothing] = useState(50);
  const [halfTimeMix, setHalfTimeMix] = useState(40);
  const [halfTimeEnabled, setHalfTimeEnabled] = useState(false);
  const morpheusEnabled = halfTimeEnabled;
  
  // Spandex Compressor values
  const [compressorThreshold, setCompressorThreshold] = useState(50);
  const [compressorRatio, setCompressorRatio] = useState(40);
  const [compressorAttack, setCompressorAttack] = useState(30);
  const [compressorRelease, setCompressorRelease] = useState(50);
  const [compressorEnabled, setCompressorEnabled] = useState(false);

  // Phase 1: Velocity & Master controls
  const [velocityCurve, setVelocityCurve] = useState<"linear" | "exponential" | "logarithmic">("linear");
  const [velocityToVolume, setVelocityToVolume] = useState(80);
  const [velocityToFilter, setVelocityToFilter] = useState(50);
  const [masterVolume, setMasterVolume] = useState(80);
  const [limiterEnabled, setLimiterEnabled] = useState(true);
  const [limiterThreshold, setLimiterThreshold] = useState(90);

  const [lightningActive, setLightningActive] = useState(false);
  const [bassHit, setBassHit] = useState(false);
  const [lastTriggeredLayer, setLastTriggeredLayer] = useState<"layer1" | "layer2" | "layer3" | null>(null);

  // Chord Generator settings
  const [chordEnabled, setChordEnabled] = useState(false);
  const [chordType, setChordType] = useState("major");
  const [chordInversion, setChordInversion] = useState(0);
  const [chordSpread, setChordSpread] = useState(30);
  const [chordStrum, setChordStrum] = useState(0);

  // MIDI and Keyboard controls
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);

  // Preset system
  const {
    presets,
    currentPresetIndex,
    savePreset,
    loadPreset,
    deletePreset,
    renamePreset,
    initializePreset,
  } = usePresets();

  // Cloud presets
  const { downloadCloudPreset } = useCloudPresets();

  // Sound library state (deprecated - now using activeView)
  const [showLibrary, setShowLibrary] = useState(false);
  const [currentSoundFeatures, setCurrentSoundFeatures] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Effects order state for drag-and-drop
  const [effectsOrder, setEffectsOrder] = useState([
    "vulcan",
    "atlas",
    "echo",
    "siren",
    "reverb",
    "mars",
    "chronos",
    "morpheus",
    "harmonia"
  ]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggedItem(id);
    mythSounds.playUIClick();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null);
      return;
    }

    const currentIndex = effectsOrder.indexOf(draggedItem);
    const targetIndex = effectsOrder.indexOf(targetId);

    const newOrder = [...effectsOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    setEffectsOrder(newOrder);
    setDraggedItem(null);
    
    // Play success sound and show toast
    mythSounds.playVulcanForge();
    toast.success("Effects chain reordered", {
      description: `${draggedItem.charAt(0).toUpperCase() + draggedItem.slice(1)} moved`,
    });
  };

  const [dragOverItem, setDragOverItem] = useState<string | null>(null);

  const handleDragEnter = (id: string) => {
    setDragOverItem(id);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = async () => {
      if (!audioEngine.isInitialized) {
        await audioEngine.initialize();
        toast.success("Audio engine ready! 🎹");
      }
    };
    
    // Initialize on first click anywhere
    const handleFirstClick = () => {
      initAudio();
      document.removeEventListener('click', handleFirstClick);
    };
    
    document.addEventListener('click', handleFirstClick);
    return () => document.removeEventListener('click', handleFirstClick);
  }, [audioEngine]);

  // Update audio parameters when controls change
  useEffect(() => {
    audioEngine.updateMasterVolume(masterVolume, limiterEnabled, limiterThreshold);
  }, [masterVolume, limiterEnabled, limiterThreshold, audioEngine]);

  useEffect(() => {
    audioEngine.updateFilter(filter, resonance);
  }, [filter, resonance, audioEngine]);

  useEffect(() => {
    audioEngine.updateDistortion(distortionDrive, distortionMix);
  }, [distortionDrive, distortionMix, audioEngine]);

  useEffect(() => {
    audioEngine.updateDelay(delayTime, delayFeedback, delayMix, delayEnabled);
  }, [delayTime, delayFeedback, delayMix, delayEnabled, audioEngine]);

  useEffect(() => {
    audioEngine.updateChorus(chorusRate, chorusDepth, chorusMix, chorusEnabled);
  }, [chorusRate, chorusDepth, chorusMix, chorusEnabled, audioEngine]);

  useEffect(() => {
    if (audioEngine.isInitialized) {
      audioEngine.updateReverb(reverbSize, reverbDamping, reverbMix, reverbEnabled);
    }
  }, [reverbSize, reverbDamping, reverbMix, reverbEnabled, audioEngine]);
  
  useEffect(() => {
    if (audioEngine.isInitialized) {
      audioEngine.updateMarsVerb(marsSize, marsShimmer, marsMix, marsEnabled);
    }
  }, [marsSize, marsShimmer, marsMix, marsEnabled, audioEngine]);
  
  useEffect(() => {
    if (audioEngine.isInitialized) {
      audioEngine.updatePastTimeVerb(pastTimeSize, pastTimeReverse, pastTimeMix, pastTimeEnabled);
    }
  }, [pastTimeSize, pastTimeReverse, pastTimeMix, pastTimeEnabled, audioEngine]);
  
  useEffect(() => {
    audioEngine.updateHalfTime(halfTimeAmount, halfTimeSmoothing, halfTimeMix, halfTimeEnabled);
  }, [halfTimeAmount, halfTimeSmoothing, halfTimeMix, halfTimeEnabled, audioEngine]);
  
  useEffect(() => {
    audioEngine.updateCompressor(compressorThreshold, compressorRatio, compressorAttack, compressorRelease, compressorEnabled);
  }, [compressorThreshold, compressorRatio, compressorAttack, compressorRelease, compressorEnabled, audioEngine]);

  // Get current configuration for preset saving
  const getCurrentConfig = useCallback((): PresetConfig => ({
    wave,
    filter,
    vibrato,
    gain,
    attack,
    decay,
    sustain,
    release,
    reverb,
    resonance,
    distortionDrive,
    distortionTone,
    distortionMix,
    velocityCurve,
    velocityToVolume,
    velocityToFilter,
    masterVolume,
    limiterEnabled,
    limiterThreshold,
  }), [wave, filter, vibrato, gain, attack, decay, sustain, release, reverb, resonance, distortionDrive, distortionTone, distortionMix, velocityCurve, velocityToVolume, velocityToFilter, masterVolume, limiterEnabled, limiterThreshold]);

  // Apply configuration from preset loading
  const applyConfig = useCallback((config: PresetConfig) => {
    setWave(config.wave);
    setFilter(config.filter);
    setVibrato(config.vibrato);
    setGain(config.gain);
    setAttack(config.attack);
    setDecay(config.decay);
    setSustain(config.sustain);
    setRelease(config.release);
    setReverb(config.reverb);
    setResonance(config.resonance);
    setDistortionDrive(config.distortionDrive);
    setDistortionTone(config.distortionTone);
    setDistortionMix(config.distortionMix);
    setVelocityCurve(config.velocityCurve);
    setVelocityToVolume(config.velocityToVolume);
    setVelocityToFilter(config.velocityToFilter);
    setMasterVolume(config.masterVolume);
    setLimiterEnabled(config.limiterEnabled);
    setLimiterThreshold(config.limiterThreshold);
  }, []);

  // Preset handlers
  const handleSavePreset = useCallback((index: number, config?: PresetConfig) => {
    const configToSave = config || getCurrentConfig();
    savePreset(index, configToSave);
    mythSounds.playApolloPluck();
  }, [getCurrentConfig, savePreset]);

  const handleLoadPreset = useCallback((index: number) => {
    const config = loadPreset(index);
    if (config) {
      applyConfig(config);
      mythSounds.playPandoraOpen();
    }
  }, [loadPreset, applyConfig]);

  const handleDeletePreset = useCallback((index: number) => {
    deletePreset(index);
    mythSounds.playVulcanForge();
  }, [deletePreset]);

  const handleExportPreset = useCallback((index: number) => {
    const preset = presets[index];
    if (preset) {
      downloadPresetFile(preset);
      toast.success("Preset exported", {
        description: `${preset.name} downloaded as JSON`,
      });
    }
  }, [presets]);

  const handleImportPreset = useCallback((preset: Preset) => {
    // Find first empty slot or overwrite last slot
    const emptyIndex = presets.findIndex(p => p === null);
    const targetIndex = emptyIndex !== -1 ? emptyIndex : presets.length - 1;
    
    savePreset(targetIndex, preset.config, preset.name);
    applyConfig(preset.config);
    mythSounds.playPandoraOpen();
  }, [presets, savePreset, applyConfig]);

  const handleDownloadCloudPreset = useCallback(async (presetId: string) => {
    const config = await downloadCloudPreset(presetId);
    if (config) {
      applyConfig(config);
      mythSounds.playPandoraOpen();
    }
  }, [downloadCloudPreset, applyConfig]);

  // Keyboard shortcuts for presets
  usePresetKeyboard({
    onSave: handleSavePreset,
    onLoad: handleLoadPreset,
    getCurrentConfig,
    enabled: true, // Always enabled
  });

  // MIDI and Keyboard integration
  useEffect(() => {
    if (!midiEnabled || !audioEngine.isInitialized) return;
    
    const config = {
      wave, filter, vibrato, gain, attack, decay, sustain, release, reverb, resonance,
      distortionDrive, distortionTone, distortionMix
    };
    
    const unsubscribe = audioEngine.enableMidiInput(config);
    return () => unsubscribe();
  }, [midiEnabled, audioEngine, wave, filter, vibrato, gain, attack, decay, sustain, release, reverb, resonance, distortionDrive, distortionTone, distortionMix]);

  useEffect(() => {
    if (!keyboardEnabled || !audioEngine.isInitialized) return;
    
    const config = {
      wave, filter, vibrato, gain, attack, decay, sustain, release, reverb, resonance,
      distortionDrive, distortionTone, distortionMix
    };
    
    const unsubscribe = audioEngine.enableKeyboardInput(config);
    return () => unsubscribe();
  }, [keyboardEnabled, audioEngine, wave, filter, vibrato, gain, attack, decay, sustain, release, reverb, resonance, distortionDrive, distortionTone, distortionMix]);

  const triggerLightning = () => {
    setLightningActive(true);
    setBassHit(true);
    setTimeout(() => setLightningActive(false), 300);
    setTimeout(() => setBassHit(false), 150);
    
    // Play a powerful C note when lightning strikes
    const config = { 
      wave, filter, vibrato, gain, attack, decay, sustain, release, reverb, resonance,
      distortionDrive, distortionTone, distortionMix 
    };
    audioEngine.play808(midiToFrequency(36), config, 36, true);
    toast("⚡ Lightning strikes!");
  };

  const captureAndAnalyzeAudio = async (frequency: number) => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    
    try {
      const offlineContext = new OfflineAudioContext(1, 44100 * 2, 44100);
      const osc = offlineContext.createOscillator();
      osc.frequency.value = frequency;
      osc.type = "sine";
      
      const gain = offlineContext.createGain();
      gain.gain.setValueAtTime(0, offlineContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, offlineContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, offlineContext.currentTime + 1.5);
      
      osc.connect(gain);
      gain.connect(offlineContext.destination);
      osc.start(0);
      osc.stop(2);
      
      const audioBuffer = await offlineContext.startRendering();
      // const features = await extractAudioFeatures(audioBuffer);
      
      setCurrentSoundFeatures(null); // Disabled for now
      toast.success("Audio analyzed! Click 'Find Similar' in Sound Match panel");
    } catch (error) {
      console.error("Audio analysis error:", error);
      toast.error("Failed to analyze audio");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNoteOn = (midiNote: number) => {
    if (!audioEngine.isInitialized) return;
    const config = { 
      wave, filter, vibrato, gain, attack, decay, sustain, release, reverb, resonance,
      distortionDrive, distortionTone, distortionMix 
    };

    // Capture first note for sound matching
    if (!currentSoundFeatures && !isAnalyzing) {
      const frequency = midiToFrequency(midiNote);
      captureAndAnalyzeAudio(frequency);
    }

    // Check if chord generator is enabled
    if (chordEnabled) {
      const chordNotes = generateChord(midiNote, chordType, chordInversion, chordSpread);
      
      chordNotes.forEach((note, index) => {
        const delay = calculateStrumDelay(index, chordNotes.length, chordStrum);
        
        setTimeout(() => {
          const frequency = midiToFrequency(note);
          
          if (mode === "multi808") {
            const triggeredLayer = audioEngine.playMulti808(frequency, config, note);
            if (index === 0) {
              setLastTriggeredLayer(triggeredLayer);
              setTimeout(() => setLastTriggeredLayer(null), 200);
            }
          } else {
            audioEngine.play808(frequency, config, note, true);
          }
        }, delay);
      });

      // Trigger visual feedback for bass chords
      if (midiNote < 48) {
        setBassHit(true);
        setTimeout(() => setBassHit(false), 100);
      }
    } else {
      // Single note mode
      const frequency = midiToFrequency(midiNote);
      
      if (mode === "multi808") {
        const triggeredLayer = audioEngine.playMulti808(frequency, config, midiNote);
        setLastTriggeredLayer(triggeredLayer);
        setTimeout(() => setLastTriggeredLayer(null), 200);
      } else {
        audioEngine.play808(frequency, config, midiNote, true);
      }
      
      // Trigger visual feedback for bass notes
      if (midiNote < 48) {
        setBassHit(true);
        setTimeout(() => setBassHit(false), 100);
      }
    }
  };

  const handleNoteOff = (midiNote: number) => {
    audioEngine.stopNote(midiNote);
  };

  const handlePadTrigger = (padIndex: number) => {
    if (!audioEngine.isInitialized) {
      toast.error("Click anywhere to initialize audio first");
      return;
    }
    
    // Map pads to different 808 notes
    const padNotes = [36, 38, 40, 41, 43, 45, 47, 48]; // C2, D2, E2, F2, G2, A2, B2, C3
    const midiNote = padNotes[padIndex];
    const config = { 
      wave, filter, vibrato, gain, attack, decay, sustain, release, reverb, resonance,
      distortionDrive, distortionTone, distortionMix 
    };
    const frequency = midiToFrequency(midiNote);
    
    // Use Multi 808 engine when in multi808 mode
    if (mode === "multi808") {
      const triggeredLayer = audioEngine.playMulti808(frequency, config, midiNote);
      setLastTriggeredLayer(triggeredLayer);
      setTimeout(() => setLastTriggeredLayer(null), 200);
    } else {
      audioEngine.play808(frequency, config, midiNote, true);
    }
    
    triggerLightning();
  };

  // Opening animation state
  const [showOpening, setShowOpening] = useState(true);
  
  // Realm navigation state
  const [currentRealm, setCurrentRealm] = useState<RealmType>("zeus");
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionRealm, setTransitionRealm] = useState<RealmType>("zeus");

  const handleRealmSelect = (realm: RealmType) => {
    if (realm === currentRealm) {
      setIsHubOpen(false);
      return;
    }

    // Play transition sound
    mythSounds.playRealmTransition();

    setIsHubOpen(false);
    setTransitionRealm(realm);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentRealm(realm);
    }, 600);
  };

  const handleChordPlay = (chord: number[]) => {
    const rootNote = 36;
    const fullConfig = {
      attack: attack / 100,
      decay: decay / 100,
      sustain: sustain / 100,
      release: release / 100,
      filter: filter / 100,
      wave: wave / 100,
      vibrato: vibrato / 100,
      gain: gain / 100,
      reverb: reverb / 100,
      resonance: resonance / 100,
      distortionDrive,
      distortionTone,
      distortionMix,
      compressor: compressorEnabled ? { threshold: compressorThreshold, ratio: compressorRatio, attack: compressorAttack, release: compressorRelease } : null
    };

    chord.forEach((offset, index) => {
      const midiNote = rootNote + offset;
      const frequency = midiToFrequency(midiNote);
      setTimeout(() => {
        audioEngine.play808(frequency, fullConfig, midiNote, false);
      }, index * calculateStrumDelay(chordStrum, chord.length, index));
    });
  };

  const renderRealm = () => {
    switch (currentRealm) {
      case "zeus":
        return (
          <ZeusRealm
            wave={wave}
            setWave={setWave}
            filter={filter}
            setFilter={setFilter}
            vibrato={vibrato}
            setVibrato={setVibrato}
            gain={gain}
            setGain={setGain}
            waveSlider={waveSlider}
            setWaveSlider={setWaveSlider}
            filterSlider={filterSlider}
            setFilterSlider={setFilterSlider}
            delaySlider={delaySlider}
            setDelaySlider={setDelaySlider}
            turrie={turrie}
            setTurrie={setTurrie}
            resonance={resonance}
            setResonance={setResonance}
            grenulate={grenulate}
            setGrenulate={setGrenulate}
            attack={attack}
            setAttack={setAttack}
            decay={decay}
            setDecay={setDecay}
            sustain={sustain}
            setSustain={setSustain}
            release={release}
            setRelease={setRelease}
            mode={mode}
            activeLayer={activeLayer}
            onModeChange={setMode}
            onLayerChange={setActiveLayer}
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            audioLevel={0}
          />
        );
      case "apollo":
        return (
          <ApolloRealm
            attack={attack}
            setAttack={setAttack}
            decay={decay}
            setDecay={setDecay}
            sustain={sustain}
            setSustain={setSustain}
            release={release}
            setRelease={setRelease}
            onNoteOn={handleNoteOn}
            onNoteOff={handleNoteOff}
            onChordPlay={handleChordPlay}
            onPadTrigger={handlePadTrigger}
          />
        );
      case "vulcan":
        return (
          <VulcanRealm
            distortionDrive={distortionDrive}
            setDistortionDrive={setDistortionDrive}
            distortionTone={distortionTone}
            setDistortionTone={setDistortionTone}
            distortionMix={distortionMix}
            setDistortionMix={setDistortionMix}
            delayTime={delayTime}
            setDelayTime={setDelayTime}
            delayFeedback={delayFeedback}
            setDelayFeedback={setDelayFeedback}
            delayMix={delayMix}
            setDelayMix={setDelayMix}
            delayEnabled={delayEnabled}
            setDelayEnabled={setDelayEnabled}
            chorusRate={chorusRate}
            setChorusRate={setChorusRate}
            chorusDepth={chorusDepth}
            setChorusDepth={setChorusDepth}
            chorusMix={chorusMix}
            setChorusMix={setChorusMix}
            chorusEnabled={chorusEnabled}
            setChorusEnabled={setChorusEnabled}
            reverbSize={reverbSize}
            setReverbSize={setReverbSize}
            reverbDamping={reverbDamping}
            setReverbDamping={setReverbDamping}
            reverbMix={reverbMix}
            setReverbMix={setReverbMix}
            reverbEnabled={reverbEnabled}
            setReverbEnabled={setReverbEnabled}
            marsSize={marsSize}
            setMarsSize={setMarsSize}
            marsDamping={marsShimmer}
            setMarsDamping={setMarsShimmer}
            marsMix={marsMix}
            setMarsMix={setMarsMix}
            marsEnabled={marsEnabled}
            setMarsEnabled={setMarsEnabled}
            chronosSize={pastTimeSize}
            setChronosSize={setPastTimeSize}
            chronosDamping={pastTimeReverse}
            setChronosDamping={setPastTimeReverse}
            chronosMix={pastTimeMix}
            setChronosMix={setPastTimeMix}
            chronosEnabled={chronosEnabled}
            setChronosEnabled={setPastTimeEnabled}
            morpheusDepth={halfTimeAmount}
            setMorpheusDepth={setHalfTimeAmount}
            morpheusRate={halfTimeSmoothing}
            setMorpheusRate={setHalfTimeSmoothing}
            morpheusMix={halfTimeMix}
            setMorpheusMix={setHalfTimeMix}
            morpheusEnabled={morpheusEnabled}
            setMorpheusEnabled={setHalfTimeEnabled}
            atlasThreshold={compressorThreshold}
            setAtlasThreshold={setCompressorThreshold}
            atlasRatio={compressorRatio}
            setAtlasRatio={setCompressorRatio}
            atlasMix={50}
            setAtlasMix={() => {}}
            atlasEnabled={compressorEnabled}
            setAtlasEnabled={setCompressorEnabled}
            effectsOrder={effectsOrder}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            draggedItem={draggedItem}
            dragOverItem={dragOverItem}
          />
        );
      case "pandora":
        return <PandoraRealm onLoadPreset={() => {}} />;
      case "oracle":
        return <OracleRealm />;
      case "hermes":
        return (
          <HermesRealm
            output1={output1}
            setOutput1={setOutput1}
            output3={output3}
            setOutput3={setOutput3}
            output4={output4}
            setOutput4={setOutput4}
            mode={mode}
            activeLayer={activeLayer}
            onModeChange={setMode}
            onLayerChange={setActiveLayer}
            audioLevel={0}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Opening Animation */}
      {showOpening && (
        <OpeningAnimation onComplete={() => setShowOpening(false)} />
      )}

      {/* Main App */}
      <AppContainer>
        <div className="relative w-full h-full">
          {/* Controls Panel - Fixed top-right */}
          <div className="fixed top-20 right-4 z-40 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
            <MidiKeyboardControls
              onMidiEnabled={setMidiEnabled}
              onKeyboardEnabled={setKeyboardEnabled}
            />
            
            {/* Preset Management */}
            <PresetPanel
              presets={presets}
              currentPresetIndex={currentPresetIndex}
              onLoad={handleLoadPreset}
              onSave={() => handleSavePreset(currentPresetIndex ?? 0)}
              onDelete={handleDeletePreset}
              onRename={renamePreset}
              onInitialize={initializePreset}
              onExport={handleExportPreset}
              onImport={handleImportPreset}
            />
            
            {/* Preset Import/Export & Sharing */}
            <div className="space-y-3">
              <PresetFileDropZone onPresetLoaded={handleImportPreset} />
              {currentPresetIndex !== null && presets[currentPresetIndex] && (
                <PresetShareDialog
                  currentPresetName={presets[currentPresetIndex]!.name}
                  currentConfig={getCurrentConfig()}
                />
              )}
            </div>
            
            {/* Cloud Preset Browser */}
            <PresetBrowser onDownload={handleDownloadCloudPreset} />
            
            <VelocityControls
              velocityCurve={velocityCurve}
              velocityToVolume={velocityToVolume}
              velocityToFilter={velocityToFilter}
              onVelocityCurveChange={setVelocityCurve}
              onVelocityToVolumeChange={setVelocityToVolume}
              onVelocityToFilterChange={setVelocityToFilter}
            />
            <ADSRVisualEditor
              attack={attack}
              decay={decay}
              sustain={sustain}
              release={release}
              onAttackChange={setAttack}
              onDecayChange={setDecay}
              onSustainChange={setSustain}
              onReleaseChange={setRelease}
            />
            <MasterControls
              masterVolume={masterVolume}
              limiterEnabled={limiterEnabled}
              limiterThreshold={limiterThreshold}
              onMasterVolumeChange={setMasterVolume}
              onLimiterEnabledChange={setLimiterEnabled}
              onLimiterThresholdChange={setLimiterThreshold}
              analyser={audioEngine.analyserNode}
            />
          </div>

          <RealmIndicator
            currentRealm={currentRealm}
            onClick={() => setIsHubOpen(true)}
          />

          <div className="w-full h-full overflow-auto animate-fade-in">
            {renderRealm()}
          </div>

          <OlympusHub
            isOpen={isHubOpen}
            onClose={() => setIsHubOpen(false)}
            onRealmSelect={handleRealmSelect}
            currentRealm={currentRealm}
          />

          {isTransitioning && (
            <RealmTransition
              currentRealm={transitionRealm}
              onTransitionComplete={() => setIsTransitioning(false)}
            />
          )}
        </div>
      </AppContainer>
    </>
  );
};

export default Index;
