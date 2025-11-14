import { useEffect, useRef } from "react";

interface IrisSpectrumProps {
  analyserNode: AnalyserNode | null;
  isActive: boolean;
}

export const IrisSpectrum = ({ analyserNode, isActive }: IrisSpectrumProps) => {
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
        
        // Create rainbow gradient like Iris (goddess of the rainbow)
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        
        if (i < bufferLength * 0.2) {
          // Bass frequencies - violet to indigo
          gradient.addColorStop(0, "rgba(139, 92, 246, 0.9)");
          gradient.addColorStop(1, "rgba(99, 102, 241, 0.9)");
        } else if (i < bufferLength * 0.4) {
          // Low-mid frequencies - blue to cyan
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.9)");
          gradient.addColorStop(1, "rgba(6, 182, 212, 0.9)");
        } else if (i < bufferLength * 0.6) {
          // Mid frequencies - green to yellow
          gradient.addColorStop(0, "rgba(34, 197, 94, 0.9)");
          gradient.addColorStop(1, "rgba(234, 179, 8, 0.9)");
        } else if (i < bufferLength * 0.8) {
          // High-mid frequencies - yellow to orange
          gradient.addColorStop(0, "rgba(249, 115, 22, 0.9)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0.9)");
        } else {
          // High frequencies - red to pink
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.8)");
          gradient.addColorStop(1, "rgba(236, 72, 153, 0.8)");
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        // Add rainbow glow for prominent frequencies
        if (barHeight > canvas.height * 0.3) {
          ctx.shadowBlur = 15;
          ctx.shadowColor = "rgba(168, 85, 247, 0.6)";
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
    <div className="relative iris-rainbow">
      <div className="text-purple-400 text-xs font-medium uppercase tracking-wider mb-2 text-center divine-glow"
        style={{
          textShadow: "0 0 10px rgba(168, 85, 247, 0.6)",
        }}>
        Iris Spectrum
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full h-32 rounded-lg bg-synth-deep/50 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] divine-shimmer relative z-10"
      />
      <div className="text-purple-400/60 text-[10px] uppercase tracking-widest text-center mt-1">
        Rainbow Messenger
      </div>
    </div>
  );
};