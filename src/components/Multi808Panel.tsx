import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dices, Shuffle } from "lucide-react";

interface Multi808PanelProps {
  onLayerChange: (layer: "core" | "layer1" | "layer2" | "layer3") => void;
}

export const Multi808Panel = ({ onLayerChange }: Multi808PanelProps) => {
  const [triggerMode, setTriggerMode] = useState<"cycle" | "random">("cycle");
  const [selectedSlot, setSelectedSlot] = useState<"core" | "layer1" | "layer2" | "layer3">("core");

  const slots = [
    { id: "core" as const, label: "808 CORE" },
    { id: "layer1" as const, label: "Layer 1" },
    { id: "layer2" as const, label: "Layer 2" },
    { id: "layer3" as const, label: "Layer 3" },
  ];

  const handleSlotClick = (slot: "core" | "layer1" | "layer2" | "layer3") => {
    setSelectedSlot(slot);
    onLayerChange(slot);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-synth-panel rounded-lg border border-synth-border">
      <div className="text-primary text-sm font-medium uppercase tracking-wider">
        Multi 808 Engine
      </div>
      
      <div className="flex flex-col gap-2">
        {slots.map((slot) => (
          <button
            key={slot.id}
            onClick={() => handleSlotClick(slot.id)}
            className={cn(
              "px-4 py-2 rounded border transition-all duration-200 text-left text-sm",
              selectedSlot === slot.id
                ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                : "bg-synth-deep border-synth-border text-muted-foreground hover:border-primary/50"
            )}
          >
            {slot.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-synth-border">
        <span className="text-xs text-muted-foreground uppercase">Trigger:</span>
        <button
          onClick={() => setTriggerMode("cycle")}
          className={cn(
            "flex-1 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-all",
            triggerMode === "cycle"
              ? "bg-primary/20 border border-primary text-primary"
              : "bg-synth-deep border border-synth-border text-muted-foreground hover:border-primary/50"
          )}
        >
          <Shuffle size={12} />
          Cycle
        </button>
        <button
          onClick={() => setTriggerMode("random")}
          className={cn(
            "flex-1 px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-all",
            triggerMode === "random"
              ? "bg-primary/20 border border-primary text-primary"
              : "bg-synth-deep border border-synth-border text-muted-foreground hover:border-primary/50"
          )}
        >
          <Dices size={12} />
          Random
        </button>
      </div>
    </div>
  );
};
