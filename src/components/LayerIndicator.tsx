import { cn } from "@/lib/utils";

interface LayerIndicatorProps {
  activeLayer: "layer1" | "layer2" | "layer3" | null;
}

export const LayerIndicator = ({ activeLayer }: LayerIndicatorProps) => {
  if (!activeLayer) return null;

  const layerNumber = activeLayer === "layer1" ? "1" : activeLayer === "layer2" ? "2" : "3";

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex items-center gap-2 bg-synth-panel/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-synth-border shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-scale-in">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <span className="text-accent text-sm font-medium uppercase tracking-wider">
          Layer {layerNumber} Triggered
        </span>
      </div>
    </div>
  );
};
