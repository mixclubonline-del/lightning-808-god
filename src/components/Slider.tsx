import { cn } from "@/lib/utils";

interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const Slider = ({ label, value, onChange, min = 0, max = 100, className }: SliderProps) => {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-synth-border rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${value}%, hsl(var(--synth-border)) ${value}%, hsl(var(--synth-border)) 100%)`,
        }}
      />
      <span className="text-xs text-primary font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
};
