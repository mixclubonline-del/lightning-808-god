import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface KnobProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export const Knob = ({ label, value, onChange, min = 0, max = 100, className }: KnobProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const normalizedValue = ((value - min) / (max - min)) * 270 - 135;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const delta = startYRef.current - e.clientY;
      const valueChange = (delta / 100) * (max - min);
      const newValue = Math.max(min, Math.min(max, startValueRef.current + valueChange));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, max, min, onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        className="relative w-16 h-16 cursor-pointer select-none"
      >
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="hsl(var(--synth-deep))"
            stroke="hsl(var(--synth-border))"
            strokeWidth="2"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="hsl(var(--synth-border))"
            strokeWidth="1"
            opacity="0.3"
          />
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="15"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${normalizedValue} 50 50)`}
            style={{
              filter: "drop-shadow(0 0 4px hsl(var(--synth-glow)))",
            }}
          />
        </svg>
      </div>
      <span className="text-xs text-primary font-medium uppercase tracking-wider">{label}</span>
    </div>
  );
};
