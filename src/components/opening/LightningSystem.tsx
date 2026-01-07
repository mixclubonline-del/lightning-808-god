import { useEffect, useRef, memo, useCallback } from 'react';

interface LightningBolt {
  id: number;
  points: { x: number; y: number }[];
  opacity: number;
  width: number;
  branches: { x: number; y: number }[][];
}

interface LightningSystemProps {
  isActive: boolean;
  intensity: number; // 0-1
  onStrike?: () => void;
}

export const LightningSystem = memo(({ isActive, intensity, onStrike }: LightningSystemProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boltsRef = useRef<LightningBolt[]>([]);
  const animationRef = useRef<number>();
  const flashRef = useRef<number>(0);
  const lastStrikeRef = useRef<number>(0);

  const generateBolt = useCallback((startX: number, startY: number, endY: number): LightningBolt => {
    const points: { x: number; y: number }[] = [{ x: startX, y: startY }];
    const segments = 15 + Math.floor(Math.random() * 10);
    const yStep = (endY - startY) / segments;
    
    let currentX = startX;
    let currentY = startY;

    for (let i = 1; i <= segments; i++) {
      currentY += yStep;
      // More jagged movement
      const maxOffset = 30 + (i / segments) * 50;
      currentX += (Math.random() - 0.5) * maxOffset;
      points.push({ x: currentX, y: currentY });
    }

    // Generate branches
    const branches: { x: number; y: number }[][] = [];
    const branchCount = 2 + Math.floor(Math.random() * 4);
    
    for (let b = 0; b < branchCount; b++) {
      const branchStartIndex = 3 + Math.floor(Math.random() * (points.length - 5));
      const branchStart = points[branchStartIndex];
      const branchPoints: { x: number; y: number }[] = [{ ...branchStart }];
      
      let bx = branchStart.x;
      let by = branchStart.y;
      const branchLength = 3 + Math.floor(Math.random() * 5);
      const direction = Math.random() > 0.5 ? 1 : -1;

      for (let i = 0; i < branchLength; i++) {
        bx += direction * (10 + Math.random() * 20);
        by += 15 + Math.random() * 20;
        branchPoints.push({ x: bx, y: by });
      }
      branches.push(branchPoints);
    }

    return {
      id: Date.now() + Math.random(),
      points,
      opacity: 1,
      width: 2 + Math.random() * 2,
      branches,
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      boltsRef.current = [];
      flashRef.current = 0;
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const drawBolt = (bolt: LightningBolt) => {
      if (bolt.points.length < 2) return;

      // Main bolt glow
      ctx.shadowBlur = 20;
      ctx.shadowColor = `hsla(0, 84%, 70%, ${bolt.opacity})`;
      
      // Draw main bolt
      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let i = 1; i < bolt.points.length; i++) {
        ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      }
      ctx.strokeStyle = `hsla(0, 84%, 80%, ${bolt.opacity})`;
      ctx.lineWidth = bolt.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Inner bright core
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
      for (let i = 1; i < bolt.points.length; i++) {
        ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
      }
      ctx.strokeStyle = `hsla(0, 0%, 100%, ${bolt.opacity * 0.9})`;
      ctx.lineWidth = bolt.width * 0.4;
      ctx.stroke();

      // Draw branches
      ctx.shadowBlur = 10;
      bolt.branches.forEach((branch) => {
        if (branch.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(branch[0].x, branch[0].y);
        for (let i = 1; i < branch.length; i++) {
          ctx.lineTo(branch[i].x, branch[i].y);
        }
        ctx.strokeStyle = `hsla(0, 84%, 70%, ${bolt.opacity * 0.6})`;
        ctx.lineWidth = bolt.width * 0.5;
        ctx.stroke();
      });

      ctx.shadowBlur = 0;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Screen flash effect
      if (flashRef.current > 0) {
        ctx.fillStyle = `hsla(0, 84%, 90%, ${flashRef.current * 0.3})`;
        ctx.fillRect(0, 0, width, height);
        flashRef.current *= 0.85;
        if (flashRef.current < 0.01) flashRef.current = 0;
      }

      // Generate new bolts
      if (time - lastStrikeRef.current > (300 / intensity) && Math.random() < intensity * 0.3) {
        const startX = width * 0.3 + Math.random() * width * 0.4;
        const bolt = generateBolt(startX, -20, height * 0.6);
        boltsRef.current.push(bolt);
        flashRef.current = 1;
        lastStrikeRef.current = time;
        onStrike?.();
      }

      // Update and draw bolts
      boltsRef.current = boltsRef.current.filter((bolt) => {
        bolt.opacity -= 0.05;
        if (bolt.opacity <= 0) return false;
        drawBolt(bolt);
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
  }, [isActive, intensity, generateBolt, onStrike]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-20 pointer-events-none"
    />
  );
});

LightningSystem.displayName = 'LightningSystem';
