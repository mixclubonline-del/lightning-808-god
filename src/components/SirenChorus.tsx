import { Knob } from "./Knob";
import { useState } from "react";

interface SirenChorusProps {
  rate: number;
  onRateChange: (value: number) => void;
  depth: number;
  onDepthChange: (value: number) => void;
  mix: number;
  onMixChange: (value: number) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const SirenChorus = ({
  rate,
  onRateChange,
  depth,
  onDepthChange,
  mix,
  onMixChange,
  enabled,
  onEnabledChange,
}: SirenChorusProps) => {
  const [voices, setVoices] = useState(3);

  return (
    <div className={`bg-synth-panel rounded-lg border-2 p-4 transition-all ${
      enabled ? 'border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.4)]' : 'border-synth-border'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-teal-400 text-sm font-medium uppercase tracking-wider">
          Siren Chorus
        </div>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            enabled 
              ? 'bg-teal-500/20 text-teal-400 border border-teal-500' 
              : 'bg-background/30 text-muted-foreground border border-synth-border'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      <div className="flex justify-around mb-3">
        <Knob label="Rate" value={rate} onChange={onRateChange} />
        <Knob label="Depth" value={depth} onChange={onDepthChange} />
        <Knob label="Mix" value={mix} onChange={onMixChange} />
      </div>

      {/* Voice count selector */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Voices:</span>
        {[2, 3, 4].map((v) => (
          <button
            key={v}
            onClick={() => setVoices(v)}
            className={`px-2 py-1 rounded text-xs transition-all ${
              voices === v
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500'
                : 'bg-background/30 text-muted-foreground border border-synth-border'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
      
      {/* Visual LFO waveform */}
      {enabled && (
        <div className="h-16 bg-background/30 rounded border border-teal-500/30 p-2">
          <svg viewBox="0 0 200 40" className="w-full h-full">
            {/* Grid */}
            <line x1="0" y1="20" x2="200" y2="20" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
            
            {/* LFO sine waves for each voice */}
            {[...Array(voices)].map((_, i) => (
              <path
                key={i}
                d={`M ${[...Array(50)].map((_, x) => {
                  const xPos = x * 4;
                  const freq = (rate / 100) * 0.5 + 0.1;
                  const phase = (i * Math.PI * 2) / voices;
                  const yPos = 20 + Math.sin((x / 10) * freq + phase) * (depth / 100) * 15;
                  return `${xPos},${yPos}`;
                }).join(' L ')}`}
                fill="none"
                stroke="rgb(20, 184, 166)"
                strokeWidth="1.5"
                className="drop-shadow-[0_0_4px_rgba(20,184,166,0.6)]"
                style={{
                  opacity: 0.4 + (i * 0.2),
                  animation: `pulse ${2 / (rate / 50 + 0.1)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`
                }}
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
};
