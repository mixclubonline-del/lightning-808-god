import { Knob } from "./Knob";

interface VulcanForgeProps {
  drive: number;
  onDriveChange: (value: number) => void;
  tone: number;
  onToneChange: (value: number) => void;
  mix: number;
  onMixChange: (value: number) => void;
}

export const VulcanForge = ({
  drive,
  onDriveChange,
  tone,
  onToneChange,
  mix,
  onMixChange,
}: VulcanForgeProps) => {
  return (
    <div className="bg-synth-panel rounded-lg border-2 border-orange-600/50 p-4 shadow-[0_0_15px_rgba(234,88,12,0.3)] marble-texture divine-shimmer deity-aura">
      <div className="text-orange-400 text-sm font-medium uppercase tracking-wider mb-4 text-center divine-glow">
        Vulcan Forge
      </div>
      <div className="flex justify-around">
        <Knob label="Drive" value={drive} onChange={onDriveChange} />
        <Knob label="Tone" value={tone} onChange={onToneChange} />
        <Knob label="Mix" value={mix} onChange={onMixChange} />
      </div>
    </div>
  );
};
