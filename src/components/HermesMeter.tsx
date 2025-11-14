import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HermesMeterProps {
  analyserNode: AnalyserNode | null;
  label: string;
  isActive: boolean;
}

export const HermesMeter = ({ analyserNode, label, isActive }: HermesMeterProps) => {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const animationRef = useRef<number>();
  const peakHoldRef = useRef<number>(0);
  const peakTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!analyserNode || !isActive) return;

    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    const update = () => {
      animationRef.current = requestAnimationFrame(update);
      analyserNode.getByteTimeDomainData(dataArray);

      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const db = 20 * Math.log10(rms);
      const normalizedLevel = Math.max(0, Math.min(100, (db + 60) * (100 / 60)));

      setLevel(normalizedLevel);

      // Peak hold
      if (normalizedLevel > peakHoldRef.current) {
        peakHoldRef.current = normalizedLevel;
        setPeak(normalizedLevel);

        clearTimeout(peakTimeoutRef.current);
        peakTimeoutRef.current = setTimeout(() => {
          peakHoldRef.current = 0;
          setPeak(0);
        }, 1500);
      }
    };

    update();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearTimeout(peakTimeoutRef.current);
    };
  }, [analyserNode, isActive]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-24 w-3 bg-synth-deep border border-slate-400/50 rounded-full overflow-hidden shadow-[0_0_10px_rgba(148,163,184,0.2)]">
        {/* Level bar with silver glow */}
        <div
          className={cn(
            "absolute bottom-0 w-full transition-all duration-75 rounded-full",
            level > 80 ? "bg-destructive" : level > 60 ? "bg-amber-500" : "bg-slate-300"
          )}
          style={{
            height: `${level}%`,
            boxShadow: level > 60 ? "0 0 12px currentColor" : "0 0 8px rgba(148,163,184,0.5)",
          }}
        />
        {/* Peak indicator */}
        {peak > 0 && (
          <div
            className="absolute w-full h-1 bg-slate-100 shadow-[0_0_8px_rgba(241,245,249,0.8)]"
            style={{ bottom: `${peak}%` }}
          />
        )}
      </div>
      <span className="text-xs text-slate-300 font-medium uppercase tracking-wider text-center"
        style={{
          textShadow: "0 0 8px rgba(203, 213, 225, 0.4)",
        }}>
        {label}
      </span>
    </div>
  );
};