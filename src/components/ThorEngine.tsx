import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dices, Shuffle } from "lucide-react";

interface ThorEngineProps {
  onLayerChange: (layer: "core" | "layer1" | "layer2" | "layer3") => void;
  onTriggerModeChange: (mode: "cycle" | "random") => void;
  triggerMode: "cycle" | "random";
  currentLayerIndex: number;
}

export const ThorEngine = ({ 
  onLayerChange, 
  onTriggerModeChange,
  triggerMode,
  currentLayerIndex 
}: ThorEngineProps) => {
  const [selectedSlot, setSelectedSlot] = useState<"core" | "layer1" | "layer2" | "layer3">("core");

  const slots = [
    { id: "core" as const, label: "Thunder Core", description: "Always strikes" },
    { id: "layer1" as const, label: "Lightning Layer 1", description: "Variation" },
    { id: "layer2" as const, label: "Lightning Layer 2", description: "Variation" },
    { id: "layer3" as const, label: "Lightning Layer 3", description: "Variation" },
  ];

  const getLayerStatus = (index: number) => {
    if (triggerMode === "cycle") {
      const layerOrder = ["layer1", "layer2", "layer3"];
      const nextLayer = layerOrder[currentLayerIndex];
      if (slots[index + 1]?.id === nextLayer) {
        return "Next";
      }
    }
    return null;
  };

  const handleSlotClick = (slot: "core" | "layer1" | "layer2" | "layer3") => {
    setSelectedSlot(slot);
    onLayerChange(slot);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-synth-panel rounded-lg border-2 border-blue-600/50 shadow-[0_0_15px_rgba(37,99,235,0.3)] marble-texture sacred-geometry thor-lightning">
      <div className="text-blue-400 text-sm font-medium uppercase tracking-wider flex items-center gap-2 divine-glow">
        <span className="text-lg">⚡</span>
        Thor Engine
      </div>
      
      <div className="flex flex-col gap-2">
        {slots.map((slot, index) => {
          const status = index > 0 ? getLayerStatus(index - 1) : null;
          return (
            <button
              key={slot.id}
              onClick={() => handleSlotClick(slot.id)}
              className={cn(
                "px-4 py-3 rounded border transition-all duration-200 text-left",
                selectedSlot === slot.id
                  ? "bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                  : "bg-synth-deep border-synth-border text-muted-foreground hover:border-blue-500/50"
              )}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">{slot.label}</div>
                  <div className="text-xs opacity-60">{slot.description}</div>
                </div>
                {status && (
                  <div className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {status}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-synth-border">
        <span className="text-xs text-muted-foreground uppercase">Layer Trigger Mode:</span>
        <div className="flex gap-2">
          <button
            onClick={() => onTriggerModeChange("cycle")}
            className={cn(
              "flex-1 px-3 py-2 rounded text-xs flex items-center justify-center gap-1 transition-all",
              triggerMode === "cycle"
                ? "bg-blue-500/20 border border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                : "bg-synth-deep border border-synth-border text-muted-foreground hover:border-blue-500/50"
            )}
          >
            <Shuffle size={12} />
            <div className="text-left">
              <div className="font-medium">Cycle</div>
              <div className="text-[10px] opacity-60">Round Robin</div>
            </div>
          </button>
          <button
            onClick={() => onTriggerModeChange("random")}
            className={cn(
              "flex-1 px-3 py-2 rounded text-xs flex items-center justify-center gap-1 transition-all",
              triggerMode === "random"
                ? "bg-blue-500/20 border border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                : "bg-synth-deep border border-synth-border text-muted-foreground hover:border-blue-500/50"
            )}
          >
            <Dices size={12} />
            <div className="text-left">
              <div className="font-medium">Random</div>
              <div className="text-[10px] opacity-60">Unpredictable</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
