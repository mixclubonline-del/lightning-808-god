import { useEffect, useRef, useState, memo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  layer: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  length: number;
  opacity: number;
}

interface CosmicBackgroundProps {
  intensity: number; // 0-1, controls overall brightness/activity
  nebulaColor?: string;
}

export const CosmicBackground = memo(({ intensity, nebulaColor = 'hsl(0, 84%, 60%)' }: CosmicBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Initialize stars
  useEffect(() => {
    const generateStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((dimensions.width * dimensions.height) / 3000);
      
      for (let i = 0; i < starCount; i++) {
        const layer = Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : 2;
        stars.push({
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          size: 0.5 + Math.random() * (layer === 2 ? 2.5 : layer === 1 ? 1.5 : 1),
          brightness: 0.3 + Math.random() * 0.7,
          layer,
          twinkleSpeed: 0.5 + Math.random() * 2,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    generateStars();

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dimensions.width, dimensions.height]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let shootingStarId = 0;
    let lastShootingStarTime = 0;

    const animate = (time: number) => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw nebula clouds
      const gradient = ctx.createRadialGradient(
        dimensions.width * 0.3,
        dimensions.height * 0.3,
        0,
        dimensions.width * 0.3,
        dimensions.height * 0.3,
        dimensions.width * 0.6
      );
      gradient.addColorStop(0, `hsla(0, 84%, 40%, ${0.15 * intensity})`);
      gradient.addColorStop(0.4, `hsla(280, 70%, 30%, ${0.1 * intensity})`);
      gradient.addColorStop(0.7, `hsla(220, 80%, 20%, ${0.05 * intensity})`);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Second nebula
      const gradient2 = ctx.createRadialGradient(
        dimensions.width * 0.7,
        dimensions.height * 0.6,
        0,
        dimensions.width * 0.7,
        dimensions.height * 0.6,
        dimensions.width * 0.4
      );
      gradient2.addColorStop(0, `hsla(25, 95%, 50%, ${0.1 * intensity})`);
      gradient2.addColorStop(0.5, `hsla(0, 84%, 30%, ${0.05 * intensity})`);
      gradient2.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw stars by layer (parallax effect)
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(time * 0.001 * star.twinkleSpeed + star.twinkleOffset);
        const currentBrightness = star.brightness * (0.5 + 0.5 * twinkle) * intensity;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(0, 0%, 100%, ${currentBrightness})`;
        ctx.fill();

        // Add glow to larger stars
        if (star.size > 1.5) {
          const glowGradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.size * 3
          );
          glowGradient.addColorStop(0, `hsla(0, 0%, 100%, ${currentBrightness * 0.3})`);
          glowGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGradient;
          ctx.fillRect(star.x - star.size * 3, star.y - star.size * 3, star.size * 6, star.size * 6);
        }
      });

      // Spawn shooting stars occasionally
      if (time - lastShootingStarTime > 2000 + Math.random() * 3000 && intensity > 0.5) {
        lastShootingStarTime = time;
        shootingStarsRef.current.push({
          id: shootingStarId++,
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height * 0.3,
          angle: Math.PI * 0.2 + Math.random() * Math.PI * 0.1,
          speed: 8 + Math.random() * 6,
          length: 80 + Math.random() * 60,
          opacity: 1,
        });
      }

      // Draw and update shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.015;

        if (star.opacity <= 0) return false;

        const tailX = star.x - Math.cos(star.angle) * star.length;
        const tailY = star.y - Math.sin(star.angle) * star.length;

        const shootingGradient = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
        shootingGradient.addColorStop(0, 'transparent');
        shootingGradient.addColorStop(0.8, `hsla(0, 0%, 100%, ${star.opacity * 0.5})`);
        shootingGradient.addColorStop(1, `hsla(0, 0%, 100%, ${star.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(star.x, star.y);
        ctx.strokeStyle = shootingGradient;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Bright head
        ctx.beginPath();
        ctx.arc(star.x, star.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(0, 0%, 100%, ${star.opacity})`;
        ctx.fill();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, intensity]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 z-0"
    />
  );
});

CosmicBackground.displayName = 'CosmicBackground';
