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
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex items-center justify-between w-full px-1 mb-1">
        <span className="text-xs text-primary font-medium uppercase tracking-wider">{label}</span>
        <span className="text-[10px] text-muted-foreground font-mono">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={(max - min) / 1000} // Higher resolution for smoother control
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 bg-synth-border rounded-full appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--synth-border)) ${percentage}%, hsl(var(--synth-border)) 100%)`,
        }}
      />
    </div>
  );
};
