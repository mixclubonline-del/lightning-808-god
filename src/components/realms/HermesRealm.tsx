import { HermesMeter } from "@/components/HermesMeter";
import { ThorEngine } from "@/components/ThorEngine";
import { Knob } from "@/components/Knob";
import { TrendingUp } from "lucide-react";

interface HermesRealmProps {
  output1: number;
  setOutput1: (v: number) => void;
  output3: number;
  setOutput3: (v: number) => void;
  output4: number;
  setOutput4: (v: number) => void;
  mode: "standard" | "multi808";
  activeLayer: "core" | "layer1" | "layer2" | "layer3";
  onModeChange: (mode: "standard" | "multi808") => void;
  onLayerChange: (layer: "core" | "layer1" | "layer2" | "layer3") => void;
  audioLevel: number;
}

export function HermesRealm(props: HermesRealmProps) {
  return (
    <div className="relative min-h-full p-8 bg-gradient-to-b from-green-950/20 to-transparent">
      {/* Realm Title */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-3 text-green-500">
          <TrendingUp className="w-8 h-8" />
          <h1 className="text-4xl font-bold tracking-widest" style={{ fontFamily: 'serif', textShadow: '0 0 20px rgba(34,197,94,0.6)' }}>
            HERMES REALM
          </h1>
          <TrendingUp className="w-8 h-8" />
        </div>
        <p className="text-center text-sm text-muted-foreground mt-1 tracking-wider">Mixing & Output</p>
      </div>

      {/* Hermes Watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <TrendingUp className="w-[600px] h-[600px]" />
      </div>

      <div className="relative mt-24 space-y-8">
        {/* Output Meters */}
        <div className="flex justify-center gap-8">
          <HermesMeter level={props.audioLevel} />
          <HermesMeter level={props.audioLevel * 0.9} />
          <HermesMeter level={props.audioLevel * 0.85} />
        </div>

        {/* Thor Layer Mixer */}
        <ThorEngine
          mode={props.mode}
          activeLayer={props.activeLayer}
          onModeChange={props.onModeChange}
          onLayerChange={props.onLayerChange}
        />

        {/* Master Output Controls */}
        <div className="flex justify-center gap-8 p-8 bg-synth-panel/50 rounded-3xl border border-synth-border">
          <div className="text-center">
            <Knob label="OUTPUT 1" value={props.output1} onChange={props.setOutput1} />
          </div>
          <div className="text-center">
            <Knob label="OUTPUT 3" value={props.output3} onChange={props.setOutput3} />
          </div>
          <div className="text-center">
            <Knob label="OUTPUT 4" value={props.output4} onChange={props.setOutput4} />
          </div>
        </div>
      </div>
    </div>
  );
}
