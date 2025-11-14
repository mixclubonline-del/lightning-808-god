import { Knob } from "./Knob";

interface EchoModuleProps {
  time: number;
  onTimeChange: (value: number) => void;
  feedback: number;
  onFeedbackChange: (value: number) => void;
  mix: number;
  onMixChange: (value: number) => void;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
}

export const EchoModule = ({
  time,
  onTimeChange,
  feedback,
  onFeedbackChange,
  mix,
  onMixChange,
  enabled,
  onEnabledChange,
}: EchoModuleProps) => {
  return (
    <div className={`bg-synth-panel rounded-3xl border-2 p-6 transition-all marble-texture overflow-hidden ${
      enabled ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] deity-aura divine-shimmer echo-waves' : 'border-synth-border'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-cyan-400 text-sm font-medium uppercase tracking-wider">
          Echo
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
      <div className="flex justify-around">
        <Knob label="Time" value={time} onChange={onTimeChange} />
        <Knob label="Feedback" value={feedback} onChange={onFeedbackChange} />
        <Knob label="Mix" value={mix} onChange={onMixChange} />
      </div>
      
      {/* Visual delay indicator */}
      {enabled && (
        <div className="mt-4 h-8 bg-background/30 rounded border border-cyan-500/30 p-1 overflow-hidden">
          <div className="flex items-center h-full gap-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-cyan-500 rounded-sm transition-all"
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
