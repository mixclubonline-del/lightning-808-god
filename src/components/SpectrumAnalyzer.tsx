import { useEffect, useRef } from "react";

interface SpectrumAnalyzerProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

export const SpectrumAnalyzer = ({ analyserNode, isActive }: SpectrumAnalyzerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!analyserNode || !canvasRef.current || !isActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    analyserNode.fftSize = 256;
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyserNode.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        // Create gradient based on frequency
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        
        if (i < bufferLength * 0.2) {
          // Bass frequencies - red to orange
          gradient.addColorStop(0, "rgba(249, 115, 22, 0.9)");
          gradient.addColorStop(1, "rgba(220, 38, 38, 0.9)");
        } else if (i < bufferLength * 0.5) {
          // Mid frequencies - orange to red
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0.6)");
        } else {
          // High frequencies - dimmer red
          gradient.addColorStop(0, "rgba(220, 38, 38, 0.6)");
          gradient.addColorStop(1, "rgba(220, 38, 38, 0.3)");
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Add glow for bass frequencies
        if (i < bufferLength * 0.3 && barHeight > canvas.height * 0.3) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }

        x += barWidth + 2;
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyserNode, isActive]);

  return (
    <div className="relative">
      <div className="text-primary text-xs font-medium uppercase tracking-wider mb-2 text-center">
        Spectrum Analyzer
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full h-32 rounded-lg bg-synth-deep/50 border border-synth-border"
      />
    </div>
  );
};
