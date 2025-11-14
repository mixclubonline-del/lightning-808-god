import { Knob } from "./Knob";

interface DelayModuleProps {
  time: number;
  onTimeChange: (value: number) => void;
  feedback: number;
  onFeedbackChange: (value: number) => void;
  mix: number;
  onMixChange: (value: number) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const DelayModule = ({
  time,
  onTimeChange,
  feedback,
  onFeedbackChange,
  mix,
  onMixChange,
  enabled,
  onEnabledChange,
}: DelayModuleProps) => {
  return (
    <div className={`bg-synth-panel rounded-lg border-2 p-4 transition-all ${
      enabled ? 'border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'border-synth-border'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-purple-400 text-sm font-medium uppercase tracking-wider">
          Delay
        </div>
        <button
          onClick={() => onEnabledChange(!enabled)}
          className={`px-3 py-1 rounded text-xs font-medium transition-all ${
            enabled 
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500' 
              : 'bg-background/30 text-muted-foreground border border-synth-border'
          }`}
        >
          {enabled ? 'ON' : 'OFF'}
        </button>
      </div>
      <div className="flex justify-around">
        <Knob label="Time" value={time} onChange={onTimeChange} />
        <Knob label="Feedback" value={feedback} onChange={onFeedbackChange} />
        <Knob label="Mix" value={mix} onChange={onMixChange} />
      </div>
      
      {/* Visual delay indicator */}
      {enabled && (
        <div className="mt-4 h-8 bg-background/30 rounded border border-purple-500/30 p-1 overflow-hidden">
          <div className="flex items-center h-full gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-purple-500 rounded-sm transition-all"
                style={{
                  opacity: Math.max(0.1, 1 - (i * feedback / 800)),
                  height: `${100 - (i * 10)}%`,
                  animation: `pulse ${2000 / (time / 10 + 1)}ms ease-in-out infinite`,
                  animationDelay: `${i * (time * 2)}ms`
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
