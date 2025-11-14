import { useState, useEffect } from "react";
import { Knob } from "@/components/Knob";
import { Slider } from "@/components/Slider";
import { OlympusPads } from "@/components/OlympusPads";
import { OrpheusKeys } from "@/components/OrpheusKeys";
import { PoseidonWave } from "@/components/PoseidonWave";
import { ThorEngine } from "@/components/ThorEngine";
import { IrisSpectrum } from "@/components/IrisSpectrum";
import { HermesMeter } from "@/components/HermesMeter";
import { VulcanForge } from "@/components/VulcanForge";
import { EchoModule } from "@/components/EchoModule";
import { SirenChorus } from "@/components/SirenChorus";
import { ReverbModule } from "@/components/ReverbModule";
import { MarsVerb } from "@/components/MarsVerb";
import { ChronosVerb } from "@/components/ChronosVerb";
import { MorpheusModule } from "@/components/MorpheusModule";
import { AtlasCompressor } from "@/components/AtlasCompressor";
import { ApolloEnvelope } from "@/components/ApolloEnvelope";
import { MnemosyneRecorder } from "@/components/MnemosyneRecorder";
import { AthenaEye } from "@/components/AthenaEye";
import { HarmoniaChords } from "@/components/HarmoniaChords";
import { PandoraLibrary } from "@/components/PandoraLibrary";
import { OracleMatcher } from "@/components/OracleMatcher";
import { StudioView } from "@/components/studio/StudioView";
import { SignalFlowView } from "@/components/SignalFlowView";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import zeusImage from "@/assets/zeus-figure.png";
import { Menu, Zap } from "lucide-react";
import { useAudioEngine, midiToFrequency } from "@/hooks/useAudioEngine";
import { generateChord, calculateStrumDelay } from "@/utils/chordGenerator";
import { AudioFeatures, extractAudioFeatures } from "@/utils/audioFeatureExtraction";
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
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-synth-deep">
        <AppSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col w-full">
          {/* Header with sidebar trigger */}
          <header className="h-16 flex items-center justify-between px-6 border-b-2 border-synth-border bg-synth-panel/50 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-primary hover:text-primary/80" />
              <h1 className="text-2xl font-bold text-primary tracking-wider hidden md:block"
                style={{
                  textShadow: "0 0 20px rgba(239, 68, 68, 0.8)",
                }}>
                VST GOD
              </h1>
            </div>
            
            {activeView === "synth" && (
              <div className="flex gap-4">
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
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {activeView === "flow" ? (
              <SignalFlowView
                distortionEnabled={mode === "multi808"}
                delayEnabled={delayEnabled}
                chorusEnabled={chorusEnabled}
                reverbEnabled={reverbEnabled}
                marsEnabled={marsEnabled}
                chronosEnabled={chronosEnabled}
                morpheusEnabled={morpheusEnabled}
                compressorEnabled={compressorEnabled}
              />
            ) : activeView === "library" ? (
            <div className="grid grid-cols-2 gap-6 h-[800px]">
              <PandoraLibrary
                onFindSimilar={(sample) => {
                  toast("Analyzing sample...");
                }}
              />
              <OracleMatcher
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
              <ThorEngine 
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

                <PoseidonWave activeLayer={activeLayer} />
              </div>
            )}
            
            <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-4">
              <OlympusPads onPadTrigger={handlePadTrigger} />
            </div>
          </div>

          {/* Center Panel - Zeus Figure */}
          <div className="col-span-6 space-y-4">
            <div className="relative bg-synth-panel rounded-lg border-2 border-synth-border h-[500px] flex items-center justify-center overflow-hidden">
              {/* Layer indicator */}
              <AthenaEye activeLayer={lastTriggeredLayer} />
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
            <IrisSpectrum 
              analyserNode={audioEngine.analyserNode} 
              isActive={audioEngine.isInitialized}
            />

            {/* Recording Controls */}
            <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-4">
              <MnemosyneRecorder
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
            <ApolloEnvelope
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
                  <HermesMeter 
                    analyserNode={audioEngine.analyserNode} 
                    label="L" 
                    isActive={audioEngine.isInitialized}
                  />
                  <HermesMeter 
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

            <VulcanForge
              drive={distortionDrive}
              onDriveChange={setDistortionDrive}
              tone={distortionTone}
              onToneChange={setDistortionTone}
              mix={distortionMix}
              onMixChange={setDistortionMix}
            />

            <EchoModule
              time={delayTime}
              onTimeChange={setDelayTime}
              feedback={delayFeedback}
              onFeedbackChange={setDelayFeedback}
              mix={delayMix}
              onMixChange={setDelayMix}
              enabled={delayEnabled}
              onEnabledChange={setDelayEnabled}
            />

            <SirenChorus
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
            
            <MarsVerb
              size={marsSize}
              shimmer={marsShimmer}
              mix={marsMix}
              enabled={marsEnabled}
              onSizeChange={setMarsSize}
              onShimmerChange={setMarsShimmer}
              onMixChange={setMarsMix}
              onEnabledChange={setMarsEnabled}
            />
            
            <ChronosVerb
              size={pastTimeSize}
              reverse={pastTimeReverse}
              mix={pastTimeMix}
              enabled={pastTimeEnabled}
              onSizeChange={setPastTimeSize}
              onReverseChange={setPastTimeReverse}
              onMixChange={setPastTimeMix}
              onEnabledChange={setPastTimeEnabled}
            />
            
            <MorpheusModule
              amount={halfTimeAmount}
              smoothing={halfTimeSmoothing}
              mix={halfTimeMix}
              enabled={halfTimeEnabled}
              onAmountChange={setHalfTimeAmount}
              onSmoothingChange={setHalfTimeSmoothing}
              onMixChange={setHalfTimeMix}
              onEnabledChange={setHalfTimeEnabled}
            />
            
            <AtlasCompressor
              threshold={compressorThreshold}
              ratio={compressorRatio}
              attack={compressorAttack}
              release={compressorRelease}
              enabled={compressorEnabled}
              onThresholdChange={setCompressorThreshold}
              onRatioChange={setCompressorRatio}
              onAttackChange={setCompressorAttack}
              onReleaseChange={setCompressorRelease}
              onEnabledChange={setCompressorEnabled}
            />

            <HarmoniaChords
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
          
          {/* Universal Keyboard - appears in synth view */}
          {activeView === "synth" && (
            <div className="mt-6">
              <OrpheusKeys onNoteOn={handleNoteOn} onNoteOff={handleNoteOff} />
            </div>
          )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
