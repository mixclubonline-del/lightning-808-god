import { Knob } from "./Knob";

interface PastTimeVerbProps {
  size: number;
  reverse: number;
  mix: number;
  enabled: boolean;
  onSizeChange: (value: number) => void;
  onReverseChange: (value: number) => void;
  onMixChange: (value: number) => void;
  onEnabledChange: (enabled: boolean) => void;
}

export const PastTimeVerb = ({
  size,
  reverse,
  mix,
  enabled,
  onSizeChange,
  onReverseChange,
  onMixChange,
  onEnabledChange,
}: PastTimeVerbProps) => {
  return (
    <div className={`bg-synth-panel rounded-lg border-2 p-4 transition-all ${
      enabled ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'border-synth-border'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-cyan-400 text-sm font-medium uppercase tracking-wider">
          Past Time Verb
        </div>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            enabled 
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' 
              : 'bg-background/30 text-muted-foreground border border-synth-border'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      
      <div className="flex justify-around mb-3">
        <Knob label="Size" value={size} onChange={onSizeChange} />
        <Knob label="Reverse" value={reverse} onChange={onReverseChange} />
        <Knob label="Mix" value={mix} onChange={onMixChange} />
      </div>

      {/* Visual reverse indicator */}
      {enabled && (
        <div className="mt-4 h-16 bg-background/30 rounded border border-cyan-500/30 p-2 overflow-hidden">
          <div className="flex items-center h-full gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-cyan-500 rounded-sm"
                style={{
                  height: `${20 + (i * 8)}%`,
                  opacity: (reverse / 100) * 0.8,
                  animation: `pulse ${1.5}s ease-in-out infinite`,
                  animationDelay: `${(9 - i) * 0.1}s`,
                  animationDirection: 'reverse'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
