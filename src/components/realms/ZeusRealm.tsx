import { Knob } from "@/components/Knob";
import { Slider } from "@/components/Slider";
import { OrpheusKeys } from "@/components/OrpheusKeys";
import { PoseidonWave } from "@/components/PoseidonWave";
import { ThorEngine } from "@/components/ThorEngine";
import { HermesMeter } from "@/components/HermesMeter";
import { ApolloEnvelope } from "@/components/ApolloEnvelope";
import { ConstellationLines } from "@/components/ConstellationLines";
import zeusImage from "@/assets/zeus-figure.png";
import { Zap } from "lucide-react";

interface ZeusRealmProps {
  wave: number;
  setWave: (v: number) => void;
  filter: number;
  setFilter: (v: number) => void;
  vibrato: number;
  setVibrato: (v: number) => void;
  gain: number;
  setGain: (v: number) => void;
  waveSlider: number;
  setWaveSlider: (v: number) => void;
  filterSlider: number;
  setFilterSlider: (v: number) => void;
  delaySlider: number;
  setDelaySlider: (v: number) => void;
  turrie: number;
  setTurrie: (v: number) => void;
  resonance: number;
  setResonance: (v: number) => void;
  grenulate: number;
  setGrenulate: (v: number) => void;
  attack: number;
  setAttack: (v: number) => void;
  decay: number;
  setDecay: (v: number) => void;
  sustain: number;
  setSustain: (v: number) => void;
  release: number;
  setRelease: (v: number) => void;
  mode: "standard" | "multi808";
  activeLayer: "core" | "layer1" | "layer2" | "layer3";
  onModeChange: (mode: "standard" | "multi808") => void;
  onLayerChange: (layer: "core" | "layer1" | "layer2" | "layer3") => void;
  onNoteOn: (note: number) => void;
  onNoteOff: (note: number) => void;
  audioLevel: number;
}

export function ZeusRealm(props: ZeusRealmProps) {
  const connections = [
    { from: "zeus-controls", to: "zeus-waveform" },
    { from: "zeus-waveform", to: "zeus-envelope" },
    { from: "zeus-envelope", to: "zeus-sliders" },
    { from: "zeus-sliders", to: "zeus-engine" },
    { from: "zeus-engine", to: "zeus-keyboard" },
  ];

  return (
    <div className="relative min-h-full p-8 bg-gradient-to-b from-red-950/20 to-transparent constellation-container">
      {/* Realm Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 text-red-500">
          <Zap className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-widest" style={{ fontFamily: 'serif', textShadow: '0 0 20px rgba(239,68,68,0.6)' }}>
            ZEUS REALM
          </h1>
          <Zap className="w-8 h-8" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1 tracking-wider">Core Synthesis</p>
      </div>

      {/* Zeus Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <Zap className="w-[600px] h-[600px]" />
      </div>

      <ConstellationLines connections={connections} color="hsl(0, 84%, 60%)" active={true} />

      <div className="relative mt-24 space-y-6">
        {/* Zeus Center Controls */}
        <div className="flex items-center justify-center gap-8 mb-8" data-module="zeus-controls">
          <div className="relative w-32 h-32">
            <img 
              src={zeusImage} 
              alt="Zeus" 
              className="w-full h-full object-contain opacity-80"
            />
          </div>
          
          <div className="grid grid-cols-4 gap-6">
            <Knob label="WAVE" value={props.wave} onChange={props.setWave} />
            <Knob label="FILTER" value={props.filter} onChange={props.setFilter} />
            <Knob label="VIBRATO" value={props.vibrato} onChange={props.setVibrato} />
            <Knob label="GAIN" value={props.gain} onChange={props.setGain} />
          </div>
        </div>

        {/* Waveform & Envelope */}
        <div className="grid grid-cols-2 gap-6">
          <div data-module="zeus-waveform">
            <PoseidonWave />
          </div>
          <div data-module="zeus-envelope">
            <ApolloEnvelope
            attack={props.attack}
            decay={props.decay}
            sustain={props.sustain}
            release={props.release}
            onAttackChange={props.setAttack}
            onDecayChange={props.setDecay}
            onSustainChange={props.setSustain}
            onReleaseChange={props.setRelease}
          />
          </div>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-3 gap-6" data-module="zeus-sliders">
          <Slider label="WAVE" value={props.waveSlider} onChange={props.setWaveSlider} />
          <Slider label="FILTER" value={props.filterSlider} onChange={props.setFilterSlider} />
          <Slider label="DELAY" value={props.delaySlider} onChange={props.setDelaySlider} />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <Slider label="TURRIE" value={props.turrie} onChange={props.setTurrie} />
          <Slider label="RESONANCE" value={props.resonance} onChange={props.setResonance} />
          <Slider label="GRENULATE" value={props.grenulate} onChange={props.setGrenulate} />
        </div>

        {/* Thor Engine & Hermes Meter */}
        <div data-module="zeus-engine">
          <ThorEngine
            onLayerChange={props.onLayerChange}
            onTriggerModeChange={(mode) => {}}
            triggerMode="cycle"
            currentLayerIndex={0}
          />

          {/* Output Meters */}
          <div className="flex justify-center mt-6">
            <HermesMeter analyserNode={null} label="OUT" isActive={false} />
          </div>
        </div>

        {/* Keyboard */}
        <div data-module="zeus-keyboard">
          <OrpheusKeys onNoteOn={props.onNoteOn} onNoteOff={props.onNoteOff} />
        </div>
      </div>
    </div>
  );
}
