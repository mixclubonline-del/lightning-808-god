import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface WaveformVisualizerProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  className?: string;
  showLabel?: boolean;
}

export const WaveformVisualizer = ({
  analyser,
  width = 400,
  height = 120,
  className = "",
  showLabel = true,
}: WaveformVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.fftSize;
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

      const w = canvas.width;
      const h = canvas.height;

      // Background
      ctx.fillStyle = getColor("--synth-deep");
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = getColor("--synth-border");
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;

      // Horizontal center line
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Vertical grid lines
      for (let i = 0; i < 10; i++) {
        const x = (i / 10) * w;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = getColor("--primary");
      ctx.beginPath();

      const sliceWidth = w / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * h) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(w, h / 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser]);

  return (
    <Card className={`p-3 bg-synth-panel border-synth-border ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Waveform
          </h4>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full rounded border border-synth-border"
        style={{ height: `${height}px` }}
      />
    </Card>
  );
};
