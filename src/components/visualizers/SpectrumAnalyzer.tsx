import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface SpectrumAnalyzerProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  className?: string;
  showLabel?: boolean;
  barCount?: number;
}

export const SpectrumAnalyzer = ({
  analyser,
  width = 400,
  height = 150,
  className = "",
  showLabel = true,
  barCount = 64,
}: SpectrumAnalyzerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

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
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;

      // Background
      ctx.fillStyle = getColor("--synth-deep");
      ctx.fillRect(0, 0, w, h);

      // Calculate bar width and spacing
      const barWidth = (w / barCount) * 0.8;
      const barSpacing = w / barCount;

      // Draw frequency bars
      for (let i = 0; i < barCount; i++) {
        // Sample the frequency data, focusing on lower frequencies more
        const dataIndex = Math.floor((i / barCount) * bufferLength * 0.6);
        const barHeight = (dataArray[dataIndex] / 255) * h;

        const x = i * barSpacing;
        const y = h - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, y, 0, h);
        const normalizedHeight = barHeight / h;

        if (normalizedHeight > 0.8) {
          gradient.addColorStop(0, getColor("--destructive"));
          gradient.addColorStop(0.5, "hsl(45, 100%, 50%)");
          gradient.addColorStop(1, getColor("--primary"));
        } else if (normalizedHeight > 0.5) {
          gradient.addColorStop(0, getColor("--accent"));
          gradient.addColorStop(1, getColor("--primary"));
        } else {
          gradient.addColorStop(0, getColor("--primary"));
          gradient.addColorStop(1, getColor("--primary"));
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Add glow effect for high frequencies
        if (normalizedHeight > 0.7) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = getColor("--primary");
          ctx.fillRect(x, y, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }
      }

      // Draw frequency labels
      ctx.fillStyle = getColor("--muted-foreground");
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      
      const freqLabels = ["20Hz", "200Hz", "2kHz", "20kHz"];
      const labelPositions = [0, 0.25, 0.5, 0.9];
      
      freqLabels.forEach((label, idx) => {
        const x = labelPositions[idx] * w;
        ctx.fillText(label, x + 2, h - 2);
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, barCount]);

  return (
    <Card className={`p-3 bg-synth-panel border-synth-border ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Spectrum Analyzer
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
