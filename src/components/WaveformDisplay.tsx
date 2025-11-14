import { useEffect, useRef } from "react";

interface WaveformDisplayProps {
  activeLayer?: "core" | "layer1" | "layer2" | "layer3";
}

export const WaveformDisplay = ({ activeLayer = "core" }: WaveformDisplayProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(139, 0, 0, 0.3)");
      gradient.addColorStop(0.5, "rgba(220, 38, 38, 0.4)");
      gradient.addColorStop(1, "rgba(139, 0, 0, 0.3)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw core waveform (white)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const y =
          canvas.height / 2 +
          Math.sin((i / canvas.width) * Math.PI * 4) * (canvas.height / 4) * Math.sin(Date.now() / 1000);
        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }
      ctx.stroke();

      // Draw active layer waveform (cyan)
      if (activeLayer !== "core") {
        ctx.strokeStyle = "rgba(0, 255, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i < canvas.width; i++) {
          const offset = activeLayer === "layer1" ? 0 : activeLayer === "layer2" ? 2 : 4;
          const y =
            canvas.height / 2 +
            Math.cos((i / canvas.width) * Math.PI * 6 + offset) * (canvas.height / 6) * Math.cos(Date.now() / 1000);
          if (i === 0) {
            ctx.moveTo(i, y);
          } else {
            ctx.lineTo(i, y);
          }
        }
        ctx.stroke();
      }
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    animate();
  }, [activeLayer]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={80}
      className="w-full h-20 rounded-lg"
    />
  );
};
