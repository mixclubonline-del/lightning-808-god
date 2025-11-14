import { Knob } from "./Knob";

interface SpandexCompressorProps {
  threshold: number;
  onThresholdChange: (value: number) => void;
  ratio: number;
  onRatioChange: (value: number) => void;
  attack: number;
  onAttackChange: (value: number) => void;
  release: number;
  onReleaseChange: (value: number) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const SpandexCompressor = ({
  threshold,
  onThresholdChange,
  ratio,
  onRatioChange,
  attack,
  onAttackChange,
  release,
  onReleaseChange,
  enabled,
  onEnabledChange,
}: SpandexCompressorProps) => {
  return (
    <div className={`bg-synth-panel rounded-lg border-2 p-4 transition-all ${
      enabled ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'border-synth-border'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-emerald-400 text-sm font-medium uppercase tracking-wider">
          Spandex Compressor
        </div>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            enabled 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500' 
              : 'bg-background/30 text-muted-foreground border border-synth-border'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-3">
        <Knob label="Threshold" value={threshold} onChange={onThresholdChange} />
        <Knob label="Ratio" value={ratio} onChange={onRatioChange} />
        <Knob label="Attack" value={attack} onChange={onAttackChange} />
        <Knob label="Release" value={release} onChange={onReleaseChange} />
      </div>

      {/* Visual compression indicator */}
      {enabled && (
        <div className="mt-4 h-20 bg-background/30 rounded border border-emerald-500/30 p-2">
          <svg viewBox="0 0 200 60" className="w-full h-full">
            {/* Grid */}
            <line x1="0" y1="30" x2="200" y2="30" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="2,2" />
            
            {/* Input signal (wavy) */}
            <path
              d={`M ${[...Array(50)].map((_, x) => {
                const xPos = x * 4;
                const yPos = 30 + Math.sin(x / 3) * 20;
                return `${xPos},${yPos}`;
              }).join(' L ')}`}
              fill="none"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
              strokeOpacity="0.4"
            />
            
            {/* Compressed signal */}
            <path
              d={`M ${[...Array(50)].map((_, x) => {
                const xPos = x * 4;
                const rawY = Math.sin(x / 3) * 20;
                const compressed = rawY > threshold / 10 ? (rawY - threshold / 10) / (ratio / 20) + threshold / 10 : rawY;
                const yPos = 30 + compressed;
                return `${xPos},${yPos}`;
              }).join(' L ')}`}
              fill="none"
              stroke="hsl(var(--emerald-500))"
              strokeWidth="2"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
            />
            
            {/* Threshold line */}
            <line 
              x1="0" 
              y1={30 - threshold / 10} 
              x2="200" 
              y2={30 - threshold / 10} 
              stroke="hsl(var(--emerald-500))" 
              strokeWidth="1" 
              strokeOpacity="0.6"
              strokeDasharray="4,4"
            />
          </svg>
        </div>
      )}
    </div>
  );
};
