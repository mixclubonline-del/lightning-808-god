import { useEffect, useRef, useState } from "react";

interface LevelMeterProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  orientation?: "horizontal" | "vertical";
  showPeak?: boolean;
  className?: string;
}

export const LevelMeter = ({
  analyser,
  width = 200,
  height = 20,
  orientation = "horizontal",
  showPeak = true,
  className = "",
}: LevelMeterProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [peakLevel, setPeakLevel] = useState(0);
  const peakHoldRef = useRef(0);
  const peakTimeRef = useRef(0);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Get computed colors
    const getColor = (varName: string) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      if (value && !value.startsWith("hsl") && !value.startsWith("#")) {
        return `hsl(${value})`;
      }
      return value || "#000";
    };

    const draw = () => {
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);
      const level = Math.min(rms * 2, 1); // Amplify and cap at 1

      const w = canvas.width;
      const h = canvas.height;

      // Update peak hold
      const now = Date.now();
      if (level > peakHoldRef.current) {
        peakHoldRef.current = level;
        peakTimeRef.current = now;
      } else if (now - peakTimeRef.current > 1000) {
        peakHoldRef.current = Math.max(0, peakHoldRef.current - 0.01);
      }

      setPeakLevel(level);

      // Clear canvas
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = getColor("--synth-deep");
      ctx.fillRect(0, 0, w, h);

      if (orientation === "horizontal") {
        const levelWidth = level * w;

        // Level gradient
        const gradient = ctx.createLinearGradient(0, 0, w, 0);
        gradient.addColorStop(0, getColor("--primary"));
        gradient.addColorStop(0.6, getColor("--accent"));
        gradient.addColorStop(0.85, "hsl(45, 100%, 50%)");
        gradient.addColorStop(1, "hsl(0, 100%, 50%)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, levelWidth, h);

        // Peak marker
        if (showPeak && peakHoldRef.current > 0.01) {
          const peakX = peakHoldRef.current * w;
          ctx.fillStyle = getColor("--foreground");
          ctx.fillRect(peakX - 1, 0, 2, h);
        }

        // Segments
        ctx.strokeStyle = getColor("--synth-border");
        ctx.lineWidth = 1;
        for (let i = 1; i < 10; i++) {
          const x = (i / 10) * w;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
      } else {
        // Vertical orientation
        const levelHeight = level * h;
        const startY = h - levelHeight;

        // Level gradient
        const gradient = ctx.createLinearGradient(0, h, 0, 0);
        gradient.addColorStop(0, getColor("--primary"));
        gradient.addColorStop(0.6, getColor("--accent"));
        gradient.addColorStop(0.85, "hsl(45, 100%, 50%)");
        gradient.addColorStop(1, "hsl(0, 100%, 50%)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, startY, w, levelHeight);

        // Peak marker
        if (showPeak && peakHoldRef.current > 0.01) {
          const peakY = h - peakHoldRef.current * h;
          ctx.fillStyle = getColor("--foreground");
          ctx.fillRect(0, peakY - 1, w, 2);
        }

        // Segments
        ctx.strokeStyle = getColor("--synth-border");
        ctx.lineWidth = 1;
        for (let i = 1; i < 10; i++) {
          const y = (i / 10) * h;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, orientation, showPeak]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded border border-synth-border ${className}`}
      style={{
        width: orientation === "horizontal" ? "100%" : `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};
