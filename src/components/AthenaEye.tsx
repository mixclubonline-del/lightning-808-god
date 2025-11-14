import { cn } from "@/lib/utils";

interface AthenaEyeProps {
  activeLayer: "layer1" | "layer2" | "layer3" | null;
}

export const AthenaEye = ({ activeLayer }: AthenaEyeProps) => {
  if (!activeLayer) return null;

  const layerNumber = activeLayer === "layer1" ? "1" : activeLayer === "layer2" ? "2" : "3";

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex items-center gap-2 bg-synth-panel/90 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.6)] animate-scale-in olympian-backdrop deity-aura athena-wisdom">
        <div className="w-2 h-2 rounded-full bg-slate-300 animate-pulse shadow-[0_0_8px_rgba(226,232,240,0.8)]" />
        <span className="text-slate-300 text-sm font-medium uppercase tracking-wider"
          style={{
            textShadow: "0 0 8px rgba(226, 232, 240, 0.5)",
          }}>
          Layer {layerNumber} Triggered
        </span>
      </div>
    </div>
  );
};