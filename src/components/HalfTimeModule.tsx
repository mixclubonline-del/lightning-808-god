import { Knob } from "./Knob";

interface HalfTimeModuleProps {
  amount: number;
  onAmountChange: (value: number) => void;
  smoothing: number;
  onSmoothingChange: (value: number) => void;
  mix: number;
  onMixChange: (value: number) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const HalfTimeModule = ({
  amount,
  onAmountChange,
  smoothing,
  onSmoothingChange,
  mix,
  onMixChange,
  enabled,
  onEnabledChange,
}: HalfTimeModuleProps) => {
  return (
    <div className={`bg-synth-panel rounded-lg border-2 p-4 transition-all ${
      enabled ? 'border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : 'border-synth-border'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-orange-400 text-sm font-medium uppercase tracking-wider">
          Half Time
        </div>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            enabled 
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500' 
              : 'bg-background/30 text-muted-foreground border border-synth-border'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="flex justify-around">
        <Knob label="Amount" value={amount} onChange={onAmountChange} />
        <Knob label="Smooth" value={smoothing} onChange={onSmoothingChange} />
        <Knob label="Mix" value={mix} onChange={onMixChange} />
      </div>
      
      {/* Visual time stretch indicator */}
      {enabled && (
        <div className="mt-4 h-12 bg-background/30 rounded border border-orange-500/30 p-2">
          <div className="flex items-center justify-between h-full gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex flex-col justify-end h-full gap-1"
                style={{
                  width: `${100 / 6}%`,
                }}
              >
                <div
                  className="bg-orange-500 rounded-sm transition-all"
                  style={{
                    height: `${60 + (i * 8)}%`,
                    opacity: 0.4 + (amount / 200),
                    animation: `pulse ${3 * (1 + amount / 100)}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`
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
