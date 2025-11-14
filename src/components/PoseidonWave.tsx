import { useEffect, useRef } from "react";

interface PoseidonWaveProps {
  activeLayer?: "core" | "layer1" | "layer2" | "layer3";
}

export const PoseidonWave = ({ activeLayer = "core" }: PoseidonWaveProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ocean gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(6, 78, 59, 0.3)");
      gradient.addColorStop(0.5, "rgba(6, 182, 212, 0.4)");
      gradient.addColorStop(1, "rgba(6, 78, 59, 0.3)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw core waveform (cyan/ocean)
      ctx.strokeStyle = "rgba(34, 211, 238, 0.9)";
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

      // Draw active layer waveform (lighter cyan)
      if (activeLayer !== "core") {
        ctx.strokeStyle = "rgba(103, 232, 249, 0.7)";
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
    <div className="relative poseidon-waves rounded-2xl overflow-hidden">
      <canvas
        ref={canvasRef}
        width={300}
        height={80}
        className="w-full h-20 rounded-2xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] divine-shimmer relative z-10"
        title="Poseidon Wave - God of the Sea"
      />
    </div>
  );
};