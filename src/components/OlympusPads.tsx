import { useState } from "react";
import { cn } from "@/lib/utils";

interface OlympusPadsProps {
  onPadTrigger?: (index: number) => void;
}

export const OlympusPads = ({ onPadTrigger }: OlympusPadsProps) => {
  const [activePads, setActivePads] = useState<Set<number>>(new Set());

  const handlePadClick = (index: number) => {
    setActivePads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
    
    // Trigger 808 sound
    onPadTrigger?.(index);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-slate-200 text-sm font-medium uppercase tracking-wider text-center"
        style={{
          textShadow: "0 0 10px rgba(226, 232, 240, 0.6)",
        }}>
        Olympus Pads
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePadClick(index)}
            className={cn(
              "aspect-square rounded-2xl border-2 transition-all duration-200",
              "hover:border-slate-200 hover:shadow-[0_0_20px_rgba(226,232,240,0.5)]",
              activePads.has(index)
                ? "bg-slate-200/20 border-slate-200 shadow-[0_0_20px_rgba(226,232,240,0.5)]"
                : "bg-synth-deep border-synth-border"
            )}
          />
        ))}
      </div>
      <div className="text-slate-200 text-xs font-medium uppercase tracking-[0.2em] text-center opacity-60">
        Mount of the Gods
      </div>
    </div>
  );
};