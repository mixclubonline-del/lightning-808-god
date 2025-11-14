import { Knob } from "./Knob";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface MarsVerbProps {
  size: number;
  shimmer: number;
  mix: number;
  enabled: boolean;
  onSizeChange: (value: number) => void;
  onShimmerChange: (value: number) => void;
  onMixChange: (value: number) => void;
  onEnabledChange: (enabled: boolean) => void;
}

export const MarsVerb = ({
  size,
  shimmer,
  mix,
  enabled,
  onSizeChange,
  onShimmerChange,
  onMixChange,
  onEnabledChange,
}: MarsVerbProps) => {
  return (
    <div className={`bg-synth-panel rounded-3xl border-2 p-6 transition-all overflow-hidden ${
      enabled ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-synth-border'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-red-400 text-sm font-medium uppercase tracking-wider">
          Mars Verb
        </div>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            enabled 
              ? 'bg-red-500/20 text-red-400 border border-red-500' 
              : 'bg-background/30 text-muted-foreground border border-synth-border'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col items-center gap-2">
          <Knob
            value={size}
            onChange={onSizeChange}
            label="Size"
          />
          <span className="text-xs text-muted-foreground">{size}%</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Knob
            value={shimmer}
            onChange={onShimmerChange}
            label="Shimmer"
          />
          <span className="text-xs text-muted-foreground">{shimmer}%</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <Knob
            value={mix}
            onChange={onMixChange}
            label="Mix"
          />
          <span className="text-xs text-muted-foreground">{mix}%</span>
        </div>
      </div>

      {/* Visual shimmer representation */}
      {enabled && (
        <div className="mt-6 h-16 bg-background/50 rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-full relative">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bg-red-500/30 rounded-full blur-sm"
                  style={{
                    left: `${i * 8}%`,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: `${30 + (shimmer / 100) * 40}px`,
                    height: `${30 + (shimmer / 100) * 40}px`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0.3 + (shimmer / 100) * 0.5,
                    animation: `pulse ${2 + (size / 50)}s ease-in-out infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
