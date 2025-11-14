import { useState } from "react";
import { Knob } from "@/components/Knob";
import { Slider } from "@/components/Slider";
import { PadGrid } from "@/components/PadGrid";
import { Keyboard } from "@/components/Keyboard";
import { WaveformDisplay } from "@/components/WaveformDisplay";
import { Multi808Panel } from "@/components/Multi808Panel";
import zeusImage from "@/assets/zeus-figure.png";
import { Zap } from "lucide-react";

const Index = () => {
  const [mode, setMode] = useState<"standard" | "multi808">("multi808");
  const [activeLayer, setActiveLayer] = useState<"core" | "layer1" | "layer2" | "layer3">("core");
  
  // Control values
  const [wave, setWave] = useState(50);
  const [filter, setFilter] = useState(50);
  const [vibrato, setVibrato] = useState(0);
  const [gain, setGain] = useState(75);
  const [attack, setAttack] = useState(20);
  const [decay, setDecay] = useState(50);
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

  const [lightningActive, setLightningActive] = useState(false);

  const triggerLightning = () => {
    setLightningActive(true);
    setTimeout(() => setLightningActive(false), 300);
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
              onClick={() => setMode("standard")}
              className={`px-6 py-2 rounded-lg border-2 transition-all ${
                mode === "standard"
                  ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  : "border-synth-border bg-synth-panel text-muted-foreground hover:border-primary/50"
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMode("multi808")}
              className={`px-6 py-2 rounded-lg border-2 transition-all ${
                mode === "multi808"
                  ? "border-primary bg-primary/20 text-primary shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                  : "border-synth-border bg-synth-panel text-muted-foreground hover:border-primary/50"
              }`}
            >
              Multi 808
            </button>
          </div>
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="col-span-3 space-y-6">
            {mode === "multi808" ? (
              <Multi808Panel onLayerChange={setActiveLayer} />
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
              <PadGrid />
            </div>
          </div>

          {/* Center Panel - Zeus Figure */}
          <div className="col-span-6">
            <div className="relative bg-synth-panel rounded-lg border-2 border-synth-border h-full flex items-center justify-center overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent"
                style={{
                  opacity: lightningActive ? 1 : 0.3,
                  transition: "opacity 0.3s",
                }}
              />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <img 
                  src={zeusImage} 
                  alt="Zeus God" 
                  className="w-96 h-auto object-contain drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]"
                  style={{
                    filter: lightningActive ? "brightness(1.5) drop-shadow(0 0 50px rgba(239,68,68,1))" : "",
                    transition: "filter 0.3s",
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
          </div>

          {/* Right Panel */}
          <div className="col-span-3 space-y-6">
            <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-6 space-y-6">
              <div className="flex justify-around">
                <Knob label="Gain" value={gain} onChange={setGain} />
                <Knob label="Attack" value={attack} onChange={setAttack} />
                <Knob label="Decay" value={decay} onChange={setDecay} />
                <Knob label="Reverb" value={reverb} onChange={setReverb} />
              </div>

              <div className="space-y-6 pt-6 border-t border-synth-border">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-16 bg-gradient-to-t from-synth-deep to-primary rounded" 
                      style={{ height: `${output1}%` }} />
                    <div className="w-2 h-16 bg-gradient-to-t from-synth-deep to-secondary rounded" 
                      style={{ height: "60%" }} />
                    <div className="w-2 h-16 bg-gradient-to-t from-synth-deep to-synth-accent rounded" 
                      style={{ height: "80%" }} />
                  </div>
                  <div className="flex justify-between text-xs text-primary">
                    <span>Output 1</span>
                    <span>Output 3</span>
                    <span>Output 4</span>
                  </div>
                </div>

                <div className="flex justify-around pt-4">
                  <Knob label="Out 1" value={output1} onChange={setOutput1} className="scale-75" />
                  <Knob label="Out 3" value={output3} onChange={setOutput3} className="scale-75" />
                  <Knob label="Out 4" value={output4} onChange={setOutput4} className="scale-75" />
                </div>
              </div>
            </div>

            <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-4">
              <Keyboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
