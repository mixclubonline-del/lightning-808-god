import { Knob } from "./Knob";

interface ChronosVerbProps {
  size: number;
  onSizeChange: (value: number) => void;
  reverse: number;
  onReverseChange: (value: number) => void;
  mix: number;
  onMixChange: (value: number) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const ChronosVerb = ({
  size,
  onSizeChange,
  reverse,
  onReverseChange,
  mix,
  onMixChange,
  enabled,
  onEnabledChange,
}: ChronosVerbProps) => {
  return (
    <div className={`bg-synth-panel rounded-lg border-2 p-4 transition-all marble-texture sacred-geometry ${
      enabled ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)] deity-aura' : 'border-synth-border'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-yellow-400 text-sm font-medium uppercase tracking-wider">
          Chronos Verb
        </div>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            enabled 
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500' 
              : 'bg-background/30 text-muted-foreground border border-synth-border'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="flex justify-around">
        <Knob label="Size" value={size} onChange={onSizeChange} />
        <Knob label="Reverse" value={reverse} onChange={onReverseChange} />
        <Knob label="Mix" value={mix} onChange={onMixChange} />
      </div>
      
      {/* Visual reverse indicator */}
      {enabled && (
        <div className="mt-4 h-12 bg-background/30 rounded border border-yellow-500/30 p-2">
          <div className="flex items-center justify-between h-full gap-1">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col justify-end h-full"
                style={{
                  width: `${100 / 10}%`,
                }}
              >
                <div
                  className="bg-yellow-500 rounded-sm transition-all"
                  style={{
                    height: `${(reverse / 100) * (100 - i * 8) + 20}%`,
                    opacity: 0.3 + ((10 - i) / 20),
                    animation: `pulse ${1.5}s ease-in-out infinite`,
                    animationDelay: `${(9 - i) * 0.1}s`,
                    animationDirection: 'reverse'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
