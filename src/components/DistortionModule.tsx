import { Knob } from "./Knob";

interface DistortionModuleProps {
  drive: number;
  onDriveChange: (value: number) => void;
  tone: number;
  onToneChange: (value: number) => void;
  mix: number;
  onMixChange: (value: number) => void;
}

export const DistortionModule = ({
  drive,
  onDriveChange,
  tone,
  onToneChange,
  mix,
  onMixChange,
}: DistortionModuleProps) => {
  return (
    <div className="bg-synth-panel rounded-lg border-2 border-synth-border p-4">
      <div className="text-primary text-sm font-medium uppercase tracking-wider mb-4 text-center">
        Distortion
      </div>
      <div className="flex justify-around">
        <Knob label="Drive" value={drive} onChange={onDriveChange} />
        <Knob label="Tone" value={tone} onChange={onToneChange} />
        <Knob label="Mix" value={mix} onChange={onMixChange} />
      </div>
    </div>
  );
};
