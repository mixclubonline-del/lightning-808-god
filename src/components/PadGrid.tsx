import { useState } from "react";
import { cn } from "@/lib/utils";

export const PadGrid = () => {
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
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-primary text-sm font-medium uppercase tracking-wider text-center">
        Pads PT.1
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <button
            key={index}
            onClick={() => handlePadClick(index)}
            className={cn(
              "aspect-square rounded-lg border-2 transition-all duration-200",
              "hover:border-primary hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]",
              activePads.has(index)
                ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                : "bg-synth-deep border-synth-border"
            )}
          />
        ))}
      </div>
      <div className="text-primary text-xs font-medium uppercase tracking-[0.2em] text-center opacity-60">
        PADS PT.1
      </div>
    </div>
  );
};
