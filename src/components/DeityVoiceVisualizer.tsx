import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DeityVoiceVisualizerProps {
  audioData: Uint8Array | null;
  color: string;
  accentColor: string;
  isActive: boolean;
  className?: string;
}

// Helper function to convert color with alpha
function colorWithAlpha(color: string, alpha: number): string {
  // If it's already rgba/hsla, modify the alpha
  if (color.startsWith('rgba') || color.startsWith('hsla')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
  }
  // If it's rgb, convert to rgba
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  // If it's hsl, convert to hsla
  if (color.startsWith('hsl(')) {
    return color.replace('hsl(', 'hsla(').replace(')', `, ${alpha})`);
  }
  // If it's a hex color, convert to rgba
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  // Fallback: return as-is with attempted alpha
  return color;
}

export function DeityVoiceVisualizer({
  audioData,
  color,
  accentColor,
  isActive,
  className,
}: DeityVoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (!audioData || !isActive) {
        // Draw idle state - subtle wave
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        for (let i = 0; i < width; i++) {
          const y = height / 2 + Math.sin(i * 0.05 + Date.now() * 0.002) * 2;
          ctx.lineTo(i, y);
        }
        
        ctx.strokeStyle = colorWithAlpha(color, 0.25);
        ctx.lineWidth = 2;
        ctx.stroke();
        return;
      }

      const barCount = Math.min(audioData.length, 32);
      const barWidth = width / barCount;
      const gap = 2;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, colorWithAlpha(color, 0.12));
      gradient.addColorStop(0.5, color);
      gradient.addColorStop(1, accentColor);

      // Draw frequency bars
      for (let i = 0; i < barCount; i++) {
        const value = audioData[i] / 255;
        const barHeight = Math.max(value * height * 0.9, 2);
        const x = i * barWidth + gap / 2;
        const y = (height - barHeight) / 2;

        // Main bar with rounded corners
        ctx.beginPath();
        const radius = Math.min(barWidth / 2 - gap, 4);
        ctx.roundRect(x, y, barWidth - gap, barHeight, radius);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Glow effect
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = value * 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw center line wave
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      
      for (let i = 0; i < width; i++) {
        const dataIndex = Math.floor((i / width) * barCount);
        const value = (audioData[dataIndex] || 0) / 255;
        const amplitude = value * height * 0.3;
        const y = height / 2 + Math.sin(i * 0.1 + Date.now() * 0.005) * amplitude;
        ctx.lineTo(i, y);
      }
      
      ctx.strokeStyle = colorWithAlpha(accentColor, 0.5);
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    draw();
  }, [audioData, color, accentColor, isActive]);

  // Animate idle state
  useEffect(() => {
    if (isActive && audioData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Draw subtle idle wave
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      
      for (let i = 0; i < width; i++) {
        const y = height / 2 + Math.sin(i * 0.03 + Date.now() * 0.001) * 3;
        ctx.lineTo(i, y);
      }
      
      ctx.strokeStyle = colorWithAlpha(color, 0.19);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [isActive, audioData, color]);

  return (
    <div
      className={cn(
        'w-full h-12 rounded-lg overflow-hidden',
        'transition-opacity duration-300',
        isActive ? 'opacity-100' : 'opacity-50',
        className
      )}
      style={{
        background: `linear-gradient(180deg, ${colorWithAlpha(color, 0.06)} 0%, transparent 100%)`,
      }}
    >
      <canvas
        ref={canvasRef}
        width={300}
        height={48}
        className="w-full h-full"
      />
    </div>
  );
}
