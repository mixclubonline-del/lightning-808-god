import { useState, useEffect } from "react";
import { Knob } from "@/components/Knob";
import { Slider } from "@/components/Slider";
import { PadGrid } from "@/components/PadGrid";
import { Keyboard } from "@/components/Keyboard";
import { WaveformDisplay } from "@/components/WaveformDisplay";
import { Multi808Panel } from "@/components/Multi808Panel";
import { SpectrumAnalyzer } from "@/components/SpectrumAnalyzer";
import { VUMeter } from "@/components/VUMeter";
import { DistortionModule } from "@/components/DistortionModule";
import { DelayModule } from "@/components/DelayModule";
import { ChorusModule } from "@/components/ChorusModule";
import { ReverbModule } from "@/components/ReverbModule";
import { ADSRModule } from "@/components/ADSRModule";
import { RecordingControls } from "@/components/RecordingControls";
import { LayerIndicator } from "@/components/LayerIndicator";
import { ChordGenerator } from "@/components/ChordGenerator";
import { SoundLibrary } from "@/components/SoundLibrary";
import { SoundMatcher } from "@/components/SoundMatcher";
import { StudioView } from "@/components/studio/StudioView";
import zeusImage from "@/assets/zeus-figure.png";
import { Zap, Library, Music } from "lucide-react";
import { useAudioEngine, midiToFrequency } from "@/hooks/useAudioEngine";
import { generateChord, calculateStrumDelay } from "@/utils/chordGenerator";
import { AudioFeatures, extractAudioFeatures } from "@/utils/audioFeatureExtraction";
import { toast } from "sonner";

const Index = () => {
  const [mode, setMode] = useState<"standard" | "multi808">("multi808");
  const [activeLayer, setActiveLayer] = useState<"core" | "layer1" | "layer2" | "layer3">("core");
  const [activeView, setActiveView] = useState<"synth" | "library" | "studio">("synth");
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

  // Reverb values
  const [reverbSize, setReverbSize] = useState(50);
  const [reverbDamping, setReverbDamping] = useState(50);
  const [reverbMix, setReverbMix] = useState(30);
  const [reverbEnabled, setReverbEnabled] = useState(false);

  const [lightningActive, setLightningActive] = useState(false);
  const [bassHit, setBassHit] = useState(false);
  const [lastTriggeredLayer, setLastTriggeredLayer] = useState<"layer1" | "layer2" | "layer3" | null>(null);

  // Chord Generator settings
  const [chordEnabled, setChordEnabled] = useState(false);
  const [chordType, setChordType] = useState("major");
  const [chordInversion, setChordInversion] = useState(0);
  const [chordSpread, setChordSpread] = useState(30);
  const [chordStrum, setChordStrum] = useState(0);

  // Sound library state (deprecated - now using activeView)
  const [showLibrary, setShowLibrary] = useState(false);
  const [currentSoundFeatures, setCurrentSoundFeatures] = useState<AudioFeatures | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
    audioEngine.updateMasterGain(gain);
  }, [gain, audioEngine]);

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
      const features = await extractAudioFeatures(audioBuffer);
      
      setCurrentSoundFeatures(features);
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

  return (
    <div className="min-h-screen bg-synth-deep p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-primary tracking-wider mb-2"
            style={{
              textShadow: "0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.4)",
            }}>
            VST GOD
          </h1>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setActiveView("synth")}
              className={`px-6 py-2 rounded-lg border-2 transition-all ${
                activeView === "synth"
                  ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  : "border-synth-border bg-synth-panel text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Zap size={18} className="inline mr-2" />
              Synth
            </button>
            <button
              onClick={() => setActiveView("studio")}
              className={`px-6 py-2 rounded-lg border-2 transition-all ${
                activeView === "studio"
                  ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  : "border-synth-border bg-synth-panel text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Music size={18} className="inline mr-2" />
              Studio
            </button>
            <button
              onClick={() => setActiveView("library")}
              className={`px-6 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                activeView === "library"
                  ? "border-accent bg-accent/20 text-accent shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                  : "border-synth-border bg-synth-panel text-muted-foreground hover:border-accent/50"
              }`}
            >
              <Library size={18} />
              Library
            </button>
          </div>
          {activeView === "synth" && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setMode("standard")}
                className={`px-4 py-1 rounded border transition-all ${
                  mode === "standard" ? "border-primary text-primary" : "border-synth-border text-muted-foreground"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setMode("multi808")}
                className={`px-4 py-1 rounded border transition-all ${
                  mode === "multi808" ? "border-primary text-primary" : "border-synth-border text-muted-foreground"
                }`}
              >
                Multi 808
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {activeView === "library" ? (
            <div className="grid grid-cols-2 gap-6 h-[800px]">
              <SoundLibrary
                onFindSimilar={(sample) => {
                  toast("Analyzing sample...");
                }}
              />
              <SoundMatcher
                currentFeatures={currentSoundFeatures}
                onClearFeatures={() => setCurrentSoundFeatures(null)}
                onMatchSelect={(match) => {
                  toast.success(`Selected: ${match.sample.name}`);
                }}
              />
            </div>
          ) : activeView === "studio" ? (
            <StudioView
              isRecording={audioEngine.isRecording}
              onStartRecording={audioEngine.startRecording}
              onStopRecording={audioEngine.stopRecording}
              getRecordedAudioBuffer={audioEngine.getRecordedAudioBuffer}
            />
          ) : (
          // Main Synth View
          <div className="grid grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="col-span-3 space-y-6">
            {mode === "multi808" ? (
              <Multi808Panel 
                onLayerChange={setActiveLayer}
                onTriggerModeChange={audioEngine.setTriggerMode}
                triggerMode={audioEngine.triggerMode}
                currentLayerIndex={audioEngine.currentLayerIndex}
              />
            ) : (
              <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-6 space-y-6">
                <div className="flex justify-around">
                  <Knob label="Wave" value={wave} onChange={setWave} />
                  <Knob label="Filter" value={filter} onChange={setFilter} />
                  <Knob label="Vibrato" value={vibrato} onChange={setVibrato} />
                </div>
                
                <div className="space-y-4">
                  <Slider label="Wave" value={waveSlider} onChange={setWaveSlider} />
                  <Slider label="Filter" value={filterSlider} onChange={setFilterSlider} />
                  <Slider label="Delay" value={delaySlider} onChange={setDelaySlider} />
                </div>

                <div className="space-y-4 pt-4 border-t border-synth-border">
                  <Slider label="Turrie" value={turrie} onChange={setTurrie} />
                  <Slider label="Resonance" value={resonance} onChange={setResonance} />
                  <Slider label="Grenulate" value={grenulate} onChange={setGrenulate} />
                </div>

                <WaveformDisplay activeLayer={activeLayer} />
              </div>
            )}
            
            <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-4">
              <PadGrid onPadTrigger={handlePadTrigger} />
            </div>
          </div>

          {/* Center Panel - Zeus Figure */}
          <div className="col-span-6 space-y-4">
            <div className="relative bg-synth-panel rounded-lg border-2 border-synth-border h-[500px] flex items-center justify-center overflow-hidden">
              {/* Layer indicator */}
              <LayerIndicator activeLayer={lastTriggeredLayer} />
              <div 
                className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent transition-all duration-150"
                style={{
                  opacity: lightningActive ? 1 : bassHit ? 0.6 : 0.3,
                  transform: bassHit ? "scale(1.05)" : "scale(1)",
                }}
              />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <img 
                  src={zeusImage} 
                  alt="Zeus God" 
                  className="w-96 h-auto object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] transition-all duration-100"
                  style={{
                    filter: lightningActive 
                      ? "brightness(1.5) drop-shadow(0 0 50px rgba(239,68,68,1))" 
                      : bassHit 
                      ? "brightness(1.2) drop-shadow(0 0 40px rgba(239,68,68,0.9))"
                      : "",
                    transform: bassHit ? "scale(1.05)" : "scale(1)",
                  }}
                />
                {lightningActive && (
                  <Zap 
                    className="absolute top-1/4 text-synth-accent animate-pulse" 
                    size={120}
                    strokeWidth={3}
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(249,115,22,1))",
                    }}
                  />
                )}
                <button
                  onClick={triggerLightning}
                  className="mt-4 px-8 py-3 bg-primary/20 border-2 border-primary text-primary rounded-lg hover:bg-primary/30 transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)] uppercase tracking-wider font-medium"
                >
                  Strike Lightning
                </button>
              </div>
            </div>

            {/* Spectrum Analyzer */}
            <SpectrumAnalyzer 
              analyserNode={audioEngine.analyserNode} 
              isActive={audioEngine.isInitialized}
            />

            {/* Recording Controls */}
            <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-4">
              <RecordingControls
                isRecording={audioEngine.isRecording}
                onStartRecording={audioEngine.startRecording}
                onStopRecording={audioEngine.stopRecording}
                onDownload={audioEngine.downloadRecording}
                hasRecording={audioEngine.hasRecording}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-3 space-y-6">
            {/* ADSR Envelope Module */}
            <ADSRModule
              attack={attack}
              onAttackChange={setAttack}
              decay={decay}
              onDecayChange={setDecay}
              sustain={sustain}
              onSustainChange={setSustain}
              release={release}
              onReleaseChange={setRelease}
            />

            <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-6 space-y-6">
              <div className="flex justify-around">
                <Knob label="Gain" value={gain} onChange={setGain} />
                <Knob label="Reverb" value={reverb} onChange={setReverb} />
              </div>

              <div className="space-y-6 pt-6 border-t border-synth-border">
                <div className="flex justify-center gap-6">
                  <VUMeter 
                    analyserNode={audioEngine.analyserNode} 
                    label="L" 
                    isActive={audioEngine.isInitialized}
                  />
                  <VUMeter 
                    analyserNode={audioEngine.analyserNode} 
                    label="R" 
                    isActive={audioEngine.isInitialized}
                  />
                </div>

                <div className="flex justify-around pt-4">
                  <Knob label="Out 1" value={output1} onChange={setOutput1} className="scale-75" />
                  <Knob label="Out 3" value={output3} onChange={setOutput3} className="scale-75" />
                  <Knob label="Out 4" value={output4} onChange={setOutput4} className="scale-75" />
                </div>
              </div>
            </div>

            <DistortionModule
              drive={distortionDrive}
              onDriveChange={setDistortionDrive}
              tone={distortionTone}
              onToneChange={setDistortionTone}
              mix={distortionMix}
              onMixChange={setDistortionMix}
            />

            <DelayModule
              time={delayTime}
              onTimeChange={setDelayTime}
              feedback={delayFeedback}
              onFeedbackChange={setDelayFeedback}
              mix={delayMix}
              onMixChange={setDelayMix}
              enabled={delayEnabled}
              onEnabledChange={setDelayEnabled}
            />

            <ChorusModule
              rate={chorusRate}
              onRateChange={setChorusRate}
              depth={chorusDepth}
              onDepthChange={setChorusDepth}
              mix={chorusMix}
              onMixChange={setChorusMix}
              enabled={chorusEnabled}
              onEnabledChange={setChorusEnabled}
            />

            <ReverbModule
              size={reverbSize}
              damping={reverbDamping}
              mix={reverbMix}
              enabled={reverbEnabled}
              onSizeChange={setReverbSize}
              onDampingChange={setReverbDamping}
              onMixChange={setReverbMix}
              onEnabledChange={setReverbEnabled}
            />

            <ChordGenerator
              enabled={chordEnabled}
              onEnabledChange={setChordEnabled}
              chordType={chordType}
              onChordTypeChange={setChordType}
              inversion={chordInversion}
              onInversionChange={setChordInversion}
              spread={chordSpread}
              onSpreadChange={setChordSpread}
              strum={chordStrum}
              onStrumChange={setChordStrum}
            />
          </div>
          </div>
          )}
          
          {/* Universal Keyboard - appears in all views */}
          <div className="mt-6">
            <Keyboard onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
