import { useState } from "react";
import { ArrowDown, ArrowRight, Zap, Music2, Activity } from "lucide-react";

interface SignalFlowViewProps {
  distortionEnabled?: boolean;
  delayEnabled?: boolean;
  chorusEnabled?: boolean;
  reverbEnabled?: boolean;
  marsEnabled?: boolean;
  chronosEnabled?: boolean;
  morpheusEnabled?: boolean;
  compressorEnabled?: boolean;
}

export const SignalFlowView = ({
  distortionEnabled = false,
  delayEnabled = false,
  chorusEnabled = false,
  reverbEnabled = false,
  marsEnabled = false,
  chronosEnabled = false,
  morpheusEnabled = false,
  compressorEnabled = false,
}: SignalFlowViewProps) => {
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const modules = [
    { id: "input", name: "Orpheus Keys", icon: "🎹", color: "yellow", enabled: true, description: "Musical keyboard input" },
    { id: "thor", name: "Thor Engine", icon: "⚡", color: "blue", enabled: true, description: "Multi-layer 808 engine" },
    { id: "apollo", name: "Apollo Envelope", icon: "☀️", color: "yellow", enabled: true, description: "ADSR envelope shaping" },
    { id: "vulcan", name: "Vulcan Forge", icon: "🔥", color: "orange", enabled: distortionEnabled, description: "Distortion & saturation" },
    { id: "atlas", name: "Atlas Compressor", icon: "💪", color: "amber", enabled: compressorEnabled, description: "Dynamic compression" },
    { id: "echo", name: "Echo Module", icon: "〰️", color: "cyan", enabled: delayEnabled, description: "Delay & echo effects" },
    { id: "siren", name: "Siren Chorus", icon: "🎭", color: "teal", enabled: chorusEnabled, description: "Chorus modulation" },
    { id: "chronos", name: "Chronos Verb", icon: "⏰", color: "yellow", enabled: chronosEnabled, description: "Reverse reverb" },
    { id: "morpheus", name: "Morpheus Module", icon: "💤", color: "indigo", enabled: morpheusEnabled, description: "Half-time effect" },
    { id: "mars", name: "Mars Verb", icon: "🔴", color: "red", enabled: marsEnabled, description: "Shimmer reverb" },
    { id: "pluto", name: "Pluto Verb", icon: "🌑", color: "purple", enabled: reverbEnabled, description: "Classic reverb" },
    { id: "output", name: "Hermes Meters", icon: "⚡", color: "slate", enabled: true, description: "Output metering" },
  ];

  const colorMap: Record<string, string> = {
    yellow: "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]",
    blue: "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]",
    orange: "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]",
    amber: "border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]",
    cyan: "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]",
    teal: "border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.4)]",
    red: "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]",
    indigo: "border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]",
    purple: "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]",
    slate: "border-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.4)]",
  };

  const textColorMap: Record<string, string> = {
    yellow: "text-yellow-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
    amber: "text-amber-400",
    cyan: "text-cyan-400",
    teal: "text-teal-400",
    red: "text-red-400",
    indigo: "text-indigo-400",
    purple: "text-purple-400",
    slate: "text-slate-300",
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary uppercase tracking-wider mb-2"
            style={{ textShadow: "0 0 20px rgba(239, 68, 68, 0.6)" }}>
            Divine Signal Flow
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest">
            Audio routing through the pantheon
          </p>
        </div>

        {/* Signal Flow Diagram */}
        <div className="relative">
          <div className="space-y-6">
            {modules.map((module, index) => (
              <div key={module.id} className="relative">
                {/* Module Box */}
                <div
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  className={`
                    relative bg-synth-panel rounded-lg border-2 p-6 transition-all duration-300
                    ${module.enabled 
                      ? `${colorMap[module.color]} opacity-100 scale-100` 
                      : "border-synth-border opacity-40 scale-95"
                    }
                    ${hoveredModule === module.id ? "scale-105 z-10" : ""}
                    marble-texture olympian-backdrop
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{module.icon}</div>
                      <div>
                        <h3 className={`text-xl font-bold uppercase tracking-wider ${textColorMap[module.color]}`}
                          style={{ textShadow: `0 0 10px currentColor` }}>
                          {module.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {module.enabled ? (
                        <>
                          <Activity className={`${textColorMap[module.color]} animate-pulse`} size={20} />
                          <span className={`text-xs uppercase tracking-wider ${textColorMap[module.color]} font-medium`}>
                            Active
                          </span>
                        </>
                      ) : (
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">
                          Bypassed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded info on hover */}
                  {hoveredModule === module.id && (
                    <div className="mt-4 pt-4 border-t border-synth-border animate-fade-in">
                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground uppercase tracking-wider">Type:</span>
                          <p className={`${textColorMap[module.color]} font-medium`}>
                            {module.id.includes("verb") ? "Reverb" : 
                             module.id === "echo" ? "Delay" :
                             module.id === "siren" ? "Modulation" :
                             module.id === "vulcan" ? "Saturation" :
                             module.id === "atlas" ? "Dynamics" :
                             module.id === "thor" ? "Oscillator" :
                             module.id === "apollo" ? "Envelope" :
                             module.id === "morpheus" ? "Time" :
                             "Utility"}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground uppercase tracking-wider">Position:</span>
                          <p className={`${textColorMap[module.color]} font-medium`}>
                            {index + 1} / {modules.length}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground uppercase tracking-wider">State:</span>
                          <p className={`${textColorMap[module.color]} font-medium`}>
                            {module.enabled ? "Processing" : "Bypassed"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Connection Arrow */}
                {index < modules.length - 1 && (
                  <div className="flex justify-center my-3">
                    <div className={`
                      transition-all duration-300
                      ${modules[index + 1].enabled 
                        ? `${textColorMap[modules[index + 1].color]} opacity-100` 
                        : "text-synth-border opacity-40"
                      }
                    `}>
                      <ArrowDown size={32} strokeWidth={3} className="animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12 p-6 bg-synth-panel rounded-lg border-2 border-synth-border marble-texture">
          <h3 className="text-sm font-medium uppercase tracking-wider text-primary mb-4">
            Signal Flow Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="text-primary" size={16} />
              <span className="text-muted-foreground">Active module</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-synth-border rounded opacity-40" />
              <span className="text-muted-foreground">Bypassed module</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowDown className="text-primary" size={16} />
              <span className="text-muted-foreground">Signal flow</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary/20 rounded animate-pulse" />
              <span className="text-muted-foreground">Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};